"use client";

import { useEffect, useRef } from "react";

/**
 * SpaceBackground
 *
 * @param {boolean} showBlackhole  — If true, renders the full cinematic
 *   amber/orange accretion disk blackhole (hero section only).
 *   If false (default), renders the plain deep-space starfield.
 */
export default function SpaceBackground({ showBlackhole = false }) {
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
      initDustClouds();
      if (showBlackhole) {
        initAccretionDisk();
        initEnergyArcs();
      }
    };

    // ── Stars — PDR palette (whites, ambers, violets) ──
    const initStars = () => {
      stars = [];
      const count = Math.min(320, Math.floor((canvas.width * canvas.height) / 5500));
      for (let i = 0; i < count; i++) {
        const depth = Math.random();
        const rnd = Math.random();
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: depth * 1.6 + 0.2,
          depth,
          opacity: Math.random() * 0.55 + 0.12,
          // PDR star palette: mostly white, some amber/gold, some violet
          color: rnd > 0.94
            ? "#E8A020"         // amber
            : rnd > 0.89
            ? "#FF6B35"         // orange
            : rnd > 0.84
            ? "#C4A8F0"         // soft violet
            : rnd > 0.78
            ? "#FFD580"         // warm gold
            : "#F0F0FF",        // soft white
          twinkleSpeed: Math.random() * 0.012 + 0.003,
          twinkleDir: Math.random() > 0.5 ? 1 : -1,
          isBeacon: Math.random() > 0.97,
        });
      }
    };

    // ── Nebula dust clouds (amber + violet hues) ──
    const initDustClouds = () => {
      dustClouds = [];
      const clouds = [
        { color: "rgba(232, 160, 32, ",   opacity: 0.025 }, // amber
        { color: "rgba(123, 94, 167, ",   opacity: 0.030 }, // violet
        { color: "rgba(10,  0,  30, ",    opacity: 0.045 }, // dark void
        { color: "rgba(255, 107, 53, ",   opacity: 0.018 }, // orange
        { color: "rgba(80,  40, 120, ",   opacity: 0.028 }, // deep purple
      ];
      for (let i = 0; i < 5; i++) {
        dustClouds.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: 120 + Math.random() * 220,
          color: clouds[i].color,
          opacity: clouds[i].opacity,
          driftX: (Math.random() - 0.5) * 0.07,
          driftY: (Math.random() - 0.5) * 0.045,
        });
      }
    };

    // ── Accretion disk (amber/orange inner, violet outer) ──
    const initAccretionDisk = () => {
      accretionParticles = [];
      const particleCount = 400;
      for (let i = 0; i < particleCount; i++) {
        const distance = Math.random() * 210 + 60;
        const angle = Math.random() * Math.PI * 2;
        const orbitSpeed = (1 / Math.sqrt(distance)) * 0.30;
        const isInner = distance < 145;
        let colorType, glowColor;

        if (isInner) {
          const r = Math.random();
          if (r < 0.45) { colorType = "rgba(232, 160, 32, "; glowColor = "#E8A020"; }       // amber
          else if (r < 0.78) { colorType = "rgba(255, 107, 53, "; glowColor = "#FF6B35"; }  // orange
          else { colorType = "rgba(255, 200, 80, "; glowColor = "#FFC850"; }                 // gold-white
        } else {
          const r = Math.random();
          if (r < 0.5) { colorType = "rgba(123, 94, 167, "; glowColor = "#7B5EA7"; }        // violet
          else if (r < 0.8) { colorType = "rgba(180, 130, 240, "; glowColor = "#B482F0"; }  // light violet
          else { colorType = "rgba(232, 160, 32, "; glowColor = "#E8A020"; }                 // amber outlier
        }

        accretionParticles.push({
          distance,
          angle,
          orbitSpeed,
          size: isInner ? Math.random() * 1.8 + 0.5 : Math.random() * 1.3 + 0.3,
          color: colorType,
          glow: glowColor,
          isInner,
          noiseOffset: Math.random() * 100,
        });
      }
    };

    // ── Energy arcs (amber inner, violet outer) ──
    const initEnergyArcs = () => {
      energyArcs = [];
      for (let i = 0; i < 6; i++) {
        energyArcs.push({
          radius: 85 + i * 38,
          speed: (0.003 + Math.random() * 0.004) * (i % 2 === 0 ? 1 : -1),
          angle: Math.random() * Math.PI * 2,
          arcLength: Math.PI * (0.25 + Math.random() * 0.55),
          opacity: 0.07 + Math.random() * 0.10,
          color: i < 3 ? "#E8A020" : "#7B5EA7",
          width: 0.7 + Math.random() * 0.8,
        });
      }
    };

    const handleMouseMove = (e) => {
      mouse.targetX = (e.clientX - window.innerWidth / 2) * 0.05;
      mouse.targetY = (e.clientY - window.innerHeight / 2) * 0.05;
    };

    const draw = () => {
      time += 0.002;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      const cx = canvas.width / 2 + mouse.x * 0.2;
      const cy = canvas.height / 2 + mouse.y * 0.2;

      // ── 0. Nebula haze ──
      dustClouds.forEach((cloud) => {
        cloud.x += cloud.driftX;
        cloud.y += cloud.driftY;
        if (cloud.x < -cloud.radius) cloud.x = canvas.width + cloud.radius;
        if (cloud.x > canvas.width + cloud.radius) cloud.x = -cloud.radius;
        if (cloud.y < -cloud.radius) cloud.y = canvas.height + cloud.radius;
        if (cloud.y > canvas.height + cloud.radius) cloud.y = -cloud.radius;

        const grad = ctx.createRadialGradient(cloud.x, cloud.y, 0, cloud.x, cloud.y, cloud.radius);
        grad.addColorStop(0, `${cloud.color}${cloud.opacity + Math.sin(time * 1.8) * 0.008})`);
        grad.addColorStop(1, `${cloud.color}0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(cloud.x - cloud.radius, cloud.y - cloud.radius, cloud.radius * 2, cloud.radius * 2);
      });

      // ── 1. Star field with parallax ──
      stars.forEach((star) => {
        const parallax = star.depth * 0.4;
        const posX = (star.x + mouse.x * parallax + canvas.width) % canvas.width;
        const posY = (star.y + mouse.y * parallax + canvas.height) % canvas.height;

        star.opacity += star.twinkleSpeed * star.twinkleDir;
        if (star.opacity > 0.78 || star.opacity < 0.08) star.twinkleDir *= -1;

        ctx.beginPath();
        ctx.arc(posX, posY, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = Math.max(0.06, Math.min(0.85, star.opacity));
        ctx.fill();

        if (star.isBeacon) {
          ctx.beginPath();
          ctx.arc(posX, posY, star.size * 9, 0, Math.PI * 2);
          const bg = ctx.createRadialGradient(posX, posY, 0, posX, posY, star.size * 9);
          let gc = "rgba(240, 240, 255, 0.18)";
          if (star.color === "#E8A020") gc = "rgba(232, 160, 32, 0.22)";
          else if (star.color === "#FF6B35") gc = "rgba(255, 107, 53, 0.18)";
          else if (star.color === "#C4A8F0") gc = "rgba(196, 168, 240, 0.18)";
          bg.addColorStop(0, gc);
          bg.addColorStop(1, "rgba(0,0,0,0)");
          ctx.globalAlpha = (0.18 + Math.sin(time * 8 + star.x) * 0.1) * star.opacity;
          ctx.fillStyle = bg;
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1.0;

      // ── Blackhole section (hero only) ──
      if (showBlackhole) {
        // PDR Tip 1: subtle 3° tilt toward mouse
        const tiltX = mouse.x * 0.03;
        const tiltY = mouse.y * 0.03;

        // 2. Gravitational lensing shimmer ring
        const lensRadius = 270 + Math.sin(time * 1.2) * 6;
        const lensGrad = ctx.createRadialGradient(cx, cy, lensRadius - 35, cx, cy, lensRadius + 35);
        lensGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
        lensGrad.addColorStop(0.35, "rgba(232, 160, 32, 0.012)");
        lensGrad.addColorStop(0.6,  "rgba(123, 94, 167, 0.020)");
        lensGrad.addColorStop(0.8,  "rgba(232, 160, 32, 0.008)");
        lensGrad.addColorStop(1,  "rgba(0, 0, 0, 0)");
        ctx.beginPath();
        ctx.arc(cx + tiltX, cy + tiltY, lensRadius + 35, 0, Math.PI * 2);
        ctx.fillStyle = lensGrad;
        ctx.fill();

        // 3. Energy arcs (orbiting rings)
        energyArcs.forEach((arc) => {
          arc.angle += arc.speed;
          ctx.beginPath();
          ctx.arc(cx + tiltX, cy + tiltY, arc.radius, arc.angle, arc.angle + arc.arcLength);
          ctx.strokeStyle = arc.color;
          ctx.lineWidth = arc.width;
          ctx.globalAlpha = arc.opacity + Math.sin(time * 6 + arc.radius) * 0.03;
          ctx.stroke();
        });
        ctx.globalAlpha = 1.0;

        // 4. Accretion disk (amber/orange inner, violet outer)
        const singRadius = 52 + Math.sin(time * 2.0) * 2;
        accretionParticles.forEach((p) => {
          p.angle += p.orbitSpeed;
          const cosA = Math.cos(p.angle);
          const sinA = Math.sin(p.angle);

          // Flattened orbital plane
          const planX = p.distance * cosA;
          const planY = p.distance * sinA * 0.12;

          // Gravitational lensing for particles behind
          const isBehind = sinA < 0;
          let lx = planX, ly = planY;
          if (isBehind) {
            const bend = 0.38;
            ly = planY + (planX > 0 ? -1 : 1) * Math.sin(time + p.noiseOffset) * 1.9
              - (singRadius + p.distance * 0.18) * (planX > 0 ? 1 : -1) * bend;
            lx = planX * 1.12;
          }

          const drawX = cx + lx + tiltX;
          const drawY = cy + ly + tiltY;
          const pct = Math.max(0.1, 1 - (p.distance - 60) / 210);
          const alpha = pct * (p.isInner ? 0.75 : 0.48);

          ctx.beginPath();
          ctx.arc(drawX, drawY, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${alpha})`;
          ctx.shadowBlur = p.size > 1 ? 10 : 4;
          ctx.shadowColor = p.glow;
          ctx.fill();
        });
        ctx.shadowBlur = 0;

        // 5. Outer violet halo (photon sphere)
        const photonGrad = ctx.createRadialGradient(cx + tiltX, cy + tiltY, singRadius + 2, cx + tiltX, cy + tiltY, singRadius + 28);
        photonGrad.addColorStop(0, "rgba(232, 160, 32, 0.10)");
        photonGrad.addColorStop(0.4, "rgba(255, 107, 53, 0.06)");
        photonGrad.addColorStop(0.75, "rgba(123, 94, 167, 0.04)");
        photonGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.beginPath();
        ctx.arc(cx + tiltX, cy + tiltY, singRadius + 28, 0, Math.PI * 2);
        ctx.fillStyle = photonGrad;
        ctx.fill();

        // 6. Core black singularity with amber edge glow
        const coreGrad = ctx.createRadialGradient(cx + tiltX, cy + tiltY, singRadius * 0.82, cx + tiltX, cy + tiltY, singRadius);
        coreGrad.addColorStop(0, "#00000A");
        coreGrad.addColorStop(0.90, "#00000A");
        coreGrad.addColorStop(0.96, "rgba(232, 160, 32, 0.55)");  // amber edge
        coreGrad.addColorStop(1,    "rgba(255, 255, 200, 0.85)");  // bright boundary
        ctx.beginPath();
        ctx.arc(cx + tiltX, cy + tiltY, singRadius, 0, Math.PI * 2);
        ctx.fillStyle = coreGrad;
        ctx.fill();

        // Bright amber ring
        ctx.beginPath();
        ctx.arc(cx + tiltX, cy + tiltY, singRadius + 1, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(232, 160, 32, 0.9)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 7. Pulsing amber energy waves
        for (let w = 0; w < 3; w++) {
          const wt = (time * 0.7 + w * 0.33) % 1;
          const wr = singRadius + wt * 190;
          const wa = (1 - wt) * 0.05;
          ctx.beginPath();
          ctx.arc(cx + tiltX, cy + tiltY, wr, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(232, 160, 32, ${wa})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // ── Subtle holographic scan lines ──
      ctx.globalAlpha = 0.009;
      ctx.strokeStyle = showBlackhole ? "#E8A020" : "#8888AA";
      ctx.lineWidth = 0.5;
      const gridSpacing = 65;
      const gridOffset = (time * 18) % gridSpacing;
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
  }, [showBlackhole]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none" style={{ background: "#00000A" }}>
      {/* Dynamic Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />

      {/* Amber radial core glow (hero only) */}
      {showBlackhole && (
        <div
          className="absolute inset-0 pointer-events-none animate-lensing-pulse"
          style={{
            background: "radial-gradient(ellipse 55% 45% at 50% 50%, rgba(232,160,32,0.05) 0%, rgba(123,94,167,0.04) 45%, transparent 70%)",
          }}
        />
      )}

      {/* Viewport vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 30%, #00000A 100%)",
        }}
      />

      {/* Readability dark overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "rgba(0, 0, 10, 0.55)" }}
      />
    </div>
  );
}
