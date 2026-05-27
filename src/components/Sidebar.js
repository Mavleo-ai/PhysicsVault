"use client";

import { getLevelInfo, getFocusGrade } from "@/lib/studyStore";
import { Flame, Target, Award, Zap, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function Sidebar({ studyData, user }) {
  const [collapsed, setCollapsed] = useState(false);
  const stats = studyData.stats || {};
  const { currentLevel, nextLevel, progress } = getLevelInfo(stats.xp || 0);
  const { grade, color: gradeColor } = getFocusGrade(
    stats.dailyFocusMinutes || 0,
    stats.dailyGoalMinutes || 120
  );

  const dailyProgress = Math.min(1, (stats.dailyFocusMinutes || 0) / (stats.dailyGoalMinutes || 120));
  const dailyCircumference = 2 * Math.PI * 36; // r=36

  if (collapsed) {
    return (
      <div className="glass-panel border border-white/10 rounded-2xl p-2 flex flex-col items-center gap-3 w-12">
        <button
          onClick={() => setCollapsed(false)}
          className="p-1.5 rounded-lg bg-white/5 text-zinc-400 hover:text-white transition-all cursor-pointer"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
        
        {/* Mini stats */}
        <span className="text-lg" title={`Level ${currentLevel.level}`}>{currentLevel.icon}</span>
        <span className="text-[9px] font-mono font-bold text-orange-400" title="Streak">🔥{stats.streak || 0}</span>
        <span className="text-[10px] font-display font-bold" style={{ color: gradeColor }} title="Focus Grade">{grade}</span>
      </div>
    );
  }

  return (
    <div className="glass-panel border border-white/10 rounded-2xl p-4 space-y-5 w-full relative">
      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(true)}
        className="absolute top-3 right-3 p-1 rounded-md bg-white/5 text-zinc-500 hover:text-white transition-all cursor-pointer hidden lg:block"
      >
        <ChevronLeft className="w-3 h-3" />
      </button>

      {/* Player Card */}
      <div className="text-center pb-4 border-b border-white/5">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-violet-600 flex items-center justify-center mx-auto mb-2 shadow-lg shadow-violet-500/20">
          <span className="text-white text-sm font-display font-bold">
            {(user?.displayName || "S")[0].toUpperCase()}
          </span>
        </div>
        <p className="text-xs font-semibold text-white truncate">{user?.displayName || "Student"}</p>
        <p className="text-[9px] font-mono text-zinc-500 mt-0.5">{currentLevel.icon} {currentLevel.rank}</p>
      </div>

      {/* Daily Goal — Circular Progress */}
      <div className="flex flex-col items-center">
        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1">
          <Target className="w-3 h-3 text-sky-400" />
          Daily Goal
        </span>

        <div className="relative w-20 h-20 mb-1">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="4" />
            <circle
              cx="40" cy="40" r="36"
              fill="none"
              stroke={dailyProgress >= 1 ? "#22c55e" : "#00d9ff"}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={dailyCircumference}
              strokeDashoffset={dailyCircumference * (1 - dailyProgress)}
              style={{
                transition: "stroke-dashoffset 0.8s ease",
                filter: `drop-shadow(0 0 4px ${dailyProgress >= 1 ? "rgba(34,197,94,0.4)" : "rgba(0,217,255,0.3)"})`,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm font-display font-extrabold text-white">
              {Math.round(dailyProgress * 100)}%
            </span>
          </div>
        </div>

        <span className="text-[9px] font-mono text-zinc-600">
          {stats.dailyFocusMinutes || 0}m / {stats.dailyGoalMinutes || 120}m
        </span>
      </div>

      {/* Focus Grade */}
      <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
          <Award className="w-3 h-3" style={{ color: gradeColor }} />
          Focus Score
        </span>
        <span
          className="text-2xl font-display font-extrabold"
          style={{ color: gradeColor, textShadow: `0 0 12px ${gradeColor}44` }}
        >
          {grade}
        </span>
      </div>

      {/* Streak */}
      <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
          <Flame className="w-3 h-3 text-orange-400" />
          Streak
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-xl font-display font-extrabold text-orange-400">
            {stats.streak || 0}
          </span>
          <span className="text-[9px] font-mono text-zinc-600">days</span>
        </div>
      </div>

      {/* XP & Level */}
      <div className="space-y-2 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-yellow-400" />
            Experience
          </span>
          <span className="text-[10px] font-mono text-yellow-400 font-bold">
            {stats.xp || 0} XP
          </span>
        </div>

        {/* XP Progress Bar */}
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${Math.round(progress * 100)}%`,
              background: "linear-gradient(90deg, #eab308, #f59e0b)",
              boxShadow: "0 0 8px rgba(234, 179, 8, 0.3)",
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[8px] font-mono text-zinc-600">
            Lvl {currentLevel.level} {currentLevel.icon}
          </span>
          {nextLevel && (
            <span className="text-[8px] font-mono text-zinc-600">
              → Lvl {nextLevel.level} {nextLevel.icon} ({nextLevel.xp} XP)
            </span>
          )}
        </div>
      </div>

      {/* Level Ranks Preview */}
      <div className="space-y-1.5 pt-2 border-t border-white/5">
        <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-wider">Ranks</span>
        <div className="grid grid-cols-3 gap-1">
          {[
            { icon: "🌱", rank: "Cadet" },
            { icon: "🧭", rank: "Navigator" },
            { icon: "⭐", rank: "Commander" },
            { icon: "🚀", rank: "Admiral" },
            { icon: "🕳️", rank: "Singularity" },
            { icon: "✨", rank: "Transcend" },
          ].map((r, i) => (
            <div
              key={i}
              className={`text-center p-1 rounded-lg text-[7px] font-mono ${
                currentLevel.rank === r.rank || (r.rank === "Transcend" && currentLevel.rank === "Transcendent")
                  ? "bg-yellow-500/10 border border-yellow-500/20 text-yellow-400"
                  : "text-zinc-700"
              }`}
            >
              <span className="text-xs">{r.icon}</span>
              <br />
              {r.rank}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
