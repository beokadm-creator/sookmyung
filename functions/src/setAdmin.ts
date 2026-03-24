import * as admin from 'firebase-admin';

const serviceAccount = require('../../sookmyung-97032-firebase-adminsdk-fbsvc-cdee98bac9.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'sookmyung-97032', // Explicitly set project ID
});

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true }); // Ignore undefined properties

const TARGET_UID = 'DiMxXk9JZug3Ma2I2hK68ia0WZs1';
const TARGET_EMAIL = 'admin@hongcomm.kr';


async function setAdminRole() {
  try {
    console.log(`Setting admin role for user: ${TARGET_EMAIL} (${TARGET_UID})`);

    // Check if user document exists
    const userRef = db.collection('users').doc(TARGET_UID);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      console.log('User document does not exist. Creating new admin user document...');
      await userRef.set({
        id: TARGET_UID,
        email: TARGET_EMAIL,
        name: 'Admin', // Default name
        role: 'admin',
        paymentStatus: false,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      console.log('User document exists. Updating role to admin...');
      await userRef.update({
        role: 'admin',
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    console.log('Successfully set admin role!');
  } catch (error) {
    console.error('Error setting admin role:', error);
  }
}

setAdminRole();
