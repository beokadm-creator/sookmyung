
const admin = require('firebase-admin');
const serviceAccount = require('./sookmyung-97032-firebase-adminsdk-fbsvc-cdee98bac9.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkAlimtalkConfig() {
  const doc = await db.collection('config').doc('alimtalk').get();
  if (!doc.exists) {
    console.log('No alimtalk config document!');
    return;
  }
  const data = doc.data();
  console.log('Alimtalk Config:');
  console.log(JSON.stringify(data, null, 2));
}

checkAlimtalkConfig().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
