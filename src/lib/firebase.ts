import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, type Analytics } from "firebase/analytics";
import { getDatabase, type Database } from "firebase/database"; // <-- Add this

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
let database: Database | null = null; // <-- Add this

if (typeof window !== 'undefined' && !getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    if (firebaseConfig.apiKey) {
      analytics = getAnalytics(app);
    }
    database = getDatabase(app); // <-- Add this
  } catch (error) {
    console.error("Firebase initialization error", error);
    if (!app!) app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    database = getDatabase(app); // <-- Add this
  }
} else {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  database = getDatabase(app); // <-- Add this
  if (typeof window !== 'undefined' && firebaseConfig.apiKey) {
    try {
      analytics = getAnalytics(app);
    } catch (error) {
      console.error("Firebase Analytics initialization error on subsequent check", error);
    }
  }
}

// Export database instance
export { app, analytics, database };
