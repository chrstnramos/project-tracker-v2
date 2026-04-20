// ═══════════════════════════════════════════════════════════
// STORAGE MODULE — Firebase (shared) or localStorage (local)
// ═══════════════════════════════════════════════════════════
//
// SETUP INSTRUCTIONS:
// 1. Go to https://console.firebase.google.com
// 2. Create project → Build → Realtime Database → Create (test mode)
// 3. Project Settings → Your Apps → Web (</>)  → copy config
// 4. Paste config below, set USE_FIREBASE = true
// 5. Push to GitHub → Vercel auto-redeploys
//

import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";

// ⬇️ PASTE YOUR FIREBASE CONFIG HERE ⬇️
const firebaseConfig = {
  apiKey: "AIzaSyDkx0swFAWjveRqPUBEJ1RgMEjZMqgMC1c",
  authDomain: "stx-roadmap.firebaseapp.com",
  databaseURL: "https://stx-roadmap-default-rtdb.firebaseio.com",
  projectId: "stx-roadmap",
  storageBucket: "stx-roadmap.firebasestorage.app",
  messagingSenderId: "971441330456",
  appId: "1:971441330456:web:c159a6290b12e66699666d"
};

// ⬇️ FLIP TO true AFTER ADDING YOUR CONFIG ⬇️
const USE_FIREBASE = true;

// ── Initialize ──
let db = null;
if (USE_FIREBASE && firebaseConfig.apiKey !== "YOUR_API_KEY") {
  try {
    const app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    console.log("[storage] Firebase connected");
  } catch (e) {
    console.warn("[storage] Firebase init failed, using localStorage:", e);
  }
}

const KEY = "stx-roadmap-data";

// ── Public API ──

/**
 * Save data. With Firebase this syncs to all users instantly.
 */
export function saveData(data) {
  if (db) {
    set(ref(db, KEY), data);
  } else {
    localStorage.setItem(KEY, JSON.stringify(data));
  }
}

/**
 * One-time read. Returns data or null.
 * For Firebase, prefer subscribeToData() for realtime updates.
 */
export function loadData() {
  if (db) return null; // use subscribe instead
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Subscribe to realtime changes.
 * - Firebase: fires on every change from ANY user (instant)
 * - localStorage: polls every 3 seconds for cross-tab sync
 * Returns an unsubscribe function.
 */
export function subscribeToData(callback) {
  if (db) {
    const dbRef = ref(db, KEY);
    const unsub = onValue(dbRef, (snapshot) => {
      callback(snapshot.val() || null);
    });
    return unsub;
  } else {
    // Initial load
    const initial = loadData();
    callback(initial);
    // Poll for cross-tab changes
    const interval = setInterval(() => {
      callback(loadData());
    }, 3000);
    return () => clearInterval(interval);
  }
}

/**
 * Returns true if Firebase is active.
 */
export function isLiveSync() {
  return !!db;
}
