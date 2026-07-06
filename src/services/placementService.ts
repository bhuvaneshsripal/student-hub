import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";

import type {
  TopicProgress,
  PlatformStat,
  ResumeChecklistItem,
} from "../types";

export interface PlacementData {
  aptitude: TopicProgress[];
  languages: TopicProgress[];
  dsa: TopicProgress[];
  webdev: TopicProgress[];
  interview: TopicProgress[];
  resumeChecklist: ResumeChecklistItem[];
  platforms: PlatformStat[];
}

function placementDoc() {
  const user = auth.currentUser;

  if (!user) return null;

  return doc(
    db,
    "users",
    user.uid,
    "data",
    "placement"
  );
}

export async function loadPlacement(): Promise<PlacementData | null> {
  const ref = placementDoc();

  if (!ref) return null;

  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return snap.data() as PlacementData;
}

export async function savePlacement(data: PlacementData) {
  const ref = placementDoc();

  if (!ref) return;

  await setDoc(ref, data, { merge: true });
}

export function subscribePlacement(
  callback: (data: PlacementData | null) => void
) {
  const ref = placementDoc();

  if (!ref) return () => {};

  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }

    callback(snap.data() as PlacementData);
  });
}