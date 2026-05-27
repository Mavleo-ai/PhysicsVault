"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  Search, 
  Layers, 
  Brain, 
  Sparkles, 
  Bookmark, 
  Clock, 
  Maximize2, 
  X, 
  Send,
  Zap,
  HelpCircle,
  Award,
  ChevronRight,
  TrendingUp,
  FileText,
  Volume2,
  Heart
} from "lucide-react";

// Components & Libs
import Navbar from "@/components/Navbar";
import SpaceBackground from "@/components/SpaceBackground";
import AuthModal from "@/components/AuthModal";
import AdvancedPdfViewer from "@/components/AdvancedPdfViewer";
import MathsLibrary from "@/components/MathsLibrary";
import { auth, saveUserActivity, loadUserActivity } from "@/lib/firebase";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css"; // Warm typeset LaTeX styling
import { onAuthStateChanged } from "firebase/auth";

export default function NotesPage() {
  const [user, setUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("login");

  // Resource items state
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // User Activity (Firestore synced + LocalStorage backup)
  const [userActivity, setUserActivity] = useState({ recentlyOpened: [], favorites: [] });

  // PDF Viewer Modal State
  const [activePDF, setActivePDF] = useState(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [aiActiveTab, setAiActiveTab] = useState("chat"); // chat, summary, quiz, flashcards, formulas

  // AI Response Caches
  const [aiChat, setAiChat] = useState([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [quiz, setQuiz] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({}); // { 0: optionIndex }
  const [quizScore, setQuizScore] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [formulas, setFormulas] = useState("");

  const chatEndRef = useRef(null);

  // LaTeX typeset mathematical formula parser
  const parseLaTeXText = (text) => {
    if (!text) return null;
    
    // Split by block equations first
    const parts = text.split(/(\$\$.*?\$\$)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith("$$") && part.endsWith("$$")) {
        const formula = part.slice(2, -2).trim();
        return (
          <div key={index} className="my-2.5 overflow-x-auto py-1.5 scrollbar-thin">
            <BlockMath math={formula} />
          </div>
        );
      }
      
      // Inline equation parsing
      const inlineParts = part.split(/(\$.*?\$)/g);
      return (
        <span key={index} className="whitespace-pre-wrap leading-relaxed text-zinc-300">
          {inlineParts.map((subPart, subIndex) => {
            if (subPart.startsWith("$") && subPart.endsWith("$")) {
              const formula = subPart.slice(1, -1).trim();
              return (
                <span key={subIndex} className="inline-block px-0.5 font-sans">
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

  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Load persistent recently opened/favorites
        const activity = await loadUserActivity(currentUser.uid);
        setUserActivity(activity);
      } else {
        // Load anonymous local activity if available
        const localActivity = localStorage.getItem("pv_activity_anonymous");
        if (localActivity) {
          try {
            setUserActivity(JSON.parse(localActivity));
          } catch (e) {
            setUserActivity({ recentlyOpened: [], favorites: [] });
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch Resources from google drive backend API
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch("/api/resources");
        const data = await response.json();
        if (data.success) {
          setResources(data.resources);
        }
      } catch (e) {
        console.error("Failed to load PDF resources:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  // Scroll to bottom on AI chat updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiChat]);

  // Handle PDF Open & Activity Recording
  const openPDF = async (resource, openToChatTab = false) => {
    const normalizedResource = {
      ...resource,
      id: resource.fileId || resource.id, // Ensure we use the actual fileId/Google Drive ID for rendering
      name: resource.name || resource.title || "Mathematics Book", // Ensure we have the name field populated for the AI context
      thumbnail: resource.thumbnail || resource.cover || "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=500&q=80",
      subject: resource.subject || "Mathematics"
    };

    setActivePDF(normalizedResource);
    setPdfModalOpen(true);
    setAiActiveTab(openToChatTab ? "chat" : "summary");
    
    // Clear dynamic AI states
    setAiChat([
      { sender: "ai", text: `Hello! I am your AI study companion for **${normalizedResource.name}**. Ask me questions, generate a custom quiz, or let me summarize the notes!` }
    ]);
    setSummary("");
    setQuiz([]);
    setQuizAnswers({});
    setQuizScore(null);
    setFlashcards([]);
    setFormulas("");

    // Append to recently opened list
    const updatedRecently = [
      normalizedResource,
      ...userActivity.recentlyOpened.filter((item) => item.id !== normalizedResource.id)
    ].slice(0, 6); // Keep last 6 items

    const updatedActivity = {
      ...userActivity,
      recentlyOpened: updatedRecently
    };

    setUserActivity(updatedActivity);

    if (user) {
      await saveUserActivity(user.uid, updatedActivity);
    } else {
      localStorage.setItem("pv_activity_anonymous", JSON.stringify(updatedActivity));
    }

    // Auto-trigger summarization upon load
    triggerAISummary(normalizedResource.name);
  };

  // Toggle Favorite
  const toggleFavorite = async (resource, e) => {
    e.stopPropagation();
    
    const isFav = userActivity.favorites.some((item) => item.id === resource.id);
    let updatedFavs;
    if (isFav) {
      updatedFavs = userActivity.favorites.filter((item) => item.id !== resource.id);
    } else {
      updatedFavs = [...userActivity.favorites, resource];
    }

    const updatedActivity = {
      ...userActivity,
      favorites: updatedFavs
    };

    setUserActivity(updatedActivity);

    if (user) {
      await saveUserActivity(user.uid, updatedActivity);
    } else {
      localStorage.setItem("pv_activity_anonymous", JSON.stringify(updatedActivity));
    }
  };

  // Trigger Gemini AI custom chat
  const sendChatMessage = async () => {
    if (!aiInput.trim() || aiLoading) return;
    const userMsg = aiInput;
    setAiChat((prev) => [...prev, { sender: "user", text: userMsg }]);
    setAiInput("");
    setAiLoading(true);

    try {
      const prompt = `Context: This question is about the textbook/resource titled "${activePDF.name}".
Student Question: ${userMsg}
Please provide an elite step-by-step academic response. Deliver formulas in beautiful KaTeX format where helpful.`;

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      });
      const data = await res.json();
      if (data.success) {
        setAiChat((prev) => [...prev, { sender: "ai", text: data.reply }]);
      } else {
        const errStr = (data.error || "").toLowerCase();
        if (errStr.includes("503") || errStr.includes("unavailable") || errStr.includes("quota") || errStr.includes("limit") || errStr.includes("busy")) {
          setAiChat((prev) => [...prev, { sender: "ai", text: "AI Tutor is busy, try again in a moment" }]);
        } else {
          setAiChat((prev) => [...prev, { sender: "ai", text: "I encountered a celestial transmission delay. Please try again." }]);
        }
      }
    } catch (e) {
      setAiChat((prev) => [...prev, { sender: "ai", text: "Connection error. Ensure your server is active." }]);
    } finally {
      setAiLoading(false);
    }
  };

  // Trigger Gemini AI Summarize
  const triggerAISummary = async (title) => {
    if (summary) return; // cache hit
    setAiLoading(true);
    try {
      const prompt = `Summarize the academic textbook or notes titled "${title}".
Provide a concise, ultra-focused, 4-bullet point cheat sheet outlining the core concepts, target equations, and essential exam topics. Format beautiful display and inline KaTeX variables.`;

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      });
      const data = await res.json();
      if (data.success) {
        setSummary(data.reply);
      } else {
        const errStr = (data.error || "").toLowerCase();
        if (errStr.includes("503") || errStr.includes("unavailable") || errStr.includes("quota") || errStr.includes("limit") || errStr.includes("busy")) {
          setSummary("AI Tutor is busy, try again in a moment");
        } else {
          setSummary("Failed to generate summary. Try manually chatting!");
        }
      }
    } catch (e) {
      setSummary("API request timed out.");
    } finally {
      setAiLoading(false);
    }
  };

  // Trigger Gemini AI Quiz
  const triggerAIQuiz = async (title) => {
    if (quiz.length > 0) return; // cache hit
    setAiLoading(true);
    setQuizScore(null);
    setQuizAnswers({});

    try {
      const prompt = `Generate a 3-question multiple choice quiz on the concepts associated with the book "${title}".
Deliver the quiz in standard JSON array format matching this structure:
[
  {
    "question": "Question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answerIndex": 0,
    "explanation": "Why this is correct"
  }
]
Deliver ONLY the JSON array inside a standard markdown code block. Do not include any intro, outro, or additional markdown outside the JSON block.`;

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      });
      const data = await res.json();
      if (data.success) {
        // Extract JSON string from markdown code block
        const jsonMatch = data.reply.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, data.reply];
        const jsonStr = jsonMatch[1] || data.reply;
        try {
          const parsedQuiz = JSON.parse(jsonStr.trim());
          setQuiz(parsedQuiz);
        } catch (e) {
          console.error("Quiz JSON parse failed:", e);
          setQuiz([
            {
              question: "Failed to parse generated quiz. Please try again.",
              options: ["Click retry above", "Use chat to study instead", "Check credentials", "Ok"],
              answerIndex: 3,
              explanation: "AI generated invalid JSON structure."
            }
          ]);
        }
      } else {
        const errStr = (data.error || "").toLowerCase();
        if (errStr.includes("503") || errStr.includes("unavailable") || errStr.includes("quota") || errStr.includes("limit") || errStr.includes("busy")) {
          setQuiz([
            {
              question: "AI Tutor is busy, try again in a moment",
              options: ["Click retry above", "Use chat to study instead", "Check credentials", "Ok"],
              answerIndex: 3,
              explanation: "The AI service is currently overloaded. Please try again shortly."
            }
          ]);
        } else {
          setQuiz([
            {
              question: "Failed to generate quiz. Please try again.",
              options: ["Retry", "Cancel", "Chat", "Help"],
              answerIndex: 1,
              explanation: data.error || "Unknown API error occurred."
            }
          ]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  // Trigger Gemini AI Flashcards
  const triggerAIFlashcards = async (title) => {
    if (flashcards.length > 0) return;
    setAiLoading(true);
    try {
      const prompt = `Generate 3 essential digital flashcards (Q&A style) for topics in "${title}".
Deliver in standard JSON array:
[
  { "front": "Core Question / Concept", "back": "Direct Answer / Formula Explanations" }
]
Deliver ONLY the JSON array inside a standard markdown code block.`;

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      });
      const data = await res.json();
      if (data.success) {
        const jsonMatch = data.reply.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, data.reply];
        const jsonStr = jsonMatch[1] || data.reply;
        try {
          const parsed = JSON.parse(jsonStr.trim());
          setFlashcards(parsed);
        } catch (e) {
          setFlashcards([{ front: "Could not render cards.", back: "Please retry." }]);
        }
      } else {
        const errStr = (data.error || "").toLowerCase();
        if (errStr.includes("503") || errStr.includes("unavailable") || errStr.includes("quota") || errStr.includes("limit") || errStr.includes("busy")) {
          setFlashcards([{ front: "AI Tutor is busy, try again in a moment", back: "The AI service is currently overloaded. Please try again shortly." }]);
        } else {
          setFlashcards([{ front: "Failed to generate flashcards.", back: "Please retry." }]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  // Trigger Gemini AI Formulas
  const triggerAIFormulas = async (title) => {
    if (formulas) return;
    setAiLoading(true);
    try {
      const prompt = `Identify, extract, and explain the top 3 core formulas associated with "${title}".
Provide each formula on its own line formatted in block KaTeX ($$...$$) and give a brief, step-by-step breakdown of what each parameter represents.`;

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      });
      const data = await res.json();
      if (data.success) {
        setFormulas(data.reply);
      } else {
        const errStr = (data.error || "").toLowerCase();
        if (errStr.includes("503") || errStr.includes("unavailable") || errStr.includes("quota") || errStr.includes("limit") || errStr.includes("busy")) {
          setFormulas("AI Tutor is busy, try again in a moment");
        } else {
          setFormulas("Formulas extraction failed.");
        }
      }
    } catch (e) {
      setFormulas("Formulas extraction failed.");
    } finally {
      setAiLoading(false);
    }
  };

  // Filter resource items
  const filteredResources = resources.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === "All" || item.subject === selectedSubject;
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;

    return matchesSearch && matchesSubject && matchesCategory;
  });

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden select-none pb-20">
      <SpaceBackground />
      
      {/* Navbar */}
      <Navbar 
        onAuthClick={(tab) => { setAuthModalTab(tab); setAuthModalOpen(true); }}
        user={user}
        onLogout={async () => { await signOut(auth); setUser(null); }}
      />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-32 space-y-12 relative z-10">
        
        {/* Header Block */}
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-mono uppercase tracking-[0.2em]"
          >
            <Sparkles className="w-3 h-3 animate-spin" style={{ animationDuration: "3s" }} />
            Dynamic Google Drive Library
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-display font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400 uppercase"
          >
            Physics<span className="text-sky-400">Vault</span> Knowledge Archive
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-xs md:text-sm text-zinc-400 font-mono tracking-wide max-w-xl mx-auto"
          >
            Access elite JEE study materials synced in real-time from the cloud, powered by contextual Gemini study agents.
          </motion.p>
        </div>

        {/* 4 Category Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { id: "physicsNotes", title: "Physics Notes", icon: "⚛️", desc: "Short notes, formula sheets, key derivations.", border: "border-orange-500/20 hover:border-orange-500/50 hover:shadow-orange-500/10", tagColor: "text-orange-400" },
            { id: "physicsTextbooks", title: "Physics Books", icon: "📚", desc: "HC Verma, Irodov, and reference conceptual texts.", border: "border-sky-500/20 hover:border-sky-500/50 hover:shadow-sky-500/10", tagColor: "text-sky-400" },
            { id: "chemistry", title: "Chemistry Books", icon: "🧪", desc: "Organic mechanisms, inorganic tables, physical guides.", border: "border-emerald-500/20 hover:border-emerald-500/50 hover:shadow-emerald-500/10", tagColor: "text-emerald-400" },
            { id: "maths", title: "Maths Books", icon: "📐", desc: "Algebra series, calculus, analytic coordinates.", border: "border-violet-500/20 hover:border-violet-500/50 hover:shadow-violet-500/10", tagColor: "text-violet-400" },
          ].map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? "All" : cat.id)}
              className={`glass-panel border rounded-2xl p-5 space-y-4 cursor-pointer transition-all hover:scale-[1.02] ${cat.border} shadow-lg ${
                selectedCategory === cat.id ? "bg-white/[0.06] border-white/40 ring-1 ring-white/20" : ""
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-2xl">{cat.icon}</span>
                <span className={`text-[9px] font-mono tracking-widest uppercase ${cat.tagColor}`}>
                  FOLDER SYNCED
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-xs uppercase font-mono font-bold tracking-wider text-white">
                  {cat.title}
                </h3>
                <p className="text-[10px] text-zinc-500 leading-relaxed font-mono">
                  {cat.desc}
                </p>
              </div>
              <div className="flex items-center gap-1 text-[9px] font-mono text-zinc-400 group-hover:text-white transition-colors">
                <span>Browse Category</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recently Opened (Synced Carousel) */}
        {userActivity.recentlyOpened.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-300">
                Continue Reading
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {userActivity.recentlyOpened.slice(0, 3).map((resource, idx) => (
                <div
                  key={`recent-${resource.id}-${idx}`}
                  onClick={() => openPDF(resource)}
                  className="glass-panel border border-white/5 hover:border-sky-500/20 rounded-xl p-3.5 flex items-center gap-4 cursor-pointer hover:bg-white/[0.02] transition-all"
                >
                  <div className="w-12 h-14 bg-zinc-900 border border-white/10 rounded overflow-hidden flex-shrink-0 relative">
                    <img 
                      src={resource.thumbnail} 
                      alt="" 
                      className="w-full h-full object-cover filter brightness-75"
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-[10px] uppercase font-mono font-bold text-white truncate">
                      {resource.name}
                    </h4>
                    <span className="text-[8px] font-mono text-sky-400 uppercase tracking-widest block">
                      {resource.subject}
                    </span>
                    <span className="text-[7px] font-mono text-zinc-600 block">
                      Opened recently
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="glass-panel border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row items-center gap-5 justify-between">
          
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search volumes, topics, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 focus:border-cyan-500/40 text-xs font-mono tracking-wider focus:outline-none transition-all placeholder:text-zinc-600 text-white"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Subject Pills */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {["All", "Physics", "Chemistry", "Mathematics"].map((sub) => {
              const isActive = selectedSubject === sub;
              return (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                    isActive
                      ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.08)]"
                      : "bg-transparent border-white/5 text-zinc-500 hover:text-zinc-300 hover:border-white/10"
                  }`}
                >
                  {sub}
                </button>
              );
            })}
          </div>

          {/* Clear Filters helper */}
          {(searchQuery || selectedSubject !== "All" || selectedCategory !== "All") && (
            <button
              onClick={() => { setSearchQuery(""); setSelectedSubject("All"); setSelectedCategory("All"); }}
              className="text-[9px] font-mono text-zinc-500 hover:text-white underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Resources Bento Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-8 h-8 rounded-full border border-t-cyan-400 border-white/5 animate-spin" />
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest animate-pulse">
              Querying Google Drive folders...
            </span>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-20 space-y-2 border border-white/5 rounded-2xl bg-white/[0.01]">
            <p className="text-xs font-mono text-zinc-500">No JEE files matched your filter query.</p>
            <button
              onClick={() => { setSearchQuery(""); setSelectedSubject("All"); setSelectedCategory("All"); }}
              className="text-[10px] font-mono text-sky-400 underline cursor-pointer"
            >
              Show all resources
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredResources.map((res, index) => {
              const isFavorite = userActivity.favorites.some((item) => item.id === res.id);
              return (
                <motion.div
                  key={res.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.5) }}
                  className="glass-panel border border-white/10 hover:border-white/20 rounded-2xl overflow-hidden flex flex-col group transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/[0.02] relative"
                >
                  {/* Card Thumbnail / Header */}
                  <div className="h-44 relative bg-zinc-950 overflow-hidden">
                    <img 
                      src={res.thumbnail} 
                      alt={res.name}
                      className="w-full h-full object-cover filter brightness-[0.7] group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Floating subject pill */}
                    <span className={`absolute top-4 left-4 text-[8px] font-mono font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                      res.subject === "Physics" 
                        ? "bg-orange-500/10 text-orange-400 border-orange-500/20" 
                        : res.subject === "Chemistry"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-violet-500/10 text-violet-400 border-violet-500/20"
                    }`}>
                      {res.subject}
                    </span>

                    {/* Dynamic favorite icon */}
                    <button
                      onClick={(e) => toggleFavorite(res, e)}
                      className={`absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center transition-all bg-black/60 border border-white/10 hover:border-red-500/30 cursor-pointer ${
                        isFavorite ? "text-red-400" : "text-zinc-500 hover:text-white"
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFavorite ? "fill-red-500/25" : ""}`} />
                    </button>
                  </div>

                  {/* Body details */}
                  <div className="p-5 flex-1 flex flex-col gap-3.5 justify-between">
                    <div className="space-y-1.5">
                      <h4 className="text-xs uppercase font-mono font-bold leading-normal text-white group-hover:text-cyan-400 transition-colors">
                        {res.name}
                      </h4>
                      <p className="text-[9px] text-zinc-500 leading-relaxed font-mono">
                        {res.desc}
                      </p>
                    </div>

                    {/* Bottom buttons */}
                    <div className="flex gap-2.5 pt-2">
                      <button
                        onClick={() => openPDF(res, false)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-mono font-bold uppercase tracking-wider text-white hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        Open PDF
                      </button>
                      <button
                        onClick={() => openPDF(res, true)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300 hover:border-cyan-500/40 transition-all cursor-pointer"
                      >
                        <Brain className="w-3.5 h-3.5 animate-pulse" />
                        Ask AI
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* 📐 Premium Mathematics Books Library Section */}
        <MathsLibrary onOpenPDF={openPDF} />
      </div>

      {/* Auth Modal Trigger Fallback */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        initialTab={authModalTab}
      />

      {/* FULLSCREEN PDF VIEWER + FLOATING GEMINI PANEL MODAL */}
      <AnimatePresence>
        {pdfModalOpen && activePDF && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center overflow-hidden"
          >
            <div className="w-full h-full flex flex-col md:flex-row relative">
              
              {/* Close Button */}
              <button
                onClick={() => { setPdfModalOpen(false); setActivePDF(null); }}
                className="absolute top-4 right-4 z-[110] w-9 h-9 rounded-full bg-black/70 border border-white/15 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              {/* LEFT SIDE: 3-Layer Advanced PDF Rendering System */}
              <div className="flex-1 h-2/3 md:h-full border-r border-white/10 bg-zinc-950 relative">
                <AdvancedPdfViewer fileId={activePDF.id} fileName={activePDF.name} />
              </div>

              {/* RIGHT SIDE: Floating AI Study Panel */}
              <div className="w-full md:w-[480px] h-1/3 md:h-full bg-black/85 flex flex-col border-t md:border-t-0 border-white/10 relative z-[105]">
                
                {/* AI Panel Header */}
                <div className="p-4 border-b border-white/5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400 animate-bounce" />
                    <h3 className="text-xs uppercase font-mono font-extrabold tracking-widest text-white">
                      Gemini 2.0 Study Companion
                    </h3>
                  </div>
                  
                  {/* Tabs Selector */}
                  <div className="flex gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/5 overflow-x-auto whitespace-nowrap">
                    {[
                      { id: "chat", label: "Ask AI", icon: <Brain className="w-3 h-3" /> },
                      { id: "summary", label: "Summary", icon: <FileText className="w-3 h-3" /> },
                      { id: "quiz", label: "Quiz", icon: <HelpCircle className="w-3 h-3" /> },
                      { id: "flashcards", label: "Cards", icon: <Layers className="w-3 h-3" /> },
                      { id: "formulas", label: "Formulas", icon: <Zap className="w-3 h-3" /> },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setAiActiveTab(tab.id);
                          if (tab.id === "summary") triggerAISummary(activePDF.name);
                          if (tab.id === "quiz") triggerAIQuiz(activePDF.name);
                          if (tab.id === "flashcards") triggerAIFlashcards(activePDF.name);
                          if (tab.id === "formulas") triggerAIFormulas(activePDF.name);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          aiActiveTab === tab.id
                            ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/25"
                            : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                        }`}
                      >
                        {tab.icon}
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Panel Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-zinc-300 text-xs font-mono leading-relaxed">
                  
                  {/* Loader Overlay */}
                  {aiLoading && (
                    <div className="flex items-center justify-center gap-2.5 py-4 text-cyan-400 font-mono text-[10px]">
                      <div className="w-4 h-4 rounded-full border border-t-cyan-400 border-white/5 animate-spin" />
                      <span>Gemini is thinking...</span>
                    </div>
                  )}

                  {/* 1. Chat Interface */}
                  {aiActiveTab === "chat" && (
                    <div className="h-full flex flex-col justify-between gap-4">
                      <div className="flex-1 space-y-3.5 pr-1">
                        {aiChat.map((msg, idx) => (
                          <div 
                            key={idx} 
                            className={`p-3 rounded-2xl max-w-[85%] border font-mono text-[10px] leading-relaxed ${
                              msg.sender === "user"
                                ? "bg-white/[0.04] border-white/10 text-white ml-auto"
                                : "bg-cyan-500/5 border-cyan-500/10 text-cyan-100"
                            }`}
                          >
                            <span className="block font-bold text-[8px] uppercase tracking-widest text-zinc-500 mb-1">
                              {msg.sender === "user" ? "You" : "AI"}
                            </span>
                            <div className="space-y-1">{parseLaTeXText(msg.text)}</div>
                          </div>
                        ))}
                        <div ref={chatEndRef} />
                      </div>
                      
                      {/* Chat Input */}
                      <div className="flex gap-2 bg-white/[0.02] border border-white/5 p-2 rounded-2xl">
                        <input
                          type="text"
                          placeholder="Ask anything about the book..."
                          value={aiInput}
                          onChange={(e) => setAiInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") sendChatMessage(); }}
                          className="flex-1 bg-transparent px-3 py-2 text-[10px] text-white focus:outline-none placeholder:text-zinc-700 font-mono"
                        />
                        <button
                          onClick={sendChatMessage}
                          className="w-8 h-8 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center cursor-pointer transition-all"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 2. Summary Panel */}
                  {aiActiveTab === "summary" && summary && (
                    <div className="space-y-4">
                      <h4 className="text-[10px] uppercase font-mono font-bold text-white tracking-wider border-b border-white/5 pb-2">
                        Summary Breakdown
                      </h4>
                      <div className="space-y-1 text-[10px] text-zinc-300 leading-relaxed bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                        {parseLaTeXText(summary)}
                      </div>
                    </div>
                  )}

                  {/* 3. Quiz Interface */}
                  {aiActiveTab === "quiz" && quiz.length > 0 && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <h4 className="text-[10px] uppercase font-mono font-bold text-white tracking-wider">
                          Dynamic Focus Check
                        </h4>
                        {quizScore !== null && (
                          <span className="text-[9px] font-mono text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-2 py-0.5 rounded">
                            Score: {quizScore} / {quiz.length}
                          </span>
                        )}
                      </div>

                      <div className="space-y-6">
                        {quiz.map((item, qIdx) => {
                          const isCorrect = quizAnswers[qIdx] === item.answerIndex;
                          const showAnswer = quizScore !== null;
                          return (
                            <div key={qIdx} className="space-y-3 bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                              <h5 className="text-[10px] font-mono font-bold text-white leading-normal">
                                Q{qIdx + 1}: {item.question}
                              </h5>
                              <div className="grid grid-cols-1 gap-2">
                                {item.options.map((opt, oIdx) => {
                                  const isSelected = quizAnswers[qIdx] === oIdx;
                                  let btnBorder = "border-white/5 hover:border-white/20 bg-transparent";
                                  if (isSelected) btnBorder = "border-cyan-500/40 bg-cyan-500/5 text-cyan-300";
                                  if (showAnswer) {
                                    if (oIdx === item.answerIndex) {
                                      btnBorder = "border-green-500/50 bg-green-500/10 text-green-400";
                                    } else if (isSelected && !isCorrect) {
                                      btnBorder = "border-red-500/50 bg-red-500/10 text-red-400";
                                    }
                                  }
                                  return (
                                    <button
                                      key={oIdx}
                                      disabled={showAnswer}
                                      onClick={() => setQuizAnswers((prev) => ({ ...prev, [qIdx]: oIdx }))}
                                      className={`px-3.5 py-2.5 rounded-lg border text-left text-[9px] font-mono transition-all ${
                                        !showAnswer ? "cursor-pointer" : "cursor-default"
                                      } ${btnBorder}`}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>
                              {showAnswer && (
                                <p className="text-[8px] font-mono text-zinc-500 leading-normal pt-1.5 border-t border-white/5">
                                  💡 {item.explanation}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {quizScore === null && (
                        <button
                          onClick={() => {
                            // Calculate Score
                            let score = 0;
                            quiz.forEach((q, idx) => {
                              if (quizAnswers[idx] === q.answerIndex) score++;
                            });
                            setQuizScore(score);
                          }}
                          disabled={Object.keys(quizAnswers).length < quiz.length}
                          className="w-full py-3 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 hover:bg-cyan-500/25 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Submit Quiz
                        </button>
                      )}
                    </div>
                  )}

                  {/* 4. Flashcards Panel */}
                  {aiActiveTab === "flashcards" && flashcards.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-[10px] uppercase font-mono font-bold text-white tracking-wider border-b border-white/5 pb-2">
                        Active Recall Cards
                      </h4>
                      <div className="space-y-4">
                        {flashcards.map((card, idx) => (
                          <Flashcard key={idx} front={card.front} back={card.back} idx={idx} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 5. Formulas Panel */}
                  {aiActiveTab === "formulas" && formulas && (
                    <div className="space-y-4">
                      <h4 className="text-[10px] uppercase font-mono font-bold text-white tracking-wider border-b border-white/5 pb-2">
                        Key Equations
                      </h4>
                      <div className="space-y-1 text-[10px] text-zinc-300 leading-relaxed bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                        {parseLaTeXText(formulas)}
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Flashcard Child Component with Toggle state
function Flashcard({ front, back, idx }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div 
      onClick={() => setFlipped(!flipped)}
      className="glass-panel border border-white/5 rounded-xl p-4 cursor-pointer min-h-24 hover:bg-white/[0.02] hover:border-white/10 transition-all flex flex-col justify-between"
    >
      <div className="flex justify-between items-center pb-2 border-b border-white/5 mb-2">
        <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-zinc-500">
          Card {idx + 1}
        </span>
        <span className="text-[7px] font-mono uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-1 rounded animate-pulse">
          Click to Flip
        </span>
      </div>
      <div className="text-[10px] font-mono text-center text-white select-none leading-relaxed py-2">
        {flipped ? parseLaTeXText(back) : parseLaTeXText(front)}
      </div>
    </div>
  );
}
