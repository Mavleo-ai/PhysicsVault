"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  BookOpen,
  Download,
  RefreshCw,
  FileText,
  AlertTriangle,
  ChevronDown,
  Zap,
  Clock,
  HardDrive,
  X,
  Maximize2,
  Filter,
} from "lucide-react";
import { fetchDriveFolder, DRIVE_FOLDERS, getDriveDownloadUrl } from "@/lib/driveResources";
import AdvancedPdfViewer from "@/components/AdvancedPdfViewer";

// ─── Color palette per subject ──────────────────────────────────────────────
const COLOR_MAP = {
  sky: {
    badge: "bg-sky-500/10 text-sky-300 border-sky-500/20",
    dot: "bg-sky-400",
    tab: "bg-sky-500/10 text-sky-400 border-sky-500/20 shadow-[0_0_12px_rgba(56,189,248,0.08)]",
    glow: "hover:border-sky-500/30 hover:shadow-sky-500/5",
    button: "bg-sky-500/10 border-sky-500/25 text-sky-300 hover:bg-sky-500/20 hover:border-sky-500/40",
  },
  orange: {
    badge: "bg-orange-500/10 text-orange-300 border-orange-500/20",
    dot: "bg-orange-400",
    tab: "bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-[0_0_12px_rgba(249,115,22,0.08)]",
    glow: "hover:border-orange-500/30 hover:shadow-orange-500/5",
    button: "bg-orange-500/10 border-orange-500/25 text-orange-300 hover:bg-orange-500/20 hover:border-orange-500/40",
  },
  emerald: {
    badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    dot: "bg-emerald-400",
    tab: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_12px_rgba(52,211,153,0.08)]",
    glow: "hover:border-emerald-500/30 hover:shadow-emerald-500/5",
    button: "bg-emerald-500/10 border-emerald-500/25 text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-500/40",
  },
  violet: {
    badge: "bg-violet-500/10 text-violet-300 border-violet-500/20",
    dot: "bg-violet-400",
    tab: "bg-violet-500/10 text-violet-400 border-violet-500/20 shadow-[0_0_12px_rgba(139,92,246,0.08)]",
    glow: "hover:border-violet-500/30 hover:shadow-violet-500/5",
    button: "bg-violet-500/10 border-violet-500/25 text-violet-300 hover:bg-violet-500/20 hover:border-violet-500/40",
  },
};

const FOLDER_KEYS = Object.keys(DRIVE_FOLDERS);

export default function DriveResourcesPanel() {
  const [activeFolder, setActiveFolder] = useState(FOLDER_KEYS[0]);
  const [filesCache, setFilesCache] = useState({}); // { folderId: [] }
  const [loadingStates, setLoadingStates] = useState({}); // { folderId: bool }
  const [errorStates, setErrorStates] = useState({}); // { folderId: string }
  const [searchQuery, setSearchQuery] = useState("");

  // PDF Viewer modal
  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);

  const folder = DRIVE_FOLDERS[activeFolder];
  const colors = COLOR_MAP[folder.color];
  const folderId = folder.id;

  // ── Fetch files for the active folder (with caching) ──
  useEffect(() => {
    if (filesCache[folderId] || loadingStates[folderId]) return;

    setLoadingStates((prev) => ({ ...prev, [folderId]: true }));
    setErrorStates((prev) => ({ ...prev, [folderId]: null }));

    fetchDriveFolder(folderId)
      .then((files) => {
        setFilesCache((prev) => ({ ...prev, [folderId]: files }));
      })
      .catch((err) => {
        setErrorStates((prev) => ({
          ...prev,
          [folderId]: err.message || "Failed to load resources",
        }));
      })
      .finally(() => {
        setLoadingStates((prev) => ({ ...prev, [folderId]: false }));
      });
  }, [activeFolder, folderId]);

  // ── Force refresh ──
  const handleRefresh = () => {
    setFilesCache((prev) => {
      const copy = { ...prev };
      delete copy[folderId];
      return copy;
    });
    setLoadingStates((prev) => ({ ...prev, [folderId]: false }));
    setErrorStates((prev) => ({ ...prev, [folderId]: null }));
  };

  // ── Filter files by search ──
  const rawFiles = filesCache[folderId] || [];
  const filteredFiles = rawFiles.filter((f) =>
    f.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isLoading = !!loadingStates[folderId];
  const error = errorStates[folderId];

  const openPDF = (file) => {
    setPdfFile(file);
    setPdfOpen(true);
  };

  return (
    <>
      {/* ── Main Panel ─────────────────────────────────────────────────── */}
      <div className="space-y-6 relative z-10">

        {/* Section header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <h2 className="text-xl md:text-2xl font-display font-extrabold tracking-wider uppercase text-white">
              Resource Library
            </h2>
          </div>
          <p className="text-[10px] md:text-xs text-zinc-500 font-mono tracking-wide max-w-xl">
            Live-synced from Google Drive · Physics, Chemistry & Mathematics Textbooks & Notes
          </p>
        </div>

        {/* ── Subject Tabs ─────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2">
          {FOLDER_KEYS.map((key) => {
            const f = DRIVE_FOLDERS[key];
            const c = COLOR_MAP[f.color];
            const isActive = activeFolder === key;
            const count = filesCache[f.id]?.length ?? null;
            return (
              <button
                key={key}
                onClick={() => setActiveFolder(key)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                  isActive
                    ? c.tab
                    : "bg-transparent border-white/5 text-zinc-500 hover:text-zinc-300 hover:border-white/10"
                }`}
              >
                <span className="text-sm">{f.icon}</span>
                {f.label}
                {count !== null && (
                  <span
                    className={`text-[8px] px-1.5 py-0.5 rounded-full border font-bold ${
                      isActive ? c.badge : "bg-white/5 text-zinc-500 border-white/5"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Control Bar ──────────────────────────────────────────────── */}
        <div className="sticky top-28 z-30 glass-panel border border-white/10 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-center gap-4 justify-between shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-md">

          {/* Left: Info pill */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className={`w-2 h-2 rounded-full ${colors.dot} ${isLoading ? "animate-pulse" : ""}`} />
            <div>
              <p className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">
                {folder.label}
              </p>
              <p className="text-[9px] text-zinc-500 font-mono">{folder.description}</p>
            </div>
          </div>

          {/* Center: Search */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder={`Search ${folder.label.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.02] border border-white/10 focus:border-sky-500/40 text-[10px] font-mono tracking-wider focus:outline-none transition-all placeholder:text-zinc-600 text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Right: Stats + Refresh */}
          <div className="flex items-center gap-3 shrink-0">
            {rawFiles.length > 0 && (
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
                {filteredFiles.length}/{rawFiles.length} files
              </span>
            )}
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-all text-[9px] font-mono font-bold uppercase tracking-wider cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
              {isLoading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* ── Content Area ─────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">

          {/* Error State */}
          {error && !isLoading && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-16 border border-red-500/20 rounded-2xl bg-red-500/[0.02] text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider">
                  Failed to load resources
                </p>
                <p className="text-[9px] text-zinc-500 font-mono mt-1 max-w-sm">{error}</p>
              </div>
              <button
                onClick={handleRefresh}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-mono font-bold uppercase tracking-wider hover:bg-red-500/20 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Retry
              </button>
            </motion.div>
          )}

          {/* Loading Skeleton */}
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
            >
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="glass-panel border border-white/5 rounded-2xl h-56 animate-pulse p-5 space-y-4"
                >
                  <div className="h-6 w-6 bg-white/5 rounded-lg" />
                  <div className="space-y-2">
                    <div className="h-3 bg-white/5 rounded w-full" />
                    <div className="h-3 bg-white/5 rounded w-3/4" />
                  </div>
                  <div className="h-2 bg-white/5 rounded w-1/3" />
                  <div className="h-8 bg-white/5 rounded-xl w-full" />
                  <div className="h-8 bg-white/5 rounded-xl w-full" />
                </div>
              ))}
            </motion.div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredFiles.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-16 border border-white/5 rounded-2xl bg-white/[0.01] space-y-3"
            >
              <HardDrive className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-xs font-mono text-zinc-500">
                {searchQuery
                  ? `No files match "${searchQuery}"`
                  : "No files found in this folder"}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-[10px] font-mono text-sky-400 underline cursor-pointer"
                >
                  Clear search
                </button>
              )}
            </motion.div>
          )}

          {/* File Grid */}
          {!isLoading && !error && filteredFiles.length > 0 && (
            <motion.div
              key={`grid-${activeFolder}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
            >
              {filteredFiles.map((file, idx) => (
                <motion.div
                  key={file.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.35, delay: Math.min(idx * 0.04, 0.4) }}
                  className={`glass-panel border border-white/5 ${colors.glow} rounded-2xl overflow-hidden flex flex-col group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
                >
                  {/* Card header bar */}
                  <div className="h-2 w-full bg-gradient-to-r from-transparent via-current to-transparent opacity-20" />

                  {/* Icon area */}
                  <div className="px-4 pt-4 pb-2">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${colors.badge} mb-3`}>
                      <FileText className="w-5 h-5" />
                    </div>

                    {/* Title */}
                    <h4 className="text-[10px] uppercase font-mono font-bold leading-snug text-white group-hover:text-sky-300 transition-colors line-clamp-3 min-h-[3.5rem]">
                      {file.title}
                    </h4>

                    {/* Sub-folder category badge */}
                    {file.category && (
                      <span className={`inline-block mt-1 text-[7px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${colors.badge}`}>
                        {file.category}
                      </span>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="px-4 pb-3 flex items-center gap-3 flex-wrap">
                    {file.size && (
                      <span className="flex items-center gap-1 text-[8px] font-mono text-zinc-500">
                        <HardDrive className="w-2.5 h-2.5" />
                        {file.size}
                      </span>
                    )}
                    {file.modifiedTime && (
                      <span className="flex items-center gap-1 text-[8px] font-mono text-zinc-600">
                        <Clock className="w-2.5 h-2.5" />
                        {file.modifiedTime}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="px-4 pb-4 mt-auto space-y-2">
                    <button
                      onClick={() => openPDF(file)}
                      className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border text-[9px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${colors.button}`}
                    >
                      <BookOpen className="w-3 h-3" />
                      Open
                    </button>
                    <a
                      href={getDriveDownloadUrl(file.fileId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-400 hover:bg-white/10 hover:text-white transition-all text-center"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </a>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── PDF Viewer Modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {pdfOpen && pdfFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center p-3 md:p-6"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
              onClick={() => setPdfOpen(false)}
            />

            {/* Modal window */}
            <motion.div
              initial={{ scale: 0.92, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 30 }}
              transition={{ type: "spring", damping: 24, stiffness: 200 }}
              className="relative w-full max-w-5xl h-[88vh] flex flex-col rounded-2xl bg-zinc-950 border border-white/10 shadow-2xl overflow-hidden z-10"
            >
              {/* Modal top bar */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-black/60 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-4 h-4 text-sky-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-mono font-bold text-white uppercase tracking-wider truncate">
                      {pdfFile.title}
                    </p>
                    <p className="text-[8px] font-mono text-zinc-500">
                      {pdfFile.size && `${pdfFile.size} · `}Google Drive Document
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={pdfFile.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[9px] font-mono font-bold uppercase tracking-wider hover:bg-sky-500/20 transition-all"
                  >
                    <Maximize2 className="w-3 h-3" />
                    Drive
                  </a>
                  <button
                    onClick={() => setPdfOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/20 transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* PDF Viewer - fills remaining height */}
              <div className="flex-1 min-h-0">
                <AdvancedPdfViewer
                  fileId={pdfFile.fileId}
                  fileName={pdfFile.title}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
