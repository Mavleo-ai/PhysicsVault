"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles, Send, Trash2, HelpCircle, Volume2, Bookmark, Check } from "lucide-react";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css"; // Essential KaTeX styles
import { onAuthStateChanged } from "firebase/auth";
import { auth, getUserTier } from "@/lib/firebase";

export default function AIDoubtSolver() {
  const [user, setUser] = useState(null);
  const [checkingTier, setCheckingTier] = useState(true);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [savedDoubts, setSavedDoubts] = useState([]);
  const [voiceActive, setVoiceActive] = useState(false);
  const scrollRef = useRef(null);

  // Suggested questions relative to JEE/NEET exams
  const suggestions = [
    "Deduce Kepler's orbital velocity formula from Newton's laws.",
    "Calculate the resonance energy bounds for a Benzene ring.",
    "Solve the limit of (sin x)/x as x approaches 0 using L'Hopital.",
    "Derive the Schrödinger stability model equation."
  ];

  // Load chat history & saved doubts on component mount and listen to auth changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedChat = localStorage.getItem("pv_ai_chat");
      const savedList = localStorage.getItem("pv_saved_doubts");
      if (savedChat) setChatHistory(JSON.parse(savedChat));
      if (savedList) setSavedDoubts(JSON.parse(savedList));
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const tier = getUserTier(currentUser.uid);
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          tier,
        });
      } else {
        setUser(null);
      }
      setCheckingTier(false);
    });

    return () => unsubscribe();
  }, []);

  // Sync scroll on chat updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, loading]);

  // Save changes locally
  const saveChatHistory = (history) => {
    setChatHistory(history);
    localStorage.setItem("pv_ai_chat", JSON.stringify(history));
  };

  const handleClearHistory = () => {
    saveChatHistory([]);
  };

  const handleSaveDoubt = (index) => {
    const doubtToSave = chatHistory[index];
    if (!doubtToSave) return;
    
    let updatedSaved = [...savedDoubts];
    const exists = updatedSaved.some(item => item.timestamp === doubtToSave.timestamp);
    
    if (exists) {
      updatedSaved = updatedSaved.filter(item => item.timestamp !== doubtToSave.timestamp);
    } else {
      updatedSaved.push(doubtToSave);
    }
    
    setSavedDoubts(updatedSaved);
    localStorage.setItem("pv_saved_doubts", JSON.stringify(updatedSaved));
  };

  // Robust mathematical parser to render LaTeX inside paragraph block flows
  const parseLaTeXText = (text) => {
    if (!text) return null;
    
    // Split by block equations first
    const parts = text.split(/(\$\$.*?\$\$)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith("$$") && part.endsWith("$$")) {
        const formula = part.slice(2, -2).trim();
        return (
          <div key={index} className="my-3 overflow-x-auto py-1.5 scrollbar-thin">
            <BlockMath math={formula} />
          </div>
        );
      }
      
      // Inline equation parsing
      const inlineParts = part.split(/(\$.*?\$)/g);
      return (
        <span key={index} className="whitespace-pre-wrap leading-relaxed font-sans text-zinc-300">
          {inlineParts.map((subPart, subIndex) => {
            if (subPart.startsWith("$") && subPart.endsWith("$")) {
              const formula = subPart.slice(1, -1).trim();
              return (
                <span key={subIndex} className="inline-block px-0.5">
                  <InlineMath math={formula} />
                </span>
              );
            }
            return subPart;
          })}
        </span>
      );
    });
  };

  const askAI = async (queryText) => {
    const activeQuery = queryText || message;
    if (!activeQuery.trim()) return;

    setLoading(true);
    if (!queryText) setMessage("");

    // Append user message
    const timestamp = Date.now();
    const currentHistory = [...chatHistory, { role: "user", text: activeQuery, timestamp }];
    saveChatHistory(currentHistory);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: activeQuery,
        }),
      });

      const data = await res.json();
      let replyText = "";
      if (data.success) {
        replyText = data.reply;
      } else {
        const errStr = (data.error || "").toLowerCase();
        if (errStr.includes("503") || errStr.includes("unavailable") || errStr.includes("quota") || errStr.includes("limit") || errStr.includes("busy")) {
          replyText = "AI Tutor is busy, try again in a moment";
        } else {
          replyText = "AI Error: " + data.error;
        }
      }

      saveChatHistory([...currentHistory, { role: "assistant", text: replyText, timestamp: Date.now() + 1 }]);
    } catch (e) {
      console.error(e);
      saveChatHistory([...currentHistory, { role: "assistant", text: "Telemetry line disconnected. Try again.", timestamp: Date.now() + 1 }]);
    } finally {
      setLoading(false);
    }
  };

  // Simulates futuristic voice doubt capture
  const triggerVoiceInput = () => {
    if (voiceActive) {
      setVoiceActive(false);
      return;
    }
    setVoiceActive(true);
    setMessage("Capturing voice telemetry...");
    setTimeout(() => {
      setMessage("Deduce Schrödinger's wave equation stability models.");
      setVoiceActive(false);
    }, 2200);
  };

  // ── GATING & SUBSCRIPTION PAYWALL CHECKS ──
  if (checkingTier) {
    return (
      <div className="w-full max-w-4xl mx-auto glass-panel border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 rounded-full border border-t-orange-400 border-white/5 animate-spin" />
        <span className="text-[10px] text-zinc-500 font-mono mt-4 uppercase tracking-widest">Checking AI Credentials...</span>
      </div>
    );
  }

  const isSubscribed = !!user;

  if (!isSubscribed) {
    return (
      <div className="w-full max-w-4xl mx-auto glass-panel border border-orange-500/20 rounded-3xl p-8 md:p-12 shadow-[0_0_50px_rgba(249,115,22,0.05)] relative overflow-hidden flex flex-col justify-center items-center min-h-[400px] text-center gap-6">
        {/* Background Neon Spotlight flares */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.15)] animate-pulse">
          <Sparkles className="w-8 h-8 text-orange-400" />
        </div>

        <div className="space-y-2 max-w-md">
          <h2 className="text-xl md:text-2xl font-display font-extrabold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
            AI Doubt Solver Locked
          </h2>
          <p className="text-xs text-zinc-500 font-mono tracking-wide leading-relaxed">
            Real-time step-by-step LaTeX solution telemetry is reserved exclusively for subscribed members.
          </p>
        </div>

        <div className="space-y-3 w-full max-w-xs pt-2">
          {!user ? (
            <a
              href="/login"
              className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl bg-gradient-to-r from-orange-500/80 to-pink-500/80 text-[10px] font-mono font-bold uppercase tracking-wider text-white hover:from-orange-500 hover:to-pink-600 transition-all cursor-pointer shadow-[0_0_20px_rgba(249,115,22,0.2)] hover:scale-[1.02]"
            >
              Sign In to Access
            </a>
          ) : (
            <div className="space-y-3">
              {/* Profile Tier info */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-left font-mono space-y-1">
                <div className="flex justify-between text-[8px] text-zinc-500">
                  <span>STUDENT PROFILE</span>
                  <span>LOCKED</span>
                </div>
                <div className="text-[10px] text-zinc-300 font-bold uppercase tracking-wider truncate">{user.email}</div>
                <div className="flex justify-between text-[8px] pt-1 border-t border-white/5">
                  <span className="text-zinc-500">Tier:</span>
                  <span className="text-red-400 font-bold uppercase">Free Tier</span>
                </div>
              </div>
              <a
                href="/#pricing"
                className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-600 text-[10px] font-mono font-bold uppercase tracking-wider text-white hover:from-orange-500 hover:to-pink-700 transition-all cursor-pointer shadow-[0_0_20px_rgba(249,115,22,0.2)] hover:scale-[1.02]"
              >
                Upgrade to Premium
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto glass-panel border border-white/10 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(249,115,22,0.1)] relative overflow-hidden flex flex-col gap-6">
      
      {/* Background Neon Spotlight flares */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-white/5 gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl md:text-3xl text-white flex items-center gap-2">
            AI Doubt Solver
            <Sparkles className="w-5 h-5 text-orange-400 animate-pulse" />
          </h2>
          <p className="text-xs text-zinc-500 font-medium mt-1">
            Futuristic scientific tutor. Delivering precise step-by-step LaTeX solutions.
          </p>
        </div>

        {chatHistory.length > 0 && (
          <button 
            onClick={handleClearHistory}
            className="flex items-center gap-1 text-[10px] font-mono uppercase text-zinc-500 hover:text-white border border-white/5 hover:border-white/10 px-3 py-1.5 rounded-lg bg-white/3 transition-all cursor-pointer font-bold"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear History
          </button>
        )}
      </div>

      {/* Chat Display Terminal */}
      <div 
        ref={scrollRef}
        className="h-80 md:h-96 overflow-y-auto bg-black/35 rounded-2xl border border-white/5 p-5 space-y-5 scrollbar-thin scroll-smooth"
      >
        {chatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500 space-y-4">
            <HelpCircle className="w-10 h-10 text-orange-500/20" />
            <div className="space-y-1">
              <span className="block text-xs font-bold text-zinc-400">No telemetry logged.</span>
              <span className="block text-[10px] font-medium max-w-sm">Select one of our suggested academic queries below or enter custom formulas.</span>
            </div>
          </div>
        ) : (
          chatHistory.map((msg, index) => (
            <div 
              key={index}
              className={`flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-orange-500 to-sky-400 flex items-center justify-center text-[10px] font-bold text-white shadow-md">
                  AI
                </div>
              )}

              <div 
                className={`rounded-2xl p-4 max-w-[85%] text-xs font-medium relative group shadow-md ${
                  msg.role === "user" 
                    ? "bg-orange-600/15 border border-orange-500/30 text-white" 
                    : "bg-white/4 border border-white/5 text-zinc-300"
                }`}
              >
                {/* Text & LaTeX rendering */}
                <div className="space-y-1 pr-4">
                  {parseLaTeXText(msg.text)}
                </div>

                {/* Save doubt bookmarks for AI replies */}
                {msg.role === "assistant" && (
                  <button 
                    onClick={() => handleSaveDoubt(index)}
                    className="absolute top-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-orange-400 cursor-pointer"
                    title="Save Doubt"
                  >
                    {savedDoubts.some(item => item.timestamp === msg.timestamp) ? (
                      <Check className="w-3.5 h-3.5 text-orange-400" />
                    ) : (
                      <Bookmark className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex gap-3 items-start animate-pulse">
            <div className="w-7 h-7 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[10px] font-bold text-orange-400 font-mono">
              AI
            </div>
            <div className="rounded-2xl p-4 bg-white/4 border border-white/5 text-zinc-500 text-xs font-mono">
              Analyzing coordinates and resolving LaTeX matrices...
            </div>
          </div>
        )}
      </div>

      {/* Suggested Questions Grid */}
      {chatHistory.length === 0 && (
        <div className="space-y-2.5">
          <span className="block text-[9px] font-mono tracking-widest text-zinc-500 uppercase font-semibold">
            SUGGESTED DOUBT TELEMETRY
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggestions.map((sug, i) => (
              <button
                key={i}
                onClick={() => askAI(sug)}
                className="text-left text-xs bg-white/3 border border-white/5 hover:border-orange-500/30 hover:bg-orange-500/5 p-3.5 rounded-xl text-zinc-400 hover:text-white transition-all duration-300 font-medium cursor-pointer"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Inputs Form */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          askAI();
        }}
        className="flex gap-3 items-center border border-white/10 bg-black/40 p-2 rounded-2xl"
      >
        <button
          type="button"
          onClick={triggerVoiceInput}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            voiceActive 
              ? "bg-red-500/20 text-red-400 animate-ping border border-red-500/30" 
              : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
          }`}
          title="Voice Capture"
        >
          <Volume2 className="w-4.5 h-4.5" />
        </button>

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter formulas or conceptual doubts in Physics, Chemistry, or Maths..."
          className="flex-1 bg-transparent border-0 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-0 font-medium pr-2"
          disabled={loading || voiceActive}
        />

        <button
          type="submit"
          disabled={loading || !message.trim()}
          className="h-10 px-5 rounded-xl bg-gradient-to-r from-orange-400 to-sky-400 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer hover:shadow-orange-500/25 hover:scale-102 transition-all disabled:opacity-30 disabled:scale-100 disabled:shadow-none shrink-0"
        >
          {loading ? "Solving..." : "Ask AI"}
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

    </div>
  );
}
