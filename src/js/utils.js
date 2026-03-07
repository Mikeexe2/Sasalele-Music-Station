import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

export async function initExternalTools() {
  try {
    const { init } = await import("@waline/client");
    init({
      el: "#waline",
      serverURL: import.meta.env.VITE_WALINE_SERVER_URL,
      lang: "en",
      pageview: true,
      meta: ["nick"],
      reaction: [
        "/i1.png",
        "/i2.png",
        "/i3.png",
        "/i4.png",
        "/i5.png",
        "/i6.png",
      ],
      noCopyright: true,
    });
  } catch (err) {
    console.error("Failed to load external services:", err);
  }
}
