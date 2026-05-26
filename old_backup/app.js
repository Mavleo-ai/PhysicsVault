/* ==========================================================================
   PHYSICS VAULT - MASTER CORE APPLICATION MODULE
   Splash loader, Pomodoro controller, Habits tracker, Custom SVG Canvas charting,
   and Simulated AI Doubt Solver timeline
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // --------------------------------------------------------------------------
  // 1. DYNAMIC SPLASH SCREEN LOADER
  // --------------------------------------------------------------------------
  const runSplashSequence = () => {
    let w = 0;
    const bar = document.getElementById('loadBar');
    const splash = document.getElementById('splash');
    
    const interval = setInterval(() => {
      w += Math.floor(Math.random() * 15) + 10;
      if (w >= 100) {
        w = 100;
        clearInterval(interval);
        
        // Hide splash screen with smooth fade transition
        setTimeout(() => {
          splash.classList.add('hide');
        }, 150);

        // Remove splash from DOM after transition completes
        setTimeout(() => {
          if (splash && splash.parentNode) {
            splash.parentNode.removeChild(splash);
          }
        }, 650);
      }
      if (bar) bar.style.width = w + '%';
    }, 100);
  };

  runSplashSequence();

  // --------------------------------------------------------------------------
  // 2. CORE SPA VARIABLES & CONFIGURATIONS
  // --------------------------------------------------------------------------
  let streakDays = 5;
  let completedTasks = 3;
  let totalHabitsCount = 5;

  let portalConfig = { focusDur: 25, shortDur: 5, longDur: 15, geminiKey: '' };
  
  // Read saved configurations
  const savedConfig = localStorage.getItem('physics_vault_config');
  if (savedConfig) {
    try {
      portalConfig = JSON.parse(savedConfig);
    } catch (e) {
      console.warn('Config parsing failed, defaults loaded.');
    }
  }

  let habits = [
    { id: 1, text: 'Solve 10 Maths Problems', subject: 'maths', checked: true },
    { id: 2, text: 'Watch 1 Chemistry lecture', subject: 'chem', checked: false },
    { id: 3, text: 'Revise Physics notes', subject: 'physics', checked: true },
    { id: 4, text: 'Read 20 pages of textbook', subject: 'general', checked: false },
    { id: 5, text: 'Review yesterday\'s errors', subject: 'general', checked: true }
  ];

  // --------------------------------------------------------------------------
  // 3. POMODORO TIMER STATION
  // --------------------------------------------------------------------------
  let timerId = null;
  let isRunning = false;
  let secondsLeft = portalConfig.focusDur * 60; // Pulls from configured Focus
  let totalSeconds = portalConfig.focusDur * 60;
  let currentMode = 'focus'; // 'focus', 'short', 'long'

  const timerClock = document.getElementById('timer-clock');
  const timerStatus = document.getElementById('timer-status');
  const progressRing = document.getElementById('progress-ring');
  const btnTimerToggle = document.getElementById('btn-timer-toggle');
  
  // Circumference of SVG Progress Ring (r = 88) => 2 * PI * 88 = 552.92
  const maxCircumference = 553;
  progressRing.style.strokeDasharray = maxCircumference;
  progressRing.style.strokeDashoffset = 0;

  // Synthesize beautiful notifications sounds using Web Audio API
  const playAlertChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Play Note 1: C5 (523.25 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
      gain1.gain.setValueAtTime(0.12, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.45);

      // Play Note 2: E5 (659.25 Hz) played smoothly after 0.25s
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659.25, ctx.currentTime);
        gain2.gain.setValueAtTime(0.12, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.55);
      }, 250);

    } catch (e) {
      console.warn('Audio synthesis skipped:', e);
    }
  };

  const updateClock = () => {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    
    // Format timer clocks
    const formattedTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    timerClock.textContent = formattedTime;

    // Update browser title tab dynamically
    document.title = `(${formattedTime}) PhysicsVault — JEE Study Portal`;

    // Render Circle Progress Ring
    const ratio = secondsLeft / totalSeconds;
    // Offset counts backwards from 0 (filled) to 553 (empty)
    progressRing.style.strokeDashoffset = maxCircumference - (ratio * maxCircumference);
  };

  const setTimerMode = (mode, mins) => {
    // Clear loop if running
    clearInterval(timerId);
    isRunning = false;
    btnTimerToggle.textContent = 'Start Session';
    btnTimerToggle.classList.remove('paused');
    
    currentMode = mode;
    secondsLeft = mins * 60;
    totalSeconds = mins * 60;

    // Toggle active classes on preset buttons
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    
    if (mode === 'focus') {
      document.getElementById('btn-mode-focus').classList.add('active');
      timerStatus.textContent = 'Focus Session';
      progressRing.style.stroke = 'url(#timer-ring-grad-focus)'; // Red/Purple Gradient
    } else if (mode === 'short') {
      document.getElementById('btn-mode-short').classList.add('active');
      timerStatus.textContent = 'Short Break';
      progressRing.style.stroke = 'var(--color-accent)'; // Neon green
    } else if (mode === 'long') {
      document.getElementById('btn-mode-long').classList.add('active');
      timerStatus.textContent = 'Long Break';
      progressRing.style.stroke = 'var(--color-phy)'; // Cyan
    }

    updateClock();
  };

  const toggleTimer = () => {
    if (isRunning) {
      // Pause simulation
      clearInterval(timerId);
      isRunning = false;
      btnTimerToggle.textContent = 'Resume';
      btnTimerToggle.classList.add('paused');
    } else {
      // Start simulation countdown
      isRunning = true;
      btnTimerToggle.textContent = 'Pause';
      btnTimerToggle.classList.remove('paused');

      timerId = setInterval(() => {
        secondsLeft--;
        if (secondsLeft <= 0) {
          secondsLeft = 0;
          clearInterval(timerId);
          isRunning = false;
          
          playAlertChime();
          
          // Switch presets automatically when complete
          if (currentMode === 'focus') {
            streakDays++;
            document.getElementById('streak-counter').textContent = `${streakDays} Days`;
            alert('Focus session complete! Time to take a short break.');
            setTimerMode('short', portalConfig.shortDur);
          } else {
            alert('Break over! Time to get back to studying.');
            setTimerMode('focus', portalConfig.focusDur);
          }
        }
        updateClock();
      }, 1000);
    }
  };

  // Wire preset buttons
  document.getElementById('btn-mode-focus').addEventListener('click', () => setTimerMode('focus', portalConfig.focusDur));
  document.getElementById('btn-mode-short').addEventListener('click', () => setTimerMode('short', portalConfig.shortDur));
  document.getElementById('btn-mode-long').addEventListener('click', () => setTimerMode('long', portalConfig.longDur));

  // Wire Control triggers
  btnTimerToggle.addEventListener('click', toggleTimer);
  document.getElementById('btn-timer-reset').addEventListener('click', () => {
    const mins = currentMode === 'focus' ? portalConfig.focusDur : (currentMode === 'short' ? portalConfig.shortDur : portalConfig.longDur);
    setTimerMode(currentMode, mins);
  });

  // Initialize Clock State
  setTimerMode('focus', portalConfig.focusDur);


  // --------------------------------------------------------------------------
  // 4. HABITS CHECKLIST CONTROLLER
  // --------------------------------------------------------------------------
  const habitsContainer = document.getElementById('habits-container');
  const checklistRatio = document.getElementById('checklist-ratio');
  const checklistProgressBar = document.getElementById('checklist-progress-bar');
  const completedBadge = document.getElementById('completed-badge');

  const updateHabitsProgress = () => {
    const total = habits.length;
    const completed = habits.filter(h => h.checked).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    checklistRatio.textContent = `${percentage}%`;
    checklistProgressBar.style.width = `${percentage}%`;
    completedBadge.textContent = `${completed}/${total}`;
  };

  const renderHabits = () => {
    habitsContainer.innerHTML = '';
    
    habits.forEach(h => {
      const li = document.createElement('li');
      li.className = `habit-item ${h.checked ? 'checked' : ''}`;
      li.setAttribute('data-id', h.id);

      // Create Subject Badge markup if applicable
      let badgeMarkup = '';
      if (h.subject !== 'general') {
        const badgeClass = h.subject === 'physics' ? 'badge-phy' : (h.subject === 'chem' ? 'badge-chem' : 'badge-maths');
        const badgeLabel = h.subject === 'physics' ? 'Phy' : (h.subject === 'chem' ? 'Chem' : 'Maths');
        badgeMarkup = `<span class="subject-badge ${badgeClass}">${badgeLabel}</span>`;
      }

      li.innerHTML = `
        <div class="custom-checkbox"></div>
        <span class="habit-label">${h.text}</span>
        ${badgeMarkup}
        <button class="habit-delete-btn">&times;</button>
      `;

      // Checkbox click handler
      li.querySelector('.custom-checkbox').addEventListener('click', () => {
        h.checked = !h.checked;
        li.classList.toggle('checked', h.checked);
        updateHabitsProgress();
      });

      // Delete item click handler
      li.querySelector('.habit-delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        habits = habits.filter(item => item.id !== h.id);
        renderHabits();
      });

      habitsContainer.appendChild(li);
    });

    updateHabitsProgress();
  };

  // Add custom habits log trigger
  const addTaskForm = document.getElementById('add-task-form');
  const inputNewTask = document.getElementById('input-new-task');

  addTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const txt = inputNewTask.value.trim();
    if (!txt) return;

    // Detect subject from text queries
    let subject = 'general';
    const lowTxt = txt.toLowerCase();
    if (lowTxt.includes('physics') || lowTxt.includes('phy') || lowTxt.includes('irodov')) {
      subject = 'physics';
    } else if (lowTxt.includes('chemistry') || lowTxt.includes('chem') || lowTxt.includes('organic')) {
      subject = 'chem';
    } else if (lowTxt.includes('math') || lowTxt.includes('calculus') || lowTxt.includes('algebra')) {
      subject = 'maths';
    }

    habits.push({
      id: Date.now(),
      text: txt,
      subject: subject,
      checked: false
    });

    inputNewTask.value = '';
    renderHabits();
  });

  // Initial Habits Render
  renderHabits();


  // --------------------------------------------------------------------------
  // 5. STUDY LOGS & DYNAMIC CANVAS CHART ENGINE
  // --------------------------------------------------------------------------
  let studyHours = {
    physics: 90,     // minutes spent
    chemistry: 120,
    maths: 60
  };

  const updateHUDStudyHoursText = () => {
    const totalMins = studyHours.physics + studyHours.chemistry + studyHours.maths;
    const hrs = (totalMins / 60).toFixed(1);
    document.getElementById('total-study-time').textContent = `${hrs} Hrs`;
  };

  // Render dynamic subject logs text labels
  const updateSubjectTimeText = () => {
    document.getElementById('log-time-physics').textContent = `${studyHours.physics}m`;
    document.getElementById('log-time-chemistry').textContent = `${studyHours.chemistry}m`;
    document.getElementById('log-time-maths').textContent = `${studyHours.maths}m`;
  };

  // Light, high-fidelity dynamic HTML5 Chart rendering
  const canvas = document.getElementById('analytics-chart-canvas');
  const ctx = canvas.getContext('2d');

  const initChartCanvasSize = () => {
    const rect = canvas.parentNode.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  };

  const drawAnalyticsChart = () => {
    if (!canvas) return;
    
    // Safety size reload
    const w = canvas.width / window.devicePixelRatio;
    const h = canvas.height / window.devicePixelRatio;

    ctx.clearRect(0, 0, w, h);

    // Padding bounds
    const padLeft = 40;
    const padBottom = 20;
    const padTop = 15;
    
    const chartW = w - padLeft - 20;
    const chartH = h - padBottom - padTop;

    // Draw horizontal grid references
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
    ctx.lineWidth = 1;
    const lines = 3;
    for (let i = 0; i <= lines; i++) {
      const yLine = padTop + (chartH / lines) * i;
      ctx.beginPath();
      ctx.moveTo(padLeft, yLine);
      ctx.lineTo(w - 20, yLine);
      ctx.stroke();
    }

    // Chart Subjects Keys config
    const data = [
      { name: 'Phy', key: 'physics', color: '#00d4ff', gradStop: '#008cba' },
      { name: 'Chem', key: 'chemistry', color: '#ff8c00', gradStop: '#c85000' },
      { name: 'Maths', key: 'maths', color: '#a855f7', gradStop: '#6b21a8' }
    ];

    // Find maximum bounds to scale columns
    const maxVal = Math.max(120, studyHours.physics, studyHours.chemistry, studyHours.maths);
    const barSpacing = chartW / data.length;

    data.forEach((item, idx) => {
      const val = studyHours[item.key];
      // Proportional height
      const barH = (val / maxVal) * (chartH - 10);
      
      const xBar = padLeft + barSpacing * idx + (barSpacing - 38) / 2;
      const yBar = h - padBottom - barH;

      // Draw Column Bar Gradients
      const grad = ctx.createLinearGradient(xBar, yBar, xBar, h - padBottom);
      grad.addColorStop(0, item.color);
      grad.addColorStop(1, item.gradStop);

      ctx.fillStyle = grad;
      ctx.beginPath();
      // Round top borders only
      ctx.roundRect(xBar, yBar, 38, barH, [6, 6, 0, 0]);
      ctx.fill();

      // Shadow Glow Borders
      ctx.strokeStyle = item.color;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Label Texts under Columns
      ctx.fillStyle = '#6a8ba2';
      ctx.font = 'bold 10px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(item.name, xBar + 19, h - 6);

      // Value counts overlay above bars
      ctx.fillStyle = '#ffffff';
      ctx.font = '500 11px Fira Code';
      ctx.fillText(`${val}m`, xBar + 19, yBar - 6);
    });

    // Draw Y-Axis label coordinates (0, Max value)
    ctx.fillStyle = '#5a7a9a';
    ctx.font = 'bold 9px Fira Code';
    ctx.textAlign = 'right';
    ctx.fillText(`${maxVal}m`, padLeft - 6, padTop + 4);
    ctx.fillText('0m', padLeft - 6, h - padBottom + 2);
  };

  // Wire log update buttons (+15m / -15m)
  document.querySelectorAll('.log-adjust-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sub = btn.getAttribute('data-subject');
      const amt = parseInt(btn.getAttribute('data-amount'), 10);

      // Mutate hours
      studyHours[sub] = Math.max(0, studyHours[sub] + amt);
      
      updateSubjectTimeText();
      updateHUDStudyHoursText();
      drawAnalyticsChart();
    });
  });

  // Init canvas reflow resizing observers
  window.addEventListener('resize', () => {
    initChartCanvasSize();
    drawAnalyticsChart();
  });

  // Setup initial drawing
  initChartCanvasSize();
  updateSubjectTimeText();
  updateHUDStudyHoursText();
  drawAnalyticsChart();


  // --------------------------------------------------------------------------
  // 6. SIMULATED AI DOUBT SOLVER CHAT
  // --------------------------------------------------------------------------
  const chatMessagesContainer = document.getElementById('chat-messages-container');
  const inputDoubtField = document.getElementById('input-doubt-field');
  const btnSubmitDoubt = document.getElementById('btn-submit-doubt');

  // Pre-programmed high quality LaTeX responses matching subject queries
  const solverResponses = [
    {
      keys: ['coulomb', 'electrostatic', 'force', 'charge'],
      subject: 'Physics',
      ans: `<strong>Coulomb's Law</strong> governs the electrostatic force between two static charges. Let charges be $q_1$ and $q_2$ at separation distance $r$.
      
      The force vector magnitude is:
      $$\\vec{F} = k_e \\cdot \\frac{q_1 q_2}{r^2} \\hat{r}$$
      
      Where:
      - $k_e = \\frac{1}{4\\pi\\varepsilon_0} \\approx 8.987 \\times 10^9 \\text{ N}\\cdot\\text{m}^2/\\text{C}^2$ (Coulomb's electrostatic constant).
      - $\\varepsilon_0 \\approx 8.854 \\times 10^{-12} \\text{ F/m}$ is permittivity of free space.
      
      <strong>JEE Tips:</strong> Permittivity changes inside a dielectric medium: $\\varepsilon = K \\cdot \\varepsilon_0$, reducing net forces by factor $K$.`
    },
    {
      keys: ['work', 'energy', 'theorem', 'conservative'],
      subject: 'Physics',
      ans: `The **Work-Energy Theorem** is a fundamental scalar tool in mechanics stating that work done by all forces (conservative, non-conservative, and internal) equals change in kinetic energy:
      $$W_{\\text{net}} = \\Delta KE = KE_f - KE_i$$
      
      Where:
      - $W_{\\text{net}} = \\int \\vec{F}_{\\text{net}} \\cdot d\\vec{r}$
      - $KE = \\frac{1}{2} m v^2$
      
      If only conservative forces act: $W_{\\text{con}} = -\\Delta PE$, leading to conservation of total mechanical energy:
      $$KE_i + PE_i = KE_f + PE_f$$`
    },
    {
      keys: ['roots', 'quadratic', 'roots sum', 'roots product'],
      subject: 'Mathematics',
      ans: `For a standard quadratic polynomial:
      $$a x^2 + b x + c = 0 \\quad (a \\neq 0)$$
      
      The roots $\\alpha$ and $\\beta$ are resolved analytically using the discriminant:
      $$x = \\frac{-b \\pm \\sqrt{D}}{2a}$$
      
      Where the Discriminant $D = b^2 - 4ac$.
      
      <strong>Roots Properties (Vieta's Relations):</strong>
      - Sum of roots: $\\alpha + \\beta = -\\frac{b}{a}$
      - Product of roots: $\\alpha \\cdot \\beta = \\frac{c}{a}$
      - Difference of roots: $|\\alpha - \\beta| = \\frac{\\sqrt{D}}{|a|}$`
    },
    {
      keys: ['nernst', 'electrochemistry', 'potential', 'cell'],
      subject: 'Chemistry',
      ans: `The **Nernst Equation** relates cell potential to concentration ratios of reactants and products:
      $$E_{\\text{cell}} = E^\\circ_{\\text{cell}} - \\frac{RT}{nF} \\ln(Q)$$
      
      At 298 Kelvin (Standard room conditions), this simplifies with log-base-10:
      $$E_{\\text{cell}} = E^\\circ_{\\text{cell}} - \\frac{0.0591}{n} \\log_{10}(Q)$$
      
      Where:
      - $E^\\circ_{\\text{cell}}$ = standard reduction cell potential.
      - $n$ = moles of electrons transferred.
      - $Q$ = reaction quotient.`
    }
  ];

  const addChatBubble = (sender, content, type = 'ai') => {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${type === 'ai' ? 'ai-bubble' : 'user-bubble'}`;
    
    bubble.innerHTML = `
      <div class="bubble-sender">${sender}</div>
      <div class="bubble-content">${content}</div>
    `;
    
    chatMessagesContainer.appendChild(bubble);
    
    // Smooth scrolling to newest message
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
  };

  // Custom Markdown & LaTeX parser helper
  const parseDoubtResponseMarkdown = (text) => {
    if (!text) return '';
    let html = text;

    // Escaping standard special HTML tags to prevent XSS
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Translate $$ ... $$ blocks to beautiful formula-block structures
    html = html.replace(/\$\$(.*?)\$\$/gs, '<div class="formula-block font-mono text-center" style="border: 1px solid rgba(0, 212, 255, 0.15); background: rgba(0,0,0,0.3); padding: 10px 14px; border-radius: 8px; margin-block: 8px; color: var(--color-phy);">$1</div>');

    // Translate $ ... $ inline math to code tags
    html = html.replace(/\$(.*?)\$/g, '<code style="color: var(--color-phy); background: rgba(0, 212, 255, 0.06); padding: 1px 4px; border-radius: 3px;">$1</code>');

    // Headers H1, H2, H3
    html = html.replace(/^### (.*?)$/gm, '<h3 style="font-family: var(--font-header); font-size: 13px; color: #ffffff; margin-top: 10px; margin-bottom: 4px;">$1</h3>');
    html = html.replace(/^## (.*?)$/gm, '<h2 style="font-family: var(--font-header); font-size: 14px; color: #ffffff; margin-top: 12px; margin-bottom: 6px;">$1</h2>');
    html = html.replace(/^# (.*?)$/gm, '<h1 style="font-family: var(--font-header); font-size: 16px; color: #ffffff; margin-top: 14px; margin-bottom: 8px;">$1</h1>');

    // Fenced Code blocks
    html = html.replace(/```([\s\S]*?)```/gm, '<pre style="background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.03); font-family: var(--font-mono); font-size: 11px; overflow-x: auto; margin-block: 8px;"><code>$1</code></pre>');

    // Inline Code
    html = html.replace(/`([^`]+)`/g, '<code style="font-family: var(--font-mono); background: rgba(0,0,0,0.2); padding: 1px 4px; border-radius: 3px; font-size: 11px;">$1</code>');

    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Bullet points list
    html = html.replace(/^\- (.*?)$/gm, '<li style="margin-left: 14px; list-style-type: disc; margin-bottom: 4px;">$1</li>');
    html = html.replace(/(<li style=".*?">.*?<\/li>)+/gs, '<ul style="margin-block: 8px;">$&</ul>');

    // Paragraph returns
    html = html.replace(/\n\n/g, '</p><p style="margin-bottom: 8px;">');
    html = html.replace(/\n/g, '<br>');

    if (!html.startsWith('<p') && !html.startsWith('<h') && !html.startsWith('<ul') && !html.startsWith('<div')) {
      html = '<p style="margin-bottom: 8px;">' + html + '</p>';
    }
    return html;
  };

  const processDoubtSubmission = async () => {
    const txt = inputDoubtField.value.trim();
    if (!txt) return;

    // Add User Bubble
    addChatBubble('You (JEE Aspirant)', txt, 'user');
    inputDoubtField.value = '';

    // Create temporary typing loader bubble
    const typingBubble = document.createElement('div');
    typingBubble.className = 'chat-bubble ai-bubble';
    typingBubble.innerHTML = `
      <div class="bubble-sender">⚛ PhysicsVault Bot</div>
      <div class="bubble-content">
        <div class="typing-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    chatMessagesContainer.appendChild(typingBubble);
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;

    if (portalConfig.geminiKey) {
      // Live Real Google Gemini 2.5 Flash API Client Request!
      try {
        const systemPrompt = `You are a world-class, premium IIT JEE expert tutor specializing in Physics, Chemistry, and Mathematics. Solve the user's doubt step-by-step with absolute clarity, perfect mathematical correctness, and helpful studying tips. Use proper, clean markdown styling. When writing formulas or equations, use standard mathematical notation or LaTeX format (e.g. $$E = mc^2$$ or $F = ma$) so they look professional. Keep the tone encouraging, highly academic, and clear.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${portalConfig.geminiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: `${systemPrompt}\n\nStudent's Doubt: ${txt}` }
                ]
              }
            ]
          })
        });

        // Remove typing bubble
        if (typingBubble.parentNode) {
          typingBubble.parentNode.removeChild(typingBubble);
        }

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        const rawReply = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawReply) {
          throw new Error("No response generated from the Gemini model.");
        }

        // Format and parse the markdown reply
        const formattedReply = parseDoubtResponseMarkdown(rawReply);
        addChatBubble('⚛ PhysicsVault AI (Live Gemini Tutor)', formattedReply, 'ai');

      } catch (err) {
        // Remove typing bubble if still present
        if (typingBubble.parentNode) {
          typingBubble.parentNode.removeChild(typingBubble);
        }
        console.error('Gemini API Error:', err);
        addChatBubble(
          '⚛ PhysicsVault Bot',
          `⚠️ <strong>Real-time AI Doubt Solver failed to connect:</strong><br>${err.message}<br><br>Please check your internet connection or verify your Google Gemini API Key inside the ⚙ <strong>Settings</strong> panel!`,
          'ai'
        );
      }
    } else {
      // Run simulated fallback tutor responses (with a helpful hint to activate Gemini key)
      setTimeout(() => {
        if (typingBubble.parentNode) {
          typingBubble.parentNode.removeChild(typingBubble);
        }

        const lowTxt = txt.toLowerCase();
        let matchedAns = null;

        for (let item of solverResponses) {
          const match = item.keys.some(key => lowTxt.includes(key));
          if (match) {
            matchedAns = item;
            break;
          }
        }

        const promoTip = `<br><br><span style="display:inline-block; font-size:11px; color:#a18cd1; border:1px dashed rgba(161, 140, 209, 0.25); padding:4px 8px; border-radius:6px; margin-top:8px;">💡 <strong>Pro-Tip:</strong> Want live, personalized, real-time answers? Get a free key from Google AI Studio and enter it inside ⚙ <strong>Settings</strong>!</span>`;

        if (matchedAns) {
          addChatBubble(
            `⚛ PhysicsVault AI (${matchedAns.subject} Tutor)`,
            matchedAns.ans + promoTip,
            'ai'
          );
        } else {
          addChatBubble(
            '⚛ PhysicsVault AI (Study Assistant)',
            `Thank you for submitted doubt: <em>"${txt}"</em>.
            <br><br>
            <strong>Step 1: Conceptual Identification</strong>
            We identify this falls under standard JEE modules. For high-fidelity answers, check related equations:
            <ul>
              <li>Ensure initial and final conservation boundaries are correctly defined.</li>
              <li>Double check unit scales (SI equivalents).</li>
            </ul>
            <br>
            <strong>Step 2: Recommendations</strong>
            Use the <strong>Formula Reference Cheat-Sheets</strong> popouts below to review the governing equations for this subject. Try solving for unknown variables dynamically in your notes!${promoTip}`,
            'ai'
          );
        }
      }, 1500);
    }
  };

  // Wire submission listeners
  btnSubmitDoubt.addEventListener('click', processDoubtSubmission);
  inputDoubtField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      processDoubtSubmission();
    }
  });


  // --------------------------------------------------------------------------
  // 7. PREMIUM FORMULA & CONFIGURATIONS REFERENCE POPUPS / MODALS
  // --------------------------------------------------------------------------
  
  // Settings Button Trigger
  const btnSettingsHud = document.getElementById('btn-settings-hud');
  const modalSettings = document.getElementById('modal-settings');
  const settingsFocus = document.getElementById('settings-focus');
  const settingsShort = document.getElementById('settings-short');
  const settingsLong = document.getElementById('settings-long');
  const lblFocus = document.getElementById('lbl-settings-focus');
  const lblShort = document.getElementById('lbl-settings-short');
  const lblLong = document.getElementById('lbl-settings-long');
  const settingsApiKey = document.getElementById('settings-api-key');

  btnSettingsHud.addEventListener('click', () => {
    // Load current configuration into input states
    settingsFocus.value = portalConfig.focusDur;
    settingsShort.value = portalConfig.shortDur;
    settingsLong.value = portalConfig.longDur;
    
    lblFocus.textContent = portalConfig.focusDur;
    lblShort.textContent = portalConfig.shortDur;
    lblLong.textContent = portalConfig.longDur;
    
    settingsApiKey.value = portalConfig.geminiKey;

    modalSettings.showModal();
  });

  // Settings range sliders inputs listeners
  settingsFocus.addEventListener('input', () => lblFocus.textContent = settingsFocus.value);
  settingsShort.addEventListener('input', () => lblShort.textContent = settingsShort.value);
  settingsLong.addEventListener('input', () => lblLong.textContent = settingsLong.value);

  // Settings Save Button Click
  document.getElementById('btn-save-settings').addEventListener('click', () => {
    portalConfig.focusDur = parseInt(settingsFocus.value, 10);
    portalConfig.shortDur = parseInt(settingsShort.value, 10);
    portalConfig.longDur = parseInt(settingsLong.value, 10);
    portalConfig.geminiKey = settingsApiKey.value.trim();

    localStorage.setItem('physics_vault_config', JSON.stringify(portalConfig));

    // Reset clock dynamically if not currently running
    if (!isRunning) {
      const mins = currentMode === 'focus' ? portalConfig.focusDur : (currentMode === 'short' ? portalConfig.shortDur : portalConfig.longDur);
      setTimerMode(currentMode, mins);
    }

    modalSettings.close();
  });



  // Wire modal close buttons
  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close');
      const dialog = document.getElementById(modalId);
      if (dialog) {
        dialog.close();
      }
    });
  });

  // Close modals when clicked outside content box (on the backdrop overlay)
  document.querySelectorAll('.glassmorphic-modal').forEach(dialog => {
    dialog.addEventListener('click', (e) => {
      const rect = dialog.getBoundingClientRect();
      const clickInside = (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      );
      if (!clickInside) {
        dialog.close();
      }
    });
  });

  // ==========================================================================
  // 8. QUANTUM MECHANICS SCROLLYTELLING ENGINE
  // ==========================================================================
  const qCanvas = document.getElementById('quantum-scroll-canvas');
  if (qCanvas) {
    const qCtx = qCanvas.getContext('2d');
    
    // Star particles for landing background
    const starsCount = 40;
    const stars = [];
    
    const initStars = (width, height) => {
      stars.length = 0;
      for (let i = 0; i < starsCount; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.5 + 0.5,
          speed: Math.random() * 0.15 + 0.05,
          opacity: Math.random() * 0.6 + 0.2
        });
      }
    };

    // Canvas sizing with high-DPI awareness
    const resizeQCanvas = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      qCanvas.width = w * window.devicePixelRatio;
      qCanvas.height = h * window.devicePixelRatio;
      qCanvas.style.width = w + 'px';
      qCanvas.style.height = h + 'px';
      qCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
      initStars(w, h);
    };

    window.addEventListener('resize', resizeQCanvas);
    resizeQCanvas();

    // Orbits and trails initialization — Interstellar palette
    const orbits = [
      { angleOffset: 0,             rx: 180, ry: 65, color: '#c8a96e', speed: 0.038, dir: 1,  trail: [] },
      { angleOffset: Math.PI / 3,   rx: 155, ry: 58, color: '#e07b39', speed: -0.028, dir: -1, trail: [] },
      { angleOffset: -Math.PI / 3,  rx: 135, ry: 50, color: '#8fa8d4', speed: 0.046, dir: 1,  trail: [] }
    ];

    let scrollRatio = 0;
    let smoothScrollRatio = 0;
    let time = 0;

    // Animation frame loop
    const renderQuantumModel = () => {
      time++;
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Calculate scroll coordinates mapping
      const maxScroll = h > 0 ? h : 1;
      scrollRatio = Math.min(window.scrollY / maxScroll, 1);
      // Linear interpolation smoothing for premium inertial scroll transitions
      smoothScrollRatio += (scrollRatio - smoothScrollRatio) * 0.1;
      
      qCtx.clearRect(0, 0, w, h);

      // 1. Draw drifting star elements (fades out as you scroll down)
      if (smoothScrollRatio < 0.99) {
        qCtx.save();
        stars.forEach(star => {
          star.y -= star.speed;
          if (star.y < 0) star.y = h;
          
          const alpha = star.opacity * (1 - smoothScrollRatio);
          qCtx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          qCtx.beginPath();
          qCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          qCtx.fill();
        });
        qCtx.restore();
      }

      // 2. Compute dynamic docking coordinates for Logo Orb
      const logoOrb = document.querySelector('.logo-orb');
      let targetX = 50;
      let targetY = 50;
      if (logoOrb) {
        const rect = logoOrb.getBoundingClientRect();
        targetX = rect.left + rect.width / 2;
        targetY = rect.top + rect.height / 2;
      }

      // Interpolate center positions
      const startX = w / 2;
      const startY = h / 2;
      const cx = startX + (targetX - startX) * smoothScrollRatio;
      const cy = startY + (targetY - startY) * smoothScrollRatio;

      // Scale coordinates from landing size (1.0) to logo size (~0.075)
      const scale = 1 - smoothScrollRatio * 0.925;
      const nucleusRadius = 26 * scale;
      const scrollSpin = smoothScrollRatio * Math.PI * 4; // Adds tumbles on scroll

      // 3. Render Orbits & Electron trails
      orbits.forEach(orbit => {
        const rx = orbit.rx * scale;
        const ry = orbit.ry * scale;
        const theta = orbit.angleOffset + scrollSpin + (time * 0.002 * orbit.dir);

        // Draw elliptical path orbit ring
        qCtx.save();
        qCtx.translate(cx, cy);
        qCtx.rotate(theta);
        qCtx.beginPath();
        qCtx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        qCtx.strokeStyle = orbit.color;
        qCtx.lineWidth = 1.2 * scale;
        qCtx.globalAlpha = 0.12 * (1 - smoothScrollRatio * 0.35); // faint but crisp outlines
        qCtx.stroke();
        qCtx.restore();

        // Calculate current electron orbital bob location on the ellipse
        const orbitalPhase = time * orbit.speed;
        const lx = rx * Math.cos(orbitalPhase);
        const ly = ry * Math.sin(orbitalPhase);
        
        // Translate local coordinates to absolute canvas system
        const gx = cx + lx * Math.cos(theta) - ly * Math.sin(theta);
        const gy = cy + lx * Math.sin(theta) + ly * Math.cos(theta);

        // Manage trails
        orbit.trail.push({ x: gx, y: gy });
        if (orbit.trail.length > 25) {
          orbit.trail.shift();
        }

        // Draw neon trail path
        qCtx.save();
        qCtx.beginPath();
        for (let j = 0; j < orbit.trail.length; j++) {
          const pt = orbit.trail[j];
          const pathRatio = j / orbit.trail.length;
          const alpha = pathRatio * 0.5 * (1 - smoothScrollRatio * 0.4);
          
          qCtx.strokeStyle = orbit.color;
          qCtx.lineWidth = 2.5 * scale * pathRatio;
          qCtx.globalAlpha = alpha;
          
          if (j === 0) qCtx.moveTo(pt.x, pt.y);
          else qCtx.lineTo(pt.x, pt.y);
        }
        qCtx.stroke();
        qCtx.restore();

        // Draw Electron bubble bob
        qCtx.save();
        qCtx.shadowBlur = 10 * scale + 2;
        qCtx.shadowColor = orbit.color;
        qCtx.fillStyle = '#ffffff';
        qCtx.beginPath();
        qCtx.arc(gx, gy, 4 * scale + 0.8, 0, Math.PI * 2);
        qCtx.fill();
        qCtx.restore();
      });

      // 4. Render pulsing core nucleus
      qCtx.save();
      const pulseFactor = 1 + Math.sin(time * 0.08) * 0.12;
      const nr = nucleusRadius * pulseFactor;
      
      // Soft radial glow — wormhole amber
      qCtx.shadowBlur = 22 * scale;
      qCtx.shadowColor = '#c8a96e';
      qCtx.fillStyle = `rgba(200, 150, 60, ${0.15 * (1 - smoothScrollRatio * 0.3)})`;
      qCtx.beginPath();
      qCtx.arc(cx, cy, nr * 1.6, 0, Math.PI * 2);
      qCtx.fill();

      // Gargantua accretion disk layers
      qCtx.fillStyle = `rgba(200, 120, 40, ${0.3 * (1 - smoothScrollRatio * 0.3)})`;
      qCtx.beginPath();
      qCtx.arc(cx, cy, nr * 0.95, 0, Math.PI * 2);
      qCtx.fill();

      // Sharp white core
      qCtx.fillStyle = '#f0ece4';
      qCtx.beginPath();
      qCtx.arc(cx, cy, nr * 0.45 + 0.6, 0, Math.PI * 2);
      qCtx.fill();
      qCtx.restore();

      requestAnimationFrame(renderQuantumModel);
    };

    requestAnimationFrame(renderQuantumModel);
  }

  // --------------------------------------------------------------------------
  // Navigation scrolling click listeners — 3-section layout
  // Section 1: Hero     (scrollY =   0)
  // Section 2: Pricing  (scrollY = 1vh)
  // Section 3: Dashboard(scrollY = 2vh)
  // --------------------------------------------------------------------------

  const VH = () => window.innerHeight;

  // Landing: "See Pricing" → scroll to pricing section
  const btnSeePricing = document.getElementById('btn-see-pricing');
  if (btnSeePricing) {
    btnSeePricing.addEventListener('click', () => {
      window.scrollTo({ top: VH(), behavior: 'smooth' });
    });
  }

  // Landing: "Enter Vault" → scroll straight to dashboard
  const btnLaunch = document.getElementById('btn-launch-vault');
  if (btnLaunch) {
    btnLaunch.addEventListener('click', () => {
      window.scrollTo({ top: VH() * 2, behavior: 'smooth' });
    });
  }

  // Landing scroll indicator → pricing
  const scrollIndicator = document.getElementById('scroll-indicator');
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
      window.scrollTo({ top: VH(), behavior: 'smooth' });
    });
  }

  // Pricing nav: "← Back" → hero
  const btnPricingBack = document.getElementById('btn-pricing-back');
  if (btnPricingBack) {
    btnPricingBack.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Pricing nav: "Enter Vault →" → dashboard
  const btnPricingEnter = document.getElementById('btn-pricing-enter');
  if (btnPricingEnter) {
    btnPricingEnter.addEventListener('click', () => {
      window.scrollTo({ top: VH() * 2, behavior: 'smooth' });
    });
  }

  // Dashboard logo → back to hero
  const logoTrigger = document.getElementById('branding-logo-trigger');
  if (logoTrigger) {
    logoTrigger.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

});
