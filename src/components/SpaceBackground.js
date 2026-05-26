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
    let accretionParticles = [];
    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let time = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
      initAccretionDisk();
    };

    const initStars = () => {
      stars = [];
      const count = Math.min(180, Math.floor((canvas.width * canvas.height) / 10000));
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.2 + 0.15,
          opacity: Math.random() * 0.6 + 0.2,
          color: Math.random() > 0.88 ? "#38bdf8" : Math.random() > 0.95 ? "#a78bfa" : "#ffffff",
          twinkleSpeed: Math.random() * 0.008 + 0.0025,
          twinkleDir: Math.random() > 0.5 ? 1 : -1,
        });
      }
    };

    const initAccretionDisk = () => {
      accretionParticles = [];
      const particleCount = 280; // Optimized clean density
      for (let i = 0; i < particleCount; i++) {
        const distance = Math.random() * 160 + 80;
        const angle = Math.random() * Math.PI * 2;
        // Keplerian velocity: v = 1 / sqrt(r)
        const orbitSpeed = (1 / Math.sqrt(distance)) * 0.38; // Cinematic slow motion
        
        // Relativistic Interstellar Matter: 100% warm orange-amber cosmic dust particles
        const rand = Math.random();
        let colorType = "";
        let glowColor = "";

        if (rand < 0.7) {
          colorType = "rgba(249, 115, 22, "; // Orange-Amber matter
          glowColor = "#f97316";
        } else {
          colorType = "rgba(251, 146, 60, "; // Hot light orange matter
          glowColor = "#fb923c";
        }

        accretionParticles.push({
          distance,
          angle,
          orbitSpeed,
          size: Math.random() * 1.35 + 0.4,
          color: colorType,
          glow: glowColor,
          noiseOffset: Math.random() * 100,
        });
      }
    };

    const handleMouseMove = (e) => {
      mouse.targetX = (e.clientX - window.innerWidth / 2) * 0.045;
      mouse.targetY = (e.clientY - window.innerHeight / 2) * 0.045;
    };

    const draw = () => {
      time += 0.0022; // Cinematic slow clock
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Smooth mouse coordination ease
      mouse.x += (mouse.targetX - mouse.x) * 0.045;
      mouse.y += (mouse.targetY - mouse.y) * 0.045;

      const cx = canvas.width / 2 + mouse.x * 0.25;
      const cy = canvas.height / 2 + mouse.y * 0.25;

      // Dark space background nebula haze (deep dark-blue shades)
      const nebulaGrad = ctx.createRadialGradient(cx, cy, 60, cx, cy, canvas.width * 0.75);
      nebulaGrad.addColorStop(0, "rgba(8, 8, 32, 0.3)");
      nebulaGrad.addColorStop(0.5, "rgba(3, 3, 15, 0.1)");
      nebulaGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = nebulaGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 1. Render Stars
      stars.forEach((star) => {
        const posX = (star.x + mouse.x * (star.size * 0.3) + canvas.width) % canvas.width;
        const posY = (star.y + mouse.y * (star.size * 0.3) + canvas.height) % canvas.height;

        star.opacity += star.twinkleSpeed * star.twinkleDir;
        if (star.opacity > 0.85 || star.opacity < 0.15) star.twinkleDir *= -1;

        ctx.beginPath();
        ctx.arc(posX, posY, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = Math.max(0.1, Math.min(0.85, star.opacity));
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // 2. MATHEMATICAL GARGANTUA ACCRETION DISK (ORANGE MATTER ACCRETION DISC)
      const singularityRadius = 61 + Math.sin(time * 2.5) * 1.5; // Pulsing core

      accretionParticles.forEach((p) => {
        p.angle += p.orbitSpeed;

        const cosA = Math.cos(p.angle);
        const sinA = Math.sin(p.angle);

        // Horizontal flattened orbital disc coordinates
        const planX = p.distance * cosA;
        const planY = p.distance * sinA * 0.15; // Sleek thin disc

        // Deflection bending for particles passing behind event horizon
        const isBehind = sinA < 0;
        let lensedX = planX;
        let lensedY = planY;

        if (isBehind) {
          lensedY = planY + (planX > 0 ? -1 : 1) * Math.sin(time + p.noiseOffset) * 1.5 - (singularityRadius + p.distance * 0.2) * (planX > 0 ? 1 : -1) * 0.4;
          lensedX = planX * 1.15;
        }

        const drawX = cx + lensedX;
        const drawY = cy + lensedY;

        ctx.beginPath();
        ctx.arc(drawX, drawY, p.size, 0, Math.PI * 2);
        
        const distancePercent = Math.max(0.1, 1 - (p.distance - 80) / 160);
        ctx.fillStyle = `${p.color}${distancePercent * 0.65})`;
        ctx.shadowBlur = p.size > 1.1 ? 6 : 0;
        ctx.shadowColor = p.glow;
        ctx.fill();
      });
      ctx.shadowBlur = 0;

      // 3. Central Opaque Horizon Singularity (glowing BRIGHT WHITE event boundary)
      const singularityGrad = ctx.createRadialGradient(cx, cy, singularityRadius * 0.88, cx, cy, singularityRadius);
      singularityGrad.addColorStop(0, "#000000");
      singularityGrad.addColorStop(0.96, "#000000");
      singularityGrad.addColorStop(1, "rgba(255, 255, 255, 0.98)"); // Glowing BRIGHT WHITE event boundary

      ctx.beginPath();
      ctx.arc(cx, cy, singularityRadius, 0, Math.PI * 2);
      ctx.fillStyle = singularityGrad;
      ctx.fill();

      // Relativistic deflection outline (Glowing BRIGHT WHITE gravity lensing ring wrapping center)
      ctx.beginPath();
      ctx.arc(cx, cy, singularityRadius + 1, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.88)";
      ctx.lineWidth = 2.2;
      ctx.stroke();

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
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-black select-none">
      
      {/* Dynamic Canvas Stars */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
      
      {/* Viewport Dark Vignette & Readability Shields */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,rgba(0,0,0,0)_38%,#030303_100%] pointer-events-none" />
      
      {/* EXACT USER SPECIFIED READABILITY OVERLAY: background: linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.55)) */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.55))"
        }}
      />
      
    </div>
  );
}
