/**
 * PHYSICSVAULT — Interstellar Cosmic SaaS Studio
 * Designed and Developed by Leo Sandal
 *
 * Website: PhysicsVault · physicsvault.online
 * Author Email: poosalapati.leosandal@gmail.com
 */

"use client";

import { useEffect, useState } from "react";
import { LogIn, LogOut, Menu, X, Rocket, Shield, LayoutDashboard, Atom } from "lucide-react";

export default function Navbar({ onAuthClick, user, onLogout }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Home",     href: "#" },
    { label: "Features", href: "#features" },
    { label: "Pricing",  href: "#pricing" },
    { label: "Reviews",  href: "#reviews" },
    { label: "Contact",  href: "#contact" },
  ];

  return (
    <div className="fixed top-0 inset-x-0 z-50 flex flex-col">

      {/* ── Top Info Banner ── */}
      <div
        className="w-full border-b border-white/[0.04] py-2 px-6 flex justify-center items-center"
        style={{ background: "rgba(0,0,10,0.8)" }}
      >
        <div className="max-w-7xl w-full flex justify-between items-center text-[8px] font-mono tracking-[0.2em] text-[#8888AA] uppercase font-bold">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Sim System: Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            Designed by{" "}
            <span
              className="font-extrabold bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(90deg, #E8A020, #FF6B35, #C4A8F0)" }}
            >
              Leo Sandal
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>SECURE TERMINAL</span>
          </div>
        </div>
      </div>

      {/* ── Main Navbar ── */}
      <nav
        className={`w-full transition-all duration-500 ease-in-out ${
          isScrolled
            ? "py-3 border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.9)]"
            : "py-7 bg-transparent"
        }`}
        style={isScrolled ? { background: "rgba(0,0,10,0.75)", backdropFilter: "blur(20px)" } : {}}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">

          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div
              className="relative w-8 h-8 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300"
              style={{
                background: "linear-gradient(135deg, #E8A020, #FF6B35)",
                boxShadow: "0 0 18px rgba(232,160,32,0.35)",
              }}
            >
              <span className="font-display font-bold text-white text-sm">⚛</span>
              <div
                className="absolute inset-0 rounded-lg blur opacity-40 group-hover:opacity-70 transition-opacity"
                style={{ background: "linear-gradient(135deg, #E8A020, #FF6B35)" }}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-lg tracking-wider leading-none" style={{ fontFamily: "var(--font-display)" }}>
                <span className="text-[#F0F0FF]">PHYSICS</span>
                <span style={{ color: "#E8A020" }}>VAULT</span>
              </span>
              <span className="text-[7px] font-mono tracking-widest text-[#8888AA] uppercase mt-0.5">
                physicsvault.online
              </span>
            </div>
          </a>

          {/* Center Nav Links */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="relative text-xs uppercase tracking-widest text-[#8888AA] hover:text-[#F0F0FF] transition-colors py-1 group font-medium"
              >
                {link.label}
                <span
                  className="absolute bottom-0 left-0 w-0 h-[1.5px] transition-all duration-300 group-hover:w-full"
                  style={{ background: "#E8A020", boxShadow: "0 0 6px rgba(232,160,32,0.6)" }}
                />
              </a>
            ))}
          </div>

          {/* Right: Auth Buttons */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <a
                    href="/dashboard"
                    className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg border transition-all cursor-pointer"
                    style={{
                      background: "rgba(232,160,32,0.08)",
                      border: "1px solid rgba(232,160,32,0.25)",
                      color: "#E8A020",
                      boxShadow: "0 0 12px rgba(232,160,32,0.08)",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "rgba(232,160,32,0.16)";
                      e.currentTarget.style.boxShadow = "0 0 20px rgba(232,160,32,0.18)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "rgba(232,160,32,0.08)";
                      e.currentTarget.style.boxShadow = "0 0 12px rgba(232,160,32,0.08)";
                    }}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard
                  </a>
                  <span className="text-xs text-[#8888AA] flex items-center gap-1.5 bg-white/[0.03] border border-white/10 px-3 py-1 rounded-full">
                    <Shield className="w-3.5 h-3.5" style={{ color: "#E8A020" }} />
                    {user.email}
                    <span
                      className={`ml-2 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        user.tier === "titan"
                          ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                          : user.tier === "aspirant"
                          ? "bg-amber-500/20 border border-amber-500/30"
                          : "bg-zinc-500/20 text-zinc-500 border border-zinc-500/30"
                      }`}
                      style={user.tier === "aspirant" ? { color: "#E8A020" } : {}}
                    >
                      {user.tier || "free"}
                    </span>
                  </span>
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-1.5 text-xs text-[#8888AA] hover:text-white border border-white/10 px-4 py-2 rounded-lg bg-white/[0.03] hover:bg-red-500/10 hover:border-red-500/20 transition-all cursor-pointer font-medium uppercase tracking-wider"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => onAuthClick("login")}
                    className="text-xs font-semibold uppercase tracking-wider text-[#8888AA] hover:text-[#F0F0FF] transition-colors cursor-pointer px-4 py-2"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => onAuthClick("signup")}
                    className="relative overflow-hidden group px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider cursor-pointer shadow-lg transition-all hover:scale-105"
                    style={{
                      background: "linear-gradient(135deg, #E8A020, #FF6B35)",
                      color: "#ffffff",
                      boxShadow: "0 0 20px rgba(232,160,32,0.4)",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 35px rgba(232,160,32,0.6)"; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 20px rgba(232,160,32,0.4)"; }}
                  >
                    Enter the Vault <Rocket className="inline w-3 h-3 ml-1" />
                  </button>
                </>
              )}
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-[#8888AA] hover:text-[#F0F0FF] p-1 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Full-Screen Overlay ── */}
        {mobileMenuOpen && (
          <div
            className="md:hidden absolute top-full left-0 w-full border-b border-white/10 py-8 px-6 flex flex-col gap-6"
            style={{ background: "rgba(0,0,10,0.96)", backdropFilter: "blur(24px)" }}
          >
            <div className="flex flex-col gap-5">
              {user && (
                <a
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-sm tracking-wider font-bold transition-colors"
                  style={{ color: "#E8A020" }}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Study Dashboard
                </a>
              )}
              {navLinks.map((link, i) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg tracking-wider text-[#8888AA] hover:text-[#F0F0FF] transition-colors font-medium"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="h-[1px] bg-white/8 w-full" />

            <div className="flex flex-col gap-3">
              {user ? (
                <>
                  <span className="text-xs text-[#8888AA] block truncate font-mono">
                    Logged in as: {user.email}
                  </span>
                  <button
                    onClick={() => { setMobileMenuOpen(false); onLogout(); }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/20 bg-red-500/5 text-xs font-semibold text-red-400"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { setMobileMenuOpen(false); onAuthClick("login"); }}
                    className="w-full py-3.5 rounded-full border border-white/15 text-sm font-semibold text-[#8888AA] hover:text-white bg-white/[0.04] text-center transition-all"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); onAuthClick("signup"); }}
                    className="w-full py-3.5 rounded-full text-sm font-bold text-white text-center shadow-lg"
                    style={{
                      background: "linear-gradient(135deg, #E8A020, #FF6B35)",
                      boxShadow: "0 0 20px rgba(232,160,32,0.35)",
                    }}
                  >
                    Enter the Vault →
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}
