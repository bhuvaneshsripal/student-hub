# Student Hub

A premium, glassmorphic productivity dashboard for college students — timetable planning, CGPA & attendance tracking, a placement prep roadmap, notes, tasks, a Pomodoro timer, and a calendar, all in one app.

## Tech stack
React 19 + TypeScript + Vite + Tailwind CSS v4, Zustand (with localStorage persistence), React Router, Framer Motion, Recharts, Lucide icons, jsPDF for PDF export.

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm run build      # production build to dist/
npm run preview    # preview the production build
```

## What's included
- **Dashboard** — greeting, live clock, today's timetable, CGPA, attendance, study streak/hours, placement readiness ring, quick actions.
- **Timetable Planner** — weekly Mon–Sat grid, add/edit/delete classes, color coding, drag a class card onto another day to reschedule, conflict detection, search + day filter, print, PDF export, autosaved to localStorage.
- **CGPA Calculator** — unlimited semesters/subjects, O/A+/A/B+/B/C/U grading, semester GPA + overall CGPA, semester comparison bar chart, CGPA trend line chart, grade distribution pie chart, PDF report export.
- **Attendance Calculator** — per-subject totals, percentage, classes needed for 75%, classes you can safely miss, safe/warning/danger status, pie + bar charts, one-tap present/absent marking.
- **Placement Prep Roadmap** — Aptitude, Programming Languages, DSA, Web Dev, and Interview Prep checklists, a resume checklist, coding-platform stat tracking (LeetCode, CodeChef, Codeforces, HackerRank, GeeksforGeeks), an overall readiness score with a circular indicator, and unlockable achievement badges.
- **Notes** — searchable notes with tags.
- **To-Do List** — priorities, due dates, filtering.
- **Pomodoro Timer** — 25/5 presets, custom duration, animated ring, session history feeding the dashboard's study streak and weekly hours.
- **Calendar** — month grid for exams, assignments, events, and holidays, plus an upcoming list.
- **Profile & Settings** — editable student info with an uploadable photo, dark/light mode, and full JSON backup/restore + clear-data controls.
- **Global search** across timetable, notes, tasks, and placement topics. Toasts, modals, loading skeletons, and a floating action button throughout.

## Notes on scope
Everything above is fully wired to real state (Zustand + localStorage) — nothing is a static mockup. A few of the most elaborate asks from the brief were simplified to keep the codebase maintainable rather than sprawling:
- **PDF export** covers the timetable and CGPA report (the two places it matters most) via jsPDF, rather than every module.
- **Drag-and-drop** lets you drag a class card to a different day column; it isn't a full free-form time-slot drag canvas.
- **PWA/offline support** wasn't added — the app is a standard Vite SPA. It's a small addition (a manifest + service worker) if you want it next.
- Rich text notes use plain text rather than a full WYSIWYG editor.

All data lives in your browser's localStorage under keys prefixed `studenthub-`, so it persists across refreshes on the same device/browser.
