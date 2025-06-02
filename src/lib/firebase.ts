
// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, type Analytics } from "firebase/analytics";
// Import other Firebase services as needed, e.g.:
// import { getFirestore } from "firebase/firestore";
// import { getAuth } from "firebase/auth";
// import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp;
let analytics: Analytics | null = null;

if (typeof window !== 'undefined' && !getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    if (firebaseConfig.measurementId) {
      analytics = getAnalytics(app);
    }
  } catch (error) {
    console.error("Firebase initialization error", error);
    // Fallback or ensure app is defined even if analytics fails
    if (!app!) app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }
} else {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig); // For server-side or if already initialized
  // Analytics should only be initialized on the client
  if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
     try {
        analytics = getAnalytics(app);
     } catch (error) {
        console.error("Firebase Analytics initialization error on subsequent check", error);
     }
  }
}


// Example exports for other services (uncomment and import getFirestore/getAuth as needed)
// const firestore = getFirestore(app);
// const auth = getAuth(app);
// const storage = getStorage(app);

export { app, analytics };
// export { app, firestore, auth, storage, analytics };
