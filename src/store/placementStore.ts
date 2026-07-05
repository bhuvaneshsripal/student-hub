import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TopicProgress, PlatformStat, ResumeChecklistItem } from '../types';

function topics(names: string[], difficulty?: TopicProgress['difficulty']): TopicProgress[] {
  return names.map((n) => ({ id: crypto.randomUUID(), name: n, difficulty, done: false }));
}

interface PlacementState {
  aptitude: TopicProgress[];
  languages: TopicProgress[];
  dsa: TopicProgress[];
  webdev: TopicProgress[];
  interview: TopicProgress[];
  resumeChecklist: ResumeChecklistItem[];
  platforms: PlatformStat[];
  toggleTopic: (group: 'aptitude' | 'languages' | 'dsa' | 'webdev' | 'interview', id: string) => void;
  toggleResumeItem: (id: string) => void;
  updatePlatform: (id: string, patch: Partial<PlatformStat>) => void;
  readinessScore: () => number;
}

export const usePlacementStore = create<PlacementState>()(
  persist(
    (set, get) => ({
      aptitude: topics(['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability']),
      languages: topics(['C', 'C++', 'Java', 'Python', 'JavaScript']),
      dsa: topics(['Arrays', 'Strings', 'Linked Lists', 'Stacks', 'Queues', 'Trees', 'Graphs', 'Recursion', 'Backtracking', 'Greedy', 'Dynamic Programming']),
      webdev: topics(['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Express.js', 'MongoDB', 'REST APIs', 'Git & GitHub', 'Deployment']),
      interview: topics(['HR Questions', 'Technical Questions', 'Mock Interviews', 'Behavioral Questions', 'System Design Basics']),
      resumeChecklist: [
        'Resume Uploaded', 'GitHub Profile', 'LinkedIn Profile', 'Portfolio Website', 'Projects', 'Certifications', 'Internship Experience',
      ].map((label) => ({ id: crypto.randomUUID(), label, done: false })),
      platforms: [
        { id: 'leetcode', name: 'LeetCode', solved: 0, weeklyGoal: 10, monthlyGoal: 40, streak: 0 },
        { id: 'codechef', name: 'CodeChef', solved: 0, weeklyGoal: 5, monthlyGoal: 20, streak: 0 },
        { id: 'codeforces', name: 'Codeforces', solved: 0, weeklyGoal: 5, monthlyGoal: 20, streak: 0 },
        { id: 'hackerrank', name: 'HackerRank', solved: 0, weeklyGoal: 5, monthlyGoal: 20, streak: 0 },
        { id: 'gfg', name: 'GeeksforGeeks', solved: 0, weeklyGoal: 5, monthlyGoal: 20, streak: 0 },
      ],
      toggleTopic: (group, id) => set((s) => ({
        [group]: s[group].map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
      } as any)),
      toggleResumeItem: (id) => set((s) => ({
        resumeChecklist: s.resumeChecklist.map((r) => (r.id === id ? { ...r, done: !r.done } : r)),
      })),
      updatePlatform: (id, patch) => set((s) => ({
        platforms: s.platforms.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      })),
      readinessScore: () => {
        const s = get();
        const groups = [s.aptitude, s.languages, s.dsa, s.webdev, s.interview];
        const totalTopics = groups.reduce((a, g) => a + g.length, 0);
        const doneTopics = groups.reduce((a, g) => a + g.filter((t) => t.done).length, 0);
        const topicScore = totalTopics ? doneTopics / totalTopics : 0;
        const resumeScore = s.resumeChecklist.filter((r) => r.done).length / s.resumeChecklist.length;
        const platformScore = Math.min(1, s.platforms.reduce((a, p) => a + p.solved, 0) / 200);
        return Math.round((topicScore * 0.55 + resumeScore * 0.25 + platformScore * 0.2) * 100);
      },
    }),
    { name: 'studenthub-placement' }
  )
);
