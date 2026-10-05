import { initializeApp } from "firebase/app";
import { addDoc, collection, getFirestore, serverTimestamp } from "firebase/firestore";

/**
 * Public web client config — not a secret (see plan_chatgpt docs: Firebase web
 * config is distinct from server credentials). Safe to ship in the bundle.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export interface NewReviewInput {
  image: string;
  title: string;
  comment: string;
  star: string;
}

/**
 * Ported unchanged from my_flix.html: a direct browser write to Firestore once
 * the caller has already verified the secret key client-side. The user
 * explicitly confirmed (twice) that this mechanism should stay as-is — no
 * Firebase Auth / server-side write path for registration.
 */
export async function addReview(input: NewReviewInput): Promise<void> {
  await addDoc(collection(db, "movies"), {
    ...input,
    created_at: serverTimestamp(),
  });
}
