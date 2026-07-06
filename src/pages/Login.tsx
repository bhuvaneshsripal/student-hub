import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  CalendarClock,
  GraduationCap,
  ClipboardCheck,
  Rocket,
  X,
} from "lucide-react";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase";
import { useNavigate } from "react-router-dom";

const FEATURES = [
  {
    title: "Timetable",
    subtitle: "Smart Management",
    icon: CalendarClock,
    gradient: "linear-gradient(135deg, #5B9CFF 0%, #3B5BFF 100%)",
  },
  {
    title: "CGPA",
    subtitle: "Smart Management",
    icon: GraduationCap,
    gradient: "linear-gradient(135deg, #B08CFF 0%, #8B3AFF 100%)",
  },
  {
    title: "Attendance",
    subtitle: "Smart Management",
    icon: ClipboardCheck,
    gradient: "linear-gradient(135deg, #35D0B8 0%, #0FB89A 100%)",
  },
  {
    title: "Placement",
    subtitle: "Smart Management",
    icon: Rocket,
    gradient: "linear-gradient(135deg, #FFC15C 0%, #FF9F1C 100%)",
  },
];

async function ensureUserDoc(user: {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}) {
  await setDoc(
    doc(db, "users", user.uid),
    {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      photo: user.photoURL,
      createdAt: new Date(),
    },
    { merge: true }
  );
}

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      try {
        const result = await signInWithEmailAndPassword(auth, email.trim(), password);
        await ensureUserDoc(result.user);
      } catch (err: any) {
        // No account yet with this email — create one automatically.
        if (err?.code === "auth/user-not-found" || err?.code === "auth/invalid-credential") {
          const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
          await ensureUserDoc(result.user);
        } else {
          throw err;
        }
      }
      navigate("/");
    } catch (err: any) {
      console.error(err);
      setError(friendlyAuthError(err?.code));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await ensureUserDoc(result.user);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!forgotEmail.trim()) return;
    setForgotStatus("sending");
    try {
      await sendPasswordResetEmail(auth, forgotEmail.trim());
      setForgotStatus("sent");
    } catch (err) {
      console.error(err);
      setForgotStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-5 py-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src="/studo-logo.png"
            alt="Studo"
            className="w-28 h-28 rounded-[28px] shadow-lg object-contain"
            loading="eager"
            decoding="async"
          />
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-3">
          {/* Email */}
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 focus-within:border-[#3B5BFF] focus-within:shadow-[0_0_0_3px_rgba(59,91,255,0.12)]"
            style={{ borderColor: "var(--line)" }}
          >
            <Mail size={19} className="text-[#3B5BFF] shrink-0" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              autoComplete="email"
              className="w-full bg-transparent outline-none border-none text-[15px] font-medium placeholder:text-[#9296B8] placeholder:font-medium"
              style={{ color: "var(--ink)", boxShadow: "none" }}
            />
          </div>

          {/* Password */}
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 focus-within:border-[#3B5BFF] focus-within:shadow-[0_0_0_3px_rgba(59,91,255,0.12)]"
            style={{ borderColor: "var(--line)" }}
          >
            <Lock size={19} className="text-[#3B5BFF] shrink-0" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              className="w-full bg-transparent outline-none border-none text-[15px] font-medium placeholder:text-[#9296B8] placeholder:font-medium"
              style={{ color: "var(--ink)", boxShadow: "none" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="shrink-0 text-[#63678C]"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <p className="text-xs text-red-500 pt-1">{error}</p>
          )}

          <div className="flex justify-end pt-1 pb-1">
            <button
              type="button"
              onClick={() => {
                setForgotEmail(email);
                setForgotStatus("idle");
                setForgotOpen(true);
              }}
              className="text-xs font-medium text-[#3B5BFF] hover:underline"
            >
              Forget password
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-1 py-3.5 rounded-full text-white font-semibold text-[16px] shadow-lg transition-transform active:scale-[0.98] disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #5B9CFF 0%, #3B5BFF 100%)" }}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-2.5 mt-5 py-3 rounded-full text-[15px] font-semibold border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_24px_-4px_rgba(59,91,255,0.55)] disabled:opacity-60"
          style={{
            color: "var(--ink)",
            borderColor: "rgba(59,91,255,0.3)",
            boxShadow: "0 0 0 1px rgba(59,91,255,0.06), 0 4px 18px -6px rgba(59,91,255,0.35)",
          }}
        >
          <svg width="19" height="19" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.6 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.7 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.5 0 10.4-2.1 14.1-5.5l-6.5-5.5C29.6 34.9 27 36 24 36c-5.4 0-9.9-3.4-11.5-8.2l-6.5 5C9.5 39.6 16.2 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 3-3.2 5.4-6.1 6.9l6.5 5.5C39.7 37 44 31 44 24c0-1.3-.1-2.7-.4-3.5z" />
          </svg>
          Continue with Google
        </button>

        {/* Feature cards */}
        <div className="grid grid-cols-2 gap-3 mt-8">
          {FEATURES.map(({ title, subtitle, icon: Icon, gradient }) => (
            <div
              key={title}
              className="rounded-2xl p-4 text-white flex flex-col justify-between min-h-[92px] shadow-md"
              style={{ background: gradient }}
            >
              <Icon size={22} strokeWidth={2.25} />
              <div className="mt-2">
                <p className="font-bold text-[15px] leading-tight">{title}</p>
                <p className="text-[11px] opacity-90 leading-tight mt-0.5">{subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Forgot password modal */}
      <AnimatePresence>
        {forgotOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/40" onClick={() => setForgotOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.18 }}
              className="relative w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg text-[#12142B]">Reset password</h3>
                <button onClick={() => setForgotOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5">
                  <X size={18} className="text-[#63678C]" />
                </button>
              </div>

              {forgotStatus === "sent" ? (
                <p className="text-sm text-[#63678C]">
                  A password reset link has been sent to <strong>{forgotEmail}</strong>. Check your inbox.
                </p>
              ) : (
                <>
                  <p className="text-sm text-[#63678C] mb-4">
                    Enter your email and we'll send you a link to reset your password.
                  </p>
                  <div
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border mb-4 transition-all duration-200 focus-within:border-[#3B5BFF] focus-within:shadow-[0_0_0_3px_rgba(59,91,255,0.12)]"
                    style={{ borderColor: "var(--line)" }}
                  >
                    <Mail size={17} className="text-[#3B5BFF]" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="Email Address"
                      className="w-full bg-transparent outline-none border-none text-sm"
                    />
                  </div>
                  {forgotStatus === "error" && (
                    <p className="text-xs text-red-500 mb-3">Couldn't send reset email. Check the address and try again.</p>
                  )}
                  <button
                    onClick={handleForgotPassword}
                    disabled={forgotStatus === "sending"}
                    className="w-full py-3 rounded-full text-white font-semibold text-sm disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg, #5B9CFF 0%, #3B5BFF 100%)" }}
                  >
                    {forgotStatus === "sending" ? "Sending..." : "Send reset link"}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function friendlyAuthError(code?: string) {
  switch (code) {
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}
