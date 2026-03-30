import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import cors from 'cors';
import { verifyAdmin, getTossSecretKey } from '../utils/common';

const db = admin.firestore();
const corsHandler = cors({
  origin: [
    'https://smwu120th.or.kr',
    'https://www.smwu120th.or.kr',
    'https://sookmyung-97032.web.app',
    'https://sookmyung-97032.firebaseapp.com',
  ],
});

// Admin code with environment variable fallback
const getValidAdminCode = (): string => {
  return process.env.ADMIN_CODE || functions.config().admin?.code || 'SOOKMYUNG2024';
};

export const createAdmin = functions.region('asia-northeast1').https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { email, adminCode } = req.body;

    if (!email || !adminCode) {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }

    if (adminCode !== getValidAdminCode()) {
      res.status(403).json({ error: 'Invalid admin code' });
      return;
    }

    const userQuery = await db.collection('users').where('email', '==', email).get();

    if (userQuery.empty) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const userDoc = userQuery.docs[0];
    await userDoc.ref.update({
      role: 'admin',
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true, message: 'Admin role granted successfully' });
  } catch (error: any) {
    console.error('Create admin error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export const requestWithdrawal = functions.region('asia-northeast1').https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '로그인이 필요합니다.');
  }

  const userId = context.auth.uid;
  const { reason } = data;

  if (!reason) {
    throw new functions.https.HttpsError('invalid-argument', '탈퇴 사유를 입력해주세요.');
  }

  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', '사용자를 찾을 수 없습니다.');
    }

    const userData = userDoc.data();

    const existingRequest = await db.collection('withdrawal_requests')
      .where('user_id', '==', userId)
      .where('status', '==', 'pending')
      .get();

    if (!existingRequest.empty) {
      throw new functions.https.HttpsError('already-exists', '이미 진행 중인 탈퇴 신청이 있습니다.');
    }

    const withdrawalRef = await db.collection('withdrawal_requests').add({
      user_id: userId,
      user_name: userData?.name || '',
      user_email: userData?.email || '',
      reason: reason,
      status: 'pending',
      requested_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      requestId: withdrawalRef.id,
      message: '탈퇴 신청이 접수되었습니다. 관리자 승인 후 처리됩니다.'
    };
  } catch (error: any) {
    console.error('Request withdrawal error:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', '탈퇴 신청 중 오류가 발생했습니다.');
  }
});

export const processWithdrawal = functions.region('asia-northeast1').https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '로그인이 필요합니다.');
  }

  const { requestId, action, rejectReason } = data;

  if (!requestId || !action) {
    throw new functions.https.HttpsError('invalid-argument', '필수 파라미터가 누락되었습니다.');
  }

  try {
    await verifyAdmin(context.auth.uid);

    const withdrawalRef = db.collection('withdrawal_requests').doc(requestId);
    const withdrawalDoc = await withdrawalRef.get();

    if (!withdrawalDoc.exists) {
      throw new functions.https.HttpsError('not-found', '탈퇴 신청을 찾을 수 없습니다.');
    }

    const withdrawalData = withdrawalDoc.data();

    if (withdrawalData?.status !== 'pending') {
      throw new functions.https.HttpsError('failed-precondition', '이미 처리된 요청입니다.');
    }

    if (action === 'approve') {
      const tossSecretKey = await getTossSecretKey();

      try {
        const paymentsSnapshot = await db.collection('payments')
          .where('user_id', '==', withdrawalData?.user_id)
          .where('status', '==', 'completed')
          .get();

        if (!paymentsSnapshot.empty) {
          for (const paymentDoc of paymentsSnapshot.docs) {
            const paymentData = paymentDoc.data();
            const paymentKey = paymentData.payment_key;
            const cancelReason = `참가 취소 신청 (${withdrawalData?.reason})`;

            try {
              const tossResponse = await fetch(`https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`, {
                method: 'POST',
                headers: {
                  'Authorization': `Basic ${Buffer.from(tossSecretKey + ':').toString('base64')}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  cancelReason: cancelReason,
                }),
              });

              if (!tossResponse.ok) {
                const tossError = await tossResponse.json() as { code?: string; message?: string };
                console.error('Toss cancellation failed:', tossError);

                if (tossError.code !== 'ALREADY_CANCELED_PAYMENT') {
                  console.warn(`Payment cancellation warning: ${tossError.message}. Proceeding with user deletion.`);
                }
              }

              await paymentDoc.ref.update({
                status: 'cancelled',
                cancelled_at: admin.firestore.FieldValue.serverTimestamp(),
                cancel_reason: cancelReason,
              });
            } catch (singlePaymentError: any) {
              console.error(`Failed to cancel payment ${paymentKey}:`, singlePaymentError);
            }
          }
        }
      } catch (paymentError: any) {
        console.error('Payment cancellation error (continuing with user deletion):', paymentError);
      }

      await admin.auth().deleteUser(withdrawalData?.user_id);

      await db.collection('users').doc(withdrawalData?.user_id).delete();

      await withdrawalRef.update({
        status: 'approved',
        processed_at: admin.firestore.FieldValue.serverTimestamp(),
        processed_by: context.auth.uid,
      });

      return { success: true, message: '참가 취소가 승인되었습니다. 결제 환불은 5-10일 내에 처리됩니다.' };
    } else if (action === 'reject') {
      await withdrawalRef.update({
        status: 'rejected',
        reject_reason: rejectReason || '',
        processed_at: admin.firestore.FieldValue.serverTimestamp(),
        processed_by: context.auth.uid,
      });

      return { success: true, message: '탈퇴가 거절되었습니다.' };
    } else {
      throw new functions.https.HttpsError('invalid-argument', '잘못된 액션입니다.');
    }
  } catch (error: any) {
    console.error('Process withdrawal error:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', '탈퇴 처리 중 오류가 발생했습니다.');
  }
});

export const cancelPaymentByAdmin = functions.region('asia-northeast1').https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '로그인이 필요합니다.');
  }

  const { paymentId, cancelReason } = data;

  if (!paymentId) {
    throw new functions.https.HttpsError('invalid-argument', '결제 ID가 필요합니다.');
  }

  try {
    await verifyAdmin(context.auth.uid);

    const paymentRef = db.collection('payments').doc(paymentId);
    const paymentDoc = await paymentRef.get();

    if (!paymentDoc.exists) {
      throw new functions.https.HttpsError('not-found', '결제 정보를 찾을 수 없습니다.');
    }

    const paymentData = paymentDoc.data();
    
    if (paymentData?.status !== 'completed') {
      throw new functions.https.HttpsError('failed-precondition', '취소할 수 없는 결제 상태입니다.');
    }

    const paymentKey = paymentData.payment_key;
    const tossSecretKey = await getTossSecretKey();
    const reason = cancelReason || '관리자 취소';

    try {
      const tossResponse = await fetch(`https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(tossSecretKey + ':').toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cancelReason: reason,
        }),
      });

      if (!tossResponse.ok) {
        const tossError = await tossResponse.json() as { code?: string; message?: string };
        console.error('Toss cancellation failed:', tossError);

        if (tossError.code !== 'ALREADY_CANCELED_PAYMENT') {
          throw new functions.https.HttpsError('internal', `결제 취소 실패: ${tossError.message}`);
        }
      }

      await paymentRef.update({
        status: 'cancelled',
        cancelled_at: admin.firestore.FieldValue.serverTimestamp(),
        cancel_reason: reason,
        cancelled_by: context.auth.uid,
      });

      if (paymentData.user_id && paymentData.user_id !== 'anonymous') {
        await db.collection('users').doc(paymentData.user_id).update({
          paymentStatus: false,
          updated_at: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      return { success: true, message: '결제가 취소되었습니다.' };
    } catch (paymentError: any) {
      console.error('Payment cancellation error:', paymentError);
      throw new functions.https.HttpsError('internal', paymentError.message || '결제 취소 중 오류가 발생했습니다.');
    }
  } catch (error: any) {
    console.error('Cancel payment by admin error:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', '결제 취소 처리 중 오류가 발생했습니다.');
  }
});
