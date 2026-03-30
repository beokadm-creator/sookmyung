
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
      projectId: "sookmyung-97032"
  });
}

const db = admin.firestore();

async function checkConfig() {
  try {
    const doc = await db.collection('config').doc('event_settings').get();
    if (doc.exists) {
      console.log('EVENT SETTINGS:', JSON.stringify(doc.data(), null, 2));
    } else {
      console.log('EVENT SETTINGS NOT FOUND');
    }

    const pgDoc = await db.collection('config').doc('pg_config').get();
    if (pgDoc.exists) {
        const data = pgDoc.data();
        console.log('PG CONFIG Found. Client Key exists:', !!data.clientKey);
    } else {
        console.log('PG CONFIG NOT FOUND');
    }
  } catch (e) {
    console.error(e);
  }
}

checkConfig();
