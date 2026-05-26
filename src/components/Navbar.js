"use client";

import { useEffect, useState } from "react";
import { LogIn, LogOut, Menu, X, Rocket, Shield } from "lucide-react";

export default function Navbar({ onAuthClick, user, onLogout }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ease-in-out ${
        isScrolled
          ? "py-3 bg-black/60 backdrop-blur-md border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.8)]"
          : "py-6 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Left Side: Logo */}
        <a href="#" className="flex items-center gap-2 group">
          <div className="relative w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:scale-105 transition-transform duration-300">
            <span className="font-display font-bold text-white text-sm">PV</span>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-sky-500 to-violet-600 blur opacity-40 group-hover:opacity-80 transition-opacity" />
          </div>
          <span className="font-display font-extrabold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
            PHYSICS<span className="text-sky-400 font-medium">VAULT</span>
          </span>
        </a>

        {/* Center: Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: "Home", href: "#" },
            { label: "Features", href: "#features" },
            { label: "Pricing", href: "#pricing" },
            { label: "About", href: "#about" },
            { label: "Contact", href: "#contact" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="relative text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors py-1 group font-medium"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-sky-400 transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* Right Side: Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-xs text-zinc-400 flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                <Shield className="w-3.5 h-3.5 text-sky-400" />
                {user.email}
              </span>
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white border border-white/10 px-4 py-2 rounded-lg bg-white/5 hover:bg-red-500/10 hover:border-red-500/20 transition-all cursor-pointer font-medium uppercase tracking-wider"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => onAuthClick("login")}
                className="text-xs font-semibold uppercase tracking-wider text-zinc-300 hover:text-white transition-colors cursor-pointer px-4 py-2"
              >
                Login
              </button>
              <button
                onClick={() => onAuthClick("signup")}
                className="relative overflow-hidden group px-5 py-2.5 rounded-lg bg-white text-black font-semibold text-xs uppercase tracking-wider cursor-pointer shadow-lg hover:shadow-sky-500/20 transition-all hover:scale-102"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />
                <span className="relative z-10 group-hover:text-white transition-colors flex items-center gap-1">
                  Sign Up <Rocket className="w-3 h-3" />
                </span>
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-zinc-400 hover:text-white p-1"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-lg border-b border-white/10 py-6 px-6 flex flex-col gap-5 animate-in fade-in slide-in-from-top-5 duration-300">
          <div className="flex flex-col gap-4">
            {[
              { label: "Home", href: "#" },
              { label: "Features", href: "#features" },
              { label: "Pricing", href: "#pricing" },
              { label: "About", href: "#about" },
              { label: "Contact", href: "#contact" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm tracking-wider text-zinc-400 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="h-[1px] bg-white/10 w-full" />

          <div className="flex flex-col gap-3">
            {user ? (
              <>
                <span className="text-xs text-zinc-500 block truncate">
                  Logged in as: {user.email}
                </span>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-red-500/20 bg-red-500/5 text-xs font-semibold text-red-400"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onAuthClick("login");
                  }}
                  className="w-full py-3 rounded-lg border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white bg-white/5 text-center"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onAuthClick("signup");
                  }}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-sky-400 to-violet-500 text-xs font-semibold text-white shadow-lg text-center"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
