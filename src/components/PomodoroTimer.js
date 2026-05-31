"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Play, Pause, RotateCcw, Coffee, Brain, Zap } from "lucide-react";

const MODES = {
  focus:     { label: "FOCUS",      icon: Brain,  color: "#E8A020", glow: "rgba(232, 160, 32, 0.35)" },
  break:     { label: "BREAK",      icon: Coffee, color: "#39D98A", glow: "rgba(57, 217, 138, 0.30)" },
  longBreak: { label: "LONG BREAK", icon: Zap,    color: "#7B5EA7", glow: "rgba(123, 94, 167, 0.30)" },
};

export default function PomodoroTimer({ studyData, onUpdate }) {
  const [mode, setMode] = useState("focus");
  const [isRunning, setIsRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(studyData.pomodoro.focusMinutes * 60);
  const [sessionsInCycle, setSessionsInCycle] = useState(0);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  const totalSeconds = mode === "focus"
    ? studyData.pomodoro.focusMinutes * 60
    : mode === "break"
    ? studyData.pomodoro.breakMinutes * 60
    : studyData.pomodoro.longBreakMinutes * 60;

  const progress = 1 - secondsLeft / totalSeconds;
  const circumference = 2 * Math.PI * 120; // radius = 120
  const strokeDashoffset = circumference * (1 - progress);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleComplete = useCallback(() => {
    setIsRunning(false);

    if (mode === "focus") {
      const newSessions = sessionsInCycle + 1;
      setSessionsInCycle(newSessions);

      // Update stats
      const focusMins = studyData.pomodoro.focusMinutes;
      const newData = { ...studyData };
      newData.pomodoro.totalSessionsCompleted += 1;
      newData.stats.totalFocusMinutes += focusMins;
      newData.stats.dailyFocusMinutes += focusMins;
      newData.stats.xp += 25; // XP_REWARDS.POMODORO_COMPLETE

      // Update today's weekly focus
      const weeklyFocus = [...newData.stats.weeklyFocus];
      weeklyFocus[weeklyFocus.length - 1] += focusMins;
      newData.stats.weeklyFocus = weeklyFocus;

      onUpdate(newData);

      // Decide next mode
      if (newSessions >= studyData.pomodoro.sessionsBeforeLongBreak) {
        setMode("longBreak");
        setSecondsLeft(studyData.pomodoro.longBreakMinutes * 60);
        setSessionsInCycle(0);
      } else {
        setMode("break");
        setSecondsLeft(studyData.pomodoro.breakMinutes * 60);
      }
    } else {
      // Break completed, back to focus
      setMode("focus");
      setSecondsLeft(studyData.pomodoro.focusMinutes * 60);
    }
  }, [mode, sessionsInCycle, studyData, onUpdate]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, handleComplete]);

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(totalSeconds);
  };

  const switchMode = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    const secs = newMode === "focus"
      ? studyData.pomodoro.focusMinutes * 60
      : newMode === "break"
      ? studyData.pomodoro.breakMinutes * 60
      : studyData.pomodoro.longBreakMinutes * 60;
    setSecondsLeft(secs);
  };

  const adjustTime = (delta) => {
    if (isRunning) return;
    const newData = { ...studyData };
    if (mode === "focus") {
      newData.pomodoro.focusMinutes = Math.max(1, Math.min(120, newData.pomodoro.focusMinutes + delta));
      setSecondsLeft(newData.pomodoro.focusMinutes * 60);
    } else if (mode === "break") {
      newData.pomodoro.breakMinutes = Math.max(1, Math.min(30, newData.pomodoro.breakMinutes + delta));
      setSecondsLeft(newData.pomodoro.breakMinutes * 60);
    } else {
      newData.pomodoro.longBreakMinutes = Math.max(1, Math.min(60, newData.pomodoro.longBreakMinutes + delta));
      setSecondsLeft(newData.pomodoro.longBreakMinutes * 60);
    }
    onUpdate(newData);
  };

  const currentMode = MODES[mode];
  const ModeIcon = currentMode.icon;

  return (
    <div className="glass-panel border border-white/10 rounded-2xl p-6 flex flex-col items-center relative overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${currentMode.glow}, transparent 70%)`,
        }}
      />

      {/* Header */}
      <div className="flex items-center gap-2 mb-1 z-10">
        <ModeIcon className="w-4 h-4" style={{ color: currentMode.color }} />
        <span
          className="text-[10px] font-mono font-bold uppercase tracking-[0.2em]"
          style={{ color: currentMode.color }}
        >
          {currentMode.label} MODE
        </span>
      </div>

      {/* Session counter */}
      <span className="text-[9px] font-mono text-zinc-500 mb-5">
        Session {sessionsInCycle + 1} / {studyData.pomodoro.sessionsBeforeLongBreak} · Total: {studyData.pomodoro.totalSessionsCompleted}
      </span>

      {/* Circular Timer */}
      <div className="relative w-64 h-64 mb-6">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 260 260">
          {/* Track */}
          <circle
            cx="130" cy="130" r="120"
            fill="none"
            stroke="#1A1A2A"
            strokeWidth="6"
          />
          {/* Progress */}
          <circle
            cx="130" cy="130" r="120"
            fill="none"
            stroke={currentMode.color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: "stroke-dashoffset 0.5s ease",
              filter: `drop-shadow(0 0 8px ${currentMode.glow})`,
            }}
          />
          {/* Inner glow ring */}
          <circle
            cx="130" cy="130" r="105"
            fill="none"
            stroke={currentMode.color}
            strokeWidth="0.5"
            opacity="0.15"
          />
        </svg>

        {/* Timer text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-5xl font-extrabold tracking-tight tabular-nums"
            style={{
              fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
              color: "#ffffff",
              textShadow: `0 0 20px ${currentMode.glow}`,
            }}
          >
            {formatTime(secondsLeft)}
          </span>

          {/* Adjust time buttons */}
          {!isRunning && (
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={() => adjustTime(-5)}
                className="w-7 h-7 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-all text-xs font-bold flex items-center justify-center cursor-pointer"
              >
                −
              </button>
              <span className="text-[9px] font-mono text-zinc-500">
                {mode === "focus" ? studyData.pomodoro.focusMinutes : mode === "break" ? studyData.pomodoro.breakMinutes : studyData.pomodoro.longBreakMinutes}m
              </span>
              <button
                onClick={() => adjustTime(5)}
                className="w-7 h-7 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-all text-xs font-bold flex items-center justify-center cursor-pointer"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 z-10">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          style={{
            background: isRunning
              ? "rgba(239, 68, 68, 0.15)"
              : `linear-gradient(135deg, ${currentMode.color}22, ${currentMode.color}11)`,
            border: `1px solid ${isRunning ? "rgba(239, 68, 68, 0.3)" : currentMode.color + "33"}`,
            color: isRunning ? "#ef4444" : currentMode.color,
            boxShadow: `0 0 20px ${isRunning ? "rgba(239, 68, 68, 0.1)" : currentMode.glow.replace("0.3", "0.1")}`,
          }}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isRunning ? "Pause" : "Start"}
        </button>

        <button
          onClick={handleReset}
          className="p-3 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-1 mt-5 bg-black/40 p-1 rounded-xl border border-white/5 z-10">
        {Object.entries(MODES).map(([key, m]) => (
          <button
            key={key}
            onClick={() => switchMode(key)}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              mode === key
                ? "text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
            style={mode === key ? {
              background: `${m.color}15`,
              border: `1px solid ${m.color}33`,
              color: m.color,
              boxShadow: `0 0 10px ${m.glow.replace("0.3", "0.08")}`,
            } : { border: "1px solid transparent" }}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
