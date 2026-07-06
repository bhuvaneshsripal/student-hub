import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import type { PomodoroSession } from "../types";

const pomodoroDoc = () => {
  const user = auth.currentUser;
  if (!user) return null;

  return doc(db, "users", user.uid, "data", "pomodoro");
};

export async function loadPomodoro() {
  const ref = pomodoroDoc();
  if (!ref) return [];

  const snap = await getDoc(ref);

  if (!snap.exists()) return [];

  return (snap.data().sessions || []) as PomodoroSession[];
}

export async function savePomodoro(
  sessions: PomodoroSession[]
) {
  const ref = pomodoroDoc();
  if (!ref) return;

  await setDoc(
    ref,
    {
      sessions,
    },
    { merge: true }
  );
}

export function subscribePomodoro(
  callback: (sessions: PomodoroSession[]) => void
) {
  const ref = pomodoroDoc();
  if (!ref) return () => {};

  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      callback([]);
      return;
    }

    callback(
      (snap.data().sessions || []) as PomodoroSession[]
    );
  });
}