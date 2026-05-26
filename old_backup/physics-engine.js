/* ==========================================================================
   PHYSICS VAULT - 2D RIGID BODY PHYSICS SANDBOX ENGINE
   Sleek custom collision solver, mouse drag throw, and live energy chart
   ========================================================================== */

export class PhysicsSandbox {
  constructor(canvasId, energyCanvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    
    this.energyCanvas = document.getElementById(energyCanvasId);
    this.energyCtx = this.energyCanvas.getContext('2d');

    this.particles = [];
    this.running = true;
    this.lastTime = 0;
    this.fps = 60;
    this.fpsUpdateTimer = 0;

    // Simulation Parameters
    this.gravity = 9.8;
    this.elasticity = 0.85;
    this.airResistance = 0.01; // 1%
    this.showVectors = true;
    this.showTrails = false;
    this.boundaryBounce = true;

    // Mouse Interaction
    this.draggedParticle = null;
    this.mouse = { x: 0, y: 0, isDown: false, prevX: 0, prevY: 0, vx: 0, vy: 0 };
    
    // Energy Plot History
    this.energyHistory = [];
    this.maxHistoryLength = 100;

    this.initCanvasSize();
    this.setupEvents();
    this.loadResetPreset();
  }

  initCanvasSize() {
    const rect = this.canvas.parentNode.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.width = rect.width;
    this.height = rect.height;
  }

  setupEvents() {
    window.addEventListener('resize', () => {
      this.initCanvasSize();
    });

    this.canvas.addEventListener('mousedown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      this.mouse.isDown = true;
      this.mouse.x = mx;
      this.mouse.y = my;
      this.mouse.prevX = mx;
      this.mouse.prevY = my;
      this.mouse.vx = 0;
      this.mouse.vy = 0;

      // Find if clicked on any particle
      for (let p of this.particles) {
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < p.radius + 10) {
          this.draggedParticle = p;
          break;
        }
      }

      // If clicked empty space, add a new ball at mouse location
      if (!this.draggedParticle && this.particles.length < 35) {
        this.addParticle(mx, my, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
      }
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      if (this.mouse.isDown) {
        this.mouse.vx = mx - this.mouse.prevX;
        this.mouse.vy = my - this.mouse.prevY;
        this.mouse.x = mx;
        this.mouse.y = my;
        this.mouse.prevX = mx;
        this.mouse.prevY = my;

        if (this.draggedParticle) {
          this.draggedParticle.x = mx;
          this.draggedParticle.y = my;
          this.draggedParticle.vx = this.mouse.vx * 0.7; // Damp speed from instant throws
          this.draggedParticle.vy = this.mouse.vy * 0.7;
        }
      }
    });

    this.canvas.addEventListener('mouseup', () => {
      this.mouse.isDown = false;
      this.draggedParticle = null;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.isDown = false;
      this.draggedParticle = null;
    });
  }

  addParticle(x, y, vx = 0, vy = 0, radius = null, mass = null, color = null) {
    const rad = radius || Math.floor(Math.random() * 15) + 15; // Radius between 15-30
    const m = mass || rad * rad * 0.05; // Mass proportional to area

    const colors = ['#00f2fe', '#4facfe', '#a18cd1', '#f3a0ff', '#ffb347'];
    const col = color || colors[Math.floor(Math.random() * colors.length)];

    this.particles.push({
      x: x,
      y: y,
      vx: vx,
      vy: vy,
      radius: rad,
      mass: m,
      color: col,
      trail: []
    });

    document.getElementById('particle-count').textContent = this.particles.length;
  }

  clear() {
    this.particles = [];
    this.energyHistory = [];
    document.getElementById('particle-count').textContent = '0';
  }

  loadResetPreset() {
    this.clear();
    const w = this.width;
    const h = this.height;
    // Standard beautiful bouncing ball setup
    this.addParticle(w * 0.25, h * 0.3, 5, 0, 22, 10, '#00f2fe');
    this.addParticle(w * 0.5, h * 0.4, -4, 2, 28, 20, '#a18cd1');
    this.addParticle(w * 0.75, h * 0.2, -6, -2, 18, 6, '#ffb347');
    this.addParticle(w * 0.6, h * 0.6, 2, -6, 25, 15, '#f3a0ff');
  }

  loadNewtonsCradle() {
    this.clear();
    const w = this.width;
    const h = this.height;
    const r = 20;
    const m = 15;
    const centerY = h * 0.5;
    const startX = w * 0.5 - 2 * r;

    // Placed horizontally, standard collisions demonstrated
    this.addParticle(startX, centerY, 0, 0, r, m, '#a18cd1');
    this.addParticle(startX + 2*r, centerY, 0, 0, r, m, '#a18cd1');
    this.addParticle(startX + 4*r, centerY, 0, 0, r, m, '#a18cd1');
    this.addParticle(startX + 6*r, centerY, 0, 0, r, m, '#a18cd1');

    // Launch striker sphere from left
    this.addParticle(startX - 180, centerY, 15, 0, r, m, '#00f2fe');
  }

  togglePlayPause() {
    this.running = !this.running;
    return this.running;
  }

  update(dt) {
    if (!this.running) return;

    // Bound delta time
    if (dt > 0.05) dt = 0.05;

    // Apply forces and velocities
    for (let p of this.particles) {
      if (p === this.draggedParticle) continue;

      // 1. Gravity acceleration
      p.vy += this.gravity * 20 * dt; // Scaling gravity visually

      // 2. Air resistance damping
      p.vx *= (1 - this.airResistance * dt * 2);
      p.vy *= (1 - this.airResistance * dt * 2);

      // 3. Update positions
      p.x += p.vx * dt * 30; // Scale speed visually
      p.y += p.vy * dt * 30;

      // Update trail coordinates
      if (this.showTrails) {
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 25) p.trail.shift();
      } else {
        p.trail = [];
      }
    }

    // 4. Handle elastic collisions between circles
    this.handleParticleCollisions();

    // 5. Handle collisions against boundaries
    this.handleWallCollisions();

    // 6. Calculate & plot mechanical energies
    this.trackEnergy();
  }

  handleParticleCollisions() {
    const len = this.particles.length;
    for (let i = 0; i < len; i++) {
      for (let j = i + 1; j < len; j++) {
        const p1 = this.particles[i];
        const p2 = this.particles[j];

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const minDist = p1.radius + p2.radius;

        if (dist < minDist) {
          // Resolve overlap static state
          const overlap = minDist - dist;
          const nx = dx / dist;
          const ny = dy / dist;

          // Push them apart inversely proportional to mass
          const totalMass = p1.mass + p2.mass;
          if (p1 !== this.draggedParticle) {
            p1.x -= nx * overlap * (p2.mass / totalMass);
            p1.y -= ny * overlap * (p2.mass / totalMass);
          }
          if (p2 !== this.draggedParticle) {
            p2.x += nx * overlap * (p1.mass / totalMass);
            p2.y += ny * overlap * (p1.mass / totalMass);
          }

          // Calculate relative velocity
          const rvx = p2.vx - p1.vx;
          const rvy = p2.vy - p1.vy;

          // Calculate relative velocity along normal
          const velAlongNormal = rvx * nx + rvy * ny;

          // Do not resolve if velocities are separating
          if (velAlongNormal < 0) {
            // Impulse scalar
            let impulseScalar = -(1 + this.elasticity) * velAlongNormal;
            impulseScalar /= (1/p1.mass + 1/p2.mass);

            // Apply impulse vector
            const ix = impulseScalar * nx;
            const iy = impulseScalar * ny;

            if (p1 !== this.draggedParticle) {
              p1.vx -= (1/p1.mass) * ix;
              p1.vy -= (1/p1.mass) * iy;
            }
            if (p2 !== this.draggedParticle) {
              p2.vx += (1/p2.mass) * ix;
              p2.vy += (1/p2.mass) * iy;
            }
          }
        }
      }
    }
  }

  handleWallCollisions() {
    if (!this.boundaryBounce) return;

    for (let p of this.particles) {
      if (p === this.draggedParticle) continue;

      // Bottom Wall
      if (p.y + p.radius > this.height) {
        p.y = this.height - p.radius;
        p.vy = -p.vy * this.elasticity;
        // Friction on bottom wall slide
        p.vx *= 0.95;
      }
      // Top Wall
      else if (p.y - p.radius < 0) {
        p.y = p.radius;
        p.vy = -p.vy * this.elasticity;
      }

      // Right Wall
      if (p.x + p.radius > this.width) {
        p.x = this.width - p.radius;
        p.vx = -p.vx * this.elasticity;
      }
      // Left Wall
      else if (p.x - p.radius < 0) {
        p.x = p.radius;
        p.vx = -p.vx * this.elasticity;
      }
    }
  }

  trackEnergy() {
    let keTotal = 0;
    let peTotal = 0;

    for (let p of this.particles) {
      // KE = 0.5 * m * v^2
      const speedSq = p.vx*p.vx + p.vy*p.vy;
      keTotal += 0.5 * p.mass * speedSq;

      // PE = m * g * h (height relative to floor)
      // Visual coordinate y=0 is ceiling, y=height is floor
      const h = Math.max(0, this.height - p.y);
      peTotal += p.mass * (this.gravity * 0.05) * h; 
    }

    const teTotal = keTotal + peTotal;

    // Display overlay text values
    document.getElementById('val-ke').textContent = (keTotal / 10).toFixed(1);
    document.getElementById('val-pe').textContent = (peTotal / 10).toFixed(1);
    document.getElementById('val-te').textContent = (teTotal / 10).toFixed(1);

    // Save history
    this.energyHistory.push({ ke: keTotal, pe: peTotal, te: teTotal });
    if (this.energyHistory.length > this.maxHistoryLength) {
      this.energyHistory.shift();
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw grid mesh backdrop
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
    this.ctx.lineWidth = 1;
    const gridSpacing = 40;
    for (let x = 0; x < this.width; x += gridSpacing) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }
    for (let y = 0; y < this.height; y += gridSpacing) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }

    // Draw Particles
    for (let p of this.particles) {
      // Motion Trails
      if (this.showTrails && p.trail.length > 1) {
        this.ctx.beginPath();
        this.ctx.moveTo(p.trail[0].x, p.trail[0].y);
        for (let idx = 1; idx < p.trail.length; idx++) {
          this.ctx.lineTo(p.trail[idx].x, p.trail[idx].y);
        }
        this.ctx.strokeStyle = p.color;
        this.ctx.lineWidth = 2;
        this.ctx.globalAlpha = 0.25;
        this.ctx.stroke();
        this.ctx.globalAlpha = 1.0;
      }

      // Draw particle body
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      
      // Glass body fill
      this.ctx.fillStyle = 'rgba(20, 20, 45, 0.5)';
      this.ctx.fill();

      // Glowing Neon borders
      this.ctx.strokeStyle = p.color;
      this.ctx.lineWidth = 3;
      this.ctx.shadowBlur = 12;
      this.ctx.shadowColor = p.color;
      this.ctx.stroke();
      this.ctx.shadowBlur = 0; // Reset shadow

      // Dynamic shiny reflections
      this.ctx.beginPath();
      this.ctx.arc(p.x - p.radius*0.35, p.y - p.radius*0.35, p.radius * 0.2, 0, Math.PI*2);
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      this.ctx.fill();

      // Velocity vectors
      if (this.showVectors) {
        const arrowScale = 2;
        const speed = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
        if (speed > 0.5) {
          const arrowX = p.x + p.vx * arrowScale;
          const arrowY = p.y + p.vy * arrowScale;
          
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(arrowX, arrowY);
          this.ctx.strokeStyle = '#00f2fe';
          this.ctx.lineWidth = 2;
          this.ctx.stroke();

          // Arrow tip
          const angle = Math.atan2(p.vy, p.vx);
          this.ctx.beginPath();
          this.ctx.moveTo(arrowX, arrowY);
          this.ctx.lineTo(arrowX - 8 * Math.cos(angle - Math.PI/6), arrowY - 8 * Math.sin(angle - Math.PI/6));
          this.ctx.lineTo(arrowX - 8 * Math.cos(angle + Math.PI/6), arrowY - 8 * Math.sin(angle + Math.PI/6));
          this.ctx.closePath();
          this.ctx.fillStyle = '#00f2fe';
          this.ctx.fill();
        }
      }
    }

    // Draw Energy graph overlay
    this.drawEnergyGraph();
  }

  drawEnergyGraph() {
    this.energyCtx.clearRect(0, 0, this.energyCanvas.width, this.energyCanvas.height);
    if (this.energyHistory.length < 2) return;

    // Find maximum energy to scale properly
    let maxEnergy = 10;
    for (let h of this.energyHistory) {
      if (h.te > maxEnergy) maxEnergy = h.te;
    }
    
    // Safety buffer
    maxEnergy *= 1.15;

    const w = this.energyCanvas.width;
    const h = this.energyCanvas.height;

    const getX = (index) => (index / (this.maxHistoryLength - 1)) * w;
    const getY = (value) => h - (value / maxEnergy) * h;

    const drawLine = (prop, strokeStyle) => {
      this.energyCtx.beginPath();
      this.energyCtx.moveTo(getX(0), getY(this.energyHistory[0][prop]));
      for (let i = 1; i < this.energyHistory.length; i++) {
        this.energyCtx.lineTo(getX(i), getY(this.energyHistory[i][prop]));
      }
      this.energyCtx.strokeStyle = strokeStyle;
      this.energyCtx.lineWidth = 2;
      this.energyCtx.stroke();
    };

    // Draw individual trace lines
    drawLine('pe', '#a18cd1'); // Potential energy - purple
    drawLine('ke', '#00f2fe'); // Kinetic energy - cyan
    drawLine('te', '#ffb347'); // Total mechanical energy - gold
  }

  loop(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    const dt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    // Calculate FPS periodically
    this.fpsUpdateTimer += dt;
    if (this.fpsUpdateTimer >= 0.5) {
      this.fps = Math.round(1 / dt);
      document.getElementById('fps-counter').textContent = this.fps;
      this.fpsUpdateTimer = 0;
    }

    this.update(dt);
    this.draw();

    requestAnimationFrame((t) => this.loop(t));
  }

  start() {
    requestAnimationFrame((t) => {
      this.lastTime = t;
      this.loop(t);
    });
  }
}
