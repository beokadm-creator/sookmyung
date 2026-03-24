const admin = require('firebase-admin');
const serviceAccount = require('../sookmyung-97032-firebase-adminsdk-fbsvc-cdee98bac9.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function setupTossPayments() {
  try {
    console.log('Toss Payments 설정 시작...');

    const siteConfigRef = db.collection('settings').doc('site_config');
    
    const config = {
      pg_config: {
        toss_client_key: 'test_ck_0RnYX2w53222xpl9QvnM3NeyqApQ',
        toss_secret_key: 'test_sk_vZnjEJeQVxPMNXgyKJkDVPmOoBN0',
        toss_webhook_secret: 'd44eb0d039748aac65462146db6157d581d968a9cfec6d4f356435eacc985b93',
        pg_provider: 'tosspayments',
        enabled: true
      },
      terms: {
        refund_policy: '결제 취소 및 환불 정책\n\n1. 결제일로부터 7일 이내: 전액 환불\n2. 행사 7일 전: 50% 환불\n3. 행사 3일 전: 30% 환불\n4. 행사 3일 이내: 환불 불가\n\n자세한 내용은 관리자에게 문의해주세요.'
      },
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    };

    await siteConfigRef.set(config, { merge: true });
    
    console.log('✅ Toss Payments 설정 완료!');
    console.log('Client Key:', config.pg_config.toss_client_key);
    console.log('Secret Key:', config.pg_config.toss_secret_key.substring(0, 15) + '...');
    
  } catch (error) {
    console.error('설정 실패:', error);
    process.exit(1);
  } finally {
    await admin.app().delete();
  }
}

setupTossPayments();