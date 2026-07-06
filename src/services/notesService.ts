import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import type { Note } from "../types";

const notesDoc = () => {
  const user = auth.currentUser;
  if (!user) return null;

  return doc(db, "users", user.uid, "data", "notes");
};

export async function loadNotes() {
  const ref = notesDoc();
  if (!ref) return [];

  const snap = await getDoc(ref);
  if (!snap.exists()) return [];

  return (snap.data().notes || []) as Note[];
}

export async function saveNotes(notes: Note[]) {
  const ref = notesDoc();
  if (!ref) return;

  await setDoc(ref, { notes }, { merge: true });
}

export function subscribeNotes(callback: (notes: Note[]) => void) {
  const ref = notesDoc();
  if (!ref) return () => {};

  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      callback([]);
      return;
    }

    callback((snap.data().notes || []) as Note[]);
  });
}