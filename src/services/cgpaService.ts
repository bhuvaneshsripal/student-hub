import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import type { Semester } from "../types";

const cgpaDoc = () => {
  const user = auth.currentUser;

  if (!user) return null;

  return doc(db, "users", user.uid, "data", "cgpa");
};

export async function loadCgpa() {
const ref = cgpaDoc();
if (!ref) return [];
const snap = await getDoc(ref);

  if (!snap.exists()) return [];

  return (snap.data().semesters || []) as Semester[];
}

export async function saveCgpa(semesters: Semester[]) {
  const ref = cgpaDoc();
if (!ref) return;

await setDoc(ref, { semesters }, { merge: true });
}

export function subscribeCgpa(callback: (semesters: Semester[]) => void) {
    const ref = cgpaDoc();
    if (!ref) return () => {};

  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      callback([]);
      return;
    }

    callback((snap.data().semesters || []) as Semester[]);
  });
}