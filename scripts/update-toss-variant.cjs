const admin = require('firebase-admin');
const serviceAccount = require('../sookmyung-97032-firebase-adminsdk-fbsvc-cdee98bac9.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function updateVariantKey() {
  try {
    const siteConfigRef = db.collection('settings').doc('site_config');
    
    const config = {
      pg_config: {
        toss_client_key: 'test_ck_0RnYX2w53222xpl9QvnM3NeyqApQ',
        toss_secret_key: 'test_sk_vZnjEJeQVxPMNXgyKJkDVPmOoBN0',
        toss_webhook_secret: 'd44eb0d039748aac65462146db6157d581d968a9cfec6d4f356435eacc985b93',
        toss_widget_variant_key: 'DEFAULT',
        pg_provider: 'tosspayments',
        enabled: true
      },
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    };

    await siteConfigRef.set(config, { merge: true });
    
    console.log('✅ variantKey 설정 완료!');
    console.log('variantKey:', config.pg_config.toss_widget_variant_key);
    
  } catch (error) {
    console.error('설정 실패:', error);
    process.exit(1);
  } finally {
    await admin.app().delete();
  }
}

updateVariantKey();