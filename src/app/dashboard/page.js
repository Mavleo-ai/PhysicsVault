"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { 
  auth, 
  getUserTier, 
  upgradeUserTier 
} from "@/lib/firebase";
import { 
  Sparkles, 
  GraduationCap, 
  Atom, 
  Send, 
  LogOut, 
  ShieldCheck, 
  BookOpen, 
  CheckCircle,
  HelpCircle
} from "lucide-react";
import SpaceBackground from "@/components/SpaceBackground";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSubj, setActiveSubj] = useState("physics");

  // AI Doubt Solver state
  const [doubtQuery, setDoubtQuery] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", text: "Welcome to your Premium Doubt Solver. Ask me any conceptual question or paste a formula!" }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        // Protected route redirection
        router.push("/login");
      } else {
        // Load persistent student tier matching their unique Firebase ID
        const tier = getUserTier(currentUser.uid);
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || currentUser.email.split("@")[0],
          tier
        });
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  const handleSolveDoubt = async (e) => {
    e.preventDefault();
    if (!doubtQuery.trim()) return;

    const userQ = doubtQuery;
    setChatMessages(prev => [...prev, { role: "user", text: userQ }]);
    setDoubtQuery("");
    setIsTyping(true);

    await new Promise(resolve => setTimeout(resolve, 1200));

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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-xs text-orange-400 font-mono gap-3">
        <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        Syncing Student Credentials...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden select-none pb-12">
      
      {/* Dynamic blackhole starfield background */}
      <SpaceBackground />
      <div className="absolute inset-0 bg-black/60 z-1 pointer-events-none" />

      {/* Main Header / Topbar */}
      <header className="relative z-10 py-5 px-6 md:px-12 border-b border-white/5 bg-black/40 backdrop-blur-md flex justify-between items-center max-w-7xl mx-auto rounded-b-2xl">
        <a href="/" className="flex items-center gap-2 group">
          <div className="relative w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-500 to-violet-600 flex items-center justify-center shadow-lg">
            <span className="font-display font-bold text-white text-xs">PV</span>
          </div>
          <span className="font-display font-extrabold text-sm tracking-wider">
            PHYSICS<span className="text-sky-400 font-medium">VAULT</span>
          </span>
        </a>

        <div className="flex items-center gap-4">
          <span className="text-xs text-zinc-400 flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            {user.email}
            <span className={`ml-2 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              user.tier === "titan" 
                ? "bg-violet-500/20 text-violet-400 border border-violet-500/30 shadow-[0_0_10px_rgba(139,92,246,0.15)]" 
                : user.tier === "aspirant"
                ? "bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow-[0_0_10px_rgba(56,189,248,0.15)]"
                : "bg-zinc-500/20 text-zinc-400 border border-zinc-500/30"
            }`}>
              {user.tier}
            </span>
          </span>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white border border-white/10 px-4 py-2 rounded-lg bg-white/5 hover:bg-red-500/10 hover:border-red-500/20 transition-all cursor-pointer font-medium uppercase tracking-wider"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Hand: Student Progress and Syllabus Checklist */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Welcome Card */}
          <div className="glass-panel border border-white/10 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
            <h2 className="font-display font-extrabold text-2xl text-white flex items-center gap-2">
              Welcome, {user.displayName} <Sparkles className="w-5 h-5 text-orange-400 animate-pulse" />
            </h2>
            <p className="text-xs text-zinc-400 mt-2 max-w-lg leading-relaxed">
              Your academic cockpit is synchronized. Track your syllabus metrics below, or query our premium artificial doubt-solving module.
            </p>
          </div>

          {/* Academic Syllabus Panel */}
          <div className="glass-panel border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-orange-400" />
                STUDENT SYLLABUS CHECKLIST
              </span>
              <span className="text-[10px] font-mono text-sky-400 font-bold bg-sky-500/10 px-2 py-0.5 rounded-full">
                Syllabus: 82% complete
              </span>
            </div>

            {/* Subject Tabs */}
            <div className="flex gap-2 bg-black/40 p-1 border border-white/5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider">
              {["physics", "chemistry", "maths"].map((sub) => (
                <button
                  key={sub}
                  onClick={() => setActiveSubj(sub)}
                  className={`flex-1 py-2 rounded-lg text-center transition-all cursor-pointer ${
                    activeSubj === sub 
                      ? "bg-gradient-to-r from-orange-500 to-sky-400 text-white shadow-md shadow-orange-500/10" 
                      : "text-zinc-500 hover:text-white"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>

            {/* Syllabus Chapters Checklist */}
            <div className="space-y-3 pt-2">
              {activeSubj === "physics" && (
                <>
                  {[
                    { title: "Relativistic Dynamics & Singularity Bounds", comp: "95%" },
                    { title: "Electrostatics, Charge Distributions & Lattices", comp: "74%" },
                    { title: "Quantum Mechanics & Wave Function Collapses", comp: "55%" },
                  ].map((ch, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-white/3 border border-white/5 rounded-xl">
                      <span className="text-xs text-zinc-300 flex items-center gap-2 font-medium">
                        <CheckCircle className="w-4 h-4 text-orange-400" />
                        {ch.title}
                      </span>
                      <span className="text-xs text-zinc-500 font-mono font-bold">{ch.comp}</span>
                    </div>
                  ))}
                </>
              )}
              {activeSubj === "chemistry" && (
                <>
                  {[
                    { title: "Delocalized Aromatic Resonances", comp: "88%" },
                    { title: "Entropy Formulas & Thermodynamics Calculations", comp: "62%" },
                    { title: "Quantum Kinetics & Particle Collision Mechanics", comp: "45%" },
                  ].map((ch, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-white/3 border border-white/5 rounded-xl">
                      <span className="text-xs text-zinc-300 flex items-center gap-2 font-medium">
                        <CheckCircle className="w-4 h-4 text-sky-400" />
                        {ch.title}
                      </span>
                      <span className="text-xs text-zinc-500 font-mono font-bold">{ch.comp}</span>
                    </div>
                  ))}
                </>
              )}
              {activeSubj === "maths" && (
                <>
                  {[
                    { title: "Limits calculus & Infinite Integrations", comp: "92%" },
                    { title: "Vector Spaces & Matrix Dimension Transformations", comp: "65%" },
                    { title: "Complex Number Rotations & Waves Formulations", comp: "30%" },
                  ].map((ch, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-white/3 border border-white/5 rounded-xl">
                      <span className="text-xs text-zinc-300 flex items-center gap-2 font-medium">
                        <CheckCircle className="w-4 h-4 text-violet-400" />
                        {ch.title}
                      </span>
                      <span className="text-xs text-zinc-500 font-mono font-bold">{ch.comp}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Quick Notes resources for active student clearance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-panel border border-white/10 rounded-2xl p-5 flex flex-col justify-between min-h-[140px] group hover:scale-[1.02] transition-all">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">PREMIUM STUDY MODULE</span>
              <h4 className="font-display font-extrabold text-sm text-white mt-2">Chapter-Wise Formula Sheets</h4>
              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">Exact summary formulas designed for rapid JEE Mains revisions.</p>
              <a href="#" className="text-[10px] font-bold text-sky-400 uppercase font-mono tracking-wider mt-3 block">ACCESS SHEETS →</a>
            </div>
            <div className="glass-panel border border-white/10 rounded-2xl p-5 flex flex-col justify-between min-h-[140px] group hover:scale-[1.02] transition-all">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">COMMAND TEST PORTAL</span>
              <h4 className="font-display font-extrabold text-sm text-white mt-2">Chapter Telemetry Tests</h4>
              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">Practice chapter-specific tests to check your metric rating.</p>
              <a href="#" className="text-[10px] font-bold text-orange-400 uppercase font-mono tracking-wider mt-3 block">START TEST →</a>
            </div>
          </div>

        </div>

        {/* Right Hand: 24/7 AI Doubt Solver */}
        <div className="lg:col-span-5 relative">
          <div className="glass-panel rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col h-[520px]">
            
            {/* Header */}
            <div className="bg-white/3 border-b border-white/5 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-orange-400" />
                <span className="text-[10px] font-mono tracking-widest text-zinc-300 uppercase">
                  DOUBT-SOLVER TELEMETRY CONSOLE
                </span>
              </div>
              <span className="text-[9px] font-mono text-zinc-500 uppercase">
                STABLE
              </span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-left">
              {chatMessages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex items-start gap-2.5 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-6 h-6 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0 text-[9px] font-bold text-orange-400 font-mono">
                      AI
                    </div>
                  )}
                  <div 
                    className={`rounded-xl p-3.5 max-w-[85%] text-xs font-medium leading-relaxed whitespace-pre-line ${
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
                  <div className="w-6 h-6 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0 text-[9px] font-bold text-orange-400 font-mono">
                    AI
                  </div>
                  <div className="rounded-xl p-3.5 bg-white/3 border border-white/5 text-zinc-500 text-xs font-mono animate-pulse">
                    Computing LaTeX matrix...
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSolveDoubt} className="border-t border-white/5 bg-black/45 p-3 flex gap-2">
              <input
                type="text"
                value={doubtQuery}
                onChange={(e) => setDoubtQuery(e.target.value)}
                placeholder="Ask about Kepler's gravity laws, benzene bonds, limits calculus..."
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-orange-400 focus:ring-0 font-medium"
              />
              <button
                type="submit"
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-400 to-sky-400 flex items-center justify-center text-white cursor-pointer hover:shadow-orange-500/25 hover:scale-102 transition-all shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        </div>

      </main>

    </div>
  );
}
