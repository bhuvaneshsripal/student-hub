import { useEffect, useRef } from 'react';
import { useAuthUser } from '../hooks/useAuthUser';
import { useSettingsStore } from '../store/settingsStore';
import { fetchProfileFromCloud, saveProfileToCloud, deriveNameFromEmail } from '../lib/profileSync';

/**
 * Renders nothing — just keeps the local profile store and the user's
 * Firestore document in sync so the same Google/email account sees the
 * same profile on any device.
 *
 * Flow:
 *  1. On login, pull the profile down from Firestore and load it into
 *     the local store (source of truth = cloud, once it exists).
 *  2. On every local edit afterwards, push the change up to Firestore
 *     (debounced so we don't write on every keystroke).
 */
export function CloudSync() {
  const { user } = useAuthUser();
  const profile = useSettingsStore((s) => s.profile);
  const updateProfile = useSettingsStore((s) => s.updateProfile);
  const resetProfile = useSettingsStore((s) => s.resetProfile);
  const profileOwnerUid = useSettingsStore((s) => s.profileOwnerUid);
  const setProfileOwnerUid = useSettingsStore((s) => s.setProfileOwnerUid);

  const readyToSync = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Step A — download on login
  useEffect(() => {
    readyToSync.current = false;
    if (!user) return;

    // The profile cached in localStorage belongs to whichever account was
    // last logged in on this device/browser. If that isn't *this* account,
    // it's leftover data from someone else's session — wipe it immediately,
    // before we ever read or write the cloud, so it's never shown under the
    // new account and never gets uploaded as if it were the new account's
    // own data.
    if (profileOwnerUid !== user.uid) {
      resetProfile();
    }

    let cancelled = false;
    (async () => {
      const cloudProfile = await fetchProfileFromCloud(user.uid);
      if (cancelled) return;

      if (cloudProfile) {
        updateProfile(cloudProfile);
      }
      // Auto-fill the name from the signed-in account the first time only —
      // once someone has a name saved (even an auto-filled one) we never
      // overwrite it again, so a manual rename in Profile always sticks.
      if (!cloudProfile?.name?.trim()) {
        const autoName = user.displayName?.trim() || deriveNameFromEmail(user.email);
        if (autoName) updateProfile({ name: autoName });
      }
      // Profile picture is taken from the signed-in account (Google account
      // photo, etc.) and kept in sync automatically — UNLESS the person has
      // uploaded their own picture in Profile (cropped/rotated via the
      // avatar editor), in which case that custom picture always wins and
      // is never silently replaced by the provider photo.
      const customAvatar = cloudProfile?.avatarIsCustom || useSettingsStore.getState().profile.avatarIsCustom;
      if (user.photoURL && !customAvatar) {
        updateProfile({ avatar: user.photoURL });
      }
      // If there's no cloud profile yet, we simply leave the (now blank,
      // or already-correct) local profile as-is. It gets saved to the
      // cloud once the user actually fills in their own details, via
      // Step B below — we never push stale/foreign local data up.
      setProfileOwnerUid(user.uid);
      readyToSync.current = true;
    })();

    return () => {
      cancelled = true;
    };
    // Only re-run when the logged-in user changes, not on every profile edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  // Step B — upload on every subsequent edit (debounced)
  useEffect(() => {
    if (!user || !readyToSync.current) return;

    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveProfileToCloud(user.uid, profile);
    }, 800);

    return () => clearTimeout(saveTimer.current);
  }, [profile, user]);

  return null;
}
