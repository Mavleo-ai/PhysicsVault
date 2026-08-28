"use client";

import { useEffect, useState, useRef } from "react";
import { Clock } from "lucide-react";

// Exam Date Constants
const JEE_2027_DATE = new Date("2027-04-13T00:00:00+05:30");
const JEE_2028_DATE = new Date("2028-04-10T00:00:00+05:30");

function calculateDaysRemaining(targetDate) {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function calculateProgressPercent(targetDate) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const jan1 = new Date(`${currentYear}-01-01T00:00:00+05:30`);
  
  const totalPrepTime = targetDate.getTime() - jan1.getTime();
  const timeElapsed = now.getTime() - jan1.getTime();
  
  if (totalPrepTime <= 0) return 100;
  const percent = (timeElapsed / totalPrepTime) * 100;
  return Math.min(100, Math.max(0, Math.round(percent)));
}

export default function CountdownPage() {
  const [days2027, setDays2027] = useState(0);
  const [days2028, setDays2028] = useState(0);
  const [progress2027, setProgress2027] = useState(0);
  const [progress2028, setProgress2028] = useState(0);

  // Animated states for counting up on load
  const [displayDays2027, setDisplayDays2027] = useState(0);
  const [displayDays2028, setDisplayDays2028] = useState(0);
  const [displayProgress2027, setDisplayProgress2027] = useState(0);
  const [displayProgress2028, setDisplayProgress2028] = useState(0);

  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef(null);

  // Initialize values
  useEffect(() => {
    setMounted(true);
    
    const d2027 = calculateDaysRemaining(JEE_2027_DATE);
    const d2028 = calculateDaysRemaining(JEE_2028_DATE);
    const p2027 = calculateProgressPercent(JEE_2027_DATE);
    const p2028 = calculateProgressPercent(JEE_2028_DATE);

    setDays2027(d2027);
    setDays2028(d2028);
    setProgress2027(p2027);
    setProgress2028(p2028);

    // Auto-update checker at midnight
    const interval = setInterval(() => {
      const updated2027 = calculateDaysRemaining(JEE_2027_DATE);
      const updated2028 = calculateDaysRemaining(JEE_2028_DATE);
      const updatedP2027 = calculateProgressPercent(JEE_2027_DATE);
      const updatedP2028 = calculateProgressPercent(JEE_2028_DATE);
      
      setDays2027(updated2027);
      setDays2028(updated2028);
      setProgress2027(updatedP2027);
      setProgress2028(updatedP2028);
    }, 60000); // check every minute

    return () => clearInterval(interval);
  }, []);

  // Launch Sequence Animation: count up numbers and progress bars
  useEffect(() => {
    if (!mounted || days2027 === 0) return;

    let start = null;
    const duration = 800; // 800ms count-up launch sequence

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const progressRatio = Math.min(progress / duration, 1);

      // Easing function (easeOutQuad)
      const ease = progressRatio * (2 - progressRatio);

      setDisplayDays2027(Math.floor(ease * days2027));
      setDisplayDays2028(Math.floor(ease * days2028));
      setDisplayProgress2027(Math.floor(ease * progress2027));
      setDisplayProgress2028(Math.floor(ease * progress2028));

      if (progress < duration) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayDays2027(days2027);
        setDisplayDays2028(days2028);
        setDisplayProgress2027(progress2027);
        setDisplayProgress2028(progress2028);
      }
    };

    window.requestAnimationFrame(step);
  }, [mounted, days2027, days2028, progress2027, progress2028]);

  // Subtle floating star particles in background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animationId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Init slow-moving drifting particles
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
        speedY: -(Math.random() * 0.15 + 0.05),
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#ffffff";
      
      particles.forEach((p) => {
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        
        p.y += p.speedY;
        if (p.y < 0) {
          p.y = canvas.height;
          p.x = Math.random() * canvas.width;
        }
      });

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, [mounted]);

  const isSub100 = days2027 < 100;

  return (
    <main className="relative min-h-screen flex flex-col justify-between items-center px-4 py-8 z-10 select-none">
      {/* Background Canvas Particles */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-40" />

      {/* Styled Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[140px] pointer-events-none z-0" style={{ background: isSub100 ? "rgba(255,59,48,0.06)" : "rgba(255,107,0,0.05)" }} />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[140px] pointer-events-none z-0" style={{ background: "rgba(59,130,246,0.04)" }} />

      {/* ── TOP HEADER ── */}
      <div className="text-center space-y-1 animate-fade-in z-10 pt-4">
        <h1 
          className="text-2xl font-bold uppercase tracking-widest text-[#F0F0F0] flex items-center justify-center gap-2"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <Clock className="w-5 h-5 text-[#FF6B00] animate-[pulse_3s_infinite]" />
          JEE CLOCK
        </h1>
        <p className="text-xs text-[#6B7280] italic font-medium">Every day counts.</p>
      </div>

      {/* ── CENTRAL MAIN COCKPIT ── */}
      <div className="w-full max-w-[480px] space-y-5 z-10 my-auto py-8">
        
        {/* JEE 2027 COUNTDOWN CARD */}
        <div 
          className="rounded-3xl p-7 transition-all duration-500 border-l-[4px] relative overflow-hidden backdrop-blur-md"
          style={{
            background: "#12121A",
            borderLeftColor: isSub100 ? "#FF3B30" : "#FF6B00",
            boxShadow: isSub100 
              ? "0 0 45px rgba(255,59,48,0.12), inset 0 0 20px rgba(255,255,255,0.01)" 
              : "0 0 40px rgba(255,107,0,0.12), inset 0 0 20px rgba(255,255,255,0.01)",
          }}
        >
          {/* Card Header Info */}
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] tracking-[0.2em] font-mono text-[#6B7280] font-bold">
              JEE ADVANCED 2027
            </span>
            <span className="text-[11px] font-medium text-[#6B7280]" style={{ fontFamily: "var(--font-body)" }}>
              ~ April 13, 2027
            </span>
          </div>

          {/* Large Countdown Value */}
          <div className="my-3 flex items-baseline justify-between">
            <h2 
              className={`text-7xl md:text-8xl font-black transition-all ${
                isSub100 ? "text-[#FF3B30] animate-[pulse_2s_infinite]" : "text-[#FF6B00]"
              }`}
              style={{ fontFamily: "var(--font-countdown)" }}
            >
              {displayDays2027}
            </h2>
            <div className="text-right">
              <span className="block text-[11px] tracking-[0.25em] font-semibold text-[#6B7280] uppercase">
                {isSub100 ? "⚡ FINAL STRETCH" : "DAYS LEFT"}
              </span>
            </div>
          </div>

          {/* Time Elapsed Progress Indicator */}
          <div className="space-y-1.5 mt-5">
            <div className="h-1 w-full bg-[#1F1F2E] rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${displayProgress2027}%`,
                  background: isSub100 
                    ? "linear-gradient(90deg, rgba(255,59,48,0.1) 0%, #FF3B30 100%)" 
                    : "linear-gradient(90deg, rgba(255,107,0,0.1) 0%, #FF6B00 100%)"
                }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-[#6B7280]">
              <span>{displayProgress2027}% of prep window used</span>
              {isSub100 && <span className="text-[#FF3B30] font-bold animate-[pulse_1s_infinite]">ALERT: SUB-100 DAYS</span>}
            </div>
          </div>
        </div>

        {/* JEE 2028 COUNTDOWN CARD */}
        <div 
          className="rounded-3xl p-7 border-l-[4px] relative overflow-hidden backdrop-blur-md"
          style={{
            background: "#12121A",
            borderLeftColor: "#3B82F6",
            boxShadow: "0 0 35px rgba(59,130,246,0.08), inset 0 0 20px rgba(255,255,255,0.01)",
          }}
        >
          {/* Card Header Info */}
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] tracking-[0.2em] font-mono text-[#6B7280] font-bold">
              JEE ADVANCED 2028
            </span>
            <span className="text-[11px] font-medium text-[#6B7280]" style={{ fontFamily: "var(--font-body)" }}>
              ~ April 10, 2028
            </span>
          </div>

          {/* Large Countdown Value */}
          <div className="my-3 flex items-baseline justify-between">
            <h2 
              className="text-6xl md:text-7xl font-black text-[#3B82F6]"
              style={{ fontFamily: "var(--font-countdown)" }}
            >
              {displayDays2028}
            </h2>
            <div className="text-right">
              <span className="block text-[11px] tracking-[0.25em] font-semibold text-[#6B7280] uppercase">
                DAYS LEFT
              </span>
            </div>
          </div>

          {/* Time Elapsed Progress Indicator */}
          <div className="space-y-1.5 mt-5">
            <div className="h-1 w-full bg-[#1F1F2E] rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${displayProgress2028}%`,
                  background: "linear-gradient(90deg, rgba(59,130,246,0.1) 0%, #3B82F6 100%)"
                }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-[#6B7280]">
              <span>{displayProgress2028}% of prep window used</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── BOTTOM FOOTER ── */}
      <footer className="text-center py-4 z-10">
        <span 
          className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6B7280]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Updated Live · JEE 2027 & 2028
        </span>
      </footer>

      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

    </main>
  );
}
