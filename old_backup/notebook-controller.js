/* ==========================================================================
   PHYSICS VAULT - LABORATORY NOTEBOOK CONTROLLER
   Dynamic Markdown parser, localStorage sync, and file download exporter
   ========================================================================== */

export class NotebookController {
  constructor(textareaId, previewId, templateSelectId, indicatorId) {
    this.textarea = document.getElementById(textareaId);
    this.preview = document.getElementById(previewId);
    this.templateSelect = document.getElementById(templateSelectId);
    this.indicator = document.getElementById(indicatorId);

    this.localStorageKey = 'physics_vault_lab_notes';
    
    this.setupEvents();
    this.loadNotes();
  }

  setupEvents() {
    // Live Markdown parsing on input
    this.textarea.addEventListener('input', () => {
      this.updatePreview();
      this.setUnsavedStatus();
    });

    // Template change listener
    this.templateSelect.addEventListener('change', () => {
      this.loadTemplate();
    });

    // Save notes button
    document.getElementById('btn-notebook-save').addEventListener('click', () => {
      this.saveNotes();
    });

    // Copy to clipboard button
    document.getElementById('btn-notebook-copy').addEventListener('click', () => {
      this.copyToClipboard();
    });

    // Download note text exporter button
    document.getElementById('btn-notebook-download').addEventListener('click', () => {
      this.exportTextFile();
    });

    // Clear notes button
    document.getElementById('btn-notebook-clear').addEventListener('click', () => {
      if (confirm('Are you sure you want to clear your current lab log? Unsaved changes will be lost.')) {
        this.clear();
      }
    });
  }

  loadNotes() {
    const saved = localStorage.getItem(this.localStorageKey);
    if (saved) {
      this.textarea.value = saved;
    } else {
      // Default initial welcome template
      this.textarea.value = this.getTemplates().welcome;
    }
    this.updatePreview();
    this.setSavedStatus();
  }

  saveNotes() {
    const text = this.textarea.value;
    localStorage.setItem(this.localStorageKey, text);
    this.setSavedStatus();
  }

  setSavedStatus() {
    this.indicator.textContent = 'All changes saved locally';
    this.indicator.style.color = '#00f2fe';
    this.indicator.classList.remove('pulse-indicator');
  }

  setUnsavedStatus() {
    this.indicator.textContent = 'Unsaved changes...';
    this.indicator.style.color = '#ffb347';
  }

  clear() {
    this.textarea.value = '';
    this.templateSelect.value = 'empty';
    this.updatePreview();
    this.saveNotes();
  }

  copyToClipboard() {
    const text = this.textarea.value;
    navigator.clipboard.writeText(text).then(() => {
      const originalText = this.indicator.textContent;
      const originalColor = this.indicator.style.color;
      
      this.indicator.textContent = 'Notes copied to clipboard!';
      this.indicator.style.color = '#a18cd1';

      setTimeout(() => {
        this.indicator.textContent = originalText;
        this.indicator.style.color = originalColor;
      }, 2000);
    });
  }

  exportTextFile() {
    const text = this.textarea.value;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'physics_vault_observation_log.txt';
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  loadTemplate() {
    const val = this.templateSelect.value;
    const templates = this.getTemplates();

    if (val === 'empty') {
      this.textarea.value = '';
    } else if (templates[val]) {
      this.textarea.value = templates[val];
    }
    
    this.updatePreview();
    this.setUnsavedStatus();
  }

  updatePreview() {
    const rawText = this.textarea.value;
    this.preview.innerHTML = this.parseMarkdown(rawText);
  }

  parseMarkdown(markdown) {
    if (!markdown) return '<p class="text-muted">Empty preview. Start typing to see results...</p>';

    let html = markdown;

    // 1. Escaping basic HTML special entities to avoid DOM script injections
    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // 2. Headings H1, H2, H3
    html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
    html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
    html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');

    // 3. Fenced Code Blocks: ```code```
    html = html.replace(/```([\s\S]*?)```/gm, '<pre><code>$1</code></pre>');

    // 4. Inline Code: `code`
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // 5. Blockquotes: > quote
    html = html.replace(/^&gt; (.*?)$/gm, '<blockquote>$1</blockquote>');

    // 6. Unordered Lists: - item
    html = html.replace(/^\- (.*?)$/gm, '<li>$1</li>');
    // Wrap consecutive list items in <ul>
    // Simplistic wrapping:
    html = html.replace(/(<li>.*?<\/li>)+/gs, '<ul>$&</ul>');

    // 7. Bold: **text**
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // 8. Paragraph double newlines
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');
    
    // Wrap text inside paragraph tags if not structured elements
    if (!html.startsWith('<h') && !html.startsWith('<ul') && !html.startsWith('<pre') && !html.startsWith('<blockquote')) {
      html = '<p>' + html + '</p>';
    }

    return html;
  }

  getTemplates() {
    return {
      welcome: `# Lab notebook: Physics Vault Workspace
Date: 2026-05-25
Researcher: Scholar

Welcome to your digital Lab Notebook! Here you can document observation notes, capture calculations, and record experimental findings.

## Quick Guide
- Select standard templates from the dropdown bar above to start.
- Write observation logs on the left panel; a clean formatted markdown preview displays on the right.
- Use **Save Log** to sync notes with local memory.
- Export observations as text files via the **Export Text** button.

> "Somewhere, something incredible is waiting to be known." - Carl Sagan`,

      elastic: `# Lab Report: Momentum & Elastic Collisions in 2D
Date: 2026-05-25
Researcher: Physics Analyst

## 1. Objective
To analyze collision dynamics and verify conservation of linear momentum and kinetic energy inside the 2D Physics Sandbox.

## 2. Methodology
1. Initialized 2D sandbox with wall boundaries enabled and gravity constant $g$ set to zero.
2. Formed Newton's cradle linear horizontal string config.
3. Slid one bob with mass $m_1 = 15$ and speed $v_{1} = 15\\text{ m/s}$ towards rest bobs.

## 3. Data Readings
- Rest Sphere Mass ($m_{2,3,4,5}$): 15 units
- Striker Mass ($m_1$): 15 units
- Initial Total Mechanical Energy ($TE_i$): ~168.0 J
- Post-Collision Total Mechanical Energy ($TE_f$): ~168.0 J

## 4. Observations
- On impact, $m_1$ transfers all velocity immediately, coming to rest.
- Middle spheres remain static, acting as passive momentum conduits.
- The furthest particle ($m_5$) launches with the precise velocity $v_1$ of the striker.
- Graph shows total energy line $TE$ remains **completely flat and horizontal**!

## 5. Conclusions
Momentum and energy calculations fully verify elastic mechanics equations:
\`P_i = P_f\` and \`KE_i = KE_f\`.`,

      orbital: `# Research Review: Keplerian Orbital Parameters
Date: 2026-05-25
Researcher: Astrophysicist

## 1. Objective
Map eccentricities and orbital speeds of planets launched under Newton's inverse square gravity.

## 2. Experimental Setup
- Central Star Mass ($M$): 2000 Solar masses
- Gravitational Constant ($G$): 1.5
- Orbiting Planet distance $r$: 170 AU
- Planet initial velocity vector $v_{0}$: 4.2 AU/s

## 3. HUD Telemetry Readings
- **Planet 1 (Inner)**: Distance: 0.71 AU | Speed: 39.6 km/s | Eccentricity: 0.000 (Circular)
- **Planet 3 (Outer)**: Distance: 1.78 AU | Speed: 24.5 km/s | Eccentricity: 0.165 (Elliptical)

## 4. Analytical Findings
- Inner bodies orbit at high rates. Outer bodies slow down at apoapsis, obeying Kepler's Second Law (equal areas in equal time).
- Eccentricity parameter $e$ is highly sensitive to launch angle. Launching orthogonal to radius produces perfect circles ($e \\approx 0.0$).
- Oblique launch vectors stretch trajectories into dramatic ellipses ($e > 0.5$).`,

      coulomb: `# Electrostatic Field Configuration Analysis
Date: 2026-05-25
Researcher: Electromagnetism Student

## 1. Objective
Model electric dipole fields and analyze force vector direction distributions.

## 2. Charge Setup
1. Positive Point Charge ($q_1 = +1$) placed at coordinate index $(0.35W, 0.5H)$.
2. Negative Point Charge ($q_2 = -1$) placed at coordinate index $(0.65W, 0.5H)$.

## 3. Visual Observations
- Vector fields point directly away from the positive pole and curve inward towards the negative pole.
- Electric field intensity $|\vec{E}|$ is extremely high in the narrow channel directly between charges, represented by thick bright cyan arrows.
- At infinity, vectors decrease exponentially towards zero opacity.

## 4. Mathematical Model
Vector arrows map the superposition equation:
\`\\vec{E}(\\vec{r}) = k_e \\sum \\frac{q_i}{|\\vec{r} - \\vec{r}_i|^3} (\\vec{r} - \\vec{r}_i)\`
`
    };
  }
}
