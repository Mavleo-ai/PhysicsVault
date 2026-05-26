"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function SpaceStation() {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Get percentage offset from screen center
      const xOffset = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const yOffset = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      
      setCoords({ x: xOffset * 15, y: yOffset * 15 });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div 
      className="relative flex items-center justify-center w-72 h-72 md:w-96 md:h-96 pointer-events-auto"
      style={{ perspective: "1000px" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCoords({ x: 0, y: 0 });
      }}
    >
      {/* 3D Transform Wrapper */}
      <div 
        className="relative w-full h-full transition-transform duration-300 ease-out select-none"
        style={{
          transform: `rotateY(${coords.x}deg) rotateX(${-coords.y}deg) scale(${isHovered ? 1.08 : 1.02})`,
          transformStyle: "preserve-3d"
        }}
      >
        {/* Soft Cosmic Backglow */}
        <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-3xl mix-blend-screen scale-75 animate-pulse-slow" />
        
        {/* Glowing Nebula Ring */}
        <div className="absolute inset-2 border border-violet-500/20 rounded-full animate-[spin_40s_linear_infinite]" />
        <div className="absolute inset-8 border border-sky-500/10 border-dashed rounded-full animate-[spin_20s_linear_infinite_reverse]" />

        {/* Space Station Image Asset with Interactive Shadows */}
        <div className="relative w-full h-full flex items-center justify-center drop-shadow-[0_0_35px_rgba(56,189,248,0.25)]">
          <Image
            src="/station.png"
            alt="Endurance Space Station"
            width={380}
            height={380}
            className="object-contain animate-[spin_90s_linear_infinite]"
            priority
          />
        </div>

        {/* Dynamic Shadow / Reflection Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none rounded-full"
          style={{
            background: `radial-gradient(circle at ${50 + coords.x * 2}% ${50 + coords.y * 2}%, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.6) 80%)`,
            mixBlendMode: "overlay"
          }}
        />
      </div>

      {/* Futuristic Orbit Indicators */}
      <div className="absolute -inset-4 border border-white/5 rounded-full pointer-events-none" />
      <div className="absolute -inset-12 border border-white/2 rounded-full pointer-events-none" />
    </div>
  );
}
