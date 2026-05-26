import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCpsFk-dTm0c09RDwBZl3ZlrzbjxV3I_jI",
  authDomain: "physics-vault-af4fd.firebaseapp.com",
  projectId: "physics-vault-af4fd",
  storageBucket: "physics-vault-af4fd.firebasestorage.app",
  messagingSenderId: "835353082883",
  appId: "1:835353082883:web:f697b53c8db16c500e6236",
  measurementId: "G-E5KZ5YRD9Z"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

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
