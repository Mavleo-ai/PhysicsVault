/**
 * PHYSICSVAULT — Interstellar Cosmic SaaS Studio
 * Designed and Developed by Leo Sandal
 *
 * Website: PhysicsVault · physicsvault.online
 * Author Email: poosalapati.leosandal@gmail.com
 */

import { Inter, Orbitron, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// PDR Heading Font: Orbitron — space/sci-fi feel, weight 700
const orbitron = Orbitron({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

// PDR Mono Font: JetBrains Mono — timers, counters, formulas
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "PhysicsVault — The Universe of JEE Physics. One Vault.",
  description:
    "All-in-one JEE/NEET Physics study platform. Books, Pomodoro Timer, AI Doubt Solver, Study Tracker & Strategies — all at ₹99/month.",
  keywords: ["JEE Physics", "NEET", "study platform", "AI doubt solver", "physics notes"],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${orbitron.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
      style={{ scrollBehavior: "smooth" }}
    >
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#00000A" />
      </head>
      <body
        className="min-h-full flex flex-col bg-[#00000A] text-[#F0F0FF] font-sans selection:bg-amber-500/30 selection:text-white"
        style={{ fontFamily: "var(--font-inter), sans-serif" }}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
