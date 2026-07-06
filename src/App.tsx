import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { CloudSync } from './components/CloudSync';
import { useAuthUser } from './hooks/useAuthUser';
import Login from './pages/Login';

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

function FullScreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div
        className="w-8 h-8 rounded-full border-2 border-transparent animate-spin"
        style={{ borderTopColor: 'var(--blue)', borderRightColor: 'var(--purple)' }}
      />
    </div>
  );
}

/** Blocks access to everything except /login until Firebase confirms a user. */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthUser();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
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
