// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, type Analytics } from "firebase/analytics";
// Import other Firebase services as needed, e.g.:
// import { getFirestore } from "firebase/firestore";
// import { getAuth } from "firebase/auth";
// import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBssScXwadFMajRBpVoXIMEwE9RR9MgqPY",
  authDomain: "breatheeasy-dashboard-ag0rl.firebaseapp.com",
  databaseURL: "https://breatheeasy-dashboard-ag0rl-default-rtdb.firebaseio.com",
  projectId: "breatheeasy-dashboard-ag0rl",
  storageBucket: "breatheeasy-dashboard-ag0rl.firebasestorage.app",
  messagingSenderId: "652574746004",
  appId: "1:652574746004:web:e05d233b501d867f359b81"
};

let app: FirebaseApp;
let analytics: Analytics | null = null;

if (typeof window !== 'undefined' && !getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    if (firebaseConfig.apiKey) {
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
  if (typeof window !== 'undefined' && firebaseConfig.apiKey) {
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