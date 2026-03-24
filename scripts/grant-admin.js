import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceAccountPath = resolve(__dirname, '../sookmyung-97032-firebase-adminsdk-fbsvc-cdee98bac9.json');

console.log('Using service account:', serviceAccountPath);

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

const targetEmail = 'aaron@beoksolution.com';

async function grantAdmin() {
  try {
    console.log(`Checking user: ${targetEmail}`);
    
    // 1. Check Auth User
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(targetEmail);
      console.log(`Auth user found: ${userRecord.uid}`);
    } catch (e) {
      if (e.code === 'auth/user-not-found') {
        console.log('User not found in Auth.');
      } else {
        throw e;
      }
    }

    // 2. Check Firestore User
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', targetEmail).get();

    if (snapshot.empty) {
      console.log('User not found in Firestore.');
      if (userRecord) {
         // User exists in Auth but not Firestore? Odd, but possible.
         // Create Firestore doc.
         await usersRef.doc(userRecord.uid).set({
           email: targetEmail,
           role: 'admin',
           createdAt: admin.firestore.FieldValue.serverTimestamp(),
           updated_at: admin.firestore.FieldValue.serverTimestamp(),
           name: userRecord.displayName || 'Admin',
         }, { merge: true });
         console.log(`Created Firestore doc for ${userRecord.uid} as admin.`);
      } else {
         console.log('User does not exist. Please sign up on the website first.');
      }
    } else {
      for (const doc of snapshot.docs) {
        await doc.ref.update({ 
          role: 'admin',
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`Updated user ${doc.id} (${targetEmail}) to admin.`);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

grantAdmin();
