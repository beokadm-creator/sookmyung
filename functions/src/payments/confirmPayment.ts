import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import cors from 'cors';
import { getTossSecretKey } from '../utils/common';

const db = admin.firestore();
const corsHandler = cors({ origin: true });

interface TossPaymentResponse {
  status: string;
  customerKey?: string;
}

export const confirmPayment = functions.region('asia-northeast1').https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      const tossSecretKey = await getTossSecretKey();
      const { paymentKey, orderId, amount, userId: requestUserId } = req.body;

      if (!paymentKey || !orderId || !amount) {
        res.status(400).json({ error: 'Missing required parameters' });
        return;
      }

      const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${tossSecretKey}:`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount,
        }),
      });

      const paymentData = await response.json() as TossPaymentResponse;

      if (paymentData.status === 'DONE' || paymentData.status === 'IN_PROGRESS') {
        let userId = requestUserId;
        if (!userId && paymentData.customerKey && paymentData.customerKey.startsWith('user_')) {
          userId = paymentData.customerKey.replace('user_', '');
        }

        if (userId) {
          try {
            await db.collection('users').doc(userId).update({
              paymentStatus: true,
              updated_at: admin.firestore.FieldValue.serverTimestamp(),
            });
          } catch (e) {
            console.warn(`Failed to update user ${userId} payment status:`, e);
          }
        }

        await db.collection('payments').add({
          user_id: userId || 'anonymous',
          payment_key: paymentKey,
          order_id: orderId,
          amount: Number(amount),
          status: 'completed',
          payment_type: 'membership',
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp(),
          approvedAt: admin.firestore.FieldValue.serverTimestamp(),
          payment_data: paymentData
        });

        res.json({ success: true, paymentData });
      } else {
        res.status(400).json({ success: false, error: 'Payment not completed' });
      }
    } catch (error: any) {
      console.error('Payment confirmation error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
});
