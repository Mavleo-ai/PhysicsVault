"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const SOUNDS = [
  { id: "silence", label: "Silence", icon: "🔇", desc: "No ambient sound" },
  { id: "deep-space", label: "Deep Space", icon: "🌌", desc: "Cosmic ambient drone" },
  { id: "binaural-beta", label: "Beta Binaural", icon: "🧠", desc: "15Hz focus brainwave beats" },
  { id: "rain", label: "Rainfall", icon: "🌧️", desc: "Gentle rain sounds" },
  { id: "focus-beats", label: "Focus Beats", icon: "🎵", desc: "Lo-fi space chimes" },
  { id: "white-noise", label: "White Noise", icon: "📡", desc: "Static background noise" },
];

// client-side audio nodes cache
let audioCtx = null;
let currentNodes = [];
let rainInterval = null;
let chimesInterval = null;

const getAudioContext = () => {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
};

const stopAll = () => {
  if (typeof window === "undefined") return;
  
  if (rainInterval) {
    clearInterval(rainInterval);
    rainInterval = null;
  }
  if (chimesInterval) {
    clearInterval(chimesInterval);
    chimesInterval = null;
  }
  if (currentNodes && currentNodes.length > 0) {
    currentNodes.forEach((node) => {
      try { node.stop(); } catch (e) {}
      try { node.disconnect(); } catch (e) {}
    });
    currentNodes = [];
  }
};

const playBinauralBeta = () => {
  stopAll();
  const ctx = getAudioContext();
  if (!ctx) return;

  const nodes = [];

  // Master Gain
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.0, ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 1.2);
  masterGain.connect(ctx.destination);

  // Left channel: 200Hz carrier wave
  const oscLeft = ctx.createOscillator();
  oscLeft.type = "sine";
  oscLeft.frequency.value = 200;

  const pannerLeft = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
  const leftGain = ctx.createGain();
  leftGain.gain.value = 0.55;

  if (pannerLeft) {
    pannerLeft.pan.value = -1; // hard left
    oscLeft.connect(leftGain);
    leftGain.connect(pannerLeft);
    pannerLeft.connect(masterGain);
    nodes.push(pannerLeft);
  } else {
    oscLeft.connect(leftGain);
    leftGain.connect(masterGain);
  }
  oscLeft.start();
  nodes.push(oscLeft);
  nodes.push(leftGain);

  // Right channel: 215Hz detuned wave (15Hz difference = Beta waves)
  const oscRight = ctx.createOscillator();
  oscRight.type = "sine";
  oscRight.frequency.value = 215;

  const pannerRight = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
  const rightGain = ctx.createGain();
  rightGain.gain.value = 0.55;

  if (pannerRight) {
    pannerRight.pan.value = 1; // hard right
    oscRight.connect(rightGain);
    rightGain.connect(pannerRight);
    pannerRight.connect(masterGain);
    nodes.push(pannerRight);
  } else {
    oscRight.connect(rightGain);
    rightGain.connect(masterGain);
  }
  oscRight.start();
  nodes.push(oscRight);
  nodes.push(rightGain);

  // Add low-pass warmth pad for listening comfort (covers sharp sine tones)
  const padFilter = ctx.createBiquadFilter();
  padFilter.type = "lowpass";
  padFilter.frequency.setValueAtTime(80, ctx.currentTime);
  padFilter.connect(masterGain);
  nodes.push(padFilter);

  const subPad = ctx.createOscillator();
  subPad.type = "triangle";
  subPad.frequency.setValueAtTime(100, ctx.currentTime);
  subPad.connect(padFilter);
  subPad.start();
  nodes.push(subPad);

  nodes.push(masterGain);
  currentNodes = nodes;
};

const playDeepSpace = () => {
  stopAll();
  const ctx = getAudioContext();
  if (!ctx) return;

  const nodes = [];

  // Master Gain for cosmic volume
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.0, ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 1.5);
  masterGain.connect(ctx.destination);

  // Lowpass filter to create warm sub-bass cosmic hum
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(110, ctx.currentTime);
  filter.connect(masterGain);

  // Fundamental frequency A1
  const osc1 = ctx.createOscillator();
  osc1.type = "sawtooth";
  osc1.frequency.value = 55;
  osc1.connect(filter);
  osc1.start();
  nodes.push(osc1);

  // Detuned triangle for binaural beating swell
  const osc2 = ctx.createOscillator();
  osc2.type = "triangle";
  osc2.frequency.value = 55.4;
  osc2.connect(filter);
  osc2.start();
  nodes.push(osc2);

  // Sine harmonic at A2
  const osc3 = ctx.createOscillator();
  osc3.type = "sine";
  osc3.frequency.value = 110;
  osc3.connect(filter);
  osc3.start();
  nodes.push(osc3);

  // Low Frequency Oscillator (LFO) for wave filter breathing swell
  const lfo = ctx.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 0.07; // ~14 second breathing cycle
  
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 35; // sweep filter cutoff by 35Hz
  
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  lfo.start();
  
  nodes.push(lfo);
  nodes.push(lfoGain);
  nodes.push(masterGain);
  nodes.push(filter);

  currentNodes = nodes;
};

const playWhiteNoise = () => {
  stopAll();
  const ctx = getAudioContext();
  if (!ctx) return;

  const nodes = [];

  // Master gain
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.0, ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 1.0);
  masterGain.connect(ctx.destination);

  // Bandpass filter to model soft radio/cockpit air breeze static noise
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 850;
  filter.Q.value = 0.75;
  filter.connect(masterGain);

  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  source.connect(filter);
  source.start();

  nodes.push(source);
  nodes.push(filter);
  nodes.push(masterGain);

  currentNodes = nodes;
};

const playRain = () => {
  stopAll();
  const ctx = getAudioContext();
  if (!ctx) return;

  const nodes = [];

  // Ambient rain base rumble
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.0, ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 1.2);
  masterGain.connect(ctx.destination);

  // Lowpass filter for base rumble
  const rumbleFilter = ctx.createBiquadFilter();
  rumbleFilter.type = "lowpass";
  rumbleFilter.frequency.value = 420;
  rumbleFilter.connect(masterGain);

  // Buffer generator for base white noise
  const bufferSize = 2 * ctx.sampleRate;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const baseSource = ctx.createBufferSource();
  baseSource.buffer = noiseBuffer;
  baseSource.loop = true;
  baseSource.connect(rumbleFilter);
  baseSource.start();

  nodes.push(baseSource);
  nodes.push(rumbleFilter);

  // Drop filter to capture raindrop impacts
  const dropFilter = ctx.createBiquadFilter();
  dropFilter.type = "bandpass";
  dropFilter.frequency.value = 4800;
  dropFilter.Q.value = 2.8;
  dropFilter.connect(masterGain);
  nodes.push(dropFilter);

  // Procedural randomized water drop strike scheduler
  rainInterval = setInterval(() => {
    try {
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(800 + Math.random() * 3200, ctx.currentTime);

      const dropGain = ctx.createGain();
      dropGain.gain.setValueAtTime(0.0, ctx.currentTime);
      dropGain.gain.linearRampToValueAtTime(Math.random() * 0.08 + 0.02, ctx.currentTime + 0.002);
      dropGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + Math.random() * 0.06 + 0.02);

      osc.connect(dropGain);
      dropGain.connect(dropFilter);
      osc.start();

      setTimeout(() => {
        try {
          osc.stop();
          osc.disconnect();
          dropGain.disconnect();
        } catch (e) {}
      }, 150);
    } catch (e) {}
  }, 45);

  nodes.push(masterGain);
  currentNodes = nodes;
};

const playFocusBeats = () => {
  stopAll();
  const ctx = getAudioContext();
  if (!ctx) return;

  const nodes = [];

  // Procedural Ambient Retro Synth Chimes
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.0, ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 1.2);
  masterGain.connect(ctx.destination);

  // Warm background chord pads
  const padFilter = ctx.createBiquadFilter();
  padFilter.type = "lowpass";
  padFilter.frequency.value = 175;
  padFilter.connect(masterGain);
  nodes.push(padFilter);

  const pad1 = ctx.createOscillator();
  pad1.type = "triangle";
  pad1.frequency.value = 130.81; // C3
  pad1.connect(padFilter);
  pad1.start();
  nodes.push(pad1);

  const pad2 = ctx.createOscillator();
  pad2.type = "triangle";
  pad2.frequency.value = 164.81; // E3
  pad2.connect(padFilter);
  pad2.start();
  nodes.push(pad2);

  // Relaxing chord progressions for celestial synth pads
  const chords = [
    [261.63, 329.63, 392.00, 493.88], // Cmaj7 (C4, E4, G4, B4)
    [220.00, 261.63, 329.63, 392.00], // Am7 (A3, C4, E4, G4)
    [174.61, 220.00, 261.63, 329.63], // Fmaj7 (F3, A3, C4, E4)
    [196.00, 246.94, 293.66, 392.00]  // G7 (G3, B3, D4, G4)
  ];

  let chordIndex = 0;
  let beatIndex = 0;

  // Space echo delay module
  const delay = ctx.createDelay();
  delay.delayTime.value = 0.38;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.36;
  
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(masterGain);
  nodes.push(delay);
  nodes.push(feedback);

  // Musical event trigger scheduler
  chimesInterval = setInterval(() => {
    try {
      // 8 beats per chord
      if (beatIndex % 8 === 0) {
        chordIndex = (chordIndex + 1) % chords.length;
      }

      const currentChord = chords[chordIndex];

      // Procedural note selection
      if (beatIndex % 2 === 0 || Math.random() > 0.65) {
        const noteFreq = currentChord[Math.floor(Math.random() * currentChord.length)] * (Math.random() > 0.75 ? 2 : 1);
        
        const chime = ctx.createOscillator();
        chime.type = "sine";
        chime.frequency.setValueAtTime(noteFreq, ctx.currentTime);

        const chimeGain = ctx.createGain();
        chimeGain.gain.setValueAtTime(0, ctx.currentTime);
        chimeGain.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 0.05);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.4);

        chime.connect(chimeGain);
        chimeGain.connect(masterGain);
        chimeGain.connect(delay);
        chime.start();

        setTimeout(() => {
          try {
            chime.stop();
            chime.disconnect();
            chimeGain.disconnect();
          } catch (e) {}
        }, 1800);
      }

      // Add extremely subtle relaxing vinyl dust pops
      if (Math.random() > 0.82) {
        const dust = ctx.createOscillator();
        dust.type = "sawtooth";
        dust.frequency.setValueAtTime(7500, ctx.currentTime);

        const dustGain = ctx.createGain();
        dustGain.gain.setValueAtTime(0.0008, ctx.currentTime);
        dustGain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.006);

        dust.connect(dustGain);
        dustGain.connect(masterGain);
        dust.start();

        setTimeout(() => {
          try {
            dust.stop();
            dust.disconnect();
            dustGain.disconnect();
          } catch (e) {}
        }, 40);
      }

      beatIndex++;
    } catch (e) {}
  }, 480); // ~125 BPM pace

  nodes.push(masterGain);
  currentNodes = nodes;
};

export default function AmbientControls({ studyData, onUpdate }) {
  const activeSound = studyData.ambientSound || "silence";
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Manage dynamic synthesis toggles
    if (activeSound === "silence") {
      stopAll();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      if (activeSound === "deep-space") {
        playDeepSpace();
      } else if (activeSound === "binaural-beta") {
        playBinauralBeta();
      } else if (activeSound === "rain") {
        playRain();
      } else if (activeSound === "focus-beats") {
        playFocusBeats();
      } else if (activeSound === "white-noise") {
        playWhiteNoise();
      }
    }

    // Cleanup on navigation or components unmount
    return () => {
      stopAll();
    };
  }, [activeSound]);

  const selectSound = (soundId) => {
    // Triggers AudioContext unlock inside direct user interaction gesture
    getAudioContext();
    
    const newData = { ...studyData };
    newData.ambientSound = soundId;
    onUpdate(newData);
  };

  return (
    <div className="glass-panel border border-white/10 rounded-2xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          {isPlaying ? (
            <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
          )}
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.15em]">
            AMBIENT SOUNDS
          </span>
        </div>
        {isPlaying && (
          <span className="text-[7px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
            Synthesized Live
          </span>
        )}
      </div>

      {/* Sound Options */}
      <div className="space-y-1">
        {SOUNDS.map((sound) => {
          const isActive = activeSound === sound.id;
          return (
            <button
              key={sound.id}
              onClick={() => selectSound(sound.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all cursor-pointer text-left ${
                isActive
                  ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.06)]"
                  : "bg-transparent border border-transparent hover:bg-white/[0.03] text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span className="text-sm">{sound.icon}</span>
              <div className="flex-1">
                <span className={`text-[10px] font-mono font-medium block`}>
                  {sound.label}
                </span>
                <span className="text-[8px] text-zinc-600 block leading-none font-mono">
                  {sound.desc}
                </span>
              </div>
              {isActive && sound.id !== "silence" && (
                <div className="flex gap-[2.5px] items-end h-3">
                  <div className="w-[2px] bg-cyan-400 rounded-full animate-[pulse_1s_infinite]" style={{ height: "6px", animationDelay: "0s" }} />
                  <div className="w-[2px] bg-cyan-400 rounded-full animate-[pulse_0.8s_infinite]" style={{ height: "10px", animationDelay: "0.15s" }} />
                  <div className="w-[2px] bg-cyan-400 rounded-full animate-[pulse_1.2s_infinite]" style={{ height: "4px", animationDelay: "0.3s" }} />
                  <div className="w-[2px] bg-cyan-400 rounded-full animate-[pulse_0.9s_infinite]" style={{ height: "8px", animationDelay: "0.45s" }} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="pt-1.5 flex justify-center">
        <span className="text-[7px] font-mono text-zinc-600 uppercase tracking-widest text-center">
          ⚡ Math-synthesized realtime audio contexts
        </span>
      </div>
    </div>
  );
}
