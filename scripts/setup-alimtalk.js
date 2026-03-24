const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('../sookmyung-97032-firebase-adminsdk-*.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function setupAlimTalkConfig() {
  try {
    const configRef = db.collection('config').doc('alimtalk');
    
    const alimtalkConfig = {
      appKey: 'Ik6GEBC22p5Qliqk',
      secretKey: 'ajFUrusk8I7tgBQdrztuQvcf6jgWWcme',
      senderKey: 'd1a14e0d38e893e8bf4bb945ab6f33ce5e87330c',
      templates: {
        verification: {
          templateId: 'VERIFICATION_001', // 기본 템플릿 ID - 실제 템플릿 ID로 변경 필요
          enabled: true
        },
        welcome: {
          templateId: 'WELCOME_001', // 환영 메시지 템플릿 ID
          enabled: true
        },
        event: {
          templateId: 'EVENT_001', // 행사 등록 템플릿 ID
          enabled: false
        },
        payment: {
          templateId: 'PAYMENT_001', // 결제 완료 템플릿 ID
          enabled: false
        }
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await configRef.set(alimtalkConfig);
    console.log('✅ AlimTalk configuration successfully saved to Firestore!');
    console.log('📝 Document ID: config/alimtalk');
    console.log('🔧 Configuration:', JSON.stringify(alimtalkConfig, null, 2));
    console.log('\n⚠️  IMPORTANT: 템플릿 ID를 실제 NHN Cloud 콘솔에서 확인한 템플릿 ID로 업데이트해주세요.');
  } catch (error) {
    console.error('❌ Error setting up AlimTalk config:', error);
  } finally {
    process.exit(0);
  }
}

setupAlimTalkConfig();
