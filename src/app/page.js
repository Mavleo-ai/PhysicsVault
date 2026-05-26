"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Atom, 
  Orbit, 
  Sparkles, 
  ChevronRight, 
  Check, 
  HelpCircle, 
  Compass, 
  TrendingUp, 
  Zap, 
  ShieldAlert,
  ArrowRight,
  Monitor,
  Flame,
  Star
} from "lucide-react";

// Components
import Navbar from "@/components/Navbar";
import SpaceBackground from "@/components/SpaceBackground";
import SpaceStation from "@/components/SpaceStation";
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

  // Mouse coordinate state for cursor glow parallax
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Custom visual feedback for pricing choices
  const [hoveredCard, setHoveredCard] = useState(null);

  // Initializing preloader count-up
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 500); // Slight delay for smooth fadeout
          return 100;
        }
        const step = Math.floor(Math.random() * 15) + 5;
        return Math.min(100, prev + step);
      });
    }, 120);

    return () => clearInterval(interval);
  }, []);

  // Fetch Supabase / Local storage persistent user session on load
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

  return (
    <div className="relative min-h-screen text-[#f8fafc] bg-[#030303] overflow-hidden select-none">
      
      {/* Dynamic Cursor Ambient Glow */}
      <div 
        className="fixed w-[450px] h-[450px] rounded-full bg-violet-600/10 pointer-events-none -translate-x-1/2 -translate-y-1/2 filter blur-[120px] transition-all duration-300 z-30"
        style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
      />

      {/* Majestic Warp Engine Loading Preloader */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            key="preloader"
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Spinning gravitational orbit loader */}
            <div className="relative flex items-center justify-center w-36 h-36">
              <div className="absolute inset-0 border border-t-sky-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
              <div className="absolute inset-3 border border-t-transparent border-r-violet-500 border-b-transparent border-l-transparent rounded-full animate-[spin_1.5s_linear_infinite_reverse]" />
              <div className="absolute inset-6 border border-t-transparent border-r-transparent border-b-sky-400 border-l-transparent rounded-full animate-[spin_0.8s_linear_infinite]" />
              <Atom className="w-8 h-8 text-sky-400 animate-pulse" />
            </div>

            <motion.div 
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h2 className="font-display font-extrabold text-xs tracking-[0.25em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-violet-500">
                INITIALIZING WARP ENGINE
              </h2>
              <div className="w-48 h-[2px] bg-zinc-800 rounded-full mt-3 overflow-hidden mx-auto">
                <div 
                  className="h-full bg-gradient-to-r from-sky-400 to-violet-500 rounded-full transition-all duration-150"
                  style={{ width: `${loadingPercent}%` }}
                />
              </div>
              <span className="block text-[10px] font-mono text-zinc-500 mt-2 tracking-widest">
                {loadingPercent}% STABILIZED
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Interactive Canvas and Space Backdrops */}
      {!loading && (
        <>
          <SpaceBackground />
          <FloatingAstronaut />
          
          <Navbar 
            onAuthClick={triggerAuth} 
            user={user} 
            onLogout={handleLogout}
          />

          {/* Core Page Content */}
          <main className="relative z-10">
            
            {/* 1. CINEMATIC HERO SECTION */}
            <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-12 pt-28 pb-16 max-w-7xl mx-auto overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                {/* Hero Information */}
                <div className="lg:col-span-7 space-y-6 text-left relative z-20">
                  
                  {/* Floating Cosmic Tag */}
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-sky-500/20 bg-sky-500/5 backdrop-blur-md shadow-[0_0_15px_rgba(14,165,233,0.1)]"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                    <span className="text-[10px] font-mono tracking-wider font-extrabold uppercase text-sky-400">
                      SECURE QUANTUM STATIONS ACTIVE
                    </span>
                  </motion.div>

                  {/* Main Title Heading */}
                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight leading-[1.05]"
                  >
                    Embark on the Next <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-violet-400 to-violet-600 text-glow">
                      Cosmic Dimension
                    </span>
                  </motion.h1>

                  {/* Description Subtext */}
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="max-w-xl text-sm md:text-base text-zinc-400 font-medium leading-relaxed"
                  >
                    PhysicsVault simulates high-gravity orbits, relativistic dynamics, and quantum field behaviors under a breathtaking dark interface. Study, compute, and experiment with cinema-grade tools.
                  </motion.p>

                  {/* Call to Actions */}
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
                      Explore Cockpit Plans <ChevronRight className="w-4 h-4" />
                    </a>
                    
                    <a
                      href="#features"
                      className="px-6 py-3.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs uppercase tracking-wider cursor-pointer transition-all"
                    >
                      View Live Simulator
                    </a>
                  </motion.div>

                  {/* Founding Stat Counters */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.0, delay: 0.5 }}
                    className="grid grid-cols-3 gap-6 pt-10 border-t border-white/5 max-w-lg"
                  >
                    {[
                      { val: "2.4B+", label: "Particles Simulated" },
                      { val: "99.8%", label: "Warp Precision" },
                      { val: "48K+", label: "Navigators Enlisted" },
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

                {/* Rotating Floating Space Station */}
                <div className="lg:col-span-5 flex items-center justify-center relative z-20">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.0, ease: "easeOut" }}
                  >
                    <SpaceStation />
                  </motion.div>
                </div>
              </div>

              {/* Sub-hero Section Fade */}
              <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#030303] to-transparent pointer-events-none" />
            </section>

            {/* 2. PREMIUM FEATURES SECTION */}
            <section id="features" className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative overflow-hidden">
              
              {/* Feature Section Headers */}
              <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                <span className="text-[10px] font-mono tracking-[0.25em] text-violet-400 uppercase font-bold">
                  ORBIT ENGINE CAPABILITIES
                </span>
                <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white">
                  Crafted for Relativistic Speeds
                </h2>
                <p className="text-sm text-zinc-500 font-medium">
                  We engineered our physics suite from the ground up to render massive cosmological behaviors with high frame stability.
                </p>
              </div>

              {/* Bento Grid Features Layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Bento Card 1 */}
                <div className="glass-panel glass-panel-hover rounded-2xl p-8 flex flex-col justify-between h-80 relative group overflow-hidden">
                  <div className="absolute -right-8 -top-8 w-24 h-24 bg-violet-600/10 rounded-full blur-2xl group-hover:bg-violet-600/20 transition-colors" />
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                    <Orbit className="w-5 h-5 text-violet-400 animate-spin-slow" />
                  </div>
                  <div className="space-y-2 mt-8">
                    <h4 className="font-display font-bold text-lg text-white">
                      Relativistic Orbit Simulator
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                      Simulate massive stellar bodies warping space-time using full Einsteinian equations and coordinate projections.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-violet-400 font-semibold group-hover:text-white transition-colors">
                    <span>Deploy Simulator</span>
                    <ArrowRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>

                {/* Bento Card 2 */}
                <div className="glass-panel glass-panel-hover rounded-2xl p-8 flex flex-col justify-between h-80 relative group overflow-hidden">
                  <div className="absolute -right-8 -top-8 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-colors" />
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-sky-400" />
                  </div>
                  <div className="space-y-2 mt-8">
                    <h4 className="font-display font-bold text-lg text-white">
                      Instant Quantum Compute
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                      Run complex field wave functions and sub-atomic particle collision paths in microsecond pipelines with client-side GPU compilation.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-sky-400 font-semibold group-hover:text-white transition-colors">
                    <span>Explore Equations</span>
                    <ArrowRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>

                {/* Bento Card 3 */}
                <div className="glass-panel glass-panel-hover rounded-2xl p-8 flex flex-col justify-between h-80 relative group overflow-hidden">
                  <div className="absolute -right-8 -top-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors" />
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Compass className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="space-y-2 mt-8">
                    <h4 className="font-display font-bold text-lg text-white">
                      Cosmology Navigation
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                      Plot warp trajectories between celestial coordinate matrices with automatic fuel computations and asteroid warning parameters.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-emerald-400 font-semibold group-hover:text-white transition-colors">
                    <span>Launch Navigation</span>
                    <ArrowRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>

              </div>

            </section>

            {/* 3. PREMIUM PRICING SECTION */}
            <section id="pricing" className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative overflow-hidden">
              
              {/* Soft cosmic glow spotlights behind pricing card blocks */}
              <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

              {/* Pricing Section Headers */}
              <div className="text-center max-w-2xl mx-auto mb-20 space-y-3 relative z-10">
                <span className="text-[10px] font-mono tracking-[0.25em] text-sky-400 uppercase font-bold">
                  PORTAL BOARDING CLEARANCE
                </span>
                <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white">
                  Join the PhysicsVault Fleet
                </h2>
                <p className="text-sm text-zinc-500 font-medium">
                  Unlock access to unlimited simulations and quantum plotting nodes. Founding locked pricing active.
                </p>
              </div>

              {/* Pricing Cards Container */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto relative z-20">
                
                {/* CARD 1: ASPIRANT (MONTHLY PLAN) */}
                <div 
                  className="animated-border rounded-2xl p-8 flex flex-col justify-between min-h-[460px] cursor-pointer"
                  onMouseEnter={() => setHoveredCard("aspirant")}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => triggerAuth("signup")}
                >
                  <div className="space-y-6">
                    {/* Badge & Title */}
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono tracking-widest text-sky-400 uppercase font-semibold">
                          PILOT PASS
                        </span>
                        <h3 className="font-display font-extrabold text-2xl text-white mt-1">Aspirant</h3>
                        <p className="text-xs text-zinc-500 mt-0.5">Flexible monthly simulation clearance</p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2.5 py-1 rounded-full bg-sky-400/10 border border-sky-400/20 text-sky-400 uppercase tracking-widest">
                        <Flame className="w-2.5 h-2.5" /> Launch Price
                      </span>
                    </div>

                    {/* Price Tag */}
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

                    {/* Features List */}
                    <ul className="space-y-3.5 text-xs text-zinc-400">
                      {[
                        "Interactive orbit models (up to 5 bodies)",
                        "Quantum collision field simulations",
                        "Real-time calculations (1.2 Gigaflops max)",
                        "Persistent browser project state storage",
                        "Standard cockpit support channel",
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

                  {/* Action CTA Button */}
                  <div className="mt-8 pt-6 border-t border-white/5">
                    <button className="w-full py-3.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 hover:text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-sky-500/10">
                      Start 7-Day Free Trial
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* CARD 2: TITAN (ANNUAL PLAN) */}
                <div 
                  className="animated-border rounded-2xl p-8 flex flex-col justify-between min-h-[460px] relative overflow-hidden cursor-pointer"
                  onMouseEnter={() => setHoveredCard("titan")}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => triggerAuth("signup")}
                >
                  {/* Spotlight edge reflect glow for most popular premium card */}
                  <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
                  <div className="absolute -right-16 -top-16 w-36 h-36 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="space-y-6">
                    {/* Badge & Title */}
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono tracking-widest text-violet-400 uppercase font-semibold">
                          COMMANDER PASS
                        </span>
                        <h3 className="font-display font-extrabold text-2xl text-white mt-1">Titan</h3>
                        <p className="text-xs text-zinc-500 mt-0.5">Ultimate annual simulation station</p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2.5 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-400 uppercase tracking-widest shadow-md shadow-violet-500/10">
                        <Star className="w-2.5 h-2.5 fill-violet-400" /> Founding price lock
                      </span>
                    </div>

                    {/* Price Tag */}
                    <div className="py-2 border-b border-white/5">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-display font-extrabold text-white">₹1,500</span>
                        <span className="text-zinc-400 text-xs">/ year</span>
                      </div>
                      {/* Cost Saving Callout */}
                      <span className="inline-block text-[10px] font-mono text-violet-400 font-bold bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-md mt-1 uppercase tracking-wider">
                        ₹125/mo · Save 37% Overall
                      </span>
                    </div>

                    {/* Features List */}
                    <ul className="space-y-3.5 text-xs text-zinc-400">
                      {[
                        "Unlimited orbital bodies in simulator",
                        "High-gravity blackhole event horizon matrices",
                        "Unlimited compute nodes (48 Gigaflops capacity)",
                        "Cloud-persistent databases & sync across devices",
                        "Direct priority line to Flight Command",
                        "Exclusive early-access orbital modules",
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

                  {/* Action CTA Button */}
                  <div className="mt-8 pt-6 border-t border-white/5">
                    <button className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-400 to-violet-500 text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 hover:scale-102 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-violet-500/25">
                      Secure Access cockpit
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>

              {/* Extra Pricing Details Callout */}
              <div className="text-center mt-12 text-[10px] text-zinc-500 tracking-wider font-mono">
                * Prices locked forever for early fleet commanders. Standard secure transaction protocols apply.
              </div>

            </section>

            {/* 4. FOOTER & ABOUT */}
            <footer id="about" className="pt-24 pb-12 px-6 md:px-12 max-w-7xl mx-auto border-t border-white/5 relative z-20">
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
                    Designed at the edge of the galaxy. Dedicated to high-fidelity astrophysical computational structures and educational physics simulations.
                  </p>
                </div>

                <div className="space-y-3">
                  <h5 className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
                    NAVIGATION
                  </h5>
                  <ul className="space-y-2 text-xs text-zinc-400">
                    <li><a href="#" className="hover:text-white transition-colors">Home Cockpit</a></li>
                    <li><a href="#features" className="hover:text-white transition-colors">Features Orbit</a></li>
                    <li><a href="#pricing" className="hover:text-white transition-colors">Commander pricing</a></li>
                  </ul>
                </div>

                <div className="space-y-3" id="contact">
                  <h5 className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
                    SECTOR COMS
                  </h5>
                  <ul className="space-y-2 text-xs text-zinc-400">
                    <li><span className="text-zinc-500">Telemetry:</span> support@physicsvault.space</li>
                    <li><span className="text-zinc-500">HQ:</span> Quadrant 12, Kepler System</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between text-[10px] text-zinc-500 border-t border-white/5 pt-8 font-mono tracking-wider">
                <span>© 2026 PHYSICSVAULT STUDIO. ALL SYSTEMS OPERATIONAL.</span>
                <div className="flex gap-4 mt-4 sm:mt-0">
                  <a href="#" className="hover:text-white transition-colors">TELEMETRY PRIVACY</a>
                  <a href="#" className="hover:text-white transition-colors">FLIGHT PROTOCOLS</a>
                </div>
              </div>
            </footer>

          </main>

          {/* Secure Cosmic Auth Cockpit Modal */}
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
