import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { Profile } from '../types';

// Stored at: users/{uid}/data/profile
// (kept separate from the users/{uid} doc that Login.tsx already writes,
// which only holds name/email/photo from the auth provider itself)
function profileDocRef(uid: string) {
  return doc(db, 'users', uid, 'data', 'profile');
}

export async function fetchProfileFromCloud(uid: string): Promise<Partial<Profile> | null> {
  const snap = await getDoc(profileDocRef(uid));
  return snap.exists() ? (snap.data() as Partial<Profile>) : null;
}

export async function saveProfileToCloud(uid: string, profile: Profile): Promise<void> {
  await setDoc(profileDocRef(uid), profile, { merge: true });
}
