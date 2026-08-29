import { initializeApp, getApps } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const korixaConfig = {
  apiKey: import.meta.env.VITE_KORIXA_API_KEY,
  authDomain: import.meta.env.VITE_KORIXA_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_KORIXA_PROJECT_ID,
  storageBucket: import.meta.env.VITE_KORIXA_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_KORIXA_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_KORIXA_APP_ID,
}

// Initialize as secondary app (named "korixa") — won't conflict with LMIS Firebase
const korixaApp = getApps().find(a => a.name === "korixa") || initializeApp(korixaConfig, "korixa")
export const korixaDb = getFirestore(korixaApp)
