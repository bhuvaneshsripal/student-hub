import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";

import type { CalendarEvent } from "../types";

const calendarDoc = () => {
  const user = auth.currentUser;
  if (!user) return null;

  return doc(db, "users", user.uid, "data", "calendar");
};

export async function loadCalendar() {
  const ref = calendarDoc();
  if (!ref) return [];

  const snap = await getDoc(ref);

  if (!snap.exists()) return [];

  return (snap.data().events || []) as CalendarEvent[];
}

export async function saveCalendar(events: CalendarEvent[]) {
  const ref = calendarDoc();
  if (!ref) return;

  await setDoc(
    ref,
    { events },
    { merge: true }
  );
}

export function subscribeCalendar(
  callback: (events: CalendarEvent[]) => void
) {
  const ref = calendarDoc();
  if (!ref) return () => {};

  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      callback([]);
      return;
    }

    callback(
      (snap.data().events || []) as CalendarEvent[]
    );
  });
}