import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

// Sync newly created auth users to Firestore collection 'auth_users'
export const syncAuthUserOnCreate = functions.auth.user().onCreate((user) => {
  const docRef = db.collection('auth_users').doc(user.uid);
  return docRef.set({
    uid: user.uid,
    email: user.email || '',
    phoneNumber: user.phoneNumber || '',
    displayName: user.displayName || '',
    creationTime: user.metadata.creationTime,
    lastSignInTime: user.metadata.lastSignInTime,
    syncedAt: admin.firestore.FieldValue.serverTimestamp()
  });
});

// Remove user from Firestore when deleted from Auth
export const syncAuthUserOnDelete = functions.auth.user().onDelete((user) => {
  const docRef = db.collection('auth_users').doc(user.uid);
  return docRef.delete();
});
