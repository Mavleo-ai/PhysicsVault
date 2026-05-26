"use client";

import { useState, useEffect } from "react";
import { X, Mail, Lock, ShieldCheck, Eye, EyeOff, Sparkles, User } from "lucide-react";
import { auth, upgradeUserTier } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

export default function AuthModal({ isOpen, onClose, view = "login", onAuthSuccess }) {
  const [currentView, setCurrentView] = useState(view);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Sync currentView with initial view prop when modal opens
  useEffect(() => {
    setCurrentView(view);
    setErrorMsg("");
    setSuccessMsg("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  }, [view, isOpen]);

  // Dynamically calculate password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  }, [password]);

  if (!isOpen) return null;

  const handleAuth = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    if (currentView === "signup") {
      if (password !== confirmPassword) {
        setErrorMsg("Access keys do not match. Confirm correct decryption.");
        setLoading(false);
        return;
      }
      if (!agreeTerms) {
        setErrorMsg("You must agree to the Terms of Service.");
        setLoading(false);
        return;
      }
    }

    try {
      if (currentView === "login") {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        setSuccessMsg("Access Granted. Study Cockpit opening...");
        setTimeout(() => {
          onAuthSuccess(user);
          onClose();
        }, 1200);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Initialize default tier status
        upgradeUserTier(user.uid, "free");

        setSuccessMsg("Account Created! Welcome to PhysicsVault.");
        setTimeout(() => {
          onAuthSuccess(user);
          onClose();
        }, 1200);
      }
    } catch (err) {
      setErrorMsg(err.message || "An authorization error occurred. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStrengthLabel = () => {
    if (passwordStrength === 0) return { label: "Empty", color: "bg-zinc-800" };
    if (passwordStrength === 1) return { label: "Weak", color: "bg-red-500 neon-glow-red" };
    if (passwordStrength === 2) return { label: "Moderate", color: "bg-amber-500 neon-glow-amber" };
    if (passwordStrength === 3) return { label: "Strong", color: "bg-emerald-500 neon-glow-emerald" };
    return { label: "Academic Secure", color: "bg-sky-400 neon-glow-blue" };
  };

  const strength = getStrengthLabel();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Black Translucent Backdrop */}
      <div 
        className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
        onClick={onClose}
      />

      {/* Modal Dialog Body */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#090915]/90 p-8 shadow-[0_0_50px_rgba(139,92,246,0.25)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300 z-10">
        
        {/* Floating Neon Background Flares */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-violet-500/10 border border-violet-500/30 flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6 text-sky-400 animate-pulse" />
          </div>
          <h3 className="font-display font-extrabold text-xl tracking-wider text-white">
            {currentView === "login" ? "STUDENT PORTAL" : "CREATE STUDY ACCOUNT"}
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            {currentView === "login" 
              ? "Access your PhysicsVault academic cockpit." 
              : "Register as a student to start learning."}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleAuth} className="space-y-4 relative z-10">
          
          {/* Email input field */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
              STUDENT EMAIL ADDRESS
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@physicsvault.edu"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all font-medium"
              />
            </div>
          </div>

          {/* Password input field */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
              SECURE ACCESS PASSWORD
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password input field for signup */}
          {currentView === "signup" && (
            <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
                CONFIRM SECURE PASSWORD
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all font-medium"
                />
              </div>
            </div>
          )}

          {/* Password strength indicator for signup */}
          {currentView === "signup" && (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-zinc-500 uppercase">PASSWORD STRENGTH</span>
                <span className="text-sky-400 font-bold uppercase">{strength.label}</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-800/80 rounded-full overflow-hidden flex gap-[2px]">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-full flex-1 transition-all duration-300 rounded-full ${
                      passwordStrength >= step ? strength.color : "bg-zinc-800"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Options Row */}
          {currentView === "login" ? (
            <div className="flex items-center justify-between text-xs py-1">
              <label className="flex items-center gap-2 text-zinc-400 hover:text-zinc-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-zinc-700 bg-black/40 text-violet-500 focus:ring-0 cursor-pointer"
                />
                Remember login
              </label>
              <a href="#" className="text-sky-400 hover:underline">
                Reset password?
              </a>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 text-xs py-1.5">
              <input
                type="checkbox"
                id="agree"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded border-zinc-700 bg-black/40 text-violet-500 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="agree" className="text-zinc-400 cursor-pointer select-none">
                I agree to the{" "}
                <a href="#" className="text-sky-400 hover:underline">
                  Academic Terms of Service
                </a>{" "}
                and privacy protocol.
              </label>
            </div>
          )}

          {/* Feedback messages */}
          {errorMsg && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-center font-medium">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="text-xs text-sky-400 bg-sky-500/10 border border-sky-500/20 p-3 rounded-lg text-center font-medium">
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
              <>
                {currentView === "login" ? "ENTER PORTAL" : "CREATE ACCOUNT"}
              </>
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

        {/* Google Authentication */}
        <button
          onClick={async () => {
            setErrorMsg("");
            setLoading(true);
            try {
              const provider = new GoogleAuthProvider();
              const result = await signInWithPopup(auth, provider);
              
              // Initialize default tier status
              upgradeUserTier(result.user.uid, "free");

              setSuccessMsg("Google Sign-In Successful! Navigating...");
              setTimeout(() => {
                onAuthSuccess(result.user);
                onClose();
                setLoading(false);
              }, 1000);
            } catch (err) {
              setErrorMsg(err.message || "Google Sign-In failed.");
              setLoading(false);
            }
          }}
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
          Google Student Sign-In
        </button>

        {/* Footer Toggle */}
        <div className="text-center mt-6 text-xs text-zinc-500 font-medium">
          {currentView === "login" ? (
            <>
              New to PhysicsVault?{" "}
              <button 
                type="button" 
                onClick={() => setCurrentView("signup")} 
                className="text-sky-400 hover:underline font-bold"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already registered?{" "}
              <button 
                type="button" 
                onClick={() => setCurrentView("login")} 
                className="text-sky-400 hover:underline font-bold"
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
