import { useState, useRef, useEffect } from "react";
import { Bell, Menu, Bot, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";

import { GlobalSearch } from "./GlobalSearch";
import { ThemeToggle } from "../ui/ThemeToggle";
import { Modal } from "../ui/Modal";
import {
  useSettingsStore,
  playNotificationSound,
} from "../../store/settingsStore";
import { NotificationsPanel } from "./NotificationsPanel";
import { auth } from "../../firebase";

export function Topbar({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  const navigate = useNavigate();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  // Google's profile photo URL occasionally fails to load (ad/tracker
  // blockers, expired token, offline, etc). When it does, fall back to
  // initials/Bot instead of leaving a broken-image icon in the header.
  const [avatarBroken, setAvatarBroken] = useState(false);

  const profile = useSettingsStore((s) => s.profile);
  const notificationSound = useSettingsStore((s) => s.notificationSound);

  const wrapRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    } finally {
      setLoggingOut(false);
      setConfirmLogoutOpen(false);
    }
  };

  useEffect(() => {
    setAvatarBroken(false);
  }, [profile.avatar]);

  useEffect(() => {
    if (!notifOpen && !profileMenuOpen) return;

    function onOutside(e: MouseEvent | TouchEvent) {
      if (
        wrapRef.current &&
        !wrapRef.current.contains(e.target as Node)
      ) {
        setNotifOpen(false);
        setProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", onOutside);
    document.addEventListener("touchstart", onOutside);

    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("touchstart", onOutside);
    };
  }, [notifOpen, profileMenuOpen]);

  return (
    <header
      className="sticky top-0 z-40 flex items-center gap-3 px-4 md:px-6 py-3 bg-mesh border-b"
      style={{
        backgroundColor: "var(--bg)",
        borderColor: "var(--line)",
      }}
    >
      <button
        onClick={onMenuClick}
        className={`md:hidden w-9 h-9 items-center justify-center rounded-lg ${searchActive ? "hidden" : "flex"}`}
      >
        <Menu size={20} style={{ color: "var(--ink)" }} />
      </button>

      <div className="flex-1 flex justify-center md:justify-start">
        <GlobalSearch onExpandedChange={setSearchActive} />
      </div>

      <div
        ref={wrapRef}
        className={`items-center gap-3 relative ${searchActive ? "hidden md:flex" : "flex"}`}
      >
        <ThemeToggle />

        <button
          onClick={() => {
            if (!notifOpen && notificationSound) {
              playNotificationSound();
            }
            setNotifOpen(!notifOpen);
          }}
          className="relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-black/5"
        >
          <Bell size={18} style={{ color: "var(--ink)" }} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
        </button>

        {notifOpen && (
          <NotificationsPanel
            onClose={() => setNotifOpen(false)}
          />
        )}

        <div className="relative">
          <button
            onClick={() => setProfileMenuOpen((v) => !v)}
            className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
          >
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--blue)] to-[var(--purple)] flex items-center justify-center text-[var(--on-accent)] overflow-hidden shrink-0">
              {profile.avatar && !avatarBroken ? (
                <img
                  src={profile.avatar}
                  alt="Profile"
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarBroken(true)}
                  className="w-full h-full object-cover"
                />
              ) : profile.name.trim() ? (
                profile.name
                  .trim()
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
              ) : (
                <Bot size={18} />
              )}
            </span>
            <span className="hidden sm:block text-sm font-medium max-w-[9rem] truncate" style={{ color: "var(--ink)" }}>
              {profile.name.trim() || "Student"}
            </span>
          </button>

          {profileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              className="absolute right-0 top-12 w-64 rounded-[20px] p-2 z-50"
              style={{ background: "var(--glass-solid)", border: "1px solid var(--line)", boxShadow: "var(--shadow)" }}
            >
              <Link
                to="/profile"
                onClick={() => setProfileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
              >
                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--blue)] to-[var(--purple)] flex items-center justify-center text-[var(--on-accent)] overflow-hidden shrink-0">
                  {profile.avatar && !avatarBroken ? (
                    <img
                      src={profile.avatar}
                      alt="Profile"
                      referrerPolicy="no-referrer"
                      onError={() => setAvatarBroken(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : profile.name.trim() ? (
                    profile.name.trim().split(" ").map((n) => n[0]).slice(0, 2).join("")
                  ) : (
                    <Bot size={18} />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "var(--ink)" }}>
                    {profile.name.trim() || "Add your name"}
                  </p>
                  <p className="text-xs truncate" style={{ color: "var(--ink-soft)" }}>
                    {auth.currentUser?.email ?? "Not signed in"}
                  </p>
                </div>
              </Link>

              <div className="my-1.5 border-t" style={{ borderColor: "var(--line)" }} />

              <button
                onClick={() => {
                  setProfileMenuOpen(false);
                  setConfirmLogoutOpen(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                style={{ color: "#F04438" }}
              >
                <LogOut size={16} />
                Logout
              </button>
            </motion.div>
          )}
        </div>
      </div>

      <Modal
        open={confirmLogoutOpen}
        onClose={() => setConfirmLogoutOpen(false)}
        title="Log out?"
        width="max-w-sm"
      >
        <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
          You'll need to sign in again to access your dashboard. Are you sure you want to log out?
        </p>
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={() => setConfirmLogoutOpen(false)}
            className="px-4 py-2 rounded-xl text-sm font-medium border"
            style={{ borderColor: "var(--line)", color: "var(--ink)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition disabled:opacity-60"
          >
            {loggingOut ? "Logging out..." : "Log out"}
          </button>
        </div>
      </Modal>
    </header>
  );
}