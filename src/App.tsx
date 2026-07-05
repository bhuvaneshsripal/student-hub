import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Timetable from './pages/Timetable';
import CGPA from './pages/CGPA';
import Attendance from './pages/Attendance';
import Placement from './pages/Placement';
import Notes from './pages/Notes';
import Todo from './pages/Todo';
import Pomodoro from './pages/Pomodoro';
import CalendarPage from './pages/CalendarPage';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/timetable" element={<Timetable />} />
          <Route path="/cgpa" element={<CGPA />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/placement" element={<Placement />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/todo" element={<Todo />} />
          <Route path="/pomodoro" element={<Pomodoro />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
