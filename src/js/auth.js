import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { ref, get, set, runTransaction, remove } from "firebase/database";
import { app, db } from "./utils.js";

export const auth = getAuth(app);

const NAME_MIN = 3;
const NAME_MAX = 20;
const NAME_REGEX = /^[a-zA-Z0-9_ ]+$/;

export function normalizeName(name = "") {
  return name.trim().toLowerCase();
}

export function validateDisplayName(name) {
  if (!name) return "Display name is required";
  const trimmed = name.trim();
  if (trimmed.length < NAME_MIN) return `At least ${NAME_MIN} characters`;
  if (trimmed.length > NAME_MAX) return `At most ${NAME_MAX} characters`;
  if (!NAME_REGEX.test(trimmed))
    return "Only letters, numbers, underscores and spaces";
  return null;
}

export async function reserveDisplayName(displayName, uid) {
  const error = validateDisplayName(displayName);
  if (error) throw new Error(error);

  const trimmed = displayName.trim();
  const normalized = normalizeName(trimmed);
  const nameRef = ref(db, `displayNames/${normalized}`);

  const result = await runTransaction(nameRef, (current) => {
    if (current === null) {
      return { uid, displayName: trimmed, createdAt: Date.now() };
    }
    if (current.uid === uid) {
      return { ...current, displayName: trimmed };
    }
    return;
  });

  if (!result.committed || result.snapshot.val()?.uid !== uid) {
    throw new Error("That display name is already taken");
  }

  await set(ref(db, `users/${uid}/displayName`), trimmed);
  await set(ref(db, `users/${uid}/normalizedName`), normalized);

  if (auth.currentUser) {
    try {
      await updateProfile(auth.currentUser, { displayName: trimmed });
    } catch (e) {
      console.warn("[auth] updateProfile failed:", e);
    }
  }
  return trimmed;
}

export async function getDisplayName(uid) {
  const snap = await get(ref(db, `users/${uid}/displayName`));
  return snap.exists() ? snap.val() : null;
}

export async function signUp(email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signIn(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signInAnonymouslyUser() {
  const cred = await signInAnonymously(auth);
  return cred.user;
}

export async function signOutUser() {
  await signOut(auth);
}

export function onAuthChange(cb) {
  return onAuthStateChanged(auth, cb);
}

export function mapAuthError(err) {
  const code = err?.code || "";
  const map = {
    "auth/email-already-in-use":
      "This email is already registered. Try signing in.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/network-request-failed": "Network error. Check your connection.",
    "auth/missing-password": "Please enter your password.",
  };
  return map[code] || err?.message || "Something went wrong.";
}
