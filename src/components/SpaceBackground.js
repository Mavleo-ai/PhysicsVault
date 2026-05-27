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
    let energyArcs = [];
    let dustClouds = [];
    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let time = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
      initAccretionDisk();
      initEnergyArcs();
      initDustClouds();
    };

    // Multi-layer deep star field with depth parallax
    const initStars = () => {
      stars = [];
      const count = Math.min(300, Math.floor((canvas.width * canvas.height) / 6000));
      for (let i = 0; i < count; i++) {
        const depth = Math.random(); // 0 = far, 1 = close
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: depth * 1.5 + 0.2,
          depth,
          opacity: Math.random() * 0.5 + 0.15,
          // Sci-fi color palette: whites, cyans, blues, purples
          color: Math.random() > 0.92
            ? "#00d9ff"
            : Math.random() > 0.88
            ? "#a78bfa"
            : Math.random() > 0.82
            ? "#38bdf8"
            : "#ffffff",
          twinkleSpeed: Math.random() * 0.012 + 0.003,
          twinkleDir: Math.random() > 0.5 ? 1 : -1,
          // Some stars pulse brighter (beacon stars)
          isBeacon: Math.random() > 0.97,
        });
      }
    };

    // Dual-layer accretion disk: hot inner orange + outer blue energy
    const initAccretionDisk = () => {
      accretionParticles = [];
      const particleCount = 350;
      for (let i = 0; i < particleCount; i++) {
        const distance = Math.random() * 200 + 65;
        const angle = Math.random() * Math.PI * 2;
        const orbitSpeed = (1 / Math.sqrt(distance)) * 0.32;

        // Inner ring = hot orange/white, outer ring = blue/cyan energy
        const isInner = distance < 140;
        let colorType, glowColor;

        if (isInner) {
          const rand = Math.random();
          if (rand < 0.5) {
            colorType = "rgba(255, 165, 50, ";  // Hot amber
            glowColor = "#ffa532";
          } else if (rand < 0.8) {
            colorType = "rgba(255, 200, 120, "; // White-hot core
            glowColor = "#ffc878";
          } else {
            colorType = "rgba(255, 100, 30, ";  // Deep orange
            glowColor = "#ff641e";
          }
        } else {
          const rand = Math.random();
          if (rand < 0.5) {
            colorType = "rgba(0, 180, 255, ";   // Cyan energy
            glowColor = "#00b4ff";
          } else if (rand < 0.8) {
            colorType = "rgba(100, 140, 255, "; // Blue plasma
            glowColor = "#648cff";
          } else {
            colorType = "rgba(160, 120, 255, "; // Violet radiation
            glowColor = "#a078ff";
          }
        }

        accretionParticles.push({
          distance,
          angle,
          orbitSpeed,
          size: isInner ? Math.random() * 1.6 + 0.5 : Math.random() * 1.2 + 0.3,
          color: colorType,
          glow: glowColor,
          isInner,
          noiseOffset: Math.random() * 100,
        });
      }
    };

    // Sci-fi energy arcs orbiting the singularity
    const initEnergyArcs = () => {
      energyArcs = [];
      for (let i = 0; i < 6; i++) {
        energyArcs.push({
          radius: 90 + i * 35,
          speed: (0.003 + Math.random() * 0.004) * (i % 2 === 0 ? 1 : -1),
          angle: Math.random() * Math.PI * 2,
          arcLength: Math.PI * (0.3 + Math.random() * 0.5),
          opacity: 0.08 + Math.random() * 0.12,
          color: i < 3 ? "#00d9ff" : "#a78bfa",
          width: 0.8 + Math.random() * 0.8,
        });
      }
    };

    // Nebula dust clouds
    const initDustClouds = () => {
      dustClouds = [];
      for (let i = 0; i < 5; i++) {
        dustClouds.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: 100 + Math.random() * 200,
          color: i % 2 === 0 ? "rgba(0, 100, 200, " : "rgba(80, 40, 160, ",
          opacity: 0.02 + Math.random() * 0.03,
          driftX: (Math.random() - 0.5) * 0.08,
          driftY: (Math.random() - 0.5) * 0.05,
        });
      }
    };

    const handleMouseMove = (e) => {
      mouse.targetX = (e.clientX - window.innerWidth / 2) * 0.04;
      mouse.targetY = (e.clientY - window.innerHeight / 2) * 0.04;
    };

    const draw = () => {
      time += 0.002;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      const cx = canvas.width / 2 + mouse.x * 0.2;
      const cy = canvas.height / 2 + mouse.y * 0.2;

      // ── 0. Deep space nebula haze ──
      dustClouds.forEach((cloud) => {
        cloud.x += cloud.driftX;
        cloud.y += cloud.driftY;
        // Wrap around
        if (cloud.x < -cloud.radius) cloud.x = canvas.width + cloud.radius;
        if (cloud.x > canvas.width + cloud.radius) cloud.x = -cloud.radius;
        if (cloud.y < -cloud.radius) cloud.y = canvas.height + cloud.radius;
        if (cloud.y > canvas.height + cloud.radius) cloud.y = -cloud.radius;

        const grad = ctx.createRadialGradient(cloud.x, cloud.y, 0, cloud.x, cloud.y, cloud.radius);
        grad.addColorStop(0, `${cloud.color}${cloud.opacity + Math.sin(time * 2) * 0.01})`);
        grad.addColorStop(1, `${cloud.color}0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(cloud.x - cloud.radius, cloud.y - cloud.radius, cloud.radius * 2, cloud.radius * 2);
      });

      // ── 1. Star field with depth parallax ──
      stars.forEach((star) => {
        const parallax = star.depth * 0.4;
        const posX = (star.x + mouse.x * parallax + canvas.width) % canvas.width;
        const posY = (star.y + mouse.y * parallax + canvas.height) % canvas.height;

        star.opacity += star.twinkleSpeed * star.twinkleDir;
        if (star.opacity > 0.8 || star.opacity < 0.1) star.twinkleDir *= -1;

        ctx.beginPath();
        ctx.arc(posX, posY, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = Math.max(0.08, Math.min(0.85, star.opacity));
        ctx.fill();

        // Beacon stars get a glow halo
        if (star.isBeacon) {
          ctx.beginPath();
          ctx.arc(posX, posY, star.size * 8, 0, Math.PI * 2);
          const beaconGrad = ctx.createRadialGradient(posX, posY, 0, posX, posY, star.size * 8);
          let glowColor = "rgba(255, 255, 255, 0.2)";
          if (star.color === "#00d9ff") glowColor = "rgba(0, 217, 255, 0.2)";
          else if (star.color === "#a78bfa") glowColor = "rgba(167, 139, 250, 0.2)";
          else if (star.color === "#38bdf8") glowColor = "rgba(56, 189, 248, 0.2)";
          
          beaconGrad.addColorStop(0, glowColor);
          beaconGrad.addColorStop(1, "rgba(0,0,0,0)");
          ctx.globalAlpha = (0.2 + Math.sin(time * 8 + star.x) * 0.1) * star.opacity;
          ctx.fillStyle = beaconGrad;
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1.0;

      // ── 2. Gravitational lensing light distortion ring ──
      const lensRadius = 260 + Math.sin(time * 1.5) * 5;
      const lensGrad = ctx.createRadialGradient(cx, cy, lensRadius - 30, cx, cy, lensRadius + 30);
      lensGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
      lensGrad.addColorStop(0.4, "rgba(0, 180, 255, 0.015)");
      lensGrad.addColorStop(0.6, "rgba(100, 140, 255, 0.025)");
      lensGrad.addColorStop(0.8, "rgba(0, 180, 255, 0.01)");
      lensGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.beginPath();
      ctx.arc(cx, cy, lensRadius + 30, 0, Math.PI * 2);
      ctx.fillStyle = lensGrad;
      ctx.fill();

      // ── 3. Sci-fi energy arcs (orbiting holographic rings) ──
      energyArcs.forEach((arc) => {
        arc.angle += arc.speed;
        ctx.beginPath();
        ctx.arc(cx, cy, arc.radius, arc.angle, arc.angle + arc.arcLength);
        ctx.strokeStyle = arc.color;
        ctx.lineWidth = arc.width;
        ctx.globalAlpha = arc.opacity + Math.sin(time * 6 + arc.radius) * 0.04;
        ctx.stroke();
      });
      ctx.globalAlpha = 1.0;

      // ── 4. Dual-layer accretion disk ──
      const singularityRadius = 55 + Math.sin(time * 2.2) * 2;

      accretionParticles.forEach((p) => {
        p.angle += p.orbitSpeed;

        const cosA = Math.cos(p.angle);
        const sinA = Math.sin(p.angle);

        // Flattened orbital plane
        const planX = p.distance * cosA;
        const planY = p.distance * sinA * 0.13;

        // Gravitational lensing for particles behind the black hole
        const isBehind = sinA < 0;
        let lensedX = planX;
        let lensedY = planY;

        if (isBehind) {
          const bendStrength = 0.35;
          lensedY = planY + (planX > 0 ? -1 : 1) * Math.sin(time + p.noiseOffset) * 1.8
            - (singularityRadius + p.distance * 0.18) * (planX > 0 ? 1 : -1) * bendStrength;
          lensedX = planX * 1.12;
        }

        const drawX = cx + lensedX;
        const drawY = cy + lensedY;

        // Particle glow
        const distancePercent = Math.max(0.1, 1 - (p.distance - 65) / 200);
        const alphaVal = distancePercent * (p.isInner ? 0.7 : 0.45);

        ctx.beginPath();
        ctx.arc(drawX, drawY, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${alphaVal})`;
        ctx.shadowBlur = p.size > 1 ? 8 : 3;
        ctx.shadowColor = p.glow;
        ctx.fill();
      });
      ctx.shadowBlur = 0;

      // ── 5. Event horizon (black singularity with sci-fi edge glow) ──

      // Outer photon sphere glow (cyan + purple)
      const photonGrad = ctx.createRadialGradient(cx, cy, singularityRadius + 2, cx, cy, singularityRadius + 20);
      photonGrad.addColorStop(0, "rgba(0, 217, 255, 0.12)");
      photonGrad.addColorStop(0.5, "rgba(139, 92, 246, 0.06)");
      photonGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.beginPath();
      ctx.arc(cx, cy, singularityRadius + 20, 0, Math.PI * 2);
      ctx.fillStyle = photonGrad;
      ctx.fill();

      // Core black sphere with sci-fi edge
      const coreGrad = ctx.createRadialGradient(cx, cy, singularityRadius * 0.85, cx, cy, singularityRadius);
      coreGrad.addColorStop(0, "#000000");
      coreGrad.addColorStop(0.92, "#000000");
      coreGrad.addColorStop(0.97, "rgba(0, 180, 255, 0.5)");  // Cyan edge
      coreGrad.addColorStop(1, "rgba(255, 255, 255, 0.9)");    // Bright white boundary

      ctx.beginPath();
      ctx.arc(cx, cy, singularityRadius, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Inner edge ring — bright white with cyan tint
      ctx.beginPath();
      ctx.arc(cx, cy, singularityRadius + 1, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(200, 240, 255, 0.85)";
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // ── 6. Pulsing energy waves from singularity ──
      for (let w = 0; w < 3; w++) {
        const waveTime = (time * 0.8 + w * 0.33) % 1;
        const waveRadius = singularityRadius + waveTime * 180;
        const waveAlpha = (1 - waveTime) * 0.06;

        ctx.beginPath();
        ctx.arc(cx, cy, waveRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 217, 255, ${waveAlpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // ── 7. Holographic grid lines (subtle sci-fi overlay) ──
      ctx.globalAlpha = 0.012;
      ctx.strokeStyle = "#00d9ff";
      ctx.lineWidth = 0.5;

      // Horizontal scan lines
      const gridSpacing = 60;
      const gridOffset = (time * 20) % gridSpacing;
      for (let y = gridOffset; y < canvas.height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1.0;

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

      {/* Dynamic Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />

      {/* Viewport vignette */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,rgba(0,0,0,0)_38%,#030303_100%] pointer-events-none" />

      {/* Readability overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.5))"
        }}
      />

    </div>
  );
}
