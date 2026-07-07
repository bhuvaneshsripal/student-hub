import { useState, useRef, useEffect } from "react";
import { Bell, Menu, Bot, LogOut } from "lucide-react";
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
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

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
    if (!notifOpen) return;

    function onOutside(e: MouseEvent | TouchEvent) {
      if (
        wrapRef.current &&
        !wrapRef.current.contains(e.target as Node)
      ) {
        setNotifOpen(false);
      }
    }

    document.addEventListener("mousedown", onOutside);
    document.addEventListener("touchstart", onOutside);

    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("touchstart", onOutside);
    };
  }, [notifOpen]);

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
        className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg"
      >
        <Menu size={20} style={{ color: "var(--ink)" }} />
      </button>

      <div className="flex-1 flex justify-center md:justify-start">
        <GlobalSearch />
      </div>

      <div
        ref={wrapRef}
        className="flex items-center gap-3 relative"
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

        <Link
          to="/profile"
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--blue)] to-[var(--purple)] flex items-center justify-center text-[var(--on-accent)] overflow-hidden"
        >
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt="Profile"
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
        </Link>

        <button
          onClick={() => setConfirmLogoutOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition"
        >
          <LogOut size={16} />
          Logout
        </button>
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