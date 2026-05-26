"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
} from "firebase/auth";
import { Mail, Lock, Eye, EyeOff, Sparkles } from "lucide-react";
import { auth, upgradeUserTier } from "@/lib/firebase";
import SpaceBackground from "@/components/SpaceBackground";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setSuccessMsg("Access Granted. Opening Study Cockpit...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1200);
    } catch (error) {
      setErrorMsg(error.message || "Invalid credentials. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Upgrade tier locally if it doesn't exist
      upgradeUserTier(result.user.uid, "free");

      setSuccessMsg("Google Sign-In Successful! Navigating...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error) {
      setErrorMsg(error.message || "Google Sign-In failed.");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center px-4 overflow-hidden select-none">
      
      {/* Absolute Space Background Visuals */}
      <SpaceBackground />

      {/* Transparent Readability Overlay */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none z-1" />

      {/* Login Form Container */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#090915]/90 p-8 md:p-10 shadow-[0_0_50px_rgba(139,92,246,0.25)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500 z-10">
        
        {/* Ambient Neon Backlight Highlights */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Back Link to Home */}
        <button 
          onClick={() => router.push("/")}
          className="absolute top-5 left-5 text-zinc-500 hover:text-white transition-colors text-xs font-mono tracking-wider uppercase cursor-pointer"
        >
          ← Home
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 rounded-full bg-violet-500/10 border border-violet-500/30 flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6 text-sky-400 animate-pulse" />
          </div>
          <h1 className="font-display font-extrabold text-2xl md:text-3xl tracking-wider text-white">
            Welcome Back
          </h1>
          <p className="text-xs text-zinc-400 mt-1.5 font-medium">
            Enter your credentials to access your academic flightdeck.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* Email Input */}
          <div className="space-y-1">
            <label className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase">
              STUDENT EMAIL ADDRESS
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@physicsvault.edu"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-sky-400 transition-all font-medium"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase">
              SECURE ACCESS PASSWORD
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-10 pr-10 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-sky-400 transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Options Row */}
          <div className="flex items-center justify-between text-xs py-1">
            <label className="flex items-center gap-2 text-zinc-400 hover:text-zinc-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-zinc-700 bg-black/40 text-violet-500 focus:ring-0 cursor-pointer"
              />
              Remember me
            </label>
            <a href="#" className="text-sky-400 hover:underline">
              Reset password?
            </a>
          </div>

          {/* Errors/Success Feedback */}
          {errorMsg && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-center font-medium">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="text-xs text-sky-400 bg-sky-500/10 border border-sky-500/20 p-3 rounded-xl text-center font-medium">
              {successMsg}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-sky-400 to-violet-500 hover:from-sky-500 hover:to-violet-600 text-white font-semibold text-xs uppercase tracking-wider py-3.5 rounded-xl cursor-pointer shadow-lg hover:shadow-sky-500/25 transition-all duration-300 hover:scale-102 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5" />
          </div>
          <span className="relative bg-[#090915] px-3 text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
            OR SECURELY SIGN IN WITH
          </span>
        </div>

        {/* Google Authentication Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 font-semibold text-xs uppercase tracking-wider py-3.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continue with Google
        </button>

        {/* Footer Toggle */}
        <div className="text-center mt-6 text-xs text-zinc-500 font-medium">
          New to PhysicsVault?{" "}
          <button 
            type="button" 
            onClick={() => router.push("/signup")} 
            className="text-sky-400 hover:underline font-bold"
          >
            Sign Up
          </button>
        </div>

      </div>
    </div>
  );
}
