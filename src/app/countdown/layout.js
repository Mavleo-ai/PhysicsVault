import { Space_Grotesk, Orbitron, Inter } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

const orbitron = Orbitron({
  variable: "--font-countdown",
  subsets: ["latin"],
  weight: ["900"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata = {
  title: "JEE Clock — Every Day Counts",
  description: "A minimal, intense countdown clock tracking days remaining for JEE 2027 and JEE 2028.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function CountdownLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${orbitron.variable} ${inter.variable} h-full dark`}
      style={{ scrollBehavior: "smooth" }}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#0A0A0F" />
      </head>
      <body className="min-h-full bg-[#0A0A0F] text-[#F0F0F0] antialiased select-none overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
