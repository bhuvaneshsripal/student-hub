import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Calendar,
  GraduationCap,
  X,
  BarChart3,
  Code2,
  Target,
  Users,
  TrendingUp,
  Trophy,
  ChevronRight,
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
  { title: "Timetable", subtitle: "Smart Management", icon: Calendar, bg: "#FFC107" },
  { title: "CGPA", subtitle: "Smart Management", icon: GraduationCap, bg: "#6EC6FF" },
];

const SIDE_FEATURES = [
  { title: "Smart Timetable", subtitle: "Plan your day better", icon: Calendar, color: "#3B82F6" },
  { title: "Track CGPA", subtitle: "Monitor your progress", icon: TrendingUp, color: "#10B981" },
  { title: "Practice DSA", subtitle: "Sharpen your skills", icon: Code2, color: "#6366F1" },
  { title: "Aptitude Tests", subtitle: "Prepare & improve", icon: Target, color: "#EC4899" },
];

const STATS = [
  { value: "50K+", label: "Active Students", icon: Users, color: "#8B5CF6" },
  { value: "90%", label: "Stay Consistent", icon: TrendingUp, color: "#3B82F6" },
  { value: "85%", label: "Goals Achieved", icon: Target, color: "#10B981" },
  { value: "Top 1%", label: "Aiming Higher", icon: Trophy, color: "#EC4899" },
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
    <div className="s2 min-h-screen relative flex flex-col items-center justify-center gap-8 px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      {/* Decorative background layer */}
      <div className="s2-bg" aria-hidden="true">
        <div className="s2-wash s2-wash-a" />
        <div className="s2-wash s2-wash-b" />
        <div className="s2-dots" />
        <svg className="s2-wave s2-wave-a" viewBox="0 0 300 120" fill="none">
          <path d="M0 60 Q 75 10 150 60 T 300 60" stroke="url(#g1)" strokeWidth="2" />
          <defs>
            <linearGradient id="g1" x1="0" y1="0" x2="300" y2="0">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="50%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
        </svg>
        <svg className="s2-wave s2-wave-b" viewBox="0 0 300 120" fill="none">
          <path d="M0 60 Q 75 110 150 60 T 300 60" stroke="url(#g2)" strokeWidth="2" />
          <defs>
            <linearGradient id="g2" x1="0" y1="0" x2="300" y2="0">
              <stop offset="0%" stopColor="#FFC107" />
              <stop offset="50%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ============ Main row: left / card / right ============ */}
      <div className="relative z-10 w-full flex flex-col xl:flex-row items-center justify-center gap-8 xl:gap-6 2xl:gap-14">
        {/* Left decorative column (desktop only) */}
        <div className="s2-left hidden xl:block" aria-hidden="true">
          <p className="s2-eyebrow">Plan Today</p>
          <p className="s2-eyebrow">Learn Better</p>
          <p className="s2-eyebrow s2-eyebrow-grad">Achieve More</p>
          <p className="s2-sub">Smart tools to help students organize, learn and grow every day.</p>

          <div className="s2-widget s2-progress">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 size={15} className="text-[#6366F1]" />
              <span className="s2-widget-label">Today's Progress</span>
            </div>
            <p className="s2-progress-value">78%</p>
            <svg viewBox="0 0 100 26" className="w-full h-6 mt-1">
              <polyline
                points="0,20 15,17 30,19 45,10 60,13 75,5 100,3"
                fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          </div>

          <StudyIllustration className="s2-illustration" />
        </div>

        {/* ============ Center login card ============ */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm s2-card"
        >
        {/* Logo */}
        <div className="flex justify-center mb-7">
          <img
            src="/studo-logo.png"
            alt="Studo"
            width={112}
            height={112}
            className="w-28 h-28 rounded-[28px] shadow-lg object-contain"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-3.5">
          {/* Email */}
          <div className="s2-pill">
            <Mail size={18} className="s2-pill-icon" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              autoComplete="email"
              className="s2-pill-input"
            />
          </div>

          {/* Password */}
          <div className="s2-pill">
            <Lock size={18} className="s2-pill-icon" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              className="s2-pill-input"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="s2-pill-icon shrink-0"
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

          {error && <p className="text-xs text-red-500 pt-1">{error}</p>}

          <div className="flex justify-end pt-0.5 pb-0.5">
            <button
              type="button"
              onClick={() => {
                setForgotEmail(email);
                setForgotStatus("idle");
                setForgotOpen(true);
              }}
              className="s2-forgot"
            >
              Forgot password?
            </button>
          </div>

          <button type="submit" disabled={loading} className="s2-login-btn">
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="s2-divider">
          <span /> or <span />
        </div>

        <div className="s2-google-wrap">
          <button onClick={handleGoogleLogin} disabled={googleLoading} className="s2-google-btn">
            <svg width="19" height="19" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.6 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.7 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 44c5.5 0 10.4-2.1 14.1-5.5l-6.5-5.5C29.6 34.9 27 36 24 36c-5.4 0-9.9-3.4-11.5-8.2l-6.5 5C9.5 39.6 16.2 44 24 44z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 3-3.2 5.4-6.1 6.9l6.5 5.5C39.7 37 44 31 44 24c0-1.3-.1-2.7-.4-3.5z" />
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-2 gap-3 mt-7">
          {FEATURES.map(({ title, subtitle, icon: Icon, bg }) => (
            <div key={title} className="s2-feature" style={{ background: bg }}>
              <div className="flex items-start justify-between">
                <span className="s2-feature-icon">
                  <Icon size={18} strokeWidth={2.25} />
                </span>
                <ChevronRight size={16} className="opacity-50 mt-1" />
              </div>
              <div className="mt-3">
                <p className="s2-feature-title">{title}</p>
                <p className="s2-feature-sub">{subtitle}</p>
              </div>
            </div>
          ))}
        </div>
        </motion.div>

        {/* Right decorative column (desktop only) */}
        <div className="s2-right hidden xl:block" aria-hidden="true">
          <div className="s2-quote">
            <span className="s2-quote-mark">&ldquo;</span>
            <p>Small steps every day lead to big achievements.</p>
          </div>

          <div className="s2-widget s2-sidelist">
            {SIDE_FEATURES.map(({ title, subtitle, icon: Icon, color }) => (
              <div key={title} className="s2-sidelist-row">
                <span className="s2-sidelist-icon" style={{ color, background: `${color}1A` }}>
                  <Icon size={17} />
                </span>
                <div>
                  <p className="s2-sidelist-title">{title}</p>
                  <p className="s2-sidelist-sub">{subtitle}</p>
                </div>
              </div>
            ))}
          </div>

          <StudyIllustration flip className="s2-illustration" />
        </div>
      </div>

      {/* ============ Stats row (tablet & desktop) ============ */}
      <div className="s2-stats hidden md:flex" aria-hidden="true">
        {STATS.map(({ value, label, icon: Icon, color }) => (
          <div key={label} className="s2-stat">
            <span className="s2-stat-icon" style={{ color }}>
              <Icon size={19} />
            </span>
            <div>
              <p className="s2-stat-value">{value}</p>
              <p className="s2-stat-label">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ============ Compact stats row (mobile only) ============ */}
      <div className="s2-stats-mobile flex md:hidden" aria-hidden="true">
        {STATS.map(({ value, label, color }) => (
          <div key={label} className="s2-stat-mobile">
            <p className="s2-stat-mobile-value" style={{ color }}>{value}</p>
            <p className="s2-stat-mobile-label">{label}</p>
          </div>
        ))}
      </div>

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
              className="relative w-full max-w-sm bg-white rounded-[28px] p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg text-[#12142B]">Reset password</h3>
                <button onClick={() => setForgotOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5">
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
                  <div className="s2-pill mb-4">
                    <Mail size={17} className="s2-pill-icon" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="Email Address"
                      className="s2-pill-input"
                    />
                  </div>
                  {forgotStatus === "error" && (
                    <p className="text-xs text-red-500 mb-3">Couldn't send reset email. Check the address and try again.</p>
                  )}
                  <button
                    onClick={handleForgotPassword}
                    disabled={forgotStatus === "sending"}
                    className="s2-login-btn"
                  >
                    {forgotStatus === "sending" ? "Sending..." : "Send reset link"}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{loginStyles}</style>
    </div>
  );
}

/** Simple flat-vector illustration of students studying — original, non-photographic. */
function StudyIllustration({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 220 150"
      className={className}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      {/* table */}
      <rect x="20" y="112" width="180" height="10" rx="5" fill="#E7DCC8" />
      <rect x="30" y="122" width="8" height="20" fill="#D8CAAE" />
      <rect x="182" y="122" width="8" height="20" fill="#D8CAAE" />

      {/* laptop */}
      <rect x="92" y="92" width="46" height="30" rx="4" fill="#4A4A55" />
      <rect x="96" y="96" width="38" height="20" rx="2" fill="#8FD6FF" />
      <rect x="86" y="120" width="58" height="6" rx="3" fill="#6B6B78" />

      {/* books */}
      <rect x="26" y="98" width="34" height="14" rx="2" fill="#FF9F1C" />
      <rect x="30" y="90" width="28" height="10" rx="2" fill="#3B82F6" />

      {/* mug */}
      <circle cx="182" cy="104" r="10" fill="#F5F5F5" stroke="#D8D8D8" strokeWidth="1" />
      <path d="M190 100 q8 2 0 8" stroke="#D8D8D8" strokeWidth="2" fill="none" />

      {/* person left */}
      <circle cx="55" cy="60" r="16" fill="#F2C7A0" />
      <path d="M40 100 Q40 72 55 72 Q70 72 70 100 Z" fill="#FFC107" />

      {/* person right */}
      <circle cx="150" cy="55" r="16" fill="#C98F63" />
      <path d="M134 96 Q134 66 150 66 Q166 66 166 96 Z" fill="#2E7D5B" />
    </svg>
  );
}

const loginStyles = `
  .s2 { background: #FFF9EE; font-family: 'Inter', system-ui, sans-serif; }

  .s2-bg { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
  .s2-wash { position: absolute; border-radius: 999px; filter: blur(70px); opacity: 0.5; }
  .s2-wash-a { width: 480px; height: 480px; top: -140px; left: -120px; background: radial-gradient(circle, #FFD98A, transparent 70%); }
  .s2-wash-b { width: 420px; height: 420px; top: -100px; right: -120px; background: radial-gradient(circle, #A78BFA, transparent 70%); opacity: 0.35; }
  .s2-dots {
    position: absolute; left: 24px; bottom: 24px; width: 90px; height: 90px;
    background-image: radial-gradient(rgba(139,92,246,0.35) 1.5px, transparent 1.5px);
    background-size: 12px 12px;
  }
  .s2-wave { position: absolute; width: 260px; opacity: 0.6; }
  .s2-wave-a { left: -10px; bottom: 40px; }
  .s2-wave-b { right: -10px; bottom: 10px; transform: scaleY(-1); }

  /* ---- Left / right decorative columns ---- */
  .s2-left, .s2-right {
    width: 260px;
    flex-shrink: 0;
    z-index: 1;
  }
  @media (min-width: 1536px) {
    .s2-left, .s2-right { width: 300px; }
  }

  .s2-eyebrow {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 700;
    font-size: 30px;
    line-height: 1.2;
    color: #1A1F3D;
  }
  .s2-eyebrow-grad {
    background: linear-gradient(90deg, #8B5CF6, #EC4899);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .s2-sub { margin-top: 14px; font-size: 14px; line-height: 1.6; color: #6B7280; max-width: 260px; }

  .s2-widget {
    background: rgba(255,255,255,0.75);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.9);
    border-radius: 18px;
    box-shadow: 0 14px 34px -16px rgba(60,40,20,0.28);
    padding: 14px 16px;
  }
  .s2-progress { margin-top: 26px; width: 170px; }
  .s2-widget-label { font-size: 11.5px; font-weight: 600; color: #4B4B57; }
  .s2-progress-value { font-family: 'Space Grotesk', sans-serif; font-size: 26px; font-weight: 700; color: #1A1F3D; }

  .s2-illustration { width: 100%; height: auto; margin-top: 22px; opacity: 0.95; }

  .s2-quote {
    background: rgba(255,255,255,0.7);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.9);
    border-radius: 18px;
    padding: 16px 18px;
    font-style: italic;
    color: #1A1F3D;
    font-size: 13.5px;
    line-height: 1.5;
    box-shadow: 0 14px 34px -16px rgba(60,40,20,0.22);
  }
  .s2-quote-mark {
    font-family: Georgia, serif;
    font-size: 30px;
    color: #8B5CF6;
    line-height: 0;
    display: inline-block;
    margin-bottom: 6px;
  }

  .s2-sidelist { margin-top: 18px; display: flex; flex-direction: column; gap: 14px; }
  .s2-sidelist-row { display: flex; align-items: center; gap: 12px; }
  .s2-sidelist-icon {
    width: 34px; height: 34px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .s2-sidelist-title { font-size: 12.5px; font-weight: 700; color: #1A1F3D; }
  .s2-sidelist-sub { font-size: 10.5px; color: #8A8F98; }

  /* ---- Center card ---- */
  .s2-card {
    position: relative;
    z-index: 2;
    background: rgba(255,255,255,0.92);
    border-radius: 26px;
    padding: 26px 20px;
    box-shadow: 0 30px 70px -24px rgba(60,40,20,0.28);
  }
  @media (min-width: 640px) {
    .s2-card { border-radius: 32px; padding: 34px 30px; }
  }
  @media (min-width: 1024px) {
    .s2-card {
      background: rgba(255,255,255,0.82);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.9);
    }
  }

  .s2-pill {
    display: flex; align-items: center; gap: 12px;
    background: #FFFFFF;
    border: 1.5px solid #ECEBE6;
    border-radius: 999px;
    padding: 13px 20px;
    box-shadow: 0 2px 8px rgba(20,20,20,0.04);
    transition: box-shadow 0.2s ease, border-color 0.2s ease;
  }
  .s2-pill:hover { box-shadow: 0 0 0 4px rgba(99,102,241,0.1); }
  .s2-pill:focus-within { border-color: #6366F1; box-shadow: 0 0 0 4px rgba(99,102,241,0.14); }
  .s2-pill-icon { color: #9AA0A8; flex-shrink: 0; }
  .s2-pill-input {
    flex: 1; min-width: 0; background: transparent; border: none; outline: none;
    font-size: 15px; font-weight: 500; color: #1B1B1E;
  }
  .s2-pill-input::placeholder { color: #ADB2B8; font-weight: 500; }

  .s2-forgot { font-size: 12.5px; font-weight: 600; color: #4F46E5; }
  .s2-forgot:hover { text-decoration: underline; }

  .s2-login-btn {
    width: 100%; margin-top: 2px; padding: 14px 0;
    border-radius: 999px;
    background: #FFFFFF;
    border: 1.5px solid #EEEDE8;
    color: #14141A;
    font-weight: 700; font-size: 16px;
    box-shadow: 0 6px 18px rgba(20,20,20,0.08);
    transition: box-shadow 0.25s ease, transform 0.15s ease;
  }
  .s2-login-btn:hover { box-shadow: 0 0 0 5px rgba(99,102,241,0.12), 0 10px 24px rgba(20,20,20,0.1); transform: translateY(-1px); }
  .s2-login-btn:active { transform: translateY(0); }
  .s2-login-btn:disabled { opacity: 0.6; }

  .s2-divider {
    display: flex; align-items: center; gap: 12px;
    margin: 18px 0 4px;
    font-size: 12px; color: #9AA0A8;
  }
  .s2-divider span { flex: 1; height: 1px; background: #ECEBE6; }

  .s2-google-wrap {
    position: relative;
    border-radius: 999px;
    padding: 2px;
    background: conic-gradient(from 0deg, #4F8CFF, #43E8E0, #9B5CFF, #FF5CAD, #4F8CFF);
    box-shadow: 0 0 18px 1px rgba(79,140,255,0.3), 0 0 26px 4px rgba(155,92,255,0.2);
  }
  .s2-google-btn {
    width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
    padding: 12px 0; border-radius: 999px;
    background: #FFFFFF; color: #1B1B1E;
    font-size: 15px; font-weight: 600;
  }
  .s2-google-btn:disabled { opacity: 0.6; }

  .s2-feature {
    border-radius: 20px;
    padding: 14px;
    box-shadow: 0 10px 24px -12px rgba(20,20,20,0.22);
    color: #14141A;
  }
  .s2-feature-icon {
    width: 30px; height: 30px; border-radius: 9px;
    background: rgba(255,255,255,0.55);
    display: flex; align-items: center; justify-content: center;
  }
  .s2-feature-title { font-weight: 700; font-size: 14.5px; line-height: 1.2; }
  .s2-feature-sub { font-size: 10.5px; opacity: 0.75; margin-top: 1px; }

  /* ---- Stats row (tablet & desktop) ---- */
  .s2-stats {
    position: relative;
    z-index: 1;
    width: min(880px, 100%);
    background: rgba(255,255,255,0.85);
    backdrop-filter: blur(14px);
    border: 1px solid rgba(255,255,255,0.9);
    border-radius: 999px;
    box-shadow: 0 16px 36px -18px rgba(60,40,20,0.3);
    padding: 16px 10px;
    flex-wrap: wrap;
  }
  .s2-stat {
    flex: 1;
    min-width: 110px;
    display: flex; align-items: center; gap: 10px;
    justify-content: center;
    border-left: 1px solid #EDEBE4;
  }
  .s2-stat:first-child { border-left: none; }
  .s2-stat-icon { display: flex; }
  .s2-stat-value { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 16px; color: #1A1F3D; line-height: 1.1; }
  .s2-stat-label { font-size: 10.5px; color: #8A8F98; }

  /* ---- Compact stats row (mobile only) ---- */
  .s2-stats-mobile {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 24rem;
    background: rgba(255,255,255,0.85);
    backdrop-filter: blur(14px);
    border: 1px solid rgba(255,255,255,0.9);
    border-radius: 22px;
    box-shadow: 0 16px 36px -18px rgba(60,40,20,0.3);
    padding: 12px 6px;
    flex-wrap: wrap;
  }
  .s2-stat-mobile {
    flex: 1 1 45%;
    min-width: 45%;
    text-align: center;
    padding: 6px 4px;
  }
  .s2-stat-mobile-value { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 15px; line-height: 1.1; }
  .s2-stat-mobile-label { font-size: 10px; color: #8A8F98; margin-top: 2px; }

  @media (prefers-reduced-motion: reduce) {
    .s2-card, .s2-widget { transition: none !important; }
  }
`;

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
