/**
 * PHYSICSVAULT — Futuristic Cosmic SaaS Studio
 * Designed and Developed by Leo Sandal
 * 
 * Website: PhysicsVault
 * Author Email: poosalapati.leosandal@gmail.com
 */

"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Atom, 
  Sparkles, 
  ChevronRight, 
  Check, 
  Send,
  Star,
  GraduationCap,
  Award,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  AlertTriangle,
  RefreshCw,
  X,
  Layers,
  Zap,
  TrendingUp,
  Cpu,
  Bookmark,
  Timer,
  ListTodo,
  BarChart3,
  Trophy,
  Flame
} from "lucide-react";

// Components
import Navbar from "@/components/Navbar";
import SpaceBackground from "@/components/SpaceBackground";
import AuthModal from "@/components/AuthModal";
import { auth, getUserTier, upgradeUserTier } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import AIDoubtSolver from "@/components/AIDoubtSolver";

function AnimatedStat({ num, label }) {
  const [value, setValue] = useState("");
  const elementRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let target = 0;
          let prefix = "";
          let suffix = "";
          
          if (num === "10,000+") {
            target = 10000;
            suffix = "+";
          } else if (num === "50+") {
            target = 50;
            suffix = "+";
          } else if (num === "₹99") {
            target = 99;
            prefix = "₹";
          } else if (num === "4.9★") {
            target = 4.9;
            suffix = "★";
          }
          
          let current = 0;
          const duration = 1200; // ms
          const stepTime = 16; // ~60fps
          const steps = duration / stepTime;
          const increment = target / steps;
          
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              clearInterval(timer);
              setValue(num);
            } else {
              if (target === 4.9) {
                setValue(`${prefix}${current.toFixed(1)}${suffix}`);
              } else if (target === 10000) {
                setValue(`${prefix}${Math.floor(current).toLocaleString()}${suffix}`);
              } else {
                setValue(`${prefix}${Math.floor(current)}${suffix}`);
              }
            }
          }, stepTime);
          
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    
    if (elementRef.current) {
      observer.observe(elementRef.current);
    }
    
    return () => observer.disconnect();
  }, [num]);

  return (
    <div ref={elementRef} className="space-y-1">
      <span
        className="block text-2xl md:text-3xl font-extrabold"
        style={{
          fontFamily: "var(--font-display, 'Orbitron', sans-serif)",
          color: "#E8A020",
          textShadow: "0 0 18px rgba(232,160,32,0.45)",
        }}
      >
        {value || num}
      </span>
      <span className="block text-[10px] font-mono tracking-widest uppercase" style={{ color: "#8888AA" }}>
        {label}
      </span>
    </div>
  );
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [user, setUser] = useState(null);
  
  // Auth Modal state
  const [authOpen, setAuthOpen] = useState(false);
  const [authView, setAuthView] = useState("login");

  // Mouse coordinates state for glow
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Live AI Doubt Solver is handled natively inside the AIDoubtSolver component

  // Payments and Receipt details states
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success' | 'failure' | null
  const [receiptDetails, setReceiptDetails] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Active notes category tracker
  const [activeSubj, setActiveSubj] = useState("physics");

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
    }, 85);

    return () => clearInterval(interval);
  }, []);

  // Subscribe to Firebase authenticated session changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const tier = getUserTier(currentUser.uid);
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || currentUser.email.split("@")[0],
          tier
        });
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Cursor glow coordination tracking
  useEffect(() => {
    const updateMousePos = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", updateMousePos);
    return () => window.removeEventListener("mousemove", updateMousePos);
  }, []);

  // Scroll reveal Intersection Observer wiring (PDR)
  useEffect(() => {
    if (loading) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -50px 0px" }
    );

    const scrollElements = document.querySelectorAll(".reveal-on-scroll, .strikethrough-line");
    scrollElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [loading]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Sign out error:", e);
    }
  };

  const triggerAuth = (viewType) => {
    setAuthView(viewType);
    setAuthOpen(true);
  };

  // Live AI Doubt Solver triggers mapped dynamically

  // Dynamically load Razorpay's checkout script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Launch Razorpay Checkout Portal
  const handlePayment = async (planName, priceINR) => {
    setPaymentStatus(null);

    if (!user) {
      triggerAuth("signup");
      return;
    }

    setCheckoutLoading(true);

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      alert("Failed to load Razorpay payment client. Check network connection.");
      setCheckoutLoading(false);
      return;
    }

    const amountPaise = priceINR * 100;
    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_StbrZnQ0xnLGXw";

    const options = {
      key: razorpayKey,
      amount: amountPaise,
      currency: "INR",
      name: "PhysicsVault Studio",
      description: `${planName} Subscription Upgrade`,
      image: "/next.svg",
      handler: async function (response) {
        try {
          const tier = planName.toLowerCase();
          upgradeUserTier(user.uid, tier);
          setUser(prev => prev ? { ...prev, tier } : null);

          setReceiptDetails({
            paymentId: response.razorpay_payment_id,
            plan: planName,
            amount: priceINR,
            orderId: `ord_${Math.random().toString(36).substr(2, 9)}`,
            date: new Date().toLocaleDateString(),
          });
          setPaymentStatus("success");
        } catch (err) {
          console.error("Failed to upgrade student subscription tier:", err);
          setPaymentStatus("failure");
        } finally {
          setCheckoutLoading(false);
        }
      },
      prefill: {
        email: user.email,
        contact: "9999999999",
      },
      theme: {
        color: "#f97316", // Interstellar Orange theme
      },
      modal: {
        ondismiss: function () {
          setCheckoutLoading(false);
        }
      }
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function () {
        setPaymentStatus("failure");
        setCheckoutLoading(false);
      });
      rzp.open();
    } catch (e) {
      console.error("Razorpay initiation error:", e);
      setPaymentStatus("failure");
      setCheckoutLoading(false);
    }
  };

  // Floating physics formulas positions
  const formulas = [
    { text: "E = mc²", top: "15%", left: "8%", delay: 0 },
    { text: "F = G(m₁m₂)/r²", top: "42%", left: "5%", delay: 3 },
    { text: "iℏ(∂/∂t)Ψ = ĤΨ", top: "72%", left: "10%", delay: 1.5 },
    { text: "∮ B·dl = μ₀I", top: "25%", right: "12%", delay: 4 },
    { text: "∇ × E = -∂B/∂t", top: "55%", right: "8%", delay: 2 },
    { text: "PV = nRT", top: "82%", right: "15%", delay: 5.5 },
  ];

  return (
    <div className="relative min-h-screen text-[#F0F0FF] bg-[#00000A] overflow-hidden select-none">
      
      {/* Global Cursor Glow — amber PDR */}
      <div
        className="fixed w-[520px] h-[520px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 filter blur-[140px] transition-all duration-300 z-30"
        style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px`, background: "rgba(232,160,32,0.04)" }}
      />

      {/* Background Starfield and Accretion Disk Black Hole */}
      {!loading && (
        <>
          <SpaceBackground showBlackhole={true} />
          
          <Navbar 
            onAuthClick={triggerAuth} 
            user={user} 
            onLogout={handleLogout}
          />

          {/* Floating LaTeX Math Formulas Layer — amber/gold tones */}
          <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
            {formulas.map((form, i) => (
              <div
                key={i}
                className="absolute font-mono text-xs tracking-wider select-none animate-float-math"
                style={{
                  top: form.top,
                  left: form.left,
                  right: form.right,
                  animationDelay: `${form.delay}s`,
                  color: i % 2 === 0 ? "rgba(232,160,32,0.20)" : "rgba(123,94,167,0.22)",
                }}
              >
                {form.text}
              </div>
            ))}
          </div>

          <main className="relative z-10">
            
            {/* 1. RELATIVISTIC HERO SECTION (ORANGE + BLUE ENERGY CORE VISUAL) */}
            <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-12 pt-28 pb-16 max-w-7xl mx-auto overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                {/* Hero Wording & CTA — PDR Interstellar Cosmic */}
                <div className="lg:col-span-7 space-y-7 text-left relative z-20">

                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-md"
                    style={{
                      border: "1px solid rgba(232,160,32,0.25)",
                      background: "rgba(232,160,32,0.07)",
                      boxShadow: "0 0 18px rgba(232,160,32,0.12)",
                    }}
                  >
                    <Atom className="w-3.5 h-3.5 animate-pulse" style={{ color: "#E8A020" }} />
                    <span className="text-[10px] font-mono tracking-wider font-extrabold uppercase" style={{ color: "#E8A020" }}>
                      PREMIUM JEE &amp; NEET STUDY PORTAL
                    </span>
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="font-extrabold leading-[1.05] tracking-tight"
                    style={{
                      fontFamily: "var(--font-display, 'Orbitron', sans-serif)",
                      fontSize: "clamp(2.2rem, 5vw, 4rem)",
                      color: "#F0F0FF",
                      textShadow: "0 0 40px rgba(232,160,32,0.2)",
                    }}
                  >
                    The Universe of<br />
                    JEE Physics.{" "}
                    <span
                      style={{
                        backgroundImage: "linear-gradient(135deg, #E8A020, #FF6B35, #C4A8F0)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      One Vault.
                    </span>
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="max-w-xl text-base md:text-lg font-medium leading-relaxed"
                    style={{ color: "#8888AA" }}
                  >
                    Books. Timer. Doubt Solver. Tracker. Strategies.<br />
                    <span style={{ color: "#F0F0FF", fontWeight: 700 }}>All at ₹99/month.</span>
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="flex flex-wrap items-center gap-4 pt-2"
                  >
                    {/* Primary CTA — amber gradient pill (PDR) */}
                    <a
                      href="#pricing"
                      className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider text-white cursor-pointer transition-all hover:scale-105"
                      style={{
                        background: "linear-gradient(135deg, #E8A020, #FF6B35)",
                        borderRadius: "50px",
                        padding: "16px 38px",
                        boxShadow: "0 0 22px rgba(232,160,32,0.45)",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 40px rgba(232,160,32,0.7)"; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 22px rgba(232,160,32,0.45)"; }}
                    >
                      Enter the Vault <ArrowRight className="w-4 h-4" />
                    </a>

                    {/* Secondary CTA — ghost amber border */}
                    <a
                      href="#features"
                      className="flex items-center gap-2 font-semibold text-sm uppercase tracking-wider cursor-pointer transition-all"
                      style={{
                        border: "1px solid #E8A020",
                        color: "#E8A020",
                        borderRadius: "50px",
                        padding: "15px 32px",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(232,160,32,0.10)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                    >
                      See What&apos;s Inside
                    </a>
                  </motion.div>

                  {/* Hero mini-stats */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.0, delay: 0.5 }}
                    className="grid grid-cols-3 gap-6 pt-8 max-w-lg"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    {[
                      { val: "10,000+", label: "Students" },
                      { val: "₹99",     label: "Per Month" },
                      { val: "24/7",    label: "AI Support" },
                    ].map((stat) => (
                      <div key={stat.label} className="space-y-1">
                        <span
                          className="block font-extrabold text-xl"
                          style={{
                            fontFamily: "var(--font-display, 'Orbitron', sans-serif)",
                            color: "#E8A020",
                            textShadow: "0 0 12px rgba(232,160,32,0.4)",
                          }}
                        >
                          {stat.val}
                        </span>
                        <span className="block text-[9px] font-mono tracking-widest uppercase" style={{ color: "#8888AA" }}>
                          {stat.label}
                        </span>
                      </div>
                    ))}
                  </motion.div>

                </div>

                {/* INTERSTELLAR ORANGE/BLUE HOLOGRAPHIC PLASMA SPHERE CORE (NO STATIC IMAGES) */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center relative z-20 space-y-8">
                  
                  <div className="relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center select-none pointer-events-none">
                    
                    {/* Glowing Core Plasma Sphere */}
                    <motion.div 
                      animate={{
                        scale: [0.94, 1.06, 0.94],
                        opacity: [0.8, 1, 0.8],
                      }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute w-36 h-36 rounded-full bg-gradient-to-tr from-orange-500 via-amber-400 to-sky-400 filter blur-xl opacity-85 mix-blend-screen shadow-[0_0_35px_rgba(249,115,22,0.3)]"
                    />

                    {/* Concentric Amber-Orange Grid Frame */}
                    <div className="absolute w-40 h-40 rounded-full border border-orange-500/35 animate-[spin_10s_linear_infinite]" />
                    
                    {/* Concentric Cosmic Purple Ring */}
                    <div 
                      className="absolute w-52 h-52 rounded-full border border-violet-500/25 border-dashed animate-[spin_24s_linear_infinite]"
                      style={{ transform: "rotateX(60deg) rotateY(20deg)" }}
                    />

                    {/* Concentric Plasma Blue Ring */}
                    <div 
                      className="absolute w-56 h-56 rounded-full border border-sky-500/30 animate-[spin_16s_linear_infinite_reverse]"
                      style={{ transform: "rotateX(-45deg) rotateY(45deg)" }}
                    />

                    {/* Relativistic outer lensing shell */}
                    <div 
                      className="absolute w-64 h-64 rounded-full border border-orange-400/15 border-double animate-[spin_32s_linear_infinite]"
                      style={{ transform: "rotateX(80deg) rotateY(-10deg)" }}
                    />

                    {/* Central atomic geometry core */}
                    <div className="absolute w-28 h-28 rounded-full bg-black/40 border border-white/10 backdrop-blur-md flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.2)]">
                      <Atom className="w-8 h-8 text-orange-400 animate-spin-slow" />
                    </div>

                    {/* Orbital floating energy nodes */}
                    {[...Array(4)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          rotate: 360,
                        }}
                        transition={{
                          duration: 8 + i * 2,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                        className="absolute w-full h-full"
                      >
                        <div 
                          className={`absolute w-1.5 h-1.5 rounded-full ${
                            i % 2 === 0 ? "bg-orange-400 shadow-[0_0_8px_#f97316]" : "bg-sky-400 shadow-[0_0_8px_#38bdf8]"
                          }`}
                          style={{
                            top: "10%",
                            left: `${20 + i * 15}%`
                          }}
                        />
                      </motion.div>
                    ))}
                  </div>

                  {/* Student Study Dashboard Mockup */}
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.0, delay: 0.4 }}
                    className="w-full max-w-sm glass-panel rounded-2xl p-5 border border-white/10 shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
                          STUDENT STUDY COCKPIT
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-orange-400 font-bold bg-orange-500/10 px-2 py-0.5 rounded-full">
                        ACTIVE LOCK
                      </span>
                    </div>

                    <div className="space-y-3.5 text-xs">
                      <div>
                        <div className="flex justify-between text-zinc-400 mb-1.5 font-medium">
                          <span>Syllabus Tracker</span>
                          <span className="text-white font-bold">82%</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-800/80 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-orange-500 to-sky-400 rounded-full" style={{ width: "82%" }} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="bg-white/3 border border-white/5 rounded-xl p-3 space-y-1">
                          <span className="block text-[9px] font-mono text-zinc-500 uppercase">SOLVED DOUBTS</span>
                          <span className="block font-display font-extrabold text-lg text-white">412</span>
                        </div>
                        <div className="bg-white/3 border border-white/5 rounded-xl p-3 space-y-1">
                          <span className="block text-[9px] font-mono text-zinc-500 uppercase">SOLVER TIMEOUT</span>
                          <span className="block font-display font-extrabold text-lg text-orange-400">12s avg</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none" style={{ background: "linear-gradient(to top, #00000A, transparent)" }} />
            </section>

            {/* 2. STATS BAR (PDR SPEC) */}
            <div
              className="relative py-9 border-y overflow-hidden z-25 reveal-on-scroll"
              style={{
                background: "rgba(232,160,32,0.04)",
                borderColor: "rgba(232,160,32,0.15)",
              }}
            >
              <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {[
                  { num: "10,000+", label: "Students" },
                  { num: "50+",     label: "JEE Books" },
                  { num: "₹99",     label: "Only" },
                  { num: "4.9★",    label: "Rating" },
                ].map((s) => (
                  <AnimatedStat key={s.label} num={s.num} label={s.label} />
                ))}
              </div>
              {/* Marquee below stats */}
              <div className="flex whitespace-nowrap overflow-hidden mt-7 border-t pt-5" style={{ borderColor: "rgba(232,160,32,0.10)" }}>
                <div className="flex gap-16 text-xs font-mono tracking-widest uppercase animate-marquee" style={{ color: "#8888AA" }}>
                  {[...Array(4)].map((_, idx) => (
                    <span key={idx} className="flex gap-16">
                      <span className="flex items-center gap-2"><Award className="w-4 h-4" style={{ color: "#E8A020" }} /> AIR 14 JEE ADVANCED 2025</span>
                      <span className="flex items-center gap-2"><Star className="w-4 h-4" style={{ color: "#7B5EA7", fill: "rgba(123,94,167,0.2)" }} /> 99.98 PERCENTILE JEE MAINS</span>
                      <span className="flex items-center gap-2"><GraduationCap className="w-4 h-4" style={{ color: "#39D98A" }} /> AIR 42 NEET BIOLOGY SUCCESS</span>
                      <span className="flex items-center gap-2"><Atom className="w-4 h-4 animate-spin-slow" style={{ color: "#FF6B35" }} /> 15,000+ CLASS XI/XII SUCCESS STORIES</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. FEATURES SECTION — PDR 6 CARDS */}
            <section id="features" className="py-28 px-6 md:px-12 max-w-7xl mx-auto relative overflow-hidden">
              <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
                <span className="text-[10px] font-mono tracking-[0.3em] uppercase font-bold" style={{ color: "#E8A020" }}>
                  STUDY FEATURES
                </span>
                <h2
                  className="font-extrabold text-3xl md:text-4xl"
                  style={{
                    fontFamily: "var(--font-display, 'Orbitron', sans-serif)",
                    color: "#F0F0FF",
                  }}
                >
                  Everything You Need To Score Higher
                </h2>
                <p className="text-sm font-medium" style={{ color: "#8888AA" }}>
                  One cosmic vault with every tool serious JEE/NEET aspirants need — no switching tabs, no distractions.
                </p>
              </div>

              {/* 6 PDR Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                {[
                  {
                    emoji: "📚",
                    icon: "BookOpen",
                    title: "JEE Book Library",
                    desc: "HC Verma to DC Pandey — all in one vault. Organized chapter-wise with formula sheets and derivations.",
                    href: "/dashboard?tab=library",
                    cta: "Open Library",
                  },
                  {
                    emoji: "🍅",
                    icon: "Timer",
                    title: "Pomodoro Timer",
                    desc: "Study in focused bursts, beat procrastination. Circular countdown with Focus, Break, and Long Break modes.",
                    href: "/dashboard?tab=command",
                    cta: "Start Timer",
                  },
                  {
                    emoji: "🤖",
                    icon: "Sparkles",
                    title: "AI Doubt Solver",
                    desc: "Instant answers, no waiting for a tutor. Gemini-powered AI returns LaTeX derivations in seconds.",
                    href: "/dashboard?tab=ai",
                    cta: "Solve Doubts",
                  },
                  {
                    emoji: "✅",
                    icon: "ListTodo",
                    title: "To-Do List",
                    desc: "Plan your day, check it off, feel unstoppable. Tag by subject, prioritize by urgency, earn XP.",
                    href: "/dashboard?tab=command",
                    cta: "Plan Today",
                  },
                  {
                    emoji: "📊",
                    icon: "BarChart3",
                    title: "Study Tracker",
                    desc: "Watch your progress orbit higher every week. Weekly heatmap, streaks, and subject progress bars.",
                    href: "/dashboard?tab=command",
                    cta: "View Progress",
                  },
                  {
                    emoji: "🧠",
                    icon: "Trophy",
                    title: "Study Strategies",
                    desc: "Proven JEE toppers\' methods, inside the vault. Curated masterclass videos and revision blueprints.",
                    href: "/dashboard?tab=strategies",
                    cta: "Watch Strategies",
                  },
                ].map((card, idx) => (
                  <a
                    key={idx}
                    href={card.href}
                    className="pv-card p-8 flex flex-col justify-between min-h-[280px] group reveal-on-scroll"
                    style={{ 
                      textDecoration: "none",
                      transitionDelay: `${idx * 100}ms`
                    }}
                  >
                    {/* Icon container — 64px amber glow circle */}
                    <div>
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-6 transition-all duration-300"
                        style={{
                          background: "rgba(232,160,32,0.08)",
                          border: "1px solid rgba(232,160,32,0.2)",
                          boxShadow: "0 0 20px rgba(232,160,32,0.12)",
                        }}
                      >
                        {card.emoji}
                      </div>
                      <h3
                        className="font-bold text-xl mb-3 group-hover:text-[#E8A020] transition-colors"
                        style={{
                          fontFamily: "var(--font-display, 'Orbitron', sans-serif)",
                          fontSize: "1.05rem",
                          color: "#F0F0FF",
                        }}
                      >
                        {card.title}
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: "#8888AA" }}>
                        {card.desc}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mt-6 pt-5 transition-colors group-hover:text-[#F0F0FF]" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", color: "#E8A020" }}>
                      {card.cta} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </a>
                ))}
              </div>
                
            </section>

            {/* 4. HOLOGRAPHIC SYLLABUS & TEXTBOOKS CONSOLE (REPLACING THE TEXTBOOKS PNG) */}
            <section id="notes" className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                {/* 3D Holographic Textbook console mockup */}
                <div className="lg:col-span-5 flex items-center justify-center relative z-20 w-full">
                  <div className="w-full max-w-sm glass-panel rounded-2xl border border-white/10 p-6 shadow-2xl relative overflow-hidden flex flex-col gap-4">
                    <div className="absolute -top-12 -left-12 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
                    
                    {/* Header */}
                    <div className="flex justify-between items-center pb-3 border-b border-white/5">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                        ACADEMIC SYLLABUS HOLOGRAM
                      </span>
                      <Layers className="w-4 h-4 text-orange-400 animate-pulse" />
                    </div>

                    {/* Tabs subject controllers */}
                    <div className="flex gap-2 bg-black/40 p-1.5 border border-white/5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider">
                      {["physics", "chemistry", "maths"].map((sub) => (
                        <button
                          key={sub}
                          onClick={() => setActiveSubj(sub)}
                          className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                            activeSubj === sub 
                              ? "text-white shadow-md" 
                              : "text-[#8888AA] hover:text-white"
                          }`}
                          style={activeSubj === sub ? {
                            background: "linear-gradient(135deg, #E8A020, #FF6B35)",
                            boxShadow: "0 0 12px rgba(232,160,32,0.25)",
                          } : {}}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>

                    {/* Mock syllabus chapters metrics details */}
                    <div className="space-y-3.5 py-2">
                      {activeSubj === "physics" && (
                        <>
                          <div className="flex justify-between text-xs font-semibold text-white">
                            <span>Chapter 1: Relativistic Dynamics</span>
                            <span className="text-orange-400">95% complete</span>
                          </div>
                          <div className="flex justify-between text-xs font-semibold text-white">
                            <span>Chapter 2: Electrostatics & Fields</span>
                            <span className="text-orange-400">74% complete</span>
                          </div>
                          <div className="flex justify-between text-xs font-semibold text-white">
                            <span>Chapter 3: Wave Mechanics</span>
                            <span className="text-orange-400">55% complete</span>
                          </div>
                        </>
                      )}
                      {activeSubj === "chemistry" && (
                        <>
                          <div className="flex justify-between text-xs font-semibold text-white">
                            <span>Chapter 1: Delocalized Ring Bounds</span>
                            <span className="text-sky-400">88% complete</span>
                          </div>
                          <div className="flex justify-between text-xs font-semibold text-white">
                            <span>Chapter 2: Entropy Calculations</span>
                            <span className="text-sky-400">62% complete</span>
                          </div>
                          <div className="flex justify-between text-xs font-semibold text-white">
                            <span>Chapter 3: Quantum Gas Kinetics</span>
                            <span className="text-sky-400">45% complete</span>
                          </div>
                        </>
                      )}
                      {activeSubj === "maths" && (
                        <>
                          <div className="flex justify-between text-xs font-semibold text-white">
                            <span>Chapter 1: Limits & Vector calculus</span>
                            <span className="text-violet-400">92% complete</span>
                          </div>
                          <div className="flex justify-between text-xs font-semibold text-white">
                            <span>Chapter 2: Matrix Integrations</span>
                            <span className="text-violet-400">65% complete</span>
                          </div>
                          <div className="flex justify-between text-xs font-semibold text-white">
                            <span>Chapter 3: Relativistic Algorithms</span>
                            <span className="text-violet-400">30% complete</span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="h-[1px] bg-white/5 w-full my-1" />

                    <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500">
                      <span>TELEMETRY STABLE</span>
                      <span className="text-orange-400 font-bold">READY</span>
                    </div>

                  </div>
                </div>

                {/* Animated Textbook Cards */}
                <div className="lg:col-span-7 space-y-8 relative z-20">
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono tracking-[0.25em] text-sky-400 uppercase font-bold">
                      ELITE SUBJECT MODULES
                    </span>
                    <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white">
                      Curated Digital Textbooks
                    </h2>
                    <p className="text-sm text-zinc-400 leading-relaxed max-w-lg font-medium">
                      Study our hand-crafted, high-yield digital notes. Each curriculum textbook includes floating formula visualizations and instant doubt solving portals.
                    </p>
                  </div>

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
                        glow: "border-orange-500/20 group-hover:border-orange-400/40 hover:shadow-orange-500/5",
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
                          className="text-[10px] font-bold uppercase tracking-wider text-sky-400 mt-4 block font-mono"
                        >
                          OPEN TEXTBOOK
                        </a>
                      </div>
                    ))}
                  </div>

                </div>

              </div>
            </section>

            {/* 5. LIVE AI DOUBT SOLVING CONSOLE (POWERED BY GOOGLE GEMINI AND TYPESET IN RIGOROUS LATEX KATEX) */}
            <section id="doubt-solver" className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative overflow-hidden text-center">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[140px] pointer-events-none" />

              <div className="max-w-3xl mx-auto mb-12 space-y-3 relative z-10">
                <span className="text-[10px] font-mono tracking-[0.25em] text-orange-400 uppercase font-bold">
                  LIVE AI SUPPORT
                </span>
                <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white">
                  Solve Your Doubts <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-sky-400 text-glow font-extrabold">
                    In Ten Seconds Flat
                  </span>
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                  Stuck on a tricky JEE Advanced problem? Type the formula or ask a general query. Our Gemini-powered AI tutor analyzes steps instantaneously, returning crystal-clear LaTeX derivations.
                </p>
              </div>

              <div className="relative z-20">
                <AIDoubtSolver />
              </div>
            </section>

            {/* 6. TRUSTED BY STUDENTS NATIONWIDE - REVIEWS SECTION (NO PROFILE IMAGES) */}
            <section id="reviews" className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative overflow-hidden">
              <div className="text-center max-w-2xl mx-auto mb-16 space-y-3 reveal-on-scroll">
                <span className="text-[10px] font-mono tracking-[0.25em] uppercase font-bold" style={{ color: "#FF6B35" }}>
                  STUDENT TESTIMONIALS
                </span>
                <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white">
                  Trusted By Students Nationwide
                </h2>
                <p className="text-sm text-zinc-500 font-medium">
                  Thousands of students master complex JEE / NEET problems using PhysicsVault daily.
                </p>
              </div>

              {/* Success Stories Grids - Circular User Avatars fully omitted as per final PDR specs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    name: "Rahul Verma",
                    rank: "AIR 14 · JEE Advanced 2025",
                    comment: "Improved my Physics problem solving massively. The LaTeX AI doubt solver responded in seconds whenever I got stuck.",
                    rating: 5
                  },
                  {
                    name: "Ananya Iyer",
                    rank: "99.98% Percentile · JEE Mains",
                    comment: "AI explanations are extremely useful. Textbooks are filled with floating formulas that make spatial visualization effortless.",
                    rating: 5
                  },
                  {
                    name: "Vikram Malhotra",
                    rank: "AIR 42 · NEET Biology",
                    comment: "Best JEE notes platform I've used. High-precision vectors and step-by-step limits calculus modules.",
                    rating: 5
                  }
                ].map((rev, i) => (
                  <div 
                    key={i} 
                    className="glass-panel glass-panel-hover rounded-2xl p-6 border border-white/5 flex flex-col justify-between text-left h-64 relative group overflow-hidden shadow-lg hover:shadow-orange-500/5 reveal-on-scroll"
                    style={{ transitionDelay: `${i * 100}ms` }}
                  >
                    <div className="space-y-4">
                      <div className="flex gap-1">
                        {[...Array(rev.rating)].map((_, sIdx) => (
                          <Star key={sIdx} className="w-3.5 h-3.5" style={{ color: "#E8A020", fill: "#E8A020" }} />
                        ))}
                      </div>
                      
                      <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                        "{rev.comment}"
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/5 mt-4">
                      <span className="block text-xs font-bold text-white">{rev.name}</span>
                      <span className="block text-[9px] font-mono tracking-widest uppercase font-semibold mt-0.5" style={{ color: "#FF6B35" }}>
                        {rev.rank}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

            </section>

            {/* 7. SECURE RAZORPAY BILLING GRID - THE PRICING SECTION (INTERSTELLAR GLOW CONTRAST) */}
            <section id="pricing" className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative overflow-hidden">
              
              {/* Amber/violet glow spotlights (PDR) */}
              <div className="absolute top-10 left-10 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none animate-pulse-slow" style={{ background: "rgba(232,160,32,0.08)" }} />
              <div className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none animate-pulse-slow" style={{ background: "rgba(123,94,167,0.08)" }} />

              <div className="text-center max-w-2xl mx-auto mb-20 space-y-4 relative z-10">
                <span className="text-[10px] font-mono tracking-[0.3em] uppercase font-bold" style={{ color: "#E8A020" }}>
                  SECURE VAULT ACCESS
                </span>
                <h2
                  className="font-extrabold text-3xl md:text-4xl"
                  style={{ fontFamily: "var(--font-display, 'Orbitron', sans-serif)", color: "#F0F0FF" }}
                >
                  Join the PhysicsVault Fleet
                </h2>
                <p className="text-sm font-medium" style={{ color: "#8888AA" }}>
                  One vault, every tool. Cancel anytime. Start your 7-day free trial.
                </p>
              </div>

              {/* Checkout Loader */}
              {checkoutLoading && (
                <div className="flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 rounded-2xl max-w-sm mx-auto mb-8 animate-pulse text-xs text-orange-400 gap-2">
                  <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                  Initiating secure Razorpay checkout...
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto relative z-20">
                
                {/* CARD 1: ASPIRANT (ORANGE ACTIVE GLOW CARD) */}
                <div 
                  className="animated-border rounded-3xl p-8 flex flex-col justify-between min-h-[480px] cursor-pointer hover:shadow-[0_0_40px_rgba(232,160,32,0.15)] border-[#E8A020]/20 transition-all duration-300 reveal-on-scroll"
                  onClick={() => handlePayment("Aspirant", 99)}
                  style={{ transitionDelay: "0ms" }}
                >
                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono tracking-widest uppercase font-semibold" style={{ color: "#FF6B35" }}>
                          STUDENT PASS
                        </span>
                        <h3 className="font-display font-extrabold text-3xl text-white mt-1">Aspirant</h3>
                        <p className="text-xs text-zinc-500 mt-1">Flexible monthly study cockpit</p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2.5 py-1 rounded-full bg-orange-400/10 border border-orange-400/20 text-orange-400 uppercase tracking-widest animate-pulse">
                        🔥 Limited Time Offer
                      </span>
                    </div>
 
                    <div className="py-4 border-b border-white/5">
                      <div className="flex items-baseline gap-2">
                        <div className="relative inline-block mr-1">
                          <span className="text-zinc-600 text-sm font-medium pr-1 font-mono">₹999/mo</span>
                          <span className="absolute left-0 top-1/2 h-[2px] bg-red-500/80 -translate-y-1/2 strikethrough-line" />
                        </div>
                        <span
                          className="text-5xl font-extrabold"
                          style={{ fontFamily: "var(--font-display, 'Orbitron', sans-serif)", color: "#E8A020", textShadow: "0 0 20px rgba(232,160,32,0.4)" }}
                        >₹99</span>
                        <span className="text-xs" style={{ color: "#8888AA" }}>/ month</span>
                      </div>
                      <span className="block text-[10px] font-mono mt-2 uppercase tracking-wider" style={{ color: "#8888AA" }}>
                        Cancel anytime · Includes 7-Day Free Trial
                      </span>
                    </div>
 
                    <ul className="space-y-4 text-xs" style={{ color: "#8888AA" }}>
                      {[
                        "Interactive syllabus models (Physics, Chemistry, Maths)",
                        "High-yield digital notes and textbooks",
                        "24/7 AI-powered doubt-solving (50 queries/mo)",
                        "Persistent browser project state storage",
                        "Standard student dashboard support",
                      ].map((feat) => (
                        <li key={feat} className="flex items-center gap-3">
                          <div
                            className="w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: "rgba(232,160,32,0.10)", border: "1px solid rgba(232,160,32,0.25)" }}
                          >
                            <Check className="w-3 h-3" style={{ color: "#E8A020" }} />
                          </div>
                          <span className="font-medium">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
 
                  <div className="mt-8 pt-6 border-t border-white/5">
                    <button
                      className="w-full py-4 rounded-full font-bold text-sm uppercase tracking-wider transition-all hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
                      style={{
                        background: "linear-gradient(135deg, #E8A020, #FF6B35)",
                        color: "white",
                        boxShadow: "0 0 22px rgba(232,160,32,0.4)",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 40px rgba(232,160,32,0.65)"; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 22px rgba(232,160,32,0.4)"; }}
                    >
                      Start for ₹99 <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
 
                {/* CARD 2: TITAN (VIOLET/PURPLE ACTIVE GLOW CARD) */}
                <div 
                  className="animated-border rounded-3xl p-8 flex flex-col justify-between min-h-[480px] relative overflow-hidden cursor-pointer hover:shadow-[0_0_40px_rgba(123,94,167,0.25)] border-[#7B5EA7]/20 transition-all duration-300 reveal-on-scroll"
                  onClick={() => handlePayment("Titan", 1000)}
                  style={{ transitionDelay: "150ms" }}
                >
                  <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
                  <div className="absolute -right-16 -top-16 w-36 h-36 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />
 
                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono tracking-widest uppercase font-semibold" style={{ color: "#7B5EA7" }}>
                          COMMANDER PASS
                        </span>
                        <h3 className="font-display font-extrabold text-3xl text-white mt-1">Titan</h3>
                        <p className="text-xs text-zinc-500 mt-1">Ultimate annual study station</p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2.5 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-[#7B5EA7] uppercase tracking-widest shadow-md shadow-violet-500/10">
                        Founding Member lock
                      </span>
                    </div>
 
                    <div className="py-4 border-b border-white/5">
                      <div className="flex items-baseline gap-2">
                        <div className="relative inline-block mr-1">
                          <span className="text-zinc-600 text-sm font-medium pr-1 font-mono">₹9,999/yr</span>
                          <span className="absolute left-0 top-1/2 h-[2px] bg-red-500/80 -translate-y-1/2 strikethrough-line" />
                        </div>
                        <span
                          className="text-5xl font-extrabold"
                          style={{ fontFamily: "var(--font-display, 'Orbitron', sans-serif)", color: "#F0F0FF" }}
                        >₹1,000</span>
                        <span className="text-xs" style={{ color: "#8888AA" }}>/ year</span>
                      </div>
                      <span
                        className="inline-block text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md mt-2 uppercase tracking-wider"
                        style={{ color: "#E8A020", background: "rgba(232,160,32,0.08)", border: "1px solid rgba(232,160,32,0.2)" }}
                      >
                        ₹83/mo · Save 16% over monthly plan
                      </span>
                    </div>
 
                    <ul className="space-y-4 text-xs text-zinc-400">
                      {[
                        "Unlimited orbital syllabus models & simulations",
                        "High-yield digital notes and all premium textbooks",
                        "Unlimited 24/7 AI-powered LaTeX doubt solving",
                        "Cloud-persistent databases & sync across devices",
                        "Priority telemetry line to Flight Command",
                        "Exclusive early-access academic test series",
                      ].map((feat) => (
                        <li key={feat} className="flex items-center gap-3">
                          <div className="w-4.5 h-4.5 rounded-full bg-violet-500/10 flex items-center justify-center shrink-0 border border-violet-500/20">
                            <Check className="w-3 h-3 text-violet-400" />
                          </div>
                          <span className="font-medium text-zinc-300">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
 
                  <div className="mt-8 pt-6 border-t border-white/5">
                    <button
                      className="w-full py-4 rounded-full font-bold text-sm uppercase tracking-wider transition-all hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
                      style={{
                        background: "linear-gradient(135deg, #7B5EA7, #E8A020)",
                        color: "white",
                        boxShadow: "0 0 20px rgba(123,94,167,0.35)",
                      }}
                    >
                      Go Titan <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
 
              </div>

              <div className="text-center mt-12 text-[10px] text-zinc-500 tracking-wider font-mono">
                * Access level sync complete. Instant activation active.
              </div>
            </section>

            {/* 8. FOOTER */}
            <footer id="contact" className="pt-24 pb-12 px-6 md:px-12 max-w-7xl mx-auto border-t border-white/5 relative z-25">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                <div className="space-y-4 col-span-1 md:col-span-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, #E8A020, #FF6B35)", boxShadow: "0 0 12px rgba(232,160,32,0.3)" }}
                    >
                      <span className="font-bold text-white text-xs">⚛</span>
                    </div>
                    <span className="font-extrabold text-base tracking-wider" style={{ fontFamily: "var(--font-display, 'Orbitron', sans-serif)" }}>
                      <span style={{ color: "#F0F0FF" }}>PHYSICS</span><span style={{ color: "#E8A020" }}>VAULT</span>
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 max-w-sm leading-relaxed font-sans">
                    A premium modern educational studio. Dedicated to high-precision computational structures and advanced JEE/NEET study note simulations. Powered entirely by pure motion, light, and geometry.
                  </p>
                </div>

                <div className="space-y-3">
                  <h5 className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
                    ACADEMICS
                  </h5>
                <ul className="space-y-2 text-xs font-sans" style={{ color: "#8888AA" }}>
                    <li><a href="#" className="transition-colors" style={{ color: "#8888AA" }} onMouseEnter={e => e.currentTarget.style.color="#E8A020"} onMouseLeave={e => e.currentTarget.style.color="#8888AA"}>Study Cockpit</a></li>
                    <li><a href="#notes" className="transition-colors" style={{ color: "#8888AA" }} onMouseEnter={e => e.currentTarget.style.color="#E8A020"} onMouseLeave={e => e.currentTarget.style.color="#8888AA"}>Interactive Syllabus</a></li>
                    <li><a href="#pricing" className="transition-colors" style={{ color: "#8888AA" }} onMouseEnter={e => e.currentTarget.style.color="#E8A020"} onMouseLeave={e => e.currentTarget.style.color="#8888AA"}>Pricing Plans</a></li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h5 className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
                    CONTACT
                  </h5>
                  <ul className="space-y-2 text-xs text-zinc-400 font-sans">
                    <li><span className="text-zinc-500 font-mono">Email:</span> <a href="mailto:physicsvault6@gmail.com" className="hover:text-white transition-colors">physicsvault6@gmail.com</a></li>
                    <li><span className="text-zinc-500 font-mono">Support:</span> <a href="mailto:physicsvault6@gmail.com" className="hover:text-white transition-colors">physicsvault6@gmail.com</a></li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between text-[10px] text-zinc-500 border-t border-white/5 pt-8 font-mono tracking-wider">
                <span>© 2026 PHYSICSVAULT STUDIO. SYSTEMS COMPLIED STABLE.</span>
                <div className="flex gap-4 mt-4 sm:mt-0">
                  <a href="#" className="hover:text-white transition-colors">STUDY PRIVACY</a>
                  <a href="#" className="hover:text-white transition-colors">TERMS OF FLIGHT</a>
                </div>
              </div>
            </footer>

          </main>

          {/* Checkout Status Overlay Modal */}
          <AnimatePresence>
            {paymentStatus && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
              >
                <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setPaymentStatus(null)} />
                
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="relative w-full max-w-md bg-[#090915]/95 border border-white/10 rounded-2xl p-8 text-center shadow-2xl z-10"
                >
                  <button 
                    onClick={() => setPaymentStatus(null)}
                    className="absolute top-5 right-5 text-zinc-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {paymentStatus === "success" ? (
                    <div className="space-y-6 pt-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                        <ShieldCheck className="w-8 h-8 text-emerald-400" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-display font-extrabold text-2xl text-white">UPGRADE SUCCESSFUL</h3>
                        <p className="text-xs text-zinc-400">Your student study cockpit has been elevated to the {receiptDetails?.plan} Plan clearance.</p>
                      </div>

                      <div className="bg-white/3 border border-white/5 rounded-xl p-4 text-left font-mono text-[10px] text-zinc-400 space-y-2.5">
                        <div className="flex justify-between">
                          <span>RECEIPT PLAN:</span>
                          <span className="text-white font-bold">{receiptDetails?.plan?.toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>TRANSACTION ID:</span>
                          <span className="text-sky-400">{receiptDetails?.paymentId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>ORDER ID:</span>
                          <span className="text-zinc-500">{receiptDetails?.orderId}</span>
                        </div>
                        <div className="flex justify-between border-t border-white/5 pt-2 text-xs">
                          <span>AMOUNT PAID:</span>
                          <span className="text-white font-bold">₹{receiptDetails?.amount} INR</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setPaymentStatus(null)}
                        className="w-full bg-gradient-to-r from-orange-400 to-sky-400 text-white font-semibold text-xs uppercase tracking-wider py-3.5 rounded-xl cursor-pointer hover:shadow-orange-500/20"
                      >
                        Enter Upgraded Portal
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6 pt-4">
                      <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto shadow-lg shadow-red-500/10">
                        <AlertTriangle className="w-8 h-8 text-red-400 animate-bounce" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-display font-extrabold text-2xl text-white">TRANSACTION ERROR</h3>
                        <p className="text-xs text-zinc-400">The billing cockpit encountered an external payment error. No amount has been debited.</p>
                      </div>
                      <button
                        onClick={() => setPaymentStatus(null)}
                        className="w-full bg-white/5 border border-white/10 text-white font-semibold text-xs uppercase tracking-wider py-3.5 rounded-xl cursor-pointer hover:bg-white/10"
                      >
                        Dismiss Console
                      </button>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

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
