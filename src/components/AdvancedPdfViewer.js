"use client";

import { useEffect, useState } from "react";
import { 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RefreshCw, 
  Eye, 
  Maximize2, 
  AlertTriangle,
  MonitorPlay,
  RotateCcw
} from "lucide-react";

// Check SSR safety
const isClient = typeof window !== "undefined";

// Lazy-load react-pdf client side to prevent Next.js SSR build errors
let Document = () => null;
let Page = () => null;
let pdfjs = {};

if (isClient) {
  try {
    const ReactPdf = require("react-pdf");
    Document = ReactPdf.Document;
    Page = ReactPdf.Page;
    pdfjs = ReactPdf.pdfjs;

    // ⚠️ CRITICAL: Use the matching precompiled react-pdf worker from our public folder
    // to prevent "API version X does not match Worker version Y" errors.
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  } catch (err) {
    console.error("Failed to load react-pdf on client side:", err);
  }
}

export default function AdvancedPdfViewer({ fileId, fileName }) {
  // Layer state: "proxy" (Layer 0 — same-origin stream), "preview" (Layer 1 — native Drive), "gview" (Layer 1.5), "canvas" (Layer 2), "external" (Layer 3)
  const [viewerLayer, setViewerLayer] = useState("proxy");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Client PDFJS (Layer 2) parameters
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1.0);
  const [highContrastDark, setHighContrastDark] = useState(true);

  // Helper to extract clean file ID from any URL or raw ID
  const extractFileId = (input) => {
    if (!input) return "";
    if (input.includes("drive.google.com")) {
      const match = input.match(/\/d\/([a-zA-Z0-9_-]+)/);
      return match ? match[1] : input;
    }
    return input;
  };

  const cleanFileId = extractFileId(fileId);

  // Proxy URL — our Next.js API fetches from Drive server-side (no CORS/iframe blocks)
  const proxyUrl = `/api/drive/${cleanFileId}`;

  // Direct download / access URLs (used for the External Open button)
  const directPdfUrl = `https://drive.google.com/uc?export=download&id=${cleanFileId}`;
  const gviewUrl = `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(directPdfUrl)}`;
  // Native Drive preview (kept as manual fallback option in toolbar)
  const previewUrl = `https://drive.google.com/file/d/${cleanFileId}/preview`;

  // Automatically reset states when a new document is loaded
  useEffect(() => {
    setViewerLayer("proxy");
    setLoading(true);
    setError(null);
    setPageNumber(1);
    setZoom(1.0);
  }, [fileId]);

  // Handle loading timeout for iframe layers to prevent persistent spinner blocks
  useEffect(() => {
    if (viewerLayer === "proxy" || viewerLayer === "preview" || viewerLayer === "gview") {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [viewerLayer, fileId]);

  // Handle Layer 2 load success
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  // Handle Layer 2 load error
  const onDocumentLoadError = (err) => {
    console.error("Layer 2 react-pdf rendering failed:", err);
    setError("Client-side PDF rendering blocked (CORS / restricted access).");
    setViewerLayer("external"); // Fallback to Layer 3 immediately
    setLoading(false);
  };

  // Switch to Client Fallback (Layer 2) manually or on timeout
  const triggerClientFallback = () => {
    setLoading(true);
    setError(null);
    setViewerLayer("canvas");
  };

  return (
    <div className="w-full h-full flex flex-col bg-zinc-950/80 rounded-2xl border border-white/5 overflow-hidden relative">
      
      {/* 🛠️ Dynamic Navigation & Spacing Control Bar */}
      <div className="relative z-10 px-4 py-3 bg-black/60 border-b border-white/5 flex flex-wrap items-center justify-between gap-3 text-zinc-400 font-mono text-[9px]">
        
        {/* Left Controls: Select active viewer portal */}
        <div className="flex items-center gap-1.5 bg-white/[0.03] p-0.5 rounded-lg border border-white/5">
          <button
            onClick={() => { setViewerLayer("proxy"); setLoading(true); setError(null); }}
            className={`px-2.5 py-1 rounded-md font-bold uppercase tracking-wider transition-all cursor-pointer ${
              viewerLayer === "proxy"
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                : "text-zinc-500 hover:text-zinc-300 border border-transparent"
            }`}
          >
            Inline View
          </button>
          <button
            onClick={() => { setViewerLayer("preview"); setLoading(true); setError(null); }}
            className={`px-2.5 py-1 rounded-md font-bold uppercase tracking-wider transition-all cursor-pointer ${
              viewerLayer === "preview"
                ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                : "text-zinc-500 hover:text-zinc-300 border border-transparent"
            }`}
          >
            Drive Preview
          </button>
          <button
            onClick={triggerClientFallback}
            className={`px-2.5 py-1 rounded-md font-bold uppercase tracking-wider transition-all cursor-pointer ${
              viewerLayer === "canvas"
                ? "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                : "text-zinc-500 hover:text-zinc-300 border border-transparent"
            }`}
          >
            Local Render
          </button>
        </div>

        {/* Center Controls: Only active in Layer 2 (Canvas) */}
        {viewerLayer === "canvas" && numPages && (
          <div className="flex items-center gap-4">
            {/* Page navigation */}
            <div className="flex items-center gap-2">
              <button
                disabled={pageNumber <= 1}
                onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
                className="w-5 h-5 rounded bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-white font-bold">
                {pageNumber} / {numPages}
              </span>
              <button
                disabled={pageNumber >= numPages}
                onClick={() => setPageNumber(prev => Math.min(numPages, prev + 1))}
                className="w-5 h-5 rounded bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Divider */}
            <div className="h-3 w-[1px] bg-white/10" />

            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <button
                disabled={zoom <= 0.6}
                onClick={() => setZoom(prev => Math.max(0.6, prev - 0.2))}
                className="w-5 h-5 rounded bg-white/5 border border-white/10 flex items-center justify-center hover:text-white cursor-pointer"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
              <span className="text-zinc-400">{Math.round(zoom * 100)}%</span>
              <button
                disabled={zoom >= 2.5}
                onClick={() => setZoom(prev => Math.min(2.5, prev + 0.2))}
                className="w-5 h-5 rounded bg-white/5 border border-white/10 flex items-center justify-center hover:text-white cursor-pointer"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
              <button
                onClick={() => setZoom(1.0)}
                className="w-5 h-5 rounded bg-white/5 border border-white/10 flex items-center justify-center hover:text-white cursor-pointer"
                title="Reset zoom"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            {/* Contrast dark-mode filter */}
            <div className="h-3 w-[1px] bg-white/10" />
            <button
              onClick={() => setHighContrastDark(!highContrastDark)}
              className={`flex items-center gap-1 py-1 px-2.5 rounded-lg border transition-all cursor-pointer ${
                highContrastDark 
                  ? "bg-zinc-800/40 text-violet-300 border-violet-500/20" 
                  : "bg-transparent text-zinc-500 border-white/5"
              }`}
            >
              <Eye className="w-3 h-3" />
              {highContrastDark ? "Contrast Dark" : "Standard"}
            </button>
          </div>
        )}

        {/* Right Controls: Quick toggle fallback */}
        <div className="flex items-center gap-2">
          <a
            href={directPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300 transition-all font-bold uppercase tracking-wider"
          >
            <Maximize2 className="w-3 h-3" />
            External Open
          </a>
        </div>
      </div>

      {/* 🖼️ MAIN RENDER VIEWER DISPLAY */}
      <div className="flex-1 w-full h-full min-h-0 overflow-y-auto relative flex items-center justify-center p-4">
        
        {/* Loading Spinner overlay */}
        {loading && viewerLayer !== "external" && (
          <div className="absolute inset-0 z-20 bg-zinc-950/80 flex flex-col items-center justify-center gap-4">
            <div className="w-8 h-8 rounded-full border border-t-cyan-400 border-white/5 animate-spin" />
            <div className="text-center space-y-1.5 font-mono text-[9px] uppercase tracking-widest text-zinc-400">
              <p>Establishing secure archive stream...</p>
              {(viewerLayer === "proxy" || viewerLayer === "gview" || viewerLayer === "preview") && (
                <button
                  onClick={triggerClientFallback}
                  className="mt-2 text-sky-400 hover:text-white underline cursor-pointer text-[8px]"
                >
                  Taking too long? Swap to Local Render
                </button>
              )}
            </div>
          </div>
        )}

        {/* LAYER 0: Same-origin proxy stream — works for ALL files, no iframe blocks */}
        {viewerLayer === "proxy" && (
          <iframe
            key={cleanFileId + "-proxy"}
            src={proxyUrl}
            onLoad={() => setLoading(false)}
            onError={() => {
              console.warn("Proxy load failed, trying Drive preview.");
              setViewerLayer("preview");
              setLoading(true);
            }}
            className="w-full h-full border-0 relative z-10"
            title={fileName || "Document Viewer"}
          />
        )}

        {/* LAYER 1: Native Google Drive /preview */}
        {viewerLayer === "preview" && (
          <iframe
            key={cleanFileId + "-preview"}
            src={previewUrl}
            onLoad={() => setLoading(false)}
            onError={() => {
              console.warn("Drive Preview failed, trying gview fallback.");
              setViewerLayer("gview");
              setLoading(true);
            }}
            className="w-full h-full border-0 relative z-10"
            title="Google Drive Preview"
            allow="autoplay"
          />
        )}

        {/* LAYER 1.5: Google GView Iframe (fallback) */}
        {viewerLayer === "gview" && (
          <iframe
            key={cleanFileId + "-gview"}
            src={gviewUrl}
            onLoad={() => setLoading(false)}
            onError={() => {
              console.warn("GView failed, falling back to react-pdf canvas.");
              triggerClientFallback();
            }}
            className="w-full h-full border-0 relative z-10"
            title="Google Docs Cloud Viewer"
          />
        )}

        {/* LAYER 2: Client Canvas react-pdf fallback */}
        {viewerLayer === "canvas" && isClient && (
          <div className="max-w-full flex justify-center py-4 relative z-10">
            <Document
              file={proxyUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="w-6 h-6 rounded-full border border-t-violet-400 border-white/5 animate-spin" />
                  <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider animate-pulse">
                    Decrypting local PDF cache...
                  </span>
                </div>
              }
            >
              <div 
                className={`transition-all duration-300 rounded-xl overflow-hidden shadow-2xl border border-white/10 ${
                  highContrastDark ? "invert hue-rotate-180 brightness-95 contrast-125" : ""
                }`}
                style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
              >
                <Page 
                  pageNumber={pageNumber} 
                  width={Math.min(window.innerWidth - 600, 750)}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </div>
            </Document>
          </div>
        )}

        {/* LAYER 3: Futuristic External Fallback Panel */}
        {viewerLayer === "external" && (
          <div className="glass-panel border border-red-500/25 bg-red-500/[0.02] shadow-[0_0_20px_rgba(239,68,68,0.05)] rounded-2xl p-8 max-w-md w-full text-center space-y-5 relative z-10 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div className="space-y-2">
              <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-white">
                Archival Preview Link Restricted
              </h4>
              <p className="text-[9px] font-mono text-zinc-500 leading-relaxed">
                Google Drive's active security firewalls or strict browser cookies blocked direct embedded embedding. 
                Bypass this firewall by opening the PDF directly inside Google Drive.
              </p>
            </div>
            <a
              href={directPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500/15 to-violet-500/15 border border-red-500/30 text-[10px] font-mono font-bold uppercase tracking-wider text-red-400 hover:from-red-500/25 hover:to-violet-500/25 transition-all cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.08)]"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              Open PDF in Drive Portal
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
