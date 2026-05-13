
const admin = require('firebase-admin');
const serviceAccount = require('./sookmyung-97032-firebase-adminsdk-fbsvc-cdee98bac9.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkConfig() {
  const doc = await db.collection('config').doc('event_settings').get();
  if (!doc.exists) {
    console.log('No event_settings document!');
    return;
  }
  console.log(JSON.stringify(doc.data(), null, 2));
}

checkConfig().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
