import { create } from "zustand";

import type {
  TopicProgress,
  PlatformStat,
} from "../types";

import {
  loadPlacement,
  savePlacement,
  subscribePlacement,
  type PlacementData,
} from "../services/placementService";

function topics(
  names: string[],
  difficulty?: TopicProgress["difficulty"]
): TopicProgress[] {
  return names.map((name) => ({
    id: crypto.randomUUID(),
    name,
    ...(difficulty !== undefined ? { difficulty } : {}),
    done: false,
  }));
}

function defaultPlacementData(): PlacementData {
  return {
    aptitude: topics([
      "Quantitative Aptitude",
      "Logical Reasoning",
      "Verbal Ability",
    ]),

    languages: topics([
      "C",
      "C++",
      "Java",
      "Python",
      "JavaScript",
    ]),

    dsa: topics([
      "Arrays",
      "Strings",
      "Linked Lists",
      "Stacks",
      "Queues",
      "Trees",
      "Graphs",
      "Recursion",
      "Backtracking",
      "Greedy",
      "Dynamic Programming",
    ]),

    webdev: topics([
      "HTML",
      "CSS",
      "JavaScript",
      "React",
      "Node.js",
      "Express.js",
      "MongoDB",
      "REST APIs",
      "Git & GitHub",
      "Deployment",
    ]),

    interview: topics([
      "HR Questions",
      "Technical Questions",
      "Mock Interviews",
      "Behavioral Questions",
      "System Design Basics",
    ]),

    resumeChecklist: [
      "Resume Uploaded",
      "GitHub Profile",
      "LinkedIn Profile",
      "Portfolio Website",
      "Projects",
      "Certifications",
      "Internship Experience",
    ].map((label) => ({
      id: crypto.randomUUID(),
      label,
      done: false,
    })),

    platforms: [
      {
        id: "leetcode",
        name: "LeetCode",
        solved: 0,
        weeklyGoal: 10,
        monthlyGoal: 40,
        streak: 0,
      },
      {
        id: "codechef",
        name: "CodeChef",
        solved: 0,
        weeklyGoal: 5,
        monthlyGoal: 20,
        streak: 0,
      },
      {
        id: "codeforces",
        name: "Codeforces",
        solved: 0,
        weeklyGoal: 5,
        monthlyGoal: 20,
        streak: 0,
      },
      {
        id: "hackerrank",
        name: "HackerRank",
        solved: 0,
        weeklyGoal: 5,
        monthlyGoal: 20,
        streak: 0,
      },
      {
        id: "gfg",
        name: "GeeksforGeeks",
        solved: 0,
        weeklyGoal: 5,
        monthlyGoal: 20,
        streak: 0,
      },
    ],
  };
}

interface PlacementState extends PlacementData {
  sync: () => Promise<void>;

  toggleTopic: (
    group:
      | "aptitude"
      | "languages"
      | "dsa"
      | "webdev"
      | "interview",
    id: string
  ) => Promise<void>;

  toggleResumeItem: (
    id: string
  ) => Promise<void>;

  updatePlatform: (
    id: string,
    patch: Partial<PlatformStat>
  ) => Promise<void>;

  readinessScore: () => number;
}

export const usePlacementStore =
  create<PlacementState>()((set, get) => ({
    ...defaultPlacementData(),

    sync: async () => {
      const cloud = await loadPlacement();

      if (cloud) {
        set(cloud);
      } else {
        await savePlacement(defaultPlacementData());
      }

      subscribePlacement((cloudData) => {
        if (cloudData) {
          set(cloudData);
        }
      });
    },

    toggleTopic: async (group, id) => {
      const updated = get()[group].map((topic) =>
        topic.id === id
          ? {
              ...topic,
              done: !topic.done,
            }
          : topic
      );

      const data: PlacementData = {
        aptitude: get().aptitude,
        languages: get().languages,
        dsa: get().dsa,
        webdev: get().webdev,
        interview: get().interview,
        resumeChecklist: get().resumeChecklist,
        platforms: get().platforms,
        [group]: updated,
      };

      set({ [group]: updated } as Partial<PlacementState>);

      await savePlacement(data);
    },

    toggleResumeItem: async (id) => {
      const resumeChecklist = get().resumeChecklist.map((item) =>
        item.id === id
          ? {
              ...item,
              done: !item.done,
            }
          : item
      );

      set({ resumeChecklist });

      await savePlacement({
        aptitude: get().aptitude,
        languages: get().languages,
        dsa: get().dsa,
        webdev: get().webdev,
        interview: get().interview,
        resumeChecklist,
        platforms: get().platforms,
      });
    },

    updatePlatform: async (id, patch) => {
      const platforms = get().platforms.map((platform) =>
        platform.id === id
          ? {
              ...platform,
              ...patch,
            }
          : platform
      );

      set({ platforms });

      await savePlacement({
        aptitude: get().aptitude,
        languages: get().languages,
        dsa: get().dsa,
        webdev: get().webdev,
        interview: get().interview,
        resumeChecklist: get().resumeChecklist,
        platforms,
      });
    },

    readinessScore: () => {
      const state = get();

      const groups = [
        state.aptitude,
        state.languages,
        state.dsa,
        state.webdev,
        state.interview,
      ];

      const totalTopics = groups.reduce(
        (sum, group) => sum + group.length,
        0
      );

      const completedTopics = groups.reduce(
        (sum, group) =>
          sum + group.filter((topic) => topic.done).length,
        0
      );

      const topicScore =
        totalTopics === 0
          ? 0
          : completedTopics / totalTopics;

      const resumeScore =
        state.resumeChecklist.filter((item) => item.done).length /
        state.resumeChecklist.length;

      const platformScore = Math.min(
        1,
        state.platforms.reduce(
          (sum, platform) => sum + platform.solved,
          0
        ) / 200
      );

      return Math.round(
        (topicScore * 0.55 +
          resumeScore * 0.25 +
          platformScore * 0.20) *
          100
      );
    },
  }));