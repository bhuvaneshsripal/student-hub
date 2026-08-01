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

/** Turns the local part of an email into a readable display name, for
 * accounts (email/password signups) that don't have a provider-supplied
 * display name the way Google sign-in does. "bhuvi.tvk07" -> "Bhuvi Tvk",
 * "john_doe" -> "John Doe", "priya2023" -> "Priya". Purely a starting
 * point — the person can rename themselves in Profile at any time. */
export function deriveNameFromEmail(email: string | null | undefined): string {
  const local = email?.split('@')[0] ?? '';
  const words = local
    .split(/[._\-+0-9]+/)
    .map((w) => w.trim())
    .filter(Boolean);
  if (words.length === 0) return '';
  return words
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}
