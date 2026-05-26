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
          opacity: Math.random() * 0.55 + 0.25,
          color: Math.random() > 0.88 ? "#38bdf8" : Math.random() > 0.95 ? "#a78bfa" : "#ffffff",
          twinkleSpeed: Math.random() * 0.008 + 0.002, // Slower twinkling for premium feel
          twinkleDir: Math.random() > 0.5 ? 1 : -1,
        });
      }
    };

    const initAccretionDisk = () => {
      accretionParticles = [];
      // Slower, cleaner particle count to avoid visual noise (exactly 260 particles)
      const particleCount = 260;
      for (let i = 0; i < particleCount; i++) {
        const distance = Math.random() * 160 + 80; // Stable orbits
        const angle = Math.random() * Math.PI * 2;
        // Slow cinematic velocity curve
        const orbitSpeed = (1 / Math.sqrt(distance)) * 0.42; 
        
        accretionParticles.push({
          distance,
          angle,
          orbitSpeed,
          size: Math.random() * 1.3 + 0.35,
          // Hot cosmic indigo, soft violet, and glowing electric blue
          color: Math.random() > 0.55 
            ? "rgba(56, 189, 248, " // Sky Blue
            : Math.random() > 0.3 
            ? "rgba(139, 92, 246, "  // Violet
            : "rgba(99, 102, 241, ", // Indigo
          noiseOffset: Math.random() * 100,
        });
      }
    };

    const handleMouseMove = (e) => {
      // Extremely gentle mouse reactive depth
      mouse.targetX = (e.clientX - window.innerWidth / 2) * 0.04;
      mouse.targetY = (e.clientY - window.innerHeight / 2) * 0.04;
    };

    const draw = () => {
      time += 0.0018; // Cinematic slow clock
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Smooth mouse coordination ease
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      const cx = canvas.width / 2 + mouse.x * 0.25;
      const cy = canvas.height / 2 + mouse.y * 0.25;

      // Deep space background nebula haze (indigo/blue shades)
      const nebulaGrad = ctx.createRadialGradient(cx, cy, 60, cx, cy, canvas.width * 0.7);
      nebulaGrad.addColorStop(0, "rgba(8, 8, 36, 0.35)");
      nebulaGrad.addColorStop(0.5, "rgba(4, 4, 18, 0.12)");
      nebulaGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = nebulaGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 1. Render Twinkling Stars
      stars.forEach((star) => {
        const posX = (star.x + mouse.x * (star.size * 0.3) + canvas.width) % canvas.width;
        const posY = (star.y + mouse.y * (star.size * 0.3) + canvas.height) % canvas.height;

        star.opacity += star.twinkleSpeed * star.twinkleDir;
        if (star.opacity > 0.8 || star.opacity < 0.15) star.twinkleDir *= -1;

        ctx.beginPath();
        ctx.arc(posX, posY, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = Math.max(0.1, Math.min(0.8, star.opacity));
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // 2. MATHEMATICAL RELATIVISTIC BLACK HOLE ACCRETION DISC
      const singularityRadius = 60; // Clean, massive center

      accretionParticles.forEach((p) => {
        p.angle += p.orbitSpeed;

        const cosA = Math.cos(p.angle);
        const sinA = Math.sin(p.angle);

        // Standard flat coordinate plane
        const planX = p.distance * cosA;
        const planY = p.distance * sinA * 0.15; // Sleek thin disc

        // Deflection bending for particles passing behind event horizon
        const isBehind = sinA < 0;
        let lensedX = planX;
        let lensedY = planY;

        if (isBehind) {
          lensedY = planY + (planX > 0 ? -1 : 1) * Math.sin(time + p.noiseOffset) * 1.5 - (singularityRadius + p.distance * 0.18) * (planX > 0 ? 1 : -1) * 0.38;
          lensedX = planX * 1.12;
        }

        const drawX = cx + lensedX;
        const drawY = cy + lensedY;

        ctx.beginPath();
        ctx.arc(drawX, drawY, p.size, 0, Math.PI * 2);
        
        // Soft, highly refined alpha values (never blinding or chaotic)
        const distancePercent = Math.max(0.08, 1 - (p.distance - 80) / 160);
        ctx.fillStyle = `${p.color}${distancePercent * 0.58})`;
        ctx.shadowBlur = p.size > 1.1 ? 6 : 0;
        ctx.shadowColor = p.color.includes("139") ? "#8b5cf6" : "#38bdf8";
        ctx.fill();
      });
      ctx.shadowBlur = 0;

      // 3. Central Event Horizon (Pitch-black mathematical singularity absorbing all photons)
      const singularityGrad = ctx.createRadialGradient(cx, cy, singularityRadius * 0.88, cx, cy, singularityRadius);
      singularityGrad.addColorStop(0, "#000000");
      singularityGrad.addColorStop(0.98, "#000000");
      singularityGrad.addColorStop(1, "rgba(99, 102, 241, 0.12)"); // Soft indigo event boundary edge

      ctx.beginPath();
      ctx.arc(cx, cy, singularityRadius, 0, Math.PI * 2);
      ctx.fillStyle = singularityGrad;
      ctx.fill();

      // Relativistic Lensing boundary accent line
      ctx.beginPath();
      ctx.arc(cx, cy, singularityRadius + 1, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(99, 102, 241, 0.18)";
      ctx.lineWidth = 1.5;
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
      
      {/* Dynamic Vignette Mask to shield foreground text readability (Vignette + dark overlays) */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,rgba(0,0,0,0)_40%,#030303_100%] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#030303]/85 via-transparent to-[#030303]/90 pointer-events-none" />
      
    </div>
  );
}
