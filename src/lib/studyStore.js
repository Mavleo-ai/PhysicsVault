/**
 * StudyStore — Lightweight localStorage-backed state manager
 * All data keyed by Firebase UID for per-user isolation
 */

const STORE_KEY_PREFIX = "pv_study_";

// Default subjects with JEE/NEET-relevant chapter counts
const DEFAULT_SUBJECTS = [
  {
    id: "physics",
    name: "Physics",
    color: "#f97316",
    icon: "⚛",
    chaptersTotal: 20,
    chaptersCompleted: 0,
    hoursStudied: 0,
    chapters: [
      "Mechanics", "Kinematics", "Laws of Motion", "Work, Energy & Power",
      "Rotational Motion", "Gravitation", "Thermodynamics", "Kinetic Theory",
      "Oscillations", "Waves", "Electrostatics", "Current Electricity",
      "Magnetic Effects", "EMI & AC", "Electromagnetic Waves", "Optics",
      "Dual Nature of Matter", "Atoms & Nuclei", "Semiconductors", "Communication Systems"
    ],
    completedChapters: [],
  },
  {
    id: "chemistry",
    name: "Chemistry",
    color: "#38bdf8",
    icon: "🧪",
    chaptersTotal: 18,
    chaptersCompleted: 0,
    hoursStudied: 0,
    chapters: [
      "Atomic Structure", "Chemical Bonding", "States of Matter", "Thermodynamics",
      "Equilibrium", "Redox Reactions", "Electrochemistry", "Chemical Kinetics",
      "Surface Chemistry", "Coordination Compounds", "Organic Chemistry Basics",
      "Hydrocarbons", "Alcohols & Phenols", "Aldehydes & Ketones", "Amines",
      "Polymers", "Biomolecules", "Chemistry in Everyday Life"
    ],
    completedChapters: [],
  },
  {
    id: "maths",
    name: "Mathematics",
    color: "#a78bfa",
    icon: "📐",
    chaptersTotal: 16,
    chaptersCompleted: 0,
    hoursStudied: 0,
    chapters: [
      "Sets & Relations", "Complex Numbers", "Quadratic Equations", "Matrices & Determinants",
      "Permutations & Combinations", "Binomial Theorem", "Sequences & Series",
      "Limits & Continuity", "Differentiation", "Integration", "Differential Equations",
      "Coordinate Geometry", "3D Geometry", "Vectors", "Probability", "Statistics"
    ],
    completedChapters: [],
  },
];

// XP level thresholds and rank names
export const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, rank: "Cadet", icon: "🌱" },
  { level: 2, xp: 100, rank: "Navigator", icon: "🧭" },
  { level: 3, xp: 300, rank: "Commander", icon: "⭐" },
  { level: 4, xp: 600, rank: "Admiral", icon: "🚀" },
  { level: 5, xp: 1000, rank: "Singularity", icon: "🕳️" },
  { level: 6, xp: 1500, rank: "Transcendent", icon: "✨" },
];

export const XP_REWARDS = {
  POMODORO_COMPLETE: 25,
  TASK_COMPLETE: 10,
  DAILY_LOGIN: 5,
  CHAPTER_COMPLETE: 15,
};

export function getDefaultData() {
  return {
    // Pomodoro settings
    pomodoro: {
      focusMinutes: 25,
      breakMinutes: 5,
      longBreakMinutes: 15,
      sessionsBeforeLongBreak: 4,
      totalSessionsCompleted: 0,
    },
    // Subjects
    subjects: JSON.parse(JSON.stringify(DEFAULT_SUBJECTS)),
    // Tasks
    tasks: [],
    // Stats & Gamification
    stats: {
      totalFocusMinutes: 0,
      streak: 0,
      longestStreak: 0,
      lastStudyDate: null,
      xp: 0,
      dailyGoalMinutes: 120, // 2 hours default
      dailyFocusMinutes: 0,
      lastDailyReset: null,
      tasksCompleted: 0,
      // Weekly focus data for heatmap (last 7 days)
      weeklyFocus: [0, 0, 0, 0, 0, 0, 0],
    },
    // Ambient sound selection
    ambientSound: "silence",
  };
}

export function loadStudyData(uid) {
  if (typeof window === "undefined") return getDefaultData();

  try {
    const raw = localStorage.getItem(`${STORE_KEY_PREFIX}${uid}`);
    if (!raw) return getDefaultData();

    const parsed = JSON.parse(raw);

    // Merge with defaults to handle schema migrations
    const defaults = getDefaultData();
    return {
      pomodoro: { ...defaults.pomodoro, ...parsed.pomodoro },
      subjects: parsed.subjects?.length ? parsed.subjects : defaults.subjects,
      tasks: parsed.tasks || [],
      stats: { ...defaults.stats, ...parsed.stats },
      ambientSound: parsed.ambientSound || "silence",
    };
  } catch {
    return getDefaultData();
  }
}

export function saveStudyData(uid, data) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(`${STORE_KEY_PREFIX}${uid}`, JSON.stringify(data));
  } catch (e) {
    console.warn("StudyStore save failed:", e);
  }
}

// Helper: Get current level info from XP
export function getLevelInfo(xp) {
  let currentLevel = LEVEL_THRESHOLDS[0];
  let nextLevel = LEVEL_THRESHOLDS[1];

  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i].xp) {
      currentLevel = LEVEL_THRESHOLDS[i];
      nextLevel = LEVEL_THRESHOLDS[i + 1] || null;
      break;
    }
  }

  const progress = nextLevel
    ? (xp - currentLevel.xp) / (nextLevel.xp - currentLevel.xp)
    : 1;

  return { currentLevel, nextLevel, progress };
}

// Helper: Calculate focus grade
export function getFocusGrade(dailyMinutes, goalMinutes) {
  if (goalMinutes === 0) return { grade: "—", color: "#71717a" };
  const ratio = dailyMinutes / goalMinutes;
  if (ratio >= 1.0) return { grade: "A+", color: "#22c55e" };
  if (ratio >= 0.85) return { grade: "A", color: "#4ade80" };
  if (ratio >= 0.7) return { grade: "B+", color: "#38bdf8" };
  if (ratio >= 0.55) return { grade: "B", color: "#60a5fa" };
  if (ratio >= 0.4) return { grade: "C", color: "#fbbf24" };
  if (ratio >= 0.2) return { grade: "D", color: "#f97316" };
  return { grade: "F", color: "#ef4444" };
}

// Helper: Update streak logic
export function updateStreak(stats) {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (stats.lastStudyDate === today) {
    return stats; // Already studied today
  }

  const newStats = { ...stats, lastStudyDate: today };

  if (stats.lastStudyDate === yesterday) {
    newStats.streak = (stats.streak || 0) + 1;
  } else if (!stats.lastStudyDate) {
    newStats.streak = 1;
  } else {
    newStats.streak = 1; // Reset streak
  }

  if (newStats.streak > (newStats.longestStreak || 0)) {
    newStats.longestStreak = newStats.streak;
  }

  return newStats;
}

// Helper: Reset daily counters if needed
export function resetDailyIfNeeded(stats) {
  const today = new Date().toDateString();
  if (stats.lastDailyReset !== today) {
    // Shift weekly focus data
    const newWeekly = [...(stats.weeklyFocus || [0, 0, 0, 0, 0, 0, 0])];
    newWeekly.shift();
    newWeekly.push(0);

    return {
      ...stats,
      dailyFocusMinutes: 0,
      lastDailyReset: today,
      weeklyFocus: newWeekly,
    };
  }
  return stats;
}
