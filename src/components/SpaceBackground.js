"use client";

import { useEffect, useRef } from "react";

export default function SpaceBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let stars = [];
    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      stars = [];
      const count = Math.min(250, Math.floor((canvas.width * canvas.height) / 6000));
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.8 + 0.2,
          speed: Math.random() * 0.05 + 0.01,
          opacity: Math.random() * 0.7 + 0.3,
          color: Math.random() > 0.8 ? "#38bdf8" : Math.random() > 0.9 ? "#a78bfa" : "#ffffff",
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinkleDir: Math.random() > 0.5 ? 1 : -1,
        });
      }
    };

    const handleMouseMove = (e) => {
      mouse.targetX = (e.clientX - window.innerWidth / 2) * 0.08;
      mouse.targetY = (e.clientY - window.innerHeight / 2) * 0.08;
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Smooth mouse coordinate ease
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Draw background cosmic purple-blue nebula dust
      const gradient = ctx.createRadialGradient(
        canvas.width / 2 + mouse.x * 0.5,
        canvas.height / 2 + mouse.y * 0.5,
        0,
        canvas.width / 2 + mouse.x * 0.5,
        canvas.height / 2 + mouse.y * 0.5,
        canvas.width * 0.8
      );
      gradient.addColorStop(0, "rgba(8, 8, 28, 0.45)");
      gradient.addColorStop(0.5, "rgba(4, 4, 16, 0.25)");
      gradient.addColorStop(1, "rgba(3, 3, 3, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render stars with interactive parallax
      stars.forEach((star) => {
        // Adjust star coordinates based on scroll and mouse position
        const posX = (star.x + mouse.x * (star.size * 0.5) + canvas.width) % canvas.width;
        const posY = (star.y + mouse.y * (star.size * 0.5) + canvas.height) % canvas.height;

        // Twinkle opacity
        star.opacity += star.twinkleSpeed * star.twinkleDir;
        if (star.opacity > 1 || star.opacity < 0.2) {
          star.twinkleDir *= -1;
        }

        ctx.beginPath();
        ctx.arc(posX, posY, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.opacity;
        ctx.shadowBlur = star.size > 1.2 ? 6 : 0;
        ctx.shadowColor = star.color;
        ctx.fill();
      });

      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);

    resizeCanvas();
    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-black">
      {/* Dynamic Canvas Stars */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
      
      {/* Majestic Interstellar Accretion Disk Backhole Background Overlay */}
      <div 
        className="absolute w-[200vw] h-[200vw] md:w-[130vw] md:h-[130vw] lg:w-[100vw] lg:h-[100vw] rounded-full top-[10%] left-1/2 -translate-x-1/2 opacity-25 filter blur-[2px] animate-spin-slow pointer-events-none mix-blend-screen bg-cover bg-center select-none"
        style={{ backgroundImage: `url('/blackhole.png')` }}
      />
      <div className="absolute inset-0 bg-radial-[circle_at_center,rgba(0,0,0,0)_60%,#030303_100%] pointer-events-none" />
    </div>
  );
}
