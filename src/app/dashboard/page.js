"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, getUserTier, upgradeUserTier } from "@/lib/firebase";
import {
  loadStudyData,
  saveStudyData,
  updateStreak,
  resetDailyIfNeeded,
  XP_REWARDS,
} from "@/lib/studyStore";
import {
  LogOut,
  ShieldCheck,
  LayoutDashboard,
  BookOpen,
} from "lucide-react";

import DriveResourcesPanel from "@/components/DriveResourcesPanel";

import SpaceBackground from "@/components/SpaceBackground";
import AIDoubtSolver from "@/components/AIDoubtSolver";
import PomodoroTimer from "@/components/PomodoroTimer";
import SubjectTracker from "@/components/SubjectTracker";
import TaskManager from "@/components/TaskManager";
import StudyAnalytics from "@/components/StudyAnalytics";
import Sidebar from "@/components/Sidebar";
import AmbientControls from "@/components/AmbientControls";

const STUDY_STRATEGIES_VIDEOS = [
  { id: "3fKXzR0IDRU", title: "JEE Advanced Strategy & Timetable", desc: "Top preparation blueprint to crack JEE Advanced with optimal daily routines." },
  { id: "Vhrfa0Vbb5A", title: "IIT JEE Revision Masterclass", desc: "Proven methods to revise vast physics and maths syllabus systematically." },
  { id: "gOFxExkhS2o", title: "Effective Doubt Solving Guide", desc: "How to use AI models and text guides to resolve conceptual math roadblocks." },
  { id: "_YxtwAjBLFs", title: "Mechanics & Calculus Worksheets", desc: "Solving high-demanding physics rotational motion and integral calculus papers." },
  { id: "a3YHEkci3P4", title: "Ultimate Exam Day Mindset", desc: "Tips to maintain extreme focus and calmness under high pressure bounds." },
  { id: "LQoDQ2-lN2Q", title: "JEE Problem Solving Mastery", desc: "Mastering complex numeric calculations and elimination tricks." },
  { id: "VHXEU4rq6rY", title: "Scientific Memory Hacks", desc: "Active recall study methods to memorize complex constants and rules." },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studyData, setStudyData] = useState(null);
  const [activeTab, setActiveTab] = useState("command"); // command | ai | library
  const [activeVideoId, setActiveVideoId] = useState("3fKXzR0IDRU");

  // Firebase auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        const tier = getUserTier(currentUser.uid);
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || currentUser.email.split("@")[0],
          tier,
        });

        // Load study data and apply daily resets + streak updates
        let data = loadStudyData(currentUser.uid);
        data.stats = resetDailyIfNeeded(data.stats);
        data.stats = updateStreak(data.stats);

        // Daily login XP (once per day)
        const today = new Date().toDateString();
        if (data.stats.lastLoginXPDate !== today) {
          data.stats.xp += XP_REWARDS.DAILY_LOGIN;
          data.stats.lastLoginXPDate = today;
        }

        saveStudyData(currentUser.uid, data);
        setStudyData(data);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Handle tab initialization via query parameters (e.g. /dashboard?tab=strategies)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam && ["command", "ai", "library", "strategies"].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  // Persist study data on every update
  const handleStudyUpdate = useCallback(
    (newData) => {
      setStudyData(newData);
      if (user?.uid) {
        saveStudyData(user.uid, newData);
      }
    },
    [user]
  );

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  // Loading screen
  if (loading || !studyData) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin" />
          <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-violet-500/20 border-b-violet-400 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
        </div>
        <span className="text-xs text-cyan-400/70 font-mono tracking-widest uppercase">
          Initializing Study Station...
        </span>
      </div>
    );
  }

  // Subscribe paywall — only allow subscribed users to access the study dashboard
  if (user && (user.tier === "free" || !user.tier)) {
    return (
      <div className="relative min-h-screen bg-black text-white flex flex-col justify-center items-center overflow-hidden p-6 select-none">
        {/* Background elements */}
        <SpaceBackground />
        <div className="absolute inset-0 bg-black/60 z-[1] pointer-events-none" />

        {/* Paywall Card */}
        <div className="relative z-10 glass-panel border border-white/10 rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-md">
          {/* Locked Icon */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-violet-500/10 to-sky-500/10 border border-violet-500/30 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(139,92,246,0.15)] animate-pulse">
            <ShieldCheck className="w-8 h-8 text-violet-400" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg md:text-xl font-display font-extrabold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
              Command Station Locked
            </h2>
            <p className="text-[10px] md:text-xs text-zinc-500 font-mono tracking-wide leading-relaxed">
              Access to the advanced JEE/NEET study dashboard is reserved exclusively for subscribed members.
            </p>
          </div>

          {/* Current Tier Info Card */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5 text-left font-mono">
            <div className="flex justify-between items-center text-[9px] text-zinc-500">
              <span>STUDENT PROFILE</span>
              <span>LOCKED</span>
            </div>
            <div className="text-[10px] text-zinc-300 font-bold uppercase tracking-wider">
              {user.email}
            </div>
            <div className="flex justify-between items-center text-[9px] pt-1 border-t border-white/5">
              <span className="text-zinc-500">SUBSCRIPTION LEVEL:</span>
              <span className="text-red-400 font-bold uppercase">Free Tier</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3 pt-2">
            <a
              href="/#pricing"
              className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-600 border border-orange-500/20 text-[10px] font-mono font-bold uppercase tracking-wider text-white hover:from-orange-500 hover:to-pink-700 transition-all cursor-pointer text-center shadow-[0_0_20px_rgba(249,115,22,0.15)] hover:scale-[1.02]"
            >
              Upgrade Tier Now
            </a>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-400 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden select-none">
      {/* Black hole background */}
      <SpaceBackground />
      <div className="absolute inset-0 bg-black/50 z-[1] pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="relative z-10 py-6 px-6 md:px-12 border-b border-white/[0.04] bg-black/40 backdrop-blur-xl flex justify-between items-center">
        {/* Left: Logo */}
        <a href="/" className="flex items-center gap-2 group">
          <div className="relative w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-500 to-violet-600 flex items-center justify-center shadow-lg">
            <span className="font-display font-bold text-white text-[10px]">PV</span>
          </div>
          <span className="font-display font-extrabold text-sm tracking-wider">
            PHYSICS<span className="text-sky-400 font-medium">VAULT</span>
          </span>
        </a>

        {/* Center: Tab Switcher */}
        <div className="hidden md:flex gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab("command")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "command"
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_12px_rgba(0,217,255,0.08)]"
                : "text-zinc-500 hover:text-zinc-300 border border-transparent"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Command Center
          </button>
          <button
            onClick={() => setActiveTab("library")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "library"
                ? "bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-[0_0_12px_rgba(56,189,248,0.08)]"
                : "text-zinc-500 hover:text-zinc-300 border border-transparent"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Library
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "ai"
                ? "bg-violet-500/10 text-violet-400 border border-violet-500/20 shadow-[0_0_12px_rgba(139,92,246,0.08)]"
                : "text-zinc-500 hover:text-zinc-300 border border-transparent"
            }`}
          >
            <span className="text-sm">🤖</span>
            AI Solver
          </button>
          <button
            onClick={() => setActiveTab("strategies")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "strategies"
                ? "bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-[0_0_12px_rgba(249,115,22,0.08)]"
                : "text-zinc-500 hover:text-zinc-300 border border-transparent"
            }`}
          >
            <span className="text-sm">📺</span>
            Strategies
          </button>
        </div>

        {/* Right: User + Logout */}
        <div className="flex items-center gap-3">
          <span className="hidden md:flex text-[10px] text-zinc-400 items-center gap-1.5 bg-white/[0.03] border border-white/[0.06] px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-3 h-3 text-sky-400" />
            {user.email}
            <span
              className={`ml-1.5 text-[7px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                user.tier === "titan"
                  ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                  : user.tier === "aspirant"
                  ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                  : "bg-zinc-500/20 text-zinc-400 border border-zinc-500/30"
              }`}
            >
              {user.tier}
            </span>
            {user.tier && user.tier !== "free" && (
              <button
                onClick={() => {
                  upgradeUserTier(user.uid, "free");
                  window.location.reload();
                }}
                className="text-[8px] font-mono text-red-400 hover:text-red-300 underline cursor-pointer ml-1 font-bold uppercase tracking-wider transition-colors"
                title="Reset subscription to Free Tier for paywall testing"
              >
                Reset
              </button>
            )}
          </span>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-[10px] text-zinc-400 hover:text-white border border-white/[0.06] px-3 py-2 rounded-lg bg-white/[0.03] hover:bg-red-500/10 hover:border-red-500/20 transition-all cursor-pointer font-mono font-bold uppercase tracking-wider"
          >
            <LogOut className="w-3 h-3" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Mobile Tab Switcher */}
      <div className="md:hidden relative z-10 flex flex-wrap gap-1 mx-4 mt-3 bg-white/[0.03] p-1 rounded-xl border border-white/5">
        <button
          onClick={() => setActiveTab("command")}
          className={`flex-1 min-w-[70px] flex items-center justify-center gap-1 py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "command"
              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
              : "text-zinc-500 border border-transparent"
          }`}
        >
          Command Center
        </button>
        <button
          onClick={() => setActiveTab("library")}
          className={`flex-1 min-w-[70px] flex items-center justify-center gap-1 py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "library"
              ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
              : "text-zinc-500 border border-transparent"
          }`}
        >
          Library
        </button>
        <button
          onClick={() => setActiveTab("ai")}
          className={`flex-1 min-w-[70px] flex items-center justify-center gap-1 py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "ai"
              ? "bg-violet-500/10 text-violet-400 border border-violet-500/20"
              : "text-zinc-500 border border-transparent"
          }`}
        >
          AI Solver
        </button>
        <button
          onClick={() => setActiveTab("strategies")}
          className={`flex-1 min-w-[70px] flex items-center justify-center gap-1 py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "strategies"
              ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
              : "text-zinc-500 border border-transparent"
          }`}
        >
          Strategies
        </button>
      </div>

      {/* Main Content */}
      <main className="relative z-10 pb-12">
        {/* AI Solver + Study Strategies View */}
        {activeTab === "ai" && (
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 mt-6 pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Left Column: AI Doubt Solver */}
              <div className="lg:col-span-2">
                <AIDoubtSolver />
              </div>
              
              {/* Right Column: Study Strategies YouTube Playlist Player */}
              <div className="glass-panel border border-white/10 rounded-3xl p-5 space-y-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                {/* Heading */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">📺</span>
                    <h3 className="text-xs uppercase font-mono font-extrabold tracking-wider text-white">
                      Study Strategies
                    </h3>
                  </div>
                  <p className="text-[9px] text-zinc-500 font-mono">
                    Premium study techniques and IIT JEE/NEET blueprints by elite educators.
                  </p>
                </div>

                {/* Video Player */}
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-zinc-950 shadow-inner shadow-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${activeVideoId}`}
                    title="Study Strategy Video Player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>

                {/* Video Details */}
                {(() => {
                  const currentVideo = STUDY_STRATEGIES_VIDEOS.find(v => v.id === activeVideoId);
                  return currentVideo ? (
                    <div className="space-y-1.5 font-mono">
                      <h4 className="text-[10px] uppercase font-bold text-white leading-normal truncate">
                        {currentVideo.title}
                      </h4>
                      <p className="text-[9px] text-zinc-400 leading-relaxed">
                        {currentVideo.desc}
                      </p>
                    </div>
                  ) : null;
                })()}

                {/* Playlist Selection */}
                <div className="space-y-2 border-t border-white/5 pt-4">
                  <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-zinc-500 block">
                    Telemetry Playlist
                  </span>
                  
                  <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
                    {STUDY_STRATEGIES_VIDEOS.map((video) => {
                      const isCurrent = video.id === activeVideoId;
                      return (
                        <button
                          key={video.id}
                          onClick={() => setActiveVideoId(video.id)}
                          className={`w-full text-left p-2.5 rounded-xl border font-mono transition-all flex gap-3 cursor-pointer ${
                            isCurrent
                              ? "bg-violet-500/10 border-violet-500/20 text-violet-300"
                              : "bg-white/[0.01] border-white/5 text-zinc-500 hover:text-zinc-300 hover:border-white/10 hover:bg-white/[0.02]"
                          }`}
                        >
                          {/* Mini Thumbnail */}
                          <div className="w-16 h-10 bg-black rounded overflow-hidden flex-shrink-0 relative border border-white/5">
                            <img
                              src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                              alt=""
                              className="w-full h-full object-cover filter brightness-75"
                            />
                            {isCurrent && (
                              <div className="absolute inset-0 bg-violet-500/10 flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
                              </div>
                            )}
                          </div>
                          
                          {/* Title Metadata */}
                          <div className="min-w-0 flex-1 space-y-1">
                            <p className="text-[9px] font-bold uppercase tracking-wide truncate">
                              {video.title}
                            </p>
                            <p className="text-[8px] text-zinc-500 line-clamp-1">
                              {video.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Study Strategies Dedicated Cinematic View */}
        {activeTab === "strategies" && (
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 mt-6 pb-12 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Left Column: Widescreen Theater Video Player */}
              <div className="lg:col-span-2 space-y-6">
                <div className="glass-panel border border-white/10 rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                  {/* Active Video Header Info */}
                  {(() => {
                    const currentVideo = STUDY_STRATEGIES_VIDEOS.find(v => v.id === activeVideoId) || STUDY_STRATEGIES_VIDEOS[0];
                    return (
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/5">
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/25 text-orange-400 text-[9px] font-mono uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping" />
                              Active Masterclass
                            </span>
                            <h2 className="text-lg md:text-xl font-display font-extrabold uppercase text-white tracking-wide mt-1">
                              {currentVideo.title}
                            </h2>
                          </div>
                          <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-2">
                            <span>Video ID:</span>
                            <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-zinc-300 font-bold select-all">
                              {currentVideo.id}
                            </span>
                          </div>
                        </div>

                        {/* Large Cinematic Player */}
                        <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-zinc-950 shadow-[0_20px_50px_rgba(0,0,0,0.8)] group">
                          <iframe
                            src={`https://www.youtube.com/embed/${currentVideo.id}`}
                            title={currentVideo.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            className="absolute inset-0 w-full h-full"
                          />
                        </div>

                        {/* Description Panel */}
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                          <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-zinc-500 block">
                            Blueprints & Telemetry
                          </span>
                          <p className="text-xs text-zinc-300 font-mono leading-relaxed">
                            {currentVideo.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Right Column: Premium Interactive Playlist selection */}
              <div className="glass-panel border border-white/10 rounded-3xl p-6 space-y-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">📺</span>
                    <h3 className="text-xs uppercase font-mono font-extrabold tracking-wider text-white">
                      Study Strategies Playlist
                    </h3>
                  </div>
                  <p className="text-[9px] text-zinc-500 font-mono">
                    Select a seminar block to adjust your telemetry stream.
                  </p>
                </div>

                <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1 scrollbar-thin">
                  {STUDY_STRATEGIES_VIDEOS.map((video) => {
                    const isCurrent = video.id === activeVideoId;
                    return (
                      <button
                        key={video.id}
                        onClick={() => setActiveVideoId(video.id)}
                        className={`w-full text-left p-3 rounded-2xl border font-mono transition-all flex gap-3 cursor-pointer ${
                          isCurrent
                            ? "bg-orange-500/10 border-orange-500/25 text-orange-300 shadow-[0_0_15px_rgba(249,115,22,0.05)]"
                            : "bg-white/[0.01] border-white/5 text-zinc-500 hover:text-zinc-300 hover:border-white/10 hover:bg-white/[0.02]"
                        }`}
                      >
                        {/* Mini Thumbnail with image check */}
                        <div className="w-20 h-12 bg-black rounded-lg overflow-hidden flex-shrink-0 relative border border-white/5">
                          <img
                            src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                            alt=""
                            className="w-full h-full object-cover filter brightness-75 group-hover:brightness-90 transition-all"
                          />
                          {isCurrent && (
                            <div className="absolute inset-0 bg-orange-500/10 flex items-center justify-center">
                              <span className="text-xs animate-bounce">📺</span>
                            </div>
                          )}
                        </div>

                        {/* Title Metadata */}
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex justify-between items-center gap-2">
                            <p className="text-[10px] font-bold uppercase tracking-wide truncate">
                              {video.title}
                            </p>
                            {isCurrent && (
                              <span className="text-[7px] bg-orange-500/20 text-orange-400 border border-orange-500/30 px-1 py-0.2 rounded font-bold uppercase tracking-wider shrink-0 animate-pulse">
                                Live
                              </span>
                            )}
                          </div>
                          <p className="text-[8px] text-zinc-500 line-clamp-2 leading-relaxed">
                            {video.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Library View — Google Drive Resources */}
        {activeTab === "library" && (
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 mt-6 pb-12">
            <DriveResourcesPanel />
          </div>
        )}

        {/* Command Center View */}
        {activeTab === "command" && (
          <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* LEFT SIDEBAR — Gamification */}
              <div className="hidden lg:block w-56 flex-shrink-0">
                <div className="sticky top-6 space-y-4">
                  <Sidebar studyData={studyData} user={user} />
                  <AmbientControls studyData={studyData} onUpdate={handleStudyUpdate} />
                </div>
              </div>

              {/* CENTER — Main Dashboard Modules */}
              <div className="flex-1 min-w-0 space-y-6">
                {/* Welcome Cockpit Banner & SEO Primary Title */}
                <div className="glass-panel border border-white/5 rounded-3xl p-6 relative overflow-hidden bg-gradient-to-r from-white/[0.01] to-white/[0.03]">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono tracking-widest text-cyan-400 uppercase font-bold block">
                        SYSTEM CLEARANCE: COMMANDER LEVEL
                      </span>
                      <h1 className="text-xl md:text-2xl font-display font-extrabold text-white tracking-wide uppercase">
                        Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">{user.displayName || user.email.split("@")[0]}</span>
                      </h1>
                      <p className="text-[10px] text-zinc-500 font-mono">
                        Your orbital tracking cockpit is fully synced with active study telemetry.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 bg-white/[0.02] border border-white/5 px-3.5 py-2 rounded-2xl font-mono text-[9px] text-zinc-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                      <span>COSMIC TELEMETRY ACTIVE</span>
                    </div>
                  </div>
                </div>

                {/* Top Row: Pomodoro + Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <PomodoroTimer
                    studyData={studyData}
                    onUpdate={handleStudyUpdate}
                  />
                  <StudyAnalytics studyData={studyData} />
                </div>

                {/* Mobile-only Sidebar Stats */}
                <div className="lg:hidden">
                  <Sidebar studyData={studyData} user={user} />
                </div>

                {/* Bottom Row: Subject Tracker + Task Manager */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SubjectTracker
                    studyData={studyData}
                    onUpdate={handleStudyUpdate}
                  />
                  <TaskManager
                    studyData={studyData}
                    onUpdate={handleStudyUpdate}
                  />
                </div>

                {/* Mobile-only Ambient Controls */}
                <div className="lg:hidden">
                  <AmbientControls studyData={studyData} onUpdate={handleStudyUpdate} />
                </div>
              </div>

              {/* RIGHT PANEL — AI Quick Access (desktop only) */}
              <div className="hidden xl:block w-96 flex-shrink-0">
                <div className="sticky top-6">
                  <AIDoubtSolver />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
