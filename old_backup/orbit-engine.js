/* ==========================================================================
   PHYSICS VAULT - COSMIC ORBITAL GRAVITY SIMULATION ENGINE
   Keplerian Orbit Solver, Newton gravity (F=GMm/r²), and Binary Stars Preset
   ========================================================================== */

export class CosmicEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    
    this.bodies = [];
    this.running = true;
    this.lastTime = 0;

    // Simulation Constants
    this.G = 1.5; // Custom gravitational constant for visual scales
    this.persistTrails = true;

    // Center Star properties
    this.star = { x: 0, y: 0, mass: 2000, radius: 24, color: '#ffb347' };

    // Launch Vector State
    this.dragStart = null;
    this.dragCurrent = null;
    this.isDragging = false;

    // Selected body for HUD telemetry
    this.selectedBody = null;

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

    // Center star statically
    this.star.x = this.width / 2;
    this.star.y = this.height / 2;
  }

  setupEvents() {
    window.addEventListener('resize', () => {
      this.initCanvasSize();
    });

    this.canvas.addEventListener('mousedown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      // Click to select planet for telemetry
      let clickedBody = null;
      for (let b of this.bodies) {
        const dx = b.x - mx;
        const dy = b.y - my;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < b.radius + 15) {
          clickedBody = b;
          break;
        }
      }

      if (clickedBody) {
        this.selectedBody = clickedBody;
        this.updateHUD();
      } else {
        // Start launch drag vector
        this.isDragging = true;
        this.dragStart = { x: mx, y: my };
        this.dragCurrent = { x: mx, y: my };
      }
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      if (this.isDragging) {
        this.dragCurrent = { x: mx, y: my };
      }
    });

    this.canvas.addEventListener('mouseup', () => {
      if (this.isDragging && this.dragStart && this.dragCurrent) {
        // Launch a new planet!
        const dx = this.dragCurrent.x - this.dragStart.x;
        const dy = this.dragCurrent.y - this.dragStart.y;

        // Velocity is directly proportional to drag length
        const vx = -dx * 0.14; 
        const vy = -dy * 0.14;

        this.addPlanet(this.dragStart.x, this.dragStart.y, vx, vy);
      }
      this.isDragging = false;
      this.dragStart = null;
      this.dragCurrent = null;
    });
  }

  addPlanet(x, y, vx, vy, radius = null, mass = null, color = null) {
    const rad = radius || Math.floor(Math.random() * 6) + 6; // 6-12 radius
    const m = mass || rad * 0.5; // Small mass relative to star

    const planetColors = ['#00f2fe', '#f3a0ff', '#a18cd1', '#00ff66', '#ff007f'];
    const col = color || planetColors[this.bodies.length % planetColors.length];

    const body = {
      id: 'Planet ' + (this.bodies.length + 1),
      x: x,
      y: y,
      vx: vx,
      vy: vy,
      radius: rad,
      mass: m,
      color: col,
      trail: [],
      static: false
    };

    this.bodies.push(body);
    this.selectedBody = body;
    document.getElementById('cosmic-count').textContent = this.bodies.length;
  }

  clear() {
    this.bodies = [];
    this.selectedBody = null;
    document.getElementById('cosmic-count').textContent = '0';
    this.updateHUD(true);
  }

  loadResetPreset() {
    this.clear();
    this.initCanvasSize();

    // Re-establish static central star mass
    this.star.static = true;
    this.star.id = 'Sol Star';
    this.bodies.push(this.star);

    // Launch beautiful stable orbits representing solar system
    // Planet 1 (Inner planet, fast)
    this.addPlanet(this.star.x, this.star.y - 100, 5.5, 0, 8, 3, '#00f2fe');
    // Planet 2 (Middle orbit planet)
    this.addPlanet(this.star.x, this.star.y - 170, 4.2, 0, 10, 5, '#a18cd1');
    // Planet 3 (Outer ellipse planet)
    this.addPlanet(this.star.x, this.star.y - 250, 3.4, 0, 12, 8, '#ffb347');
    
    this.selectedBody = this.bodies[1]; // Focus innermost planet
    this.updateHUD();
  }

  loadBinaryStars() {
    this.clear();
    this.initCanvasSize();

    // Binary Dance stars orbiting their shared center of mass (barycenter)
    const m = 1800;
    const r = 20;
    const gap = 120;
    const speed = 4.8;

    const star1 = {
      id: 'Star Alpha',
      x: this.star.x - gap,
      y: this.star.y,
      vx: 0,
      vy: speed,
      radius: r,
      mass: m,
      color: '#ffb347',
      trail: [],
      static: false
    };

    const star2 = {
      id: 'Star Beta',
      x: this.star.x + gap,
      y: this.star.y,
      vx: 0,
      vy: -speed,
      radius: r,
      mass: m,
      color: '#00f2fe',
      trail: [],
      static: false
    };

    this.bodies.push(star1);
    this.bodies.push(star2);
    
    this.selectedBody = star1;
    this.updateHUD();
    document.getElementById('cosmic-count').textContent = this.bodies.length;
  }

  togglePlayPause() {
    this.running = !this.running;
    return this.running;
  }

  update(dt) {
    if (!this.running) return;

    if (dt > 0.05) dt = 0.05;

    const len = this.bodies.length;

    // Apply Gravitational Attraction mutual forces (N-body gravity simulation)
    for (let i = 0; i < len; i++) {
      const b1 = this.bodies[i];
      if (b1.static) continue;

      let fx = 0;
      let fy = 0;

      for (let j = 0; j < len; j++) {
        if (i === j) continue;
        const b2 = this.bodies[j];

        const dx = b2.x - b1.x;
        const dy = b2.y - b1.y;
        const distSq = dx*dx + dy*dy + 100; // Softening factor to prevent infinite division at collision
        const dist = Math.sqrt(distSq);

        // F = G * m1 * m2 / r^2
        const forceMag = (this.G * b1.mass * b2.mass) / distSq;

        fx += forceMag * (dx / dist);
        fy += forceMag * (dy / dist);
      }

      // Update planetary velocity: a = F/m
      b1.vx += (fx / b1.mass) * dt * 60;
      b1.vy += (fy / b1.mass) * dt * 60;
    }

    // Update coordinates and trails
    for (let b of this.bodies) {
      if (b.static) continue;

      b.x += b.vx * dt * 60;
      b.y += b.vy * dt * 60;

      // Orbit trails
      b.trail.push({ x: b.x, y: b.y });
      if (this.persistTrails) {
        if (b.trail.length > 500) b.trail.shift();
      } else {
        if (b.trail.length > 60) b.trail.shift();
      }
    }

    this.updateHUD();
  }

  updateHUD(reset = false) {
    if (reset || !this.selectedBody || this.selectedBody.static) {
      document.getElementById('tel-name').textContent = '---';
      document.getElementById('tel-distance').textContent = '0.0 AU';
      document.getElementById('tel-velocity').textContent = '0.0 km/s';
      document.getElementById('tel-eccentricity').textContent = '0.000';
      return;
    }

    const b = this.selectedBody;

    // Find nearest static massive central gravity star to calculate Keplerian parameters
    let massivePivot = this.star;
    // In Binary star, find the other body as gravitational reference
    if (this.bodies.length === 2) {
      massivePivot = this.bodies.find(item => item !== b);
    }

    const dx = b.x - massivePivot.x;
    const dy = b.y - massivePivot.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const speed = Math.sqrt(b.vx*b.vx + b.vy*b.vy);

    // AU Conversion factor for visuals
    const distAU = (dist / 140).toFixed(2);
    // km/s conversion scaling
    const speedKMS = (speed * 7.2).toFixed(1);

    // SOLVE KEPLERIAN ECCENTRICITY
    // Parameter mu = G * M
    const mu = this.G * massivePivot.mass;
    
    // Orbital energy per unit mass: epsilon = 0.5*v^2 - mu/r
    const epsilon = 0.5 * (speed*speed) - mu/dist;

    // Angular momentum: h = x*vy - y*vx
    const h = dx * b.vy - dy * b.vx;

    // Eccentricity: e = sqrt(1 + 2*epsilon*h^2 / mu^2)
    let eccentricity = 0;
    const eVal = 1 + (2 * epsilon * h * h) / (mu * mu);
    if (eVal >= 0) {
      eccentricity = Math.sqrt(eVal);
    }

    document.getElementById('tel-name').textContent = b.id;
    document.getElementById('tel-distance').textContent = `${distAU} AU`;
    document.getElementById('tel-velocity').textContent = `${speedKMS} km/s`;
    document.getElementById('tel-eccentricity').textContent = eccentricity.toFixed(3);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Starry Constellations background
    this.drawSpaceBackground();

    // 2. Draw Orbit Trails
    for (let b of this.bodies) {
      if (b.static || b.trail.length < 2) continue;

      this.ctx.beginPath();
      this.ctx.moveTo(b.trail[0].x, b.trail[0].y);
      for (let idx = 1; idx < b.trail.length; idx++) {
        this.ctx.lineTo(b.trail[idx].x, b.trail[idx].y);
      }
      this.ctx.strokeStyle = b.color;
      this.ctx.lineWidth = 1.5;
      
      if (!this.persistTrails) {
        // Gradient fade out for performance trails
        this.ctx.globalAlpha = 0.4;
      } else {
        this.ctx.globalAlpha = 0.65;
      }
      this.ctx.stroke();
      this.ctx.globalAlpha = 1.0;
    }

    // 3. Draw celestial bodies
    for (let b of this.bodies) {
      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);

      if (b.static) {
        // Burning Star glowing linear gradient
        const radGrad = this.ctx.createRadialGradient(b.x, b.y, b.radius * 0.1, b.x, b.y, b.radius * 1.5);
        radGrad.addColorStop(0, '#ffffff');
        radGrad.addColorStop(0.3, '#ffcc33');
        radGrad.addColorStop(0.7, '#ffb347');
        radGrad.addColorStop(1, 'rgba(255, 179, 71, 0)');
        this.ctx.fillStyle = radGrad;
        
        // Massive glow shadow
        this.ctx.shadowBlur = 24;
        this.ctx.shadowColor = '#ffb347';
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
      } else {
        // Planet body
        this.ctx.fillStyle = 'rgba(10, 10, 30, 0.7)';
        this.ctx.fill();

        this.ctx.strokeStyle = b.color;
        this.ctx.lineWidth = 2.5;
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = b.color;
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;

        // Shadow shading overlay to represent sunlight direction
        // Draw a dark crescent mask on the side facing away from the center star
        this.drawPlanetShadow(b);
      }

      // Draw selector ring on focused telemetry target
      if (this.selectedBody === b) {
        this.ctx.beginPath();
        this.ctx.arc(b.x, b.y, b.radius + 6, 0, Math.PI*2);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([4, 4]);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
      }
    }

    // 4. Draw Launch drag preview vector
    if (this.isDragging && this.dragStart && this.dragCurrent) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.dragStart.x, this.dragStart.y);
      this.ctx.lineTo(this.dragCurrent.x, this.dragCurrent.y);
      this.ctx.strokeStyle = '#00f2fe';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      // Draw inverse launcher preview path projection
      const dx = this.dragCurrent.x - this.dragStart.x;
      const dy = this.dragCurrent.y - this.dragStart.y;
      
      this.ctx.beginPath();
      this.ctx.arc(this.dragStart.x, this.dragStart.y, 6, 0, Math.PI*2);
      this.ctx.fillStyle = '#00f2fe';
      this.ctx.fill();

      // Launch vector projection path lines
      this.ctx.beginPath();
      this.ctx.moveTo(this.dragStart.x, this.dragStart.y);
      this.ctx.lineTo(this.dragStart.x - dx * 2, this.dragStart.y - dy * 2);
      this.ctx.strokeStyle = 'rgba(0, 242, 254, 0.25)';
      this.ctx.lineWidth = 1.5;
      this.ctx.setLineDash([5, 5]);
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }
  }

  drawSpaceBackground() {
    // Subtle star dust particles
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    // Pseudo-random star seeds
    const numStars = 60;
    for (let i = 0; i < numStars; i++) {
      const x = (Math.sin(i * 12345) * 0.5 + 0.5) * this.width;
      const y = (Math.cos(i * 54321) * 0.5 + 0.5) * this.height;
      const size = (Math.sin(i * 999) * 0.5 + 0.5) * 1.5;
      this.ctx.fillRect(x, y, size, size);
    }
  }

  drawPlanetShadow(p) {
    // Find angle to primary star
    let massivePivot = this.star;
    if (this.bodies.length === 2) {
      massivePivot = this.bodies.find(item => item !== p);
    }

    const angleToStar = Math.atan2(massivePivot.y - p.y, massivePivot.x - p.x);
    
    // Draw shadow crescent
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    this.ctx.clip();

    // Fill semicircle facing away from star with dark overlay
    this.ctx.beginPath();
    // Normal to star direction
    this.ctx.arc(p.x, p.y, p.radius, angleToStar + Math.PI/2, angleToStar - Math.PI/2);
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    this.ctx.fill();

    this.ctx.restore();
  }

  loop(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    const dt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

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
