import { useEffect, useRef } from 'react';
import { useAuthUser } from '../hooks/useAuthUser';
import { useSettingsStore } from '../store/settingsStore';
import { fetchProfileFromCloud, saveProfileToCloud } from '../lib/profileSync';

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

  const readyToSync = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Step A — download on login
  useEffect(() => {
    readyToSync.current = false;
    if (!user) return;

    let cancelled = false;
    (async () => {
      const cloudProfile = await fetchProfileFromCloud(user.uid);
      if (cancelled) return;

      if (cloudProfile) {
        updateProfile(cloudProfile);
      } else {
        // Nothing in the cloud yet for this account — seed it with
        // whatever is currently sitting in local storage.
        await saveProfileToCloud(user.uid, profile);
      }
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
