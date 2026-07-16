import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { CloudSync } from './components/CloudSync';
import { useAuthUser } from './hooks/useAuthUser';
import Login from './pages/Login';
import { useEffect, useState } from "react";
import { useTimetableStore } from "./store/timetableStore";
import { useCgpaStore } from "./store/cgpaStore";
import { useProductivityStore } from "./store/productivityStore";
import { useAttendanceStore } from "./store/attendanceStore";
import { usePlacementStore } from "./store/placementStore";


// Route-level code splitting: each page ships as its own chunk and is only
// downloaded when the user actually navigates there, keeping the initial
// bundle (and first paint) small and fast.
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Timetable = lazy(() => import('./pages/Timetable'));
const CGPA = lazy(() => import('./pages/CGPA'));
const Attendance = lazy(() => import('./pages/Attendance'));
const Placement = lazy(() => import('./pages/Placement'));
const Notes = lazy(() => import('./pages/Notes'));
const Todo = lazy(() => import('./pages/Todo'));
const Pomodoro = lazy(() => import('./pages/Pomodoro'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const ExamFinder = lazy(() => import('./pages/ExamFinder'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));

function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div
        className="w-8 h-8 rounded-full border-2 border-transparent animate-spin"
        style={{ borderTopColor: 'var(--blue)', borderRightColor: 'var(--purple)' }}
      />
    </div>
  );
}

function FullScreenLoader({ slow }: { slow: boolean }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
      <img src="/studo-logo.png" alt="Studo" className="w-12 h-12 rounded-2xl" />
      <div
        className="w-8 h-8 rounded-full border-2 border-transparent animate-spin"
        style={{ borderTopColor: 'var(--blue)', borderRightColor: 'var(--purple)' }}
      />
      {slow && (
        <div className="flex flex-col items-center gap-2 mt-2 text-center px-6">
          <p className="text-sm text-gray-500">This is taking longer than usual — your connection may be slow.</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm font-medium px-3 py-1.5 rounded-lg"
            style={{ background: 'var(--blue)', color: '#fff' }}
          >
            Reload
          </button>
        </div>
      )}
    </div>
  );
}

/** Blocks access to everything except /login until Firebase confirms a user.
 * On a cold load (or after the app has been closed for a while), Firebase
 * needs a round trip to verify the session before it knows whether you're
 * logged in — this shows a branded loader for that gap instead of a blank
 * white page, and surfaces a reload option if it ever takes unusually long. */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthUser();
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!loading) { setSlow(false); return; }
    const t = setTimeout(() => setSlow(true), 7000);
    return () => clearTimeout(t);
  }, [loading]);

  if (loading) return <FullScreenLoader slow={slow} />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const { user } = useAuthUser();

  const syncTimetable = useTimetableStore((s) => s.sync);
  const syncCgpa = useCgpaStore((s) => s.sync);
  const syncTasks = useProductivityStore((s) => s.syncTasks);
  const syncNotes = useProductivityStore((s) => s.syncNotes);
  const syncAttendance = useAttendanceStore((s) => s.sync);
  const syncPlacement = usePlacementStore((s) => s.sync);
  const syncPomodoro = useProductivityStore(
  (s) => s.syncPomodoro
);
  const syncCalendar = useProductivityStore((s) => s.syncCalendar);

useEffect(() => {
  if (!user) return;

  syncTimetable();
  syncCgpa();
  syncTasks();
  syncNotes();
  syncAttendance();
  syncPlacement();
  syncPomodoro();
  syncCalendar();


}, [
  user,
  syncTimetable,
  syncCgpa,
  syncTasks,
  syncNotes,
  syncAttendance,
  syncPlacement,
  syncPomodoro,
  syncCalendar,

]);

  return (
    <BrowserRouter>
      <CloudSync />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route
            path="/"
            element={
              <Suspense fallback={<PageFallback />}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route
            path="/timetable"
            element={
              <Suspense fallback={<PageFallback />}>
                <Timetable />
              </Suspense>
            }
          />
          <Route
            path="/cgpa"
            element={
              <Suspense fallback={<PageFallback />}>
                <CGPA />
              </Suspense>
            }
          />
          <Route
            path="/attendance"
            element={
              <Suspense fallback={<PageFallback />}>
                <Attendance />
              </Suspense>
            }
          />
          <Route
            path="/placement"
            element={
              <Suspense fallback={<PageFallback />}>
                <Placement />
              </Suspense>
            }
          />
          <Route
            path="/notes"
            element={
              <Suspense fallback={<PageFallback />}>
                <Notes />
              </Suspense>
            }
          />
          <Route
            path="/todo"
            element={
              <Suspense fallback={<PageFallback />}>
                <Todo />
              </Suspense>
            }
          />
          <Route
            path="/pomodoro"
            element={
              <Suspense fallback={<PageFallback />}>
                <Pomodoro />
              </Suspense>
            }
          />
          <Route
            path="/calendar"
            element={
              <Suspense fallback={<PageFallback />}>
                <CalendarPage />
              </Suspense>
            }
          />
          <Route
            path="/exam-finder"
            element={
              <Suspense fallback={<PageFallback />}>
                <ExamFinder />
              </Suspense>
            }
          />
          <Route
            path="/profile"
            element={
              <Suspense fallback={<PageFallback />}>
                <Profile />
              </Suspense>
            }
          />
          <Route
            path="/settings"
            element={
              <Suspense fallback={<PageFallback />}>
                <Settings />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
