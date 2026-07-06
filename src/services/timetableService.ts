import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";

const timetableDoc = () => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");

  return doc(db, "users", user.uid, "data", "timetable");
};

export async function loadTimetable() {
  const snap = await getDoc(timetableDoc());
  if (!snap.exists()) return [];
  return snap.data().classes || [];
}

export async function saveTimetable(classes: any[]) {
  await setDoc(
    timetableDoc(),
    { classes },
    { merge: true }
  );
}

export function subscribeTimetable(callback: (classes: any[]) => void) {
  return onSnapshot(timetableDoc(), (snap) => {
    if (!snap.exists()) {
      callback([]);
      return;
    }

    callback(snap.data().classes || []);
  });
}