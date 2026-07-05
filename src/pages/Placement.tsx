import { useState } from 'react';
import { Award, Check, ChevronDown, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { ProgressRing } from '../components/ui/ProgressRing';
import { usePlacementStore } from '../store/placementStore';
import type { TopicProgress } from '../types';

type GroupKey = 'aptitude' | 'languages' | 'dsa' | 'webdev' | 'interview';

const GROUPS: { key: GroupKey; title: string }[] = [
  { key: 'aptitude', title: 'Aptitude' },
  { key: 'languages', title: 'Programming Languages' },
  { key: 'dsa', title: 'Data Structures & Algorithms' },
  { key: 'webdev', title: 'Web Development' },
  { key: 'interview', title: 'Interview Preparation' },
];

const BADGES = [
  { at: 25, label: 'Getting Started', icon: '🌱' },
  { at: 50, label: 'Halfway Hero', icon: '🔥' },
  { at: 75, label: 'Almost There', icon: '⚡' },
  { at: 100, label: 'Placement Ready', icon: '🏆' },
];

function TopicGroup({ title, topics, onToggle }: { title: string; topics: TopicProgress[]; onToggle: (id: string) => void }) {
  const [open, setOpen] = useState(true);
  const done = topics.filter((t) => t.done).length;
  const pct = topics.length ? (done / topics.length) * 100 : 0;
  return (
    <Card>
      <button className="w-full flex items-center justify-between" onClick={() => setOpen((o) => !o)}>
        <div className="text-left">
          <h3 className="font-display font-semibold text-sm" style={{ color: 'var(--ink)' }}>{title}</h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--ink-soft)' }}>{done}/{topics.length} completed</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{pct.toFixed(0)}%</span>
          <ChevronDown size={16} className="transition-transform" style={{ color: 'var(--ink-soft)', transform: open ? 'rotate(180deg)' : 'none' }} />
        </div>
      </button>
      <div className="mt-2"><ProgressBar value={pct} /></div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
              {topics.map((t) => (
                <button
                  key={t.id} onClick={() => onToggle(t.id)}
                  className="flex items-center gap-2 p-2.5 rounded-xl text-left text-sm transition-colors"
                  style={{ background: 'var(--bg)' }}
                >
                  <span
                    className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 border"
                    style={{ background: t.done ? 'linear-gradient(135deg, var(--blue), var(--purple))' : 'transparent', borderColor: t.done ? 'transparent' : 'var(--line)' }}
                  >
                    {t.done && <Check size={13} className="text-white" />}
                  </span>
                  <span style={{ color: 'var(--ink)', textDecoration: t.done ? 'line-through' : 'none', opacity: t.done ? 0.6 : 1 }}>{t.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export default function Placement() {
  const store = usePlacementStore();
  const readiness = store.readinessScore();
  const resumeDone = store.resumeChecklist.filter((r) => r.done).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--ink)' }}>Placement Preparation Roadmap</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>Track every skill, checklist item, and coding platform on your way to placement-ready.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="flex flex-col items-center justify-center">
          <CardHeader title="Overall Readiness Score" icon={<Trophy size={16} />} />
          <ProgressRing value={readiness} label="Ready" size={140} />
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title="Achievement Badges" icon={<Award size={16} />} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {BADGES.map((b) => {
              const unlocked = readiness >= b.at;
              return (
                <div
                  key={b.label}
                  className="rounded-xl p-3 text-center transition-opacity"
                  style={{ background: 'var(--bg)', opacity: unlocked ? 1 : 0.35 }}
                >
                  <div className="text-2xl mb-1">{b.icon}</div>
                  <p className="text-xs font-medium" style={{ color: 'var(--ink)' }}>{b.label}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--ink-soft)' }}>{b.at}%+</p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {GROUPS.map((g) => (
        <TopicGroup key={g.key} title={g.title} topics={store[g.key]} onToggle={(id) => store.toggleTopic(g.key, id)} />
      ))}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Resume Checklist" subtitle={`${resumeDone}/${store.resumeChecklist.length} complete`} />
          <div className="space-y-2">
            {store.resumeChecklist.map((item) => (
              <button
                key={item.id} onClick={() => store.toggleResumeItem(item.id)}
                className="w-full flex items-center gap-2 p-2.5 rounded-xl text-left text-sm"
                style={{ background: 'var(--bg)' }}
              >
                <span
                  className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 border"
                  style={{ background: item.done ? 'linear-gradient(135deg, var(--blue), var(--purple))' : 'transparent', borderColor: item.done ? 'transparent' : 'var(--line)' }}
                >
                  {item.done && <Check size={13} className="text-white" />}
                </span>
                <span style={{ color: 'var(--ink)', textDecoration: item.done ? 'line-through' : 'none', opacity: item.done ? 0.6 : 1 }}>{item.label}</span>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Coding Platforms" />
          <div className="space-y-3">
            {store.platforms.map((p) => (
              <div key={p.id} className="p-3 rounded-xl" style={{ background: 'var(--bg)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{p.name}</span>
                  <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>🔥 {p.streak} day streak</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <label className="flex flex-col gap-1">
                    <span style={{ color: 'var(--ink-soft)' }}>Solved</span>
                    <input type="number" value={p.solved} onChange={(e) => store.updatePlatform(p.id, { solved: Number(e.target.value) })} className="platform-input" />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span style={{ color: 'var(--ink-soft)' }}>Weekly Goal</span>
                    <input type="number" value={p.weeklyGoal} onChange={(e) => store.updatePlatform(p.id, { weeklyGoal: Number(e.target.value) })} className="platform-input" />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span style={{ color: 'var(--ink-soft)' }}>Monthly Goal</span>
                    <input type="number" value={p.monthlyGoal} onChange={(e) => store.updatePlatform(p.id, { monthlyGoal: Number(e.target.value) })} className="platform-input" />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <style>{`.platform-input { padding: 0.35rem 0.5rem; border-radius: 0.5rem; border: 1px solid var(--line); background: var(--bg-elev); color: var(--ink); outline: none; width: 100%; }`}</style>
    </div>
  );
}
