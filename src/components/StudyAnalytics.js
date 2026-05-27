"use client";

import { BarChart3, Clock, Target, Flame, CheckSquare, TrendingUp } from "lucide-react";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function StudyAnalytics({ studyData }) {
  const stats = studyData.stats || {};
  const weeklyFocus = stats.weeklyFocus || [0, 0, 0, 0, 0, 0, 0];
  const maxWeekly = Math.max(...weeklyFocus, 1);

  // Calculate subject distribution
  const subjectData = (studyData.subjects || []).map((s) => ({
    name: s.name,
    color: s.color,
    icon: s.icon,
    chapters: s.chaptersCompleted || 0,
    total: s.chaptersTotal || 0,
    percent: s.chaptersTotal > 0 ? Math.round((s.chaptersCompleted / s.chaptersTotal) * 100) : 0,
  }));

  // Format minutes to human-readable
  const formatMinutes = (min) => {
    if (min < 60) return `${min}m`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  // Stat cards data
  const statCards = [
    {
      label: "Total Focus",
      value: formatMinutes(stats.totalFocusMinutes || 0),
      icon: Clock,
      color: "#00d9ff",
      glow: "rgba(0, 217, 255, 0.15)",
    },
    {
      label: "Sessions",
      value: studyData.pomodoro?.totalSessionsCompleted || 0,
      icon: Target,
      color: "#f97316",
      glow: "rgba(249, 115, 22, 0.15)",
    },
    {
      label: "Tasks Done",
      value: stats.tasksCompleted || 0,
      icon: CheckSquare,
      color: "#4ade80",
      glow: "rgba(74, 222, 128, 0.15)",
    },
    {
      label: "Best Streak",
      value: `${stats.longestStreak || 0}d`,
      icon: Flame,
      color: "#f59e0b",
      glow: "rgba(245, 158, 11, 0.15)",
    },
  ];

  // Heatmap color intensity
  const getHeatColor = (minutes) => {
    if (minutes === 0) return "rgba(255, 255, 255, 0.03)";
    const intensity = Math.min(1, minutes / Math.max(maxWeekly, 60));
    if (intensity < 0.25) return "rgba(0, 217, 255, 0.15)";
    if (intensity < 0.5) return "rgba(0, 217, 255, 0.3)";
    if (intensity < 0.75) return "rgba(0, 217, 255, 0.5)";
    return "rgba(0, 217, 255, 0.75)";
  };

  return (
    <div className="glass-panel border border-white/10 rounded-2xl p-5 space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center pb-3 border-b border-white/5">
        <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.15em] flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          STUDY ANALYTICS
        </span>
        <span className="text-[9px] font-mono text-zinc-600">
          Last 7 days
        </span>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="relative p-3.5 rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden group hover:border-white/10 transition-all"
            >
              {/* Background glow */}
              <div
                className="absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl pointer-events-none opacity-40"
                style={{ background: card.glow }}
              />

              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-3.5 h-3.5" style={{ color: card.color }} />
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
                  {card.label}
                </span>
              </div>
              <span
                className="text-xl font-display font-extrabold"
                style={{ color: card.color }}
              >
                {card.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* Weekly Focus Heatmap */}
      <div className="space-y-2.5">
        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
          <TrendingUp className="w-3 h-3" />
          Weekly Focus Heatmap
        </span>

        <div className="flex gap-1.5">
          {weeklyFocus.map((minutes, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
              {/* Bar */}
              <div className="w-full h-20 rounded-lg overflow-hidden flex items-end bg-white/[0.02] border border-white/[0.03]">
                <div
                  className="w-full rounded-t-md transition-all duration-500 ease-out"
                  style={{
                    height: `${Math.max(4, (minutes / Math.max(maxWeekly, 60)) * 100)}%`,
                    background: getHeatColor(minutes),
                    boxShadow: minutes > 0 ? `0 0 10px ${getHeatColor(minutes)}` : "none",
                  }}
                />
              </div>
              {/* Label */}
              <span className="text-[8px] font-mono text-zinc-600">
                {DAY_LABELS[idx]}
              </span>
              {/* Minutes */}
              <span className="text-[8px] font-mono text-zinc-500">
                {minutes > 0 ? formatMinutes(minutes) : "–"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Subject Distribution */}
      {subjectData.length > 0 && (
        <div className="space-y-2.5">
          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
            Subject Progress
          </span>

          <div className="space-y-2">
            {subjectData.map((s, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-400 flex items-center gap-1.5">
                    <span>{s.icon}</span>
                    {s.name}
                  </span>
                  <span className="text-[9px] font-mono font-bold" style={{ color: s.color }}>
                    {s.chapters}/{s.total}
                  </span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${s.percent}%`,
                      background: s.color,
                      boxShadow: `0 0 6px ${s.color}44`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
