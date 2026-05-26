"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  Atom, 
  BookOpen,
  Sparkles, 
  ChevronRight, 
  Check, 
  Search,
  MessageSquare,
  Send,
  HelpCircle, 
  Zap, 
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Star,
  GraduationCap,
  Award
} from "lucide-react";

// Components
import Navbar from "@/components/Navbar";
import SpaceBackground from "@/components/SpaceBackground";
import FloatingAstronaut from "@/components/FloatingAstronaut";
import AuthModal from "@/components/AuthModal";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [user, setUser] = useState(null);
  
  // Auth Modal state
  const [authOpen, setAuthOpen] = useState(false);
  const [authView, setAuthView] = useState("login");

  // Mouse coordinates state for glow
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Interactive AI Doubt Solver Simulator state
  const [doubtQuery, setDoubtQuery] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", text: "Hello! I am your PhysicsVault AI Study Orb. Ask me any question or paste a formula from Physics, Chemistry, or Maths!" }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Initializing preloader count-up
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 500);
          return 100;
        }
        const step = Math.floor(Math.random() * 15) + 5;
        return Math.min(100, prev + step);
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Fetch persistent user session on load
  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      }
    };
    fetchSession();
  }, []);

  // Cursor glow coordination tracking
  useEffect(() => {
    const updateMousePos = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", updateMousePos);
    return () => window.removeEventListener("mousemove", updateMousePos);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const triggerAuth = (viewType) => {
    setAuthView(viewType);
    setAuthOpen(true);
  };

  // Mock AI Doubt solving database answers
  const handleSolveDoubt = async (e) => {
    e.preventDefault();
    if (!doubtQuery.trim()) return;

    const userQ = doubtQuery;
    setChatMessages(prev => [...prev, { role: "user", text: userQ }]);
    setDoubtQuery("");
    setIsTyping(true);

    // Simulate AI computing latency
    await new Promise(resolve => setTimeout(resolve, 1400));

    let reply = "I've analyzed your telemetry query. Here is the step-by-step mathematical deduction:\n\nUsing the Schrödinger equation:\n\n$$-\\frac{\\hbar^2}{2m} \\nabla^2 \\Psi + V\\Psi = E\\Psi$$\n\nIntegrating over bounded energy levels confirms orbital stability.";
    
    const queryLower = userQ.toLowerCase();
    if (queryLower.includes("gravity") || queryLower.includes("kepler")) {
      reply = "Kepler's Third Law states that the square of the orbital period $T^2$ is proportional to the cube of the semi-major axis $a^3$:\n\n$$T^2 = \\left( \\frac{4\\pi^2}{G(M + m)} \\right) a^3$$\n\nFor satellites orbiting massive centers, we approximate gravity balances as:\n\n$$\\frac{v^2}{r} = \\frac{GM}{r^2} \\implies v = \\sqrt{\\frac{GM}{r}}$$";
    } else if (queryLower.includes("benzene") || queryLower.includes("chemistry")) {
      reply = "For organic resonance compounds, molecular orbitals form delocalized $\\pi$-electron rings. Let's calculate the resonance energy bounds:\n\n$$\\text{Resonance Energy} = E_{\\text{localized}} - E_{\\text{delocalized}} \\approx 152\\text{ kJ/mol}$$";
    } else if (queryLower.includes("limit") || queryLower.includes("calculus") || queryLower.includes("math")) {
      reply = "Using L'Hôpital's Rule for indeterminate forms $0/0$:\n\n$$\\lim_{x \\to c} \\frac{f(x)}{g(x)} = \\lim_{x \\to c} \\frac{f'(x)}{g'(x)}$$\n\nDifferentiating the numerators and denominators allows direct evaluation.";
    }

    setChatMessages(prev => [...prev, { role: "assistant", text: reply }]);
    setIsTyping(false);
  };

  // Floating physics & mathematics equations positions
  const formulas = [
    { text: "E = mc²", top: "15%", left: "8%", delay: 0 },
    { text: "F = G(m₁m₂)/r²", top: "42%", left: "5%", delay: 3 },
    { text: "iℏ(∂/∂t)Ψ = ĤΨ", top: "72%", left: "10%", delay: 1.5 },
    { text: "∮ B·dl = μ₀I", top: "25%", right: "12%", delay: 4 },
    { text: "∇ × E = -∂B/∂t", top: "55%", right: "8%", delay: 2 },
    { text: "PV = nRT", top: "82%", right: "15%", delay: 5.5 },
  ];

  return (
    <div className="relative min-h-screen text-[#f8fafc] bg-[#030303] overflow-hidden select-none">
      
      {/* Global Cursor Glow */}
      <div 
        className="fixed w-[500px] h-[500px] rounded-full bg-sky-500/5 pointer-events-none -translate-x-1/2 -translate-y-1/2 filter blur-[130px] transition-all duration-300 z-30"
        style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
      />

      {/* Cinematic Academic Preloader */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            key="preloader"
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020205]"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative flex items-center justify-center w-36 h-36">
              <div className="absolute inset-0 border border-t-sky-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
              <div className="absolute inset-3 border border-t-transparent border-r-violet-500 border-b-transparent border-l-transparent rounded-full animate-[spin_1.5s_linear_infinite_reverse]" />
              <div className="absolute inset-6 border border-t-transparent border-r-transparent border-b-sky-400 border-l-transparent rounded-full animate-[spin_0.8s_linear_infinite]" />
              <GraduationCap className="w-8 h-8 text-sky-400 animate-pulse" />
            </div>

            <motion.div 
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h2 className="font-display font-extrabold text-xs tracking-[0.25em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-violet-400">
                INITIALIZING PHYSICSVAULT COCKPIT
              </h2>
              <div className="w-48 h-[2px] bg-zinc-800 rounded-full mt-3 overflow-hidden mx-auto">
                <div 
                  className="h-full bg-gradient-to-r from-sky-400 to-violet-500 rounded-full transition-all duration-150"
                  style={{ width: `${loadingPercent}%` }}
                />
              </div>
              <span className="block text-[10px] font-mono text-zinc-500 mt-2 tracking-widest">
                {loadingPercent}% LOADED
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Starfield and Accretion Disk Black Hole */}
      {!loading && (
        <>
          <SpaceBackground />
          <FloatingAstronaut />
          
          <Navbar 
            onAuthClick={triggerAuth} 
            user={user} 
            onLogout={handleLogout}
          />

          {/* Floating LaTeX Math Formulas Layer */}
          <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
            {formulas.map((form, i) => (
              <div
                key={i}
                className="absolute font-mono text-xs text-sky-400/25 tracking-wider select-none animate-float-math"
                style={{
                  top: form.top,
                  left: form.left,
                  right: form.right,
                  animationDelay: `${form.delay}s`,
                }}
              >
                {form.text}
              </div>
            ))}
          </div>

          <main className="relative z-10">
            
            {/* 1. ACADEMIC HERO SECTION */}
            <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-12 pt-28 pb-16 max-w-7xl mx-auto overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                {/* Hero Wording & CTA */}
                <div className="lg:col-span-7 space-y-6 text-left relative z-20">
                  
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/5 backdrop-blur-md shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
                    <span className="text-[10px] font-mono tracking-wider font-extrabold uppercase text-violet-400">
                      PREMIUM JEE & NEET PREPARATION cockpit
                    </span>
                  </motion.div>

                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight leading-[1.05]"
                  >
                    Master Physics <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-sky-300 to-violet-500 text-glow">
                      Like Never Before
                    </span>
                  </motion.h1>

                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="max-w-xl text-sm md:text-base text-zinc-400 font-medium leading-relaxed"
                  >
                    Access elite study notes, interactive textbooks, and instant 24/7 AI-powered doubt solving tailored for advanced science learners and exam candidates.
                  </motion.p>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="flex flex-wrap items-center gap-4 pt-3"
                  >
                    <a
                      href="#pricing"
                      className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-sky-400 to-violet-500 hover:from-sky-500 hover:to-violet-600 text-white font-semibold text-xs uppercase tracking-wider cursor-pointer shadow-lg hover:shadow-sky-500/25 transition-all hover:scale-102 flex items-center gap-2"
                    >
                      Start Free Trial <ChevronRight className="w-4 h-4" />
                    </a>
                    
                    <a
                      href="#notes"
                      className="px-6 py-3.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs uppercase tracking-wider cursor-pointer transition-all"
                    >
                      Access Notes
                    </a>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.0, delay: 0.5 }}
                    className="grid grid-cols-3 gap-6 pt-10 border-t border-white/5 max-w-lg"
                  >
                    {[
                      { val: "15,000+", label: "Selections Secured" },
                      { val: "99.98", label: "Top Percentile" },
                      { val: "24/7", label: "AI Doubt Assist" },
                    ].map((stat) => (
                      <div key={stat.label} className="space-y-1">
                        <span className="block font-display font-extrabold text-lg sm:text-xl text-white text-glow">
                          {stat.val}
                        </span>
                        <span className="block text-[9px] font-mono tracking-widest text-zinc-500 uppercase">
                          {stat.label}
                        </span>
                      </div>
                    ))}
                  </motion.div>

                </div>

                {/* Floating AI assistant Orb & Dashboard preview */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center relative z-20 space-y-6">
                  
                  {/* Floating AI Orb Container */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="relative w-48 h-48 md:w-56 md:h-56 select-none flex items-center justify-center filter drop-shadow-[0_0_35px_rgba(56,189,248,0.3)]"
                  >
                    <Image
                      src="/ai_orb.png"
                      alt="Cosmic AI Doubt Solving Orb"
                      width={220}
                      height={220}
                      className="object-contain"
                      priority
                    />
                    <div className="absolute -inset-4 border border-sky-400/20 border-dashed rounded-full animate-[spin_40s_linear_infinite]" />
                  </motion.div>

                  {/* Student Study Dashboard Mockup */}
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.0, delay: 0.4 }}
                    className="w-full max-w-sm glass-panel rounded-2xl p-5 border border-white/10 shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />
                    
                    {/* Header line */}
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
                          STUDENT STUDY COCKPIT
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-sky-400 font-bold bg-sky-500/10 px-2 py-0.5 rounded-full">
                        ACTIVE SESSION
                      </span>
                    </div>

                    {/* Stats details */}
                    <div className="space-y-3.5 text-xs">
                      <div>
                        <div className="flex justify-between text-zinc-400 mb-1.5 font-medium">
                          <span>JEE General Syllabus Tracker</span>
                          <span className="text-white font-bold">82%</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-800/80 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-sky-400 to-violet-500 rounded-full" style={{ width: "82%" }} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="bg-white/3 border border-white/5 rounded-xl p-3 space-y-1">
                          <span className="block text-[9px] font-mono text-zinc-500 uppercase">SOLVED DOUBTS</span>
                          <span className="block font-display font-extrabold text-lg text-white">412</span>
                        </div>
                        <div className="bg-white/3 border border-white/5 rounded-xl p-3 space-y-1">
                          <span className="block text-[9px] font-mono text-zinc-500 uppercase">SOLVER TIMEOUT</span>
                          <span className="block font-display font-extrabold text-lg text-sky-400">12s avg</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                </div>
              </div>

              {/* Sub-hero Fade */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#030303] to-transparent pointer-events-none" />
            </section>

            {/* 2. INFINITE ACHIEVEMENTS RUNNING MARQUEE */}
            <div className="relative py-8 bg-black/60 border-y border-white/5 overflow-hidden z-25">
              <div className="flex whitespace-nowrap overflow-hidden">
                <div className="flex gap-16 text-xs font-mono tracking-widest text-zinc-400 uppercase animate-marquee">
                  {[...Array(4)].map((_, idx) => (
                    <span key={idx} className="flex gap-16">
                      <span className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-sky-400" /> AIR 14 JEE ADVANCED 2025
                      </span>
                      <span className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-violet-400 fill-violet-400/20" /> 99.98 PERCENTILE JEE MAINS
                      </span>
                      <span className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-emerald-400" /> AIR 42 NEET BIOLOGY SUCCESS
                      </span>
                      <span className="flex items-center gap-2">
                        <Atom className="w-4 h-4 text-sky-400 animate-spin-slow" /> 15,000+ CLASS XI/XII CLASSROOM SUCCESS STORIES
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. NOTES & TEXTBOOKS GRID SECTION */}
            <section id="notes" className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                {/* Visual Science Textbooks Display */}
                <div className="lg:col-span-5 flex items-center justify-center relative z-20">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                    className="relative w-80 h-80 md:w-96 md:h-96 filter drop-shadow-[0_0_40px_rgba(139,92,246,0.25)] pointer-events-auto"
                  >
                    <Image
                      src="/textbooks.png"
                      alt="Physics Vault Textbooks"
                      width={380}
                      height={380}
                      className="object-contain"
                      priority
                    />
                  </motion.div>
                </div>

                {/* Animated Textbook Cards */}
                <div className="lg:col-span-7 space-y-8 relative z-20">
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono tracking-[0.25em] text-sky-400 uppercase font-bold">
                      ELITE SUBJECT MODULES
                    </span>
                    <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white">
                      Futuristic Interactive Syllabus
                    </h2>
                    <p className="text-sm text-zinc-400 leading-relaxed max-w-lg font-medium">
                      Study our hand-crafted, high-yield digital notes. Each curriculum textbook includes floating formula visualizations and instant doubt solving portals.
                    </p>
                  </div>

                  {/* Textbook cards details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {[
                      {
                        subj: "Physics",
                        badge: "Mechanics + Field Electrics",
                        glow: "border-sky-500/20 group-hover:border-sky-400/40 hover:shadow-sky-500/5",
                        features: ["Kinematics & Gravity Solver", "Relativistic Fields", "Waves & Particles"]
                      },
                      {
                        subj: "Chemistry",
                        badge: "Organic Rings + Gas Labs",
                        glow: "border-emerald-500/20 group-hover:border-emerald-400/40 hover:shadow-emerald-500/5",
                        features: ["Benzene Rings Resonance", "Cosmic Gas Kinetics", "Entropy States Math"]
                      },
                      {
                        subj: "Mathematics",
                        badge: "Limits + Calculus Vectors",
                        glow: "border-violet-500/20 group-hover:border-violet-400/40 hover:shadow-violet-500/5",
                        features: ["Limits & Calculus Rates", "Vector Spaces", "Quantum Algorithms"]
                      }
                    ].map((card, idx) => (
                      <div 
                        key={idx}
                        className={`glass-panel rounded-xl p-5 border text-left flex flex-col justify-between min-h-[220px] group transition-all duration-300 hover:scale-103 ${card.glow}`}
                      >
                        <div className="space-y-3">
                          <span className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                            {card.badge}
                          </span>
                          <h4 className="font-display font-extrabold text-lg text-white">
                            {card.subj}
                          </h4>
                          <ul className="space-y-2 text-[10px] text-zinc-400 font-medium">
                            {card.features.map((feat, fIdx) => (
                              <li key={fIdx} className="flex items-center gap-1.5">
                                <Check className="w-3 h-3 text-sky-400" /> {feat}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <a 
                          href="#pricing"
                          className="text-[10px] font-bold uppercase tracking-wider text-sky-400 mt-4 block"
                        >
                          OPEN TEXTBOOK
                        </a>
                      </div>
                    ))}
                  </div>

                </div>

              </div>
            </section>

            {/* 4. LIVE AI DOUBT SOLVING SECTION */}
            <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-[140px] pointer-events-none" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                {/* AI Text explanation */}
                <div className="lg:col-span-6 space-y-6 text-left relative z-20">
                  <span className="text-[10px] font-mono tracking-[0.25em] text-violet-400 uppercase font-bold">
                    LIVE AI SUPPORT
                  </span>
                  <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white">
                    Solve Your Doubts <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-violet-500 text-glow font-extrabold">
                      In Ten Seconds Flat
                    </span>
                  </h2>
                  <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                    Stuck on a tricky JEE Advanced problem? Type the formula or upload your telemetry equation. Our AI tutor analyzes steps instantaneously, returning crystal-clear LaTeX derivations.
                  </p>
                  
                  <div className="space-y-3.5 pt-4">
                    {[
                      "Fully supports Physics, Chemistry, and Maths equations.",
                      "Translates atomic bonds, mechanics, and vector lattices.",
                      "LaTeX formatted mathematical notation rendering.",
                    ].map((point, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-violet-500/10 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 text-violet-400" />
                        </div>
                        <span className="text-xs text-zinc-300 font-medium">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Interactive Chat Simulator Console */}
                <div className="lg:col-span-6 relative z-20">
                  <div className="glass-panel rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col h-[380px]">
                    
                    {/* Chat console header */}
                    <div className="bg-white/3 border-b border-white/5 px-5 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
                        <span className="text-[10px] font-mono tracking-widest text-zinc-300 uppercase">
                          DOUBT-SOLVER TELEMETRY CONSOLE
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase">
                        AI COCKPIT STABLE
                      </span>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-4 text-left">
                      {chatMessages.map((msg, i) => (
                        <div 
                          key={i} 
                          className={`flex items-start gap-2.5 ${
                            msg.role === "user" ? "justify-end" : "justify-start"
                          }`}
                        >
                          {msg.role === "assistant" && (
                            <div className="w-6 h-6 rounded-full bg-sky-500/10 flex items-center justify-center shrink-0 border border-sky-500/20 text-[9px] font-bold text-sky-400 font-mono">
                              AI
                            </div>
                          )}
                          <div 
                            className={`rounded-xl p-3.5 max-w-[80%] text-xs font-medium leading-relaxed whitespace-pre-line ${
                              msg.role === "user"
                                ? "bg-violet-600/20 border border-violet-500/30 text-white"
                                : "bg-white/3 border border-white/5 text-zinc-300"
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      ))}
                      {isTyping && (
                        <div className="flex items-start gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-sky-500/10 flex items-center justify-center shrink-0 border border-sky-500/20 text-[9px] font-bold text-sky-400 font-mono">
                            AI
                          </div>
                          <div className="rounded-xl p-3.5 bg-white/3 border border-white/5 text-zinc-500 text-xs font-mono">
                            Computing LaTeX matrix...
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Chat input submit */}
                    <form onSubmit={handleSolveDoubt} className="border-t border-white/5 bg-black/40 p-3 flex gap-2">
                      <input
                        type="text"
                        value={doubtQuery}
                        onChange={(e) => setDoubtQuery(e.target.value)}
                        placeholder="e.g. Solve Kepler's third gravity law, or limits calculus..."
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-sky-400 focus:ring-0 font-medium"
                      />
                      <button
                        type="submit"
                        className="w-10 h-10 rounded-xl bg-gradient-to-r from-sky-400 to-violet-500 flex items-center justify-center text-white cursor-pointer hover:shadow-sky-500/20 hover:scale-102 transition-all shrink-0"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>

                  </div>
                </div>

              </div>
            </section>

            {/* 5. STUDENT SUCCESS REVIEWS SECTION */}
            <section id="reviews" className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative overflow-hidden">
              <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                <span className="text-[10px] font-mono tracking-[0.25em] text-sky-400 uppercase font-bold">
                  STUDENT TESTIMONIALS
                </span>
                <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white">
                  Fleet Ranks & Success Stories
                </h2>
                <p className="text-sm text-zinc-500 font-medium">
                  Thousands of navigators master complex competitive examinations using PhysicsVault textbooks.
                </p>
              </div>

              {/* Review Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    name: "Rahul Verma",
                    rank: "AIR 14 · JEE Advanced 2025",
                    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
                    comment: "The relativistic simulation fields saved me weeks of dry textbook reading. The LaTeX AI doubt solver responded in seconds whenever I got stuck.",
                    rating: 5
                  },
                  {
                    name: "Ananya Iyer",
                    rank: "99.98% Percentile · JEE Mains",
                    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
                    comment: "Chemistry and Maths textbooks are filled with floating formulas that make spatial visualization effortless. Absolute startup gold standard.",
                    rating: 5
                  },
                  {
                    name: "Vikram Malhotra",
                    rank: "AIR 42 · NEET Biology",
                    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
                    comment: "PhysicsVault study notes are compiled with high-precision matrices. The persistent dashboard allowed me to continue studying on my tablet flawlessly.",
                    rating: 5
                  }
                ].map((rev, i) => (
                  <div key={i} className="glass-panel glass-panel-hover rounded-2xl p-6 border border-white/5 flex flex-col justify-between text-left h-76 relative group overflow-hidden">
                    <div className="space-y-4">
                      {/* Rating stars */}
                      <div className="flex gap-1">
                        {[...Array(rev.rating)].map((_, sIdx) => (
                          <Star key={sIdx} className="w-3.5 h-3.5 text-sky-400 fill-sky-400" />
                        ))}
                      </div>
                      
                      <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                        "{rev.comment}"
                      </p>
                    </div>

                    {/* Author block */}
                    <div className="flex items-center gap-3 pt-4 border-t border-white/5 mt-4">
                      <div className="relative w-9 h-9 rounded-full overflow-hidden border border-sky-400/20 shrink-0">
                        <img 
                          src={rev.image} 
                          alt={rev.name}
                          className="w-full h-full object-cover filter contrast-105"
                        />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-white">{rev.name}</span>
                        <span className="block text-[9px] font-mono tracking-widest text-sky-400 uppercase font-semibold">
                          {rev.rank}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </section>

            {/* 6. EDUCATIONAL PRICING SECTION */}
            <section id="pricing" className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative overflow-hidden">
              <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

              <div className="text-center max-w-2xl mx-auto mb-20 space-y-3 relative z-10">
                <span className="text-[10px] font-mono tracking-[0.25em] text-sky-400 uppercase font-bold">
                  PORTAL BOARDING CLEARANCE
                </span>
                <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white">
                  Join the PhysicsVault Fleet
                </h2>
                <p className="text-sm text-zinc-500 font-medium">
                  Unlock access to unlimited study notes, animated textbooks, and AI doubt solvers.
                </p>
              </div>

              {/* Pricing Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto relative z-20">
                
                {/* CARD 1: ASPIRANT */}
                <div 
                  className="animated-border rounded-2xl p-8 flex flex-col justify-between min-h-[460px] cursor-pointer"
                  onClick={() => triggerAuth("signup")}
                >
                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono tracking-widest text-sky-400 uppercase font-semibold">
                          STUDENT PASS
                        </span>
                        <h3 className="font-display font-extrabold text-2xl text-white mt-1">Aspirant</h3>
                        <p className="text-xs text-zinc-500 mt-0.5">Flexible monthly study cockpit</p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2.5 py-1 rounded-full bg-sky-400/10 border border-sky-400/20 text-sky-400 uppercase tracking-widest">
                        Launch Price
                      </span>
                    </div>

                    <div className="py-2 border-b border-white/5">
                      <div className="flex items-baseline gap-2">
                        <span className="text-zinc-600 line-through text-sm font-medium">₹299/mo</span>
                        <span className="text-4xl font-display font-extrabold text-white">₹200</span>
                        <span className="text-zinc-400 text-xs">/ month</span>
                      </div>
                      <span className="block text-[10px] font-mono text-zinc-500 mt-1 uppercase tracking-wider">
                        Cancel anytime · Includes 7-Day Free Trial
                      </span>
                    </div>

                    <ul className="space-y-3.5 text-xs text-zinc-400">
                      {[
                        "Interactive syllabus models (Physics, Chemistry, Maths)",
                        "High-yield digital notes and textbooks",
                        "24/7 AI-powered doubt-solving (50 queries/mo)",
                        "Persistent browser project state storage",
                        "Standard student dashboard support",
                      ].map((feat) => (
                        <li key={feat} className="flex items-center gap-2.5">
                          <div className="w-4 h-4 rounded-full bg-sky-400/10 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-sky-400" />
                          </div>
                          <span className="font-medium">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/5">
                    <button className="w-full py-3.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 hover:text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-sky-500/10">
                      Start 7-Day Free Trial
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* CARD 2: TITAN */}
                <div 
                  className="animated-border rounded-2xl p-8 flex flex-col justify-between min-h-[460px] relative overflow-hidden cursor-pointer"
                  onClick={() => triggerAuth("signup")}
                >
                  <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
                  <div className="absolute -right-16 -top-16 w-36 h-36 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono tracking-widest text-violet-400 uppercase font-semibold">
                          COMMANDER PASS
                        </span>
                        <h3 className="font-display font-extrabold text-2xl text-white mt-1">Titan</h3>
                        <p className="text-xs text-zinc-500 mt-0.5">Ultimate annual study station</p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2.5 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-400 uppercase tracking-widest shadow-md shadow-violet-500/10">
                        Founding Member lock
                      </span>
                    </div>

                    <div className="py-2 border-b border-white/5">
                      <div className="flex items-baseline gap-2">
                        <span className="text-zinc-600 line-through text-sm font-medium">₹799/mo</span>
                        <span className="text-4xl font-display font-extrabold text-white">₹1,500</span>
                        <span className="text-zinc-400 text-xs">/ year</span>
                      </div>
                      <span className="inline-block text-[10px] font-mono text-violet-400 font-bold bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-md mt-1 uppercase tracking-wider">
                        ₹125/mo · Save 37% Overall
                      </span>
                    </div>

                    <ul className="space-y-3.5 text-xs text-zinc-400">
                      {[
                        "Unlimited orbital syllabus models & simulations",
                        "High-yield digital notes and all premium textbooks",
                        "Unlimited 24/7 AI-powered LaTeX doubt solving",
                        "Cloud-persistent databases & sync across devices",
                        "Priority telemetry line to Flight Command",
                        "Exclusive early-access academic test series",
                      ].map((feat) => (
                        <li key={feat} className="flex items-center gap-2.5">
                          <div className="w-4 h-4 rounded-full bg-violet-400/10 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-violet-400" />
                          </div>
                          <span className="font-medium text-zinc-300">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/5">
                    <button className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-400 to-violet-500 text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 hover:scale-102 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-violet-500/25">
                      Secure Study Access
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>

              <div className="text-center mt-12 text-[10px] text-zinc-500 tracking-wider font-mono">
                * Prices locked forever for founding students. Standard secure academic encryption active.
              </div>
            </section>

            {/* 7. FOOTER */}
            <footer id="contact" className="pt-24 pb-12 px-6 md:px-12 max-w-7xl mx-auto border-t border-white/5 relative z-25">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                <div className="space-y-4 col-span-1 md:col-span-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-400 to-violet-500 flex items-center justify-center">
                      <span className="font-display font-bold text-white text-xs">PV</span>
                    </div>
                    <span className="font-display font-extrabold text-base tracking-wider text-white">
                      PHYSICS<span className="text-sky-400 font-medium">VAULT</span>
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
                    A premium modern educational studio. Dedicated to high-fidelity astrophysical computational structures and advanced JEE/NEET study notes simulations.
                  </p>
                </div>

                <div className="space-y-3">
                  <h5 className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
                    ACADEMICS
                  </h5>
                  <ul className="space-y-2 text-xs text-zinc-400">
                    <li><a href="#" className="hover:text-white transition-colors">Study Cockpit</a></li>
                    <li><a href="#notes" className="hover:text-white transition-colors">Interactive Textbooks</a></li>
                    <li><a href="#pricing" className="hover:text-white transition-colors">Commander Pass pricing</a></li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h5 className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
                    SECTOR COMS
                  </h5>
                  <ul className="space-y-2 text-xs text-zinc-400">
                    <li><span className="text-zinc-500">Academic:</span> cockpit@physicsvault.edu</li>
                    <li><span className="text-zinc-500">Base:</span> Kepler Quadrant, System 12</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between text-[10px] text-zinc-500 border-t border-white/5 pt-8 font-mono tracking-wider">
                <span>© 2026 PHYSICSVAULT STUDIO. COCKPIT SYSTEMS OPERATIONAL.</span>
                <div className="flex gap-4 mt-4 sm:mt-0">
                  <a href="#" className="hover:text-white transition-colors">STUDY PRIVACY</a>
                  <a href="#" className="hover:text-white transition-colors">TERMS OF FLIGHT</a>
                </div>
              </div>
            </footer>

          </main>

          <AuthModal
            isOpen={authOpen}
            onClose={() => setAuthOpen(false)}
            view={authView}
            onAuthSuccess={(userData) => {
              setUser(userData);
            }}
          />
        </>
      )}
    </div>
  );
}
