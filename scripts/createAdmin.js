import admin from "firebase-admin";
import fs from "fs";
import readline from "readline";

// Load service account credentials
const serviceAccountPath = "./LmserviceAccountKey.json";
if (!fs.existsSync(serviceAccountPath)) {
  console.error(`❌ Error: ${serviceAccountPath} not found in root directory.`);
  process.exit(1);
}

const serviceAccount = JSON.parse(
  fs.readFileSync(serviceAccountPath, "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function setAdminClaim(email, password = null) {
  try {
    let user;
    try {
      user = await admin.auth().getUserByEmail(email);
      console.log(`ℹ️ User found in Auth: ${user.uid} (${email})`);
    } catch (err) {
      if (err.code === 'auth/user-not-found' && password) {
        console.log(`ℹ️ User not found in Auth. Creating new user: ${email}`);
        user = await admin.auth().createUser({
          email,
          password,
          emailVerified: true,
        });
      } else {
        throw err;
      }
    }

    // Set custom claims
    await admin.auth().setCustomUserClaims(user.uid, {
      admin: true,
    });
    console.log(`✅ Admin claims set successfully in Auth for: ${email}`);

    // Sync to Firestore 'users' collection as requested
    console.log(`ℹ️ Syncing admin data to Firestore 'users' collection...`);
    await db.collection("users").doc(user.uid).set({
      email: email,
      role: "admin",
      isAdmin: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      displayName: email.split('@')[0], // Default display name
    }, { merge: true });

    console.log(`✅ Firestore 'users' document updated for: ${email}`);
    console.log("UID:", user.uid);
  } catch (err) {
    if (err.code === 'auth/user-not-found' && !password) {
      console.error(`❌ Error: User with email ${email} not found in Auth. Please provide a password to create a new user.`);
    } else {
      console.error("❌ Error:", err.message);
    }
  } finally {
    process.exit();
  }
}

// CLI args support:
// node scripts/createAdmin.js you@example.com (promote)
// node scripts/createAdmin.js you@example.com yourPassword (create or promote)
const emailArg = process.argv[2];
const passwordArg = process.argv[3];

if (emailArg) {
  setAdminClaim(emailArg, passwordArg);
} else {
  // Fallback to interactive mode
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Admin email: ", (email) => {
    rl.question("Admin password (leave blank to promote existing user): ", (password) => {
      rl.close();
      setAdminClaim(email, password || null);
    });
  });
}
