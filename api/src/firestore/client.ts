import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { env } from "../config/env.js";

export function ensureFirebaseApp() {
  if (getApps().length === 0) {
    initializeApp({
      credential: applicationDefault(),
      projectId: env.firestoreProjectId,
    });
  }
}

export function getDb() {
  ensureFirebaseApp();
  return getFirestore();
}
