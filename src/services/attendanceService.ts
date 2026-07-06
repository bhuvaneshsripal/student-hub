import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
 setDoc,
  onSnapshot,
} from "firebase/firestore";

import type { AttendanceSubject } from "../types";

const attendanceDoc = () => {
  const user = auth.currentUser;

  if (!user) return null;

  return doc(db, "users", user.uid, "data", "attendance");
};

export async function loadAttendance() {
  const ref = attendanceDoc();

  if (!ref) return [];

  const snap = await getDoc(ref);

  if (!snap.exists()) return [];

  return (snap.data().subjects || []) as AttendanceSubject[];
}

export async function saveAttendance(
  subjects: AttendanceSubject[]
) {
  const ref = attendanceDoc();

  if (!ref) return;

  await setDoc(
    ref,
    {
      subjects,
    },
    { merge: true }
  );
}

export function subscribeAttendance(
  callback: (subjects: AttendanceSubject[]) => void
) {
  const ref = attendanceDoc();

  if (!ref) return () => {};

  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      callback([]);
      return;
    }

    callback(
      (snap.data().subjects || []) as AttendanceSubject[]
    );
  });
}