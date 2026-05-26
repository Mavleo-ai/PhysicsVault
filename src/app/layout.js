import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata = {
  title: "PhysicsVault — Futuristic Cosmic SaaS Studio",
  description: "Next-gen physics simulator and study hub with cinema-grade space visualizers.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased dark`}
      style={{ scrollBehavior: "smooth" }}
    >
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-full flex flex-col bg-[#030303] text-[#f8fafc] font-sans selection:bg-violet-500/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
