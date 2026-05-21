import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
try {
  const serviceAccountPath = path.join(__dirname, '../firebase-admin.json');
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error("Error loading firebase-admin.json. Make sure the file exists.", error.message);
  process.exit(1);
}

const db = admin.firestore();

async function syncAuthUsers() {
  console.log("Starting Auth users synchronization...");
  try {
    let pageToken;
    let authUsersCount = 0;
    
    do {
      const listUsersResult = await admin.auth().listUsers(1000, pageToken);
      
      const batch = db.batch();
      
      for (const userRecord of listUsersResult.users) {
        if (userRecord.email) {
          authUsersCount++;
          const docRef = db.collection('auth_users').doc(userRecord.uid);
          
          batch.set(docRef, {
            uid: userRecord.uid,
            email: userRecord.email,
            phoneNumber: userRecord.phoneNumber || '',
            displayName: userRecord.displayName || '',
            creationTime: userRecord.metadata.creationTime,
            lastSignInTime: userRecord.metadata.lastSignInTime,
            syncedAt: admin.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
        }
      }
      
      await batch.commit();
      
      if (listUsersResult.pageToken) {
        pageToken = listUsersResult.pageToken;
      } else {
        pageToken = undefined;
      }
    } while (pageToken);
    
    console.log(`Successfully synced ${authUsersCount} users with email to the 'auth_users' Firestore collection.`);
  } catch (error) {
    console.error("Error syncing auth users:", error);
  }
}

syncAuthUsers().then(() => process.exit(0));
