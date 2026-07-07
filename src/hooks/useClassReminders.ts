import { useEffect, useRef } from 'react';
import { useTimetableStore } from '../store/timetableStore';
import { useSettingsStore } from '../store/settingsStore';
import { useToastStore } from '../store/toastStore';
import { DAYS, type Day } from '../types';

/** Maps JS's Date#getDay() (0 = Sunday) to our Day type. Sunday has no
 * timetable slot in this app, so it simply never matches. */
function todayAsDay(): Day | null {
  const idx = new Date().getDay();
  return idx === 0 ? null : DAYS[idx - 1];
}

/**
 * Polls the timetable every 20s and fires a browser notification (plus an
 * in-app toast) `classReminderMinutes` before each class starts today.
 * Each class is only notified once per day, tracked in a ref that resets at
 * midnight (naturally, since the "today" key changes).
 */
export function useClassReminders() {
  const classes = useTimetableStore((s) => s.classes);
  const classReminders = useSettingsStore((s) => s.classReminders);
  const reminderMinutes = useSettingsStore((s) => s.classReminderMinutes);
  const push = useToastStore((s) => s.push);
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!classReminders) return;

    function tick() {
      const day = todayAsDay();
      if (!day) return;

      const now = new Date();
      const todayKey = now.toISOString().slice(0, 10);

      classes.filter((c) => c.day === day).forEach((c) => {
        const [h, m] = c.start.split(':').map(Number);
        const startTime = new Date(now);
        startTime.setHours(h, m, 0, 0);

        const minutesUntil = (startTime.getTime() - now.getTime()) / 60000;
        const notifyKey = `${c.id}-${todayKey}`;

        if (minutesUntil <= reminderMinutes && minutesUntil > reminderMinutes - 1 && !notifiedRef.current.has(notifyKey)) {
          notifiedRef.current.add(notifyKey);

          const message = `${c.subject} starts at ${c.start} (in ${reminderMinutes} min)${c.room ? ` · ${c.room}` : ''}`;
          push(message, 'info');

          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Upcoming class', { body: message, icon: '/studo-logo.png' });
          }
        }
      });
    }

    tick();
    const interval = setInterval(tick, 20000);
    return () => clearInterval(interval);
  }, [classes, classReminders, reminderMinutes, push]);
}
