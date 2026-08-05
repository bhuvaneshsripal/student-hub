import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";

const timetableDoc = () => {
  const user = auth.currentUser;
  if (!user) return null;

  return doc(db, "users", user.uid, "data", "timetable");
};

export async function loadTimetable() {
  const ref = timetableDoc();
  if (!ref) return [];

  const snap = await getDoc(ref);
  if (!snap.exists()) return [];
  return snap.data().classes || [];
}

export async function saveTimetable(classes: any[]) {
  const ref = timetableDoc();
  if (!ref) return;

  await setDoc(
    ref,
    { classes },
    { merge: true }
  );
}

export function subscribeTimetable(callback: (classes: any[]) => void) {
  const ref = timetableDoc();
  if (!ref) return () => {};

  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      callback([]);
      return;
    }

    callback(snap.data().classes || []);
  });
}