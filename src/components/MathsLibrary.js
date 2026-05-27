"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  BookOpen, 
  Download, 
  Layers, 
  ChevronRight, 
  ArrowUpDown, 
  GraduationCap, 
  Check, 
  Brain 
} from "lucide-react";
import { mathsResources } from "@/lib/mathsResources";

const CATEGORIES = [
  "All",
  "Algebra",
  "Calculus",
  "Coordinate Geometry",
  "Trigonometry",
  "Vector & 3D Geometry",
  "Probability",
  "Problem Solving"
];

export default function MathsLibrary({ onOpenPDF }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState("asc"); // asc, desc
  const [loading, setLoading] = useState(true);

  // Simulate premium skeleton loader on initial mount
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Filter and Sort Logic
  const filteredBooks = mathsResources.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          book.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (sortOrder === "asc") {
      return a.title.localeCompare(b.title);
    } else {
      return b.title.localeCompare(a.title);
    }
  });

  // Convert Drive sharing link to direct download link securely
  const getDirectDownloadLink = (fileId) => {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  };

  return (
    <div className="space-y-8 pt-10 border-t border-white/10 relative z-10">
      
      {/* ── Section Title & Subtitle ── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
          <h2 className="text-xl md:text-2xl font-display font-extrabold tracking-wider uppercase text-white">
            Mathematics Library
          </h2>
        </div>
        <p className="text-[10px] md:text-xs text-zinc-500 font-mono tracking-wide max-w-xl">
          Premium IIT JEE Mathematics Books & Problem Solving Resources. Synergized with dynamic PDF loaders.
        </p>
      </div>

      {/* ── Sticky Control Panel ── */}
      <div className="sticky top-28 z-30 glass-panel border border-white/10 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-center gap-4 justify-between shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-md">
        
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search math textbooks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.02] border border-white/10 focus:border-violet-500/40 text-[10px] font-mono tracking-wider focus:outline-none transition-all placeholder:text-zinc-600 text-white"
          />
        </div>

        {/* Categories Tab Pill Container */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none py-1 whitespace-nowrap">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`relative px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                  isActive
                    ? "bg-violet-500/15 text-violet-300 border-violet-500/30 shadow-[0_0_10px_rgba(139,92,246,0.1)]"
                    : "bg-transparent border-white/5 text-zinc-500 hover:text-zinc-300 hover:border-white/10"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Sort and Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-white/[0.02] border border-white/10 text-zinc-400 font-mono text-[9px] rounded-lg py-1.5 px-3 focus:outline-none focus:border-violet-500/40 uppercase tracking-wider cursor-pointer"
            >
              <option value="asc" className="bg-zinc-950 text-zinc-400">Title A-Z</option>
              <option value="desc" className="bg-zinc-950 text-zinc-400">Title Z-A</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Library Card Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-panel border border-white/5 rounded-2xl h-72 animate-pulse p-5 space-y-4">
              <div className="h-32 bg-white/5 rounded-xl" />
              <div className="h-4 bg-white/5 rounded w-3/4" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
              <div className="h-8 bg-white/5 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : sortedBooks.length === 0 ? (
        <div className="text-center py-16 border border-white/5 rounded-2xl bg-white/[0.01] space-y-2">
          <p className="text-xs font-mono text-zinc-500">No math textbooks matched your request.</p>
          <button
            onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
            className="text-[10px] font-mono text-violet-400 underline cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedBooks.map((book) => (
            <motion.div
              key={book.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="glass-panel border border-white/5 hover:border-violet-500/20 rounded-2xl overflow-hidden flex flex-col group transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/[0.02]"
            >
              
              {/* Cover Art Box */}
              <div className="h-32 relative bg-zinc-950 overflow-hidden">
                <img 
                  src={book.cover} 
                  alt={book.title} 
                  className="w-full h-full object-cover filter brightness-[0.6] group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Subject tag */}
                <span className="absolute top-3 left-3 text-[7px] font-mono font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  {book.category}
                </span>

                {/* IIT JEE Tag */}
                <span className="absolute top-3 right-3 text-[7px] font-mono font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 animate-pulse">
                  IIT JEE Focus
                </span>
              </div>

              {/* Card Body details */}
              <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-[10px] uppercase font-mono font-bold leading-normal text-white group-hover:text-violet-300 transition-colors line-clamp-2">
                    {book.title}
                  </h4>
                  <p className="text-[9px] text-zinc-600 leading-relaxed font-mono line-clamp-3">
                    {book.desc}
                  </p>
                </div>

                {/* Card Actions */}
                <div className="space-y-1.5 pt-1">
                  <button
                    onClick={() => onOpenPDF(book, false)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/25 text-[9px] font-mono font-bold uppercase tracking-wider text-violet-300 hover:bg-violet-500/20 hover:border-violet-500/40 transition-all cursor-pointer"
                  >
                    <BookOpen className="w-3 h-3" />
                    Open Book
                  </button>
                  <a
                    href={getDirectDownloadLink(book.fileId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-400 hover:bg-white/10 hover:text-white transition-all text-center"
                  >
                    <Download className="w-3 h-3" />
                    Download PDF
                  </a>
                </div>
              </div>

            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
