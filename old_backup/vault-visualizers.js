/* ==========================================================================
   PHYSICS VAULT - INTERACTIVE FORMULA DECK VISUALIZERS
   Projectile trajectories, wave superposition, Coulomb grids, and Quantum states
   ========================================================================== */

// --------------------------------------------------------------------------
// 1. Projectile Trajectory Visualizer
// --------------------------------------------------------------------------
export class ProjectileVisualizer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    
    this.angle = 45;
    this.speed = 25;
    this.g = 9.8;
    this.h0 = 10; // launch height offset

    // Animation states
    this.isFiring = false;
    this.fireTime = 0;
    this.trajectoryPoints = [];

    this.initSize();
    this.calculateTheoretical();
    this.draw();
  }

  initSize() {
    const rect = this.canvas.parentNode.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = 180; // Bound standard height
    this.width = rect.width;
    this.height = 180;
  }

  updateParams(angle, speed) {
    this.angle = angle;
    this.speed = speed;
    this.calculateTheoretical();
    this.draw();
  }

  calculateTheoretical() {
    const theta = (this.angle * Math.PI) / 180;
    const v0 = this.speed;
    const g = this.g;

    // Flight time: solve quadratic equation for y = 0
    // 0 = h0 + v0*sin(theta)*t - 0.5*g*t^2 => 0.5*g*t^2 - v0*sin(theta)*t - h0 = 0
    const a = 0.5 * g;
    const b = -v0 * Math.sin(theta);
    const c = -this.h0;
    
    const tFlight = (-b + Math.sqrt(b*b - 4*a*c)) / (2*a);
    
    // Max Range
    const range = v0 * Math.cos(theta) * tFlight;
    
    // Peak Height
    const tApex = (v0 * Math.sin(theta)) / g;
    const maxH = this.h0 + v0 * Math.sin(theta) * tApex - 0.5 * g * tApex * tApex;

    document.getElementById('proj-range').textContent = `${range.toFixed(1)}m`;
    document.getElementById('proj-height').textContent = `${maxH.toFixed(1)}m`;

    this.tFlight = tFlight;
    this.range = range;
    this.maxH = maxH;

    // Generate static trajectory coordinate projection points
    this.trajectoryPoints = [];
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * tFlight;
      const x = v0 * Math.cos(theta) * t;
      const y = this.h0 + v0 * Math.sin(theta) * t - 0.5 * g * t * t;
      this.trajectoryPoints.push({ x, y });
    }
  }

  fire() {
    if (this.isFiring) return;
    this.isFiring = true;
    this.fireTime = 0;
    this.animateFire();
  }

  animateFire() {
    if (!this.isFiring) return;

    this.fireTime += 0.035; // speed parameter step
    if (this.fireTime > this.tFlight) {
      this.isFiring = false;
      this.fireTime = this.tFlight;
    }

    this.draw();

    if (this.isFiring) {
      requestAnimationFrame(() => this.animateFire());
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Padding parameters
    const padLeft = 25;
    const padBottom = 20;
    
    const viewW = this.width - padLeft - 20;
    const viewH = this.height - padBottom - 20;

    // Find axis scale scaling factors
    const scaleX = viewW / Math.max(50, this.range * 1.1);
    const scaleY = viewH / Math.max(25, this.maxH * 1.15);

    const getCanvasCoords = (ptX, ptY) => {
      return {
        x: padLeft + ptX * scaleX,
        y: this.height - padBottom - ptY * scaleY
      };
    };

    // Draw Axes
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.lineWidth = 1;
    
    // Y-Axis
    this.ctx.beginPath();
    this.ctx.moveTo(padLeft, 10);
    this.ctx.lineTo(padLeft, this.height - padBottom);
    // X-Axis
    this.ctx.lineTo(this.width - 15, this.height - padBottom);
    this.ctx.stroke();

    // Draw static dashed trajectory path line
    if (this.trajectoryPoints.length > 1) {
      this.ctx.beginPath();
      const start = getCanvasCoords(this.trajectoryPoints[0].x, this.trajectoryPoints[0].y);
      this.ctx.moveTo(start.x, start.y);
      for (let i = 1; i < this.trajectoryPoints.length; i++) {
        const pt = getCanvasCoords(this.trajectoryPoints[i].x, this.trajectoryPoints[i].y);
        this.ctx.lineTo(pt.x, pt.y);
      }
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      this.ctx.lineWidth = 1.5;
      this.ctx.setLineDash([4, 4]);
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }

    // Draw live animated glowing firing particle
    if (this.isFiring || this.fireTime > 0) {
      const theta = (this.angle * Math.PI) / 180;
      const t = this.fireTime;
      const xNow = this.speed * Math.cos(theta) * t;
      const yNow = this.h0 + this.speed * Math.sin(theta) * t - 0.5 * this.g * t * t;
      const canvasPt = getCanvasCoords(xNow, yNow);

      // Firing particle core
      this.ctx.beginPath();
      this.ctx.arc(canvasPt.x, canvasPt.y, 6, 0, Math.PI * 2);
      this.ctx.fillStyle = '#00f2fe';
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = '#00f2fe';
      this.ctx.fill();
      this.ctx.shadowBlur = 0; // reset
    }

    // Launch point pedestal
    const pedestalBase = getCanvasCoords(0, 0);
    const pedestalTop = getCanvasCoords(0, this.h0);
    this.ctx.beginPath();
    this.ctx.moveTo(pedestalBase.x, pedestalBase.y);
    this.ctx.lineTo(pedestalTop.x, pedestalTop.y);
    this.ctx.strokeStyle = 'rgba(161, 140, 209, 0.5)';
    this.ctx.lineWidth = 4;
    this.ctx.stroke();
  }
}


// --------------------------------------------------------------------------
// 2. Wave Superposition Wave-Machine
// --------------------------------------------------------------------------
export class WaveSuperpositionVisualizer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    
    // Primary Parameters
    this.amp1 = 25;
    this.freq1 = 1.0;
    this.amp2 = 25;
    this.freq2 = 2.0;
    this.phase2 = 0; // Phase shift in multiples of pi
    
    this.time = 0;
    this.running = true;

    this.initSize();
    this.animate();
  }

  initSize() {
    const rect = this.canvas.parentNode.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = 200;
    this.width = rect.width;
    this.height = 200;
  }

  updateParams(freq2, phase2) {
    this.freq2 = freq2;
    this.phase2 = phase2;
  }

  animate() {
    if (this.running) {
      this.time += 0.05;
      this.draw();
    }
    requestAnimationFrame(() => this.animate());
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    const midY = this.height / 2;
    const k = 0.04; // wavenumber spatial frequency parameter

    // Draw central node line
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(0, midY);
    this.ctx.lineTo(this.width, midY);
    this.ctx.stroke();

    const pts1 = [];
    const pts2 = [];
    const ptsSum = [];

    // Solve positions along screen width
    for (let x = 0; x < this.width; x += 2) {
      // Wave 1: y1 = A1 * sin(k*x - w1*t)
      const y1 = this.amp1 * Math.sin(k * x - this.freq1 * this.time);
      // Wave 2: y2 = A2 * sin(k*x - w2*t + phi)
      const phi = this.phase2 * Math.PI;
      const y2 = this.amp2 * Math.sin(k * x - this.freq2 * this.time + phi);
      // Wave 3: Superposition Sum
      const ySum = y1 + y2;

      pts1.push({ x, y: midY + y1 });
      pts2.push({ x, y: midY + y2 });
      ptsSum.push({ x, y: midY + ySum });
    }

    const drawCurve = (points, strokeStyle, width, alpha = 1.0) => {
      this.ctx.beginPath();
      this.ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        this.ctx.lineTo(points[i].x, points[i].y);
      }
      this.ctx.strokeStyle = strokeStyle;
      this.ctx.lineWidth = width;
      this.ctx.globalAlpha = alpha;
      this.ctx.stroke();
      this.ctx.globalAlpha = 1.0;
    };

    // Draw component waves
    drawCurve(pts1, '#00f2fe', 1.5, 0.4); // Wave 1 (cyan, dim)
    drawCurve(pts2, '#a18cd1', 1.5, 0.4); // Wave 2 (purple, dim)
    
    // Draw Superposition wave (bold glowing gold)
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = '#ffb347';
    drawCurve(ptsSum, '#ffb347', 3.0, 0.95);
    this.ctx.shadowBlur = 0;
  }
}


// --------------------------------------------------------------------------
// 3. Coulomb Vector Field Grid
// --------------------------------------------------------------------------
export class CoulombVisualizer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');

    this.charges = [];
    
    // Drag charge interaction
    this.selectedCharge = null;

    this.initSize();
    this.setupEvents();
    this.loadDefaultCharges();
  }

  initSize() {
    const rect = this.canvas.parentNode.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = 250;
    this.width = rect.width;
    this.height = 250;
  }

  setupEvents() {
    this.canvas.addEventListener('mousedown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      // Check if clicked near any charge to drag
      for (let c of this.charges) {
        const dx = c.x - mx;
        const dy = c.y - my;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < c.radius + 10) {
          this.selectedCharge = c;
          break;
        }
      }
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.selectedCharge) {
        const rect = this.canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        // Bound to canvas dimensions
        this.selectedCharge.x = Math.max(10, Math.min(this.width - 10, mx));
        this.selectedCharge.y = Math.max(10, Math.min(this.height - 10, my));
        this.draw();
      }
    });

    this.canvas.addEventListener('mouseup', () => {
      this.selectedCharge = null;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.selectedCharge = null;
    });
  }

  addCharge(q) {
    if (this.charges.length >= 8) return; // Limit charges count

    this.charges.push({
      x: this.width * (0.3 + Math.random() * 0.4),
      y: this.height * (0.3 + Math.random() * 0.4),
      q: q, // Charge sign (+1 or -1)
      radius: 12
    });
    this.draw();
  }

  loadDefaultCharges() {
    this.charges = [];
    // Load a classical dipole configuration
    this.charges.push({ x: this.width * 0.35, y: this.height * 0.5, q: 1, radius: 12 });
    this.charges.push({ x: this.width * 0.65, y: this.height * 0.5, q: -1, radius: 12 });
    this.draw();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw Vector field grid arrows
    const colSpacing = 24;
    const rowSpacing = 24;

    const ke = 1200; // Electric scale constant

    for (let x = colSpacing / 2; x < this.width; x += colSpacing) {
      for (let y = rowSpacing / 2; y < this.height; y += rowSpacing) {
        
        let exTotal = 0;
        let eyTotal = 0;
        let inCharge = false;

        // Calculate Electric field vectors: E = k * q / r^2
        for (let c of this.charges) {
          const dx = x - c.x;
          const dy = y - c.y;
          const distSq = dx*dx + dy*dy;
          const dist = Math.sqrt(distSq);

          if (dist < c.radius + 2) {
            inCharge = true;
            break;
          }

          // Force magnitudes inverse square
          const fieldMag = (ke * c.q) / (distSq + 200); // added softening
          exTotal += fieldMag * (dx / dist);
          eyTotal += fieldMag * (dy / dist);
        }

        if (inCharge) continue;

        const totalE = Math.sqrt(exTotal*exTotal + eyTotal*eyTotal);
        if (totalE < 0.1) continue;

        // Vector direction angle
        const angle = Math.atan2(eyTotal, exTotal);

        // Normalize vector for arrow display length
        // scale length logarithmically so high fields don't span screen
        const arrowLen = Math.min(18, Math.max(5, Math.log1p(totalE) * 4));

        // Opacity based on field strength
        const opacity = Math.min(0.8, Math.max(0.15, totalE * 0.08));

        const startX = x - (arrowLen/2) * Math.cos(angle);
        const startY = y - (arrowLen/2) * Math.sin(angle);
        const endX = x + (arrowLen/2) * Math.cos(angle);
        const endY = y + (arrowLen/2) * Math.sin(angle);

        this.ctx.strokeStyle = `rgba(0, 242, 254, ${opacity})`;
        this.ctx.lineWidth = totalE > 12 ? 2.0 : 1.2;

        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();

        // Little arrow tip for directionality
        this.ctx.beginPath();
        this.ctx.moveTo(endX, endY);
        this.ctx.lineTo(endX - 4 * Math.cos(angle - Math.PI/6), endY - 4 * Math.sin(angle - Math.PI/6));
        this.ctx.lineTo(endX - 4 * Math.cos(angle + Math.PI/6), endY - 4 * Math.sin(angle + Math.PI/6));
        this.ctx.fillStyle = `rgba(0, 242, 254, ${opacity})`;
        this.ctx.fill();
      }
    }

    // Draw Charges
    for (let c of this.charges) {
      this.ctx.beginPath();
      this.ctx.arc(c.x, c.y, c.radius, 0, Math.PI*2);

      const color = c.q > 0 ? '#00f2fe' : '#a18cd1';

      this.ctx.fillStyle = 'rgba(10, 10, 25, 0.85)';
      this.ctx.fill();

      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 3;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = color;
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;

      // Draw charge sign text (+ or -)
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 15px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(c.q > 0 ? '+' : '-', c.x, c.y + 0.5);
    }
  }
}


// --------------------------------------------------------------------------
// 4. Quantum Wavefunction Drawer (Particle in a Box)
// --------------------------------------------------------------------------
export class QuantumVisualizer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    
    this.n = 1; // default quantum state

    this.initSize();
    this.draw();
  }

  initSize() {
    const rect = this.canvas.parentNode.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = 200;
    this.width = rect.width;
    this.height = 200;
  }

  updateState(n) {
    this.n = n;
    this.draw();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    const midY = this.height / 2;
    const boxLeft = 40;
    const boxRight = this.width - 40;
    const L = boxRight - boxLeft;

    // Draw Barrier potential walls (Infinite borders)
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 3.5;
    this.ctx.beginPath();
    // Left barrier
    this.ctx.moveTo(boxLeft, 15);
    this.ctx.lineTo(boxLeft, this.height - 15);
    // Right barrier
    this.ctx.moveTo(boxRight, 15);
    this.ctx.lineTo(boxRight, this.height - 15);
    this.ctx.stroke();

    // Subtle center reference line
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(boxLeft, midY);
    this.ctx.lineTo(boxRight, midY);
    this.ctx.stroke();

    // Wave plotting parameters
    const ampScale = 45; // peak amplitude scale
    const psiPts = [];
    const probPts = [];

    // Solve for coordinates inside the potential well [0, L]
    for (let x = 0; x <= L; x++) {
      const theta = (this.n * Math.PI * x) / L;
      
      // Wavefunction: Psi_n(x) = sqrt(2/L) * sin(n*pi*x/L)
      const psi = Math.sin(theta);
      
      // Probability density: |Psi_n(x)|^2 = (2/L) * sin^2(n*pi*x/L)
      const prob = psi * psi;

      const canvasX = boxLeft + x;

      psiPts.push({ x: canvasX, y: midY - psi * ampScale });
      // Plotted from a baseline above the bottom border
      const baselineY = this.height - 35;
      probPts.push({ x: canvasX, y: baselineY - prob * ampScale * 1.5 });
    }

    const drawLines = (pts, strokeStyle, width) => {
      this.ctx.beginPath();
      this.ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        this.ctx.lineTo(pts[i].x, pts[i].y);
      }
      this.ctx.strokeStyle = strokeStyle;
      this.ctx.lineWidth = width;
      this.ctx.stroke();
    };

    // 1. Draw Wavefunction Psi (purple neon curve)
    this.ctx.shadowBlur = 8;
    this.ctx.shadowColor = '#a18cd1';
    drawLines(psiPts, '#a18cd1', 2.5);
    this.ctx.shadowBlur = 0;

    // 2. Draw Probability Density |Psi|^2 (filled transparent cyan glow)
    this.ctx.shadowBlur = 8;
    this.ctx.shadowColor = '#00f2fe';
    drawLines(probPts, '#00f2fe', 2.0);
    this.ctx.shadowBlur = 0;

    // Solid fill under probability density
    this.ctx.beginPath();
    this.ctx.moveTo(boxLeft, this.height - 35);
    for (let p of probPts) {
      this.ctx.lineTo(p.x, p.y);
    }
    this.ctx.lineTo(boxRight, this.height - 35);
    this.ctx.closePath();
    this.ctx.fillStyle = 'rgba(0, 242, 254, 0.06)';
    this.ctx.fill();

    // Plotted reference label for bottom floor
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(boxLeft, this.height - 35);
    this.ctx.lineTo(boxRight, this.height - 35);
    this.ctx.stroke();
  }
}
