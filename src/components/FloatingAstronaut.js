"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

export default function FloatingAstronaut() {
  const { scrollYProgress } = useScroll();
  const [windowWidth, setWindowWidth] = useState(1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Determine path of the astronaut based on viewport width
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  // Custom paths for scrollytelling positions
  // Scroll 0 (Hero): Floating on top right
  // Scroll 0.3 (Features): Float left, scale up, rotate
  // Scroll 0.7+ (Pricing): Lock next to pricing, scale slightly, looking at cards
  
  const x = useTransform(
    scrollYProgress,
    [0, 0.35, 0.7, 1],
    isMobile
      ? ["35%", "-35%", "0%", "20%"] // Mobile coords
      : isTablet
      ? ["40%", "-40%", "35%", "25%"] // Tablet coords
      : ["42vw", "-32vw", "30vw", "32vw"] // Widescreen coords
  );

  const y = useTransform(
    scrollYProgress,
    [0, 0.35, 0.7, 1],
    isMobile
      ? ["10vh", "38vh", "65vh", "85vh"]
      : ["12vh", "40vh", "72vh", "82vh"]
  );

  const scale = useTransform(
    scrollYProgress,
    [0, 0.35, 0.7, 1],
    isMobile ? [0.6, 0.7, 0.75, 0.6] : [0.75, 0.9, 1.05, 0.8]
  );

  const rotate = useTransform(
    scrollYProgress,
    [0, 0.35, 0.7, 1],
    [5, -22, 12, -8]
  );

  const glowOpacity = useTransform(
    scrollYProgress,
    [0, 0.35, 0.7, 1],
    [0.1, 0.25, 0.4, 0.2]
  );

  return (
    <motion.div
      className="fixed top-0 left-1/2 z-40 pointer-events-none origin-center"
      style={{
        x,
        y,
        scale,
        rotate,
      }}
    >
      <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center">
        {/* Soft custom backdrop spotlight */}
        <motion.div 
          className="absolute inset-4 rounded-full bg-violet-600/30 filter blur-3xl mix-blend-screen scale-75"
          style={{ opacity: glowOpacity }}
        />

        {/* Floating astronaut image with parallax animation */}
        <motion.div
          className="w-full h-full relative"
          animate={{
            y: [0, -12, 0],
            rotate: [0, 2, -1, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Image
            src="/astronaut.png"
            alt="Cosmic Navigator Astronaut"
            width={400}
            height={400}
            className="object-contain drop-shadow-[0_0_40px_rgba(139,92,246,0.3)] filter contrast-105"
            priority
          />
        </motion.div>

        {/* Subtitle tag floating above him */}
        <motion.div
          className="absolute -top-6 left-1/2 -translate-x-1/2 px-3 py-1 text-[10px] font-mono tracking-widest uppercase bg-space-black/80 backdrop-blur-md border border-sky-500/30 rounded-full text-sky-400 whitespace-nowrap shadow-lg shadow-sky-500/10"
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          SIM_SYSTEM: ACTIVE
        </motion.div>
      </div>
    </motion.div>
  );
}
