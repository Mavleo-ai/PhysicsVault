import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyCpsFk-dTm0c09RDwBZl3ZlrzbjxV3I_jI",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "physics-vault-af4fd.firebaseapp.com",
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL || "https://physics-vault-af4fd-default-rtdb.firebaseio.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "physics-vault-af4fd",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "physics-vault-af4fd.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "835353082883",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:835353082883:web:f697b53c8db16c500e6236",
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || "G-E5KZ5YRD9Z"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

if (typeof window !== "undefined") {
  try {
    getAnalytics(app);
  } catch (e) {
    console.warn("Analytics initialization failed:", e);
  }
}

// Relativistic subscription tier sync utilities mapped to persistent Firebase User UIDs
export const getUserTier = (uid) => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(`pv_tier_${uid}`) || "free";
  }
  return "free";
};

export const upgradeUserTier = (uid, tier) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(`pv_tier_${uid}`, tier);
  }
  return { tier };
};

// Dual-layer User Activity Persistence Helpers (Firestore Cloud + LocalStorage Mirror)
export const saveUserActivity = async (uid, activityData) => {
  if (typeof window === "undefined" || !uid) return;

  // 1. Mirror locally for instant offline availability
  try {
    localStorage.setItem(`pv_activity_${uid}`, JSON.stringify(activityData));
  } catch (e) {
    console.warn("LocalStorage save user activity failed:", e);
  }

  // 2. Synchronize to Firestore Cloud DB
  try {
    const userDocRef = doc(db, "userActivity", uid);
    await setDoc(userDocRef, activityData, { merge: true });
  } catch (err) {
    console.warn("Firestore sync failed (falling back to LocalStorage):", err.message);
  }
};

export const loadUserActivity = async (uid) => {
  const defaultActivity = { recentlyOpened: [], favorites: [] };
  if (typeof window === "undefined" || !uid) return defaultActivity;

  // Load local state first as high-speed cache
  let localData = defaultActivity;
  try {
    const raw = localStorage.getItem(`pv_activity_${uid}`);
    if (raw) localData = JSON.parse(raw);
  } catch (e) {
    console.warn("LocalStorage load activity failed:", e);
  }

  // Fetch latest cloud state from Firestore
  try {
    const userDocRef = doc(db, "userActivity", uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const cloudData = userDoc.data();
      return {
        recentlyOpened: cloudData.recentlyOpened || localData.recentlyOpened || [],
        favorites: cloudData.favorites || localData.favorites || []
      };
    }
  } catch (err) {
    console.warn("Firestore fetch activity failed (using LocalStorage cache):", err.message);
  }

  return localData;
};
