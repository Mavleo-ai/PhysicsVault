"use client";

import { useEffect, useState } from "react";
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
  Bookmark
} from "lucide-react";

// Components
import Navbar from "@/components/Navbar";
import SpaceBackground from "@/components/SpaceBackground";
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

  // Interactive AI Doubt Solver state
  const [doubtQuery, setDoubtQuery] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", text: "Hello! I am your PhysicsVault AI Doubt Solver. Ask me any conceptual question or paste a formula from Physics, Chemistry, or Maths!" }
  ]);
  const [isTyping, setIsTyping] = useState(false);

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

  // Fetch persistent user session on load
  const fetchSession = async () => {
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      setUser(data.user);
    }
  };

  useEffect(() => {
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

  // Mock AI doubt solver logic
  const handleSolveDoubt = async (e) => {
    e.preventDefault();
    if (!doubtQuery.trim()) return;

    const userQ = doubtQuery;
    setChatMessages(prev => [...prev, { role: "user", text: userQ }]);
    setDoubtQuery("");
    setIsTyping(true);

    await new Promise(resolve => setTimeout(resolve, 1400));

    let reply = "Here is the step-by-step mathematical deduction:\n\nUsing the Schrödinger equation:\n\n$$-\\frac{\\hbar^2}{2m} \\nabla^2 \\Psi + V\\Psi = E\\Psi$$\n\nIntegrating over bounded energy levels confirms orbital stability.";
    
    const queryLower = userQ.toLowerCase();
    if (queryLower.includes("gravity") || queryLower.includes("kepler") || queryLower.includes("orbit")) {
      reply = "Kepler's Third Law states that the square of the orbital period $T^2$ is proportional to the cube of the semi-major axis $a^3$:\n\n$$T^2 = \\left( \\frac{4\\pi^2}{G(M + m)} \\right) a^3$$\n\nFor satellites orbiting massive centers, we approximate gravity balances as:\n\n$$\\frac{v^2}{r} = \\frac{GM}{r^2} \\implies v = \\sqrt{\\frac{GM}{r}}$$";
    } else if (queryLower.includes("benzene") || queryLower.includes("chemistry") || queryLower.includes("bond")) {
      reply = "Delocalized organic molecular orbitals satisfy Huckel criteria. Let's calculate the resonance energy bounds:\n\n$$\\text{Resonance Energy} = E_{\\text{localized}} - E_{\\text{delocalized}} \\approx 152\\text{ kJ/mol}$$";
    } else if (queryLower.includes("limit") || queryLower.includes("calculus") || queryLower.includes("math")) {
      reply = "Using L'Hôpital's Rule for indeterminate forms $0/0$:\n\n$$\\lim_{x \\to c} \\frac{f(x)}{g(x)} = \\lim_{x \\to c} \\frac{f'(x)}{g'(x)}$$\n\nDifferentiating the numerators and denominators allows direct evaluation.";
    }

    setChatMessages(prev => [...prev, { role: "assistant", text: reply }]);
    setIsTyping(false);
  };

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
          const { data, error } = await supabase.auth.upgradeUserTier(planName.toLowerCase());
          if (error) throw new Error(error);

          await fetchSession();

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
    <div className="relative min-h-screen text-[#f8fafc] bg-[#030303] overflow-hidden select-none">
      
      {/* Global Cursor Glow */}
      <div 
        className="fixed w-[500px] h-[500px] rounded-full bg-orange-500/3 pointer-events-none -translate-x-1/2 -translate-y-1/2 filter blur-[130px] transition-all duration-300 z-30"
        style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
      />

      {/* Background Starfield and Accretion Disk Black Hole */}
      {!loading && (
        <>
          <SpaceBackground />
          
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
            
            {/* 1. RELATIVISTIC HERO SECTION (ORANGE + BLUE ENERGY CORE VISUAL) */}
            <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-12 pt-28 pb-16 max-w-7xl mx-auto overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                {/* Hero Wording & CTA */}
                <div className="lg:col-span-7 space-y-6 text-left relative z-20">
                  
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-500/20 bg-orange-500/5 backdrop-blur-md shadow-[0_0_15px_rgba(249,115,22,0.1)]"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
                    <span className="text-[10px] font-mono tracking-wider font-extrabold uppercase text-orange-400">
                      PREMIUM JEE & NEET STUDY PORTAL
                    </span>
                  </motion.div>

                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight leading-[1.05]"
                  >
                    Master Physics <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-amber-400 to-sky-400 text-glow">
                      Like Never Before
                    </span>
                  </motion.h1>

                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="max-w-xl text-sm md:text-base text-zinc-400 font-medium leading-relaxed"
                  >
                    Elite notes, textbooks, and AI-powered learning for serious students.
                  </motion.p>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="flex flex-wrap items-center gap-4 pt-3"
                  >
                    <a
                      href="#pricing"
                      className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-xs uppercase tracking-wider cursor-pointer shadow-lg hover:shadow-orange-500/25 transition-all hover:scale-102 flex items-center gap-2"
                    >
                      Start Free Trial <ChevronRight className="w-4 h-4" />
                    </a>
                    
                    <a
                      href="#notes"
                      className="px-6 py-3.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs uppercase tracking-wider cursor-pointer transition-all"
                    >
                      Explore Notes
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

              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#030303] to-transparent pointer-events-none" />
            </section>

            {/* 2. INFINITE ACHIEVEMENTS RUNNING MARQUEE */}
            <div className="relative py-8 bg-black/60 border-y border-white/5 overflow-hidden z-25">
              <div className="flex whitespace-nowrap overflow-hidden">
                <div className="flex gap-16 text-xs font-mono tracking-widest text-zinc-400 uppercase animate-marquee">
                  {[...Array(4)].map((_, idx) => (
                    <span key={idx} className="flex gap-16">
                      <span className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-orange-400" /> AIR 14 JEE ADVANCED 2025
                      </span>
                      <span className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-violet-400 fill-violet-400/20" /> 99.98 PERCENTILE JEE MAINS
                      </span>
                      <span className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-sky-400" /> AIR 42 NEET BIOLOGY SUCCESS
                      </span>
                      <span className="flex items-center gap-2">
                        <Atom className="w-4 h-4 text-orange-400 animate-spin-slow" /> 15,000+ CLASS XI/XII CLASSROOM SUCCESS STORIES
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. EVERYTHING YOU NEED TO SCORE HIGHER - FEATURES SECTION */}
            <section id="features" className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative overflow-hidden">
              <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                <span className="text-[10px] font-mono tracking-[0.25em] text-sky-400 uppercase font-bold">
                  STUDY FEATURES
                </span>
                <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white">
                  Everything You Need To Score Higher
                </h2>
                <p className="text-sm text-zinc-500 font-medium">
                  We engineered our learning suite from the ground up to render massive cosmological behaviors with high frame stability.
                </p>
              </div>

              {/* Bento Grid Features Layout with Animated Hover Borders */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Bento Card 1: Elite Physics Notes */}
                <div className="animated-border rounded-2xl p-8 flex flex-col justify-between h-80 relative group overflow-hidden cursor-pointer">
                  <div className="absolute -right-8 -top-8 w-24 h-24 bg-orange-600/10 rounded-full blur-2xl group-hover:bg-orange-600/20 transition-colors" />
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.15)]">
                    <GraduationCap className="w-5 h-5 text-orange-400" />
                  </div>
                  <div className="space-y-2 mt-8">
                    <h4 className="font-display font-bold text-lg text-white">
                      Elite Physics Notes
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                      Chapter-wise study notes, precise formula sheets, and core exam-focused derivations tailored for top scores.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-orange-400 font-semibold group-hover:text-white transition-colors">
                    <span>Access Notes</span>
                    <ArrowRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>

                {/* Bento Card 2: Interactive Textbooks */}
                <div className="animated-border rounded-2xl p-8 flex flex-col justify-between h-80 relative group overflow-hidden cursor-pointer">
                  <div className="absolute -right-8 -top-8 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-colors" />
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.15)]">
                    <Atom className="w-5 h-5 text-sky-400" />
                  </div>
                  <div className="space-y-2 mt-8">
                    <h4 className="font-display font-bold text-lg text-white">
                      Interactive Textbooks
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                      Digital interactive access to full Physics, Chemistry, and Maths curricula loaded with vector coordinate tools.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-sky-400 font-semibold group-hover:text-white transition-colors">
                    <span>Open Textbooks</span>
                    <ArrowRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>

                {/* Bento Card 3: 24/7 AI Support */}
                <div className="animated-border rounded-2xl p-8 flex flex-col justify-between h-80 relative group overflow-hidden cursor-pointer">
                  <div className="absolute -right-8 -top-8 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/20 transition-colors" />
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.15)]">
                    <Sparkles className="w-5 h-5 text-violet-400 animate-pulse" />
                  </div>
                  <div className="space-y-2 mt-8">
                    <h4 className="font-display font-bold text-lg text-white">
                      24/7 AI Support
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                      Solve any sub-topic doubt, get instant step-by-step formula explanations and structural conceptual breakdowns.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-violet-400 font-semibold group-hover:text-white transition-colors">
                    <span>Solve Doubts</span>
                    <ArrowRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>

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
                              ? "bg-gradient-to-r from-orange-500 to-sky-400 text-white shadow-md shadow-orange-500/10" 
                              : "text-zinc-500 hover:text-white"
                          }`}
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

            {/* 5. LIVE AI DOUBT SOLVING CONSOLE */}
            <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-[140px] pointer-events-none" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                <div className="lg:col-span-6 space-y-6 text-left relative z-20">
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
                    Stuck on a tricky JEE Advanced problem? Type the formula or ask a general query. Our AI tutor analyzes steps instantaneously, returning crystal-clear LaTeX derivations.
                  </p>
                  
                  <div className="space-y-3.5 pt-4">
                    {[
                      "Fully supports Physics, Chemistry, and Maths equations.",
                      "Translates chemical bonds, mechanics, and vector lattices.",
                      "LaTeX formatted mathematical notation rendering.",
                    ].map((point, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/20">
                          <Check className="w-3.5 h-3.5 text-orange-400" />
                        </div>
                        <span className="text-xs text-zinc-300 font-medium">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-6 relative z-20">
                  <div className="glass-panel rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col h-[380px]">
                    
                    <div className="bg-white/3 border-b border-white/5 px-5 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-pulse" />
                        <span className="text-[10px] font-mono tracking-widest text-zinc-300 uppercase">
                          DOUBT-SOLVER TELEMETRY CONSOLE
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase">
                        AI CONSOLE STABLE
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-4 text-left">
                      {chatMessages.map((msg, i) => (
                        <div 
                          key={i} 
                          className={`flex items-start gap-2.5 ${
                            msg.role === "user" ? "justify-end" : "justify-start"
                          }`}
                        >
                          {msg.role === "assistant" && (
                            <div className="w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/20 text-[9px] font-bold text-orange-400 font-mono">
                              AI
                            </div>
                          )}
                          <div 
                            className={`rounded-xl p-3.5 max-w-[80%] text-xs font-medium leading-relaxed whitespace-pre-line ${
                              msg.role === "user"
                                ? "bg-orange-600/20 border border-orange-500/30 text-white animate-in fade-in"
                                : "bg-white/3 border border-white/5 text-zinc-300"
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      ))}
                      {isTyping && (
                        <div className="flex items-start gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/20 text-[9px] font-bold text-orange-400 font-mono">
                            AI
                          </div>
                          <div className="rounded-xl p-3.5 bg-white/3 border border-white/5 text-zinc-500 text-xs font-mono animate-pulse">
                            Computing LaTeX matrix...
                          </div>
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleSolveDoubt} className="border-t border-white/5 bg-black/40 p-3 flex gap-2">
                      <input
                        type="text"
                        value={doubtQuery}
                        onChange={(e) => setDoubtQuery(e.target.value)}
                        placeholder="Solve Kepler's third gravity law, or limits calculus..."
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-orange-400 focus:ring-0 font-medium"
                      />
                      <button
                        type="submit"
                        className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-400 to-sky-400 flex items-center justify-center text-white cursor-pointer hover:shadow-orange-500/20 hover:scale-102 transition-all shrink-0"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>

                  </div>
                </div>

              </div>
            </section>

            {/* 6. TRUSTED BY STUDENTS NATIONWIDE - REVIEWS SECTION (NO PROFILE IMAGES) */}
            <section id="reviews" className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative overflow-hidden">
              <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                <span className="text-[10px] font-mono tracking-[0.25em] text-orange-400 uppercase font-bold">
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
                  <div key={i} className="glass-panel glass-panel-hover rounded-2xl p-6 border border-white/5 flex flex-col justify-between text-left h-64 relative group overflow-hidden shadow-lg hover:shadow-orange-500/5">
                    <div className="space-y-4">
                      <div className="flex gap-1">
                        {[...Array(rev.rating)].map((_, sIdx) => (
                          <Star key={sIdx} className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                        ))}
                      </div>
                      
                      <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                        "{rev.comment}"
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/5 mt-4">
                      <span className="block text-xs font-bold text-white">{rev.name}</span>
                      <span className="block text-[9px] font-mono tracking-widest text-orange-400 uppercase font-semibold mt-0.5">
                        {rev.rank}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

            </section>

            {/* 7. SECURE RAZORPAY BILLING GRID - THE PRICING SECTION (INTERSTELLAR GLOW CONTRAST) */}
            <section id="pricing" className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative overflow-hidden">
              
              {/* Dynamic Orange and Blue abstract glow spotlights in the background */}
              <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse-slow" />
              <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-sky-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse-slow" />

              <div className="text-center max-w-2xl mx-auto mb-20 space-y-3 relative z-10">
                <span className="text-[10px] font-mono tracking-[0.25em] text-orange-400 uppercase font-bold">
                  SECURE SUBSCRIPTION PAYMENT
                </span>
                <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white">
                  Join the PhysicsVault Fleet
                </h2>
                <p className="text-sm text-zinc-500 font-medium">
                  Unlock access to unlimited study notes, animated textbooks, and AI doubt solvers via Razorpay.
                </p>
              </div>

              {/* Checkout Loader */}
              {checkoutLoading && (
                <div className="flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 rounded-2xl max-w-sm mx-auto mb-8 animate-pulse text-xs text-orange-400 gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Initiating secure Razorpay checkout...
                </div>
              )}

              {/* Pricing Cards - Highly contrasted Orange vs Blue glows */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto relative z-20">
                
                {/* CARD 1: ASPIRANT (ORANGE ACTIVE GLOW CARD) */}
                <div 
                  className="animated-border rounded-3xl p-8 flex flex-col justify-between min-h-[480px] cursor-pointer hover:shadow-[0_0_40px_rgba(249,115,22,0.15)] border-orange-500/20 transition-all duration-300"
                  onClick={() => handlePayment("Aspirant", 200)}
                >
                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono tracking-widest text-orange-400 uppercase font-semibold">
                          STUDENT PASS
                        </span>
                        <h3 className="font-display font-extrabold text-3xl text-white mt-1">Aspirant</h3>
                        <p className="text-xs text-zinc-500 mt-1">Flexible monthly study cockpit</p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2.5 py-1 rounded-full bg-orange-400/10 border border-orange-400/20 text-orange-400 uppercase tracking-widest">
                        Launch Price
                      </span>
                    </div>

                    <div className="py-4 border-b border-white/5">
                      <div className="flex items-baseline gap-2">
                        <span className="text-zinc-600 line-through text-sm font-medium">₹299/mo</span>
                        <span className="text-5xl font-display font-extrabold text-white">₹200</span>
                        <span className="text-zinc-400 text-xs">/ month</span>
                      </div>
                      <span className="block text-[10px] font-mono text-zinc-500 mt-2 uppercase tracking-wider">
                        Cancel anytime · Includes 7-Day Free Trial
                      </span>
                    </div>

                    <ul className="space-y-4 text-xs text-zinc-400">
                      {[
                        "Interactive syllabus models (Physics, Chemistry, Maths)",
                        "High-yield digital notes and textbooks",
                        "24/7 AI-powered doubt-solving (50 queries/mo)",
                        "Persistent browser project state storage",
                        "Standard student dashboard support",
                      ].map((feat) => (
                        <li key={feat} className="flex items-center gap-3">
                          <div className="w-4.5 h-4.5 rounded-full bg-orange-400/10 flex items-center justify-center shrink-0 border border-orange-400/20">
                            <Check className="w-3 h-3 text-orange-400" />
                          </div>
                          <span className="font-medium">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/5">
                    <button className="w-full py-4 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 hover:text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-orange-500/10">
                      Start Now
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* CARD 2: TITAN (BLUE/PURPLE GLOW CARD) */}
                <div 
                  className="animated-border rounded-3xl p-8 flex flex-col justify-between min-h-[480px] relative overflow-hidden cursor-pointer hover:shadow-[0_0_40px_rgba(56,189,248,0.15)] border-sky-500/20 transition-all duration-300"
                  onClick={() => handlePayment("Titan", 1500)}
                >
                  <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
                  <div className="absolute -right-16 -top-16 w-36 h-36 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono tracking-widest text-sky-400 uppercase font-semibold">
                          COMMANDER PASS
                        </span>
                        <h3 className="font-display font-extrabold text-3xl text-white mt-1">Titan</h3>
                        <p className="text-xs text-zinc-500 mt-1">Ultimate annual study station</p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2.5 py-1 rounded-full bg-sky-400/15 border border-sky-400/30 text-sky-400 uppercase tracking-widest shadow-md shadow-sky-500/10">
                        Founding Member lock
                      </span>
                    </div>

                    <div className="py-4 border-b border-white/5">
                      <div className="flex items-baseline gap-2">
                        <span className="text-zinc-600 line-through text-sm font-medium">₹799/mo</span>
                        <span className="text-5xl font-display font-extrabold text-white">₹1,500</span>
                        <span className="text-zinc-400 text-xs">/ year</span>
                      </div>
                      <span className="inline-block text-[10px] font-mono text-sky-400 font-bold bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 rounded-md mt-2 uppercase tracking-wider">
                        ₹125/mo · Save 37% Overall
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
                          <div className="w-4.5 h-4.5 rounded-full bg-sky-400/10 flex items-center justify-center shrink-0 border border-sky-400/20">
                            <Check className="w-3 h-3 text-sky-400" />
                          </div>
                          <span className="font-medium text-zinc-300">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/5">
                    <button className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-400 to-sky-400 text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 hover:scale-102 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-orange-500/25">
                      Go Titan
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>

              <div className="text-center mt-12 text-[10px] text-zinc-500 tracking-wider font-mono">
                * Prices locked forever for founding students. Standard secure Razorpay encryption active.
              </div>
            </section>

            {/* 8. FOOTER */}
            <footer id="contact" className="pt-24 pb-12 px-6 md:px-12 max-w-7xl mx-auto border-t border-white/5 relative z-25">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                <div className="space-y-4 col-span-1 md:col-span-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-orange-500 to-sky-400 flex items-center justify-center">
                      <span className="font-display font-bold text-white text-xs">PV</span>
                    </div>
                    <span className="font-display font-extrabold text-base tracking-wider text-white">
                      PHYSICS<span className="text-orange-400 font-medium">VAULT</span>
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
                  <ul className="space-y-2 text-xs text-zinc-400 font-sans">
                    <li><a href="#" className="hover:text-white transition-colors">Study Cockpit</a></li>
                    <li><a href="#notes" className="hover:text-white transition-colors">Interactive Syllabus</a></li>
                    <li><a href="#pricing" className="hover:text-white transition-colors">Pricing pass plans</a></li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h5 className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
                    SECTOR COMS
                  </h5>
                  <ul className="space-y-2 text-xs text-zinc-400 font-sans">
                    <li><span className="text-zinc-500 font-mono">Academic:</span> cockpit@physicsvault.edu</li>
                    <li><span className="text-zinc-500 font-mono">Base:</span> Kepler Quadrant, System 12</li>
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
