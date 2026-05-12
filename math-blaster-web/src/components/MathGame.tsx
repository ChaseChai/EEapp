"use client";

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { compileExpression } from '@/core/mathEngine';
import { LEVELS } from '@/core/levels';
import { Play, RotateCcw, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

interface Particle {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  vx: number;
  vy: number;
}

interface Target {
  x: number;
  y: number;
  hit: boolean;
  rippleTime: number;
}

export default function MathGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game State
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const level = LEVELS[currentLevelIdx];
  const [params, setParams] = useState({ a: 1, b: 1, c: 0 });
  const [expression, setExpression] = useState(level.initialExpression);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(1);
  
  // Simulation State
  const [isLaunching, setIsLaunching] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [targets, setTargets] = useState<Target[]>([]);
  
  // Refs for Animation Frame
  const requestRef = useRef<number>(0);
  const timeRef = useRef(0);
  const ballPosRef = useRef({ x: -300, y: 0, active: false });
  const particlesRef = useRef<Particle[]>([]);
  const trailRef = useRef<{x: number, y: number}[]>([]);
  const compiledFuncRef = useRef(compileExpression(expression));

  // Visual constants
  const SCALE = 1; // 1 logical unit = 1 pixel for simplicity in this demo, but can be scaled if needed.
  
  useEffect(() => {
    // Reset level state
    setExpression(level.initialExpression);
    setTargets(level.targets.map(t => ({ ...t, hit: false, rippleTime: 0 })));
    setParams({ a: 1, b: 1, c: 0 }); // Defaults
    resetSimulation();
  }, [currentLevelIdx, level]);

  useEffect(() => {
    compiledFuncRef.current = compileExpression(expression);
  }, [expression]);

  const resetSimulation = () => {
    setIsLaunching(false);
    setIsRevealing(false);
    ballPosRef.current = { x: -400, y: 0, active: false }; // Start far left
    trailRef.current = [];
    particlesRef.current = [];
    timeRef.current = 0;
    setTargets(prev => prev.map(t => ({ ...t, hit: false, rippleTime: 0 })));
  };

  const handleLaunch = () => {
    setAttempts(a => a + 1);
    resetSimulation();
    setIsLaunching(true);
    ballPosRef.current.active = true;
    ballPosRef.current.x = -window.innerWidth / 2; // start from left edge of screen logic
  };

  const handleReveal = () => {
    resetSimulation();
    setIsRevealing(true);
    setExpression(level.solution);
  };

  // Convert logical coordinates to canvas coordinates
  const toScreen = (cx: number, cy: number, lx: number, ly: number) => ({
    sx: cx + lx * SCALE,
    sy: cy - ly * SCALE // Y goes up in math, down in canvas
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      // Resize
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
      }

      const cw = rect.width;
      const ch = rect.height;
      const cx = cw / 2;
      const cy = ch / 2;

      // Clear background with extremely low opacity for trails or fully clear for crisp grid
      ctx.clearRect(0, 0, cw, ch);
      
      // 1. Draw Grid & Axes
      ctx.lineWidth = 1;
      
      // Grid
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.03)';
      ctx.beginPath();
      const gridSize = 50;
      for (let x = cx % gridSize; x < cw; x += gridSize) { ctx.moveTo(x, 0); ctx.lineTo(x, ch); }
      for (let y = cy % gridSize; y < ch; y += gridSize) { ctx.moveTo(0, y); ctx.lineTo(cw, y); }
      ctx.stroke();

      // Axes
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.beginPath();
      ctx.moveTo(0, cy); ctx.lineTo(cw, cy); // X
      ctx.moveTo(cx, 0); ctx.lineTo(cx, ch); // Y
      ctx.stroke();

      // Origin
      ctx.fillStyle = '#d1b46b'; // Light gold
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();

      // 2. Compute Trajectory
      const { isValid, evaluate } = compiledFuncRef.current;
      
      // Draw static preview trajectory if not launching
      if (isValid && !isLaunching && !isRevealing) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(28, 28, 28, 0.2)'; // Ink primary faded
        ctx.lineWidth = 2;
        let started = false;
        for(let lx = -cw/2; lx <= cw/2; lx += 2) {
          try {
            const ly = evaluate({ x: lx, a: params.a, b: params.b, c: params.c });
            const { sx, sy } = toScreen(cx, cy, lx, ly);
            if (!started) { ctx.moveTo(sx, sy); started = true; } 
            else { ctx.lineTo(sx, sy); }
          } catch(e) {}
        }
        ctx.stroke();
      }

      // 3. Update & Draw Launch/Ball
      if (isLaunching && isValid) {
        const speed = 4;
        ballPosRef.current.x += speed;
        const lx = ballPosRef.current.x;
        
        try {
          const ly = evaluate({ x: lx, a: params.a, b: params.b, c: params.c });
          ballPosRef.current.y = ly;
          const { sx, sy } = toScreen(cx, cy, lx, ly);

          trailRef.current.push({ x: sx, y: sy });
          if (trailRef.current.length > 100) trailRef.current.shift();

          // Check collisions with targets
          setTargets(prev => prev.map(t => {
            if (t.hit) return { ...t, rippleTime: t.rippleTime + 1 };
            const dist = Math.hypot(lx - t.x, ly - t.y);
            if (dist < 15) { // Hit radius
              setScore(s => s + 1);
              // Spawn ink particles
              for(let i=0; i<15; i++) {
                const angle = Math.random() * Math.PI * 2;
                const v = Math.random() * 2;
                particlesRef.current.push({
                   x: sx, y: sy,
                   vx: Math.cos(angle)*v, vy: Math.sin(angle)*v,
                   life: 1, maxLife: Math.random()*30 + 20,
                   color: '#5a7d65', size: Math.random()*3 + 1
                });
              }
              return { ...t, hit: true, rippleTime: 1 };
            }
            return t;
          }));

          if (lx > cw / 2) {
            setIsLaunching(false);
            ballPosRef.current.active = false;
            // Check win condition
            setTimeout(() => {
              setTargets(curr => {
                if (curr.every(t => t.hit)) {
                  // could auto advance
                }
                return curr;
              });
            }, 500);
          }
        } catch(e) {}
      }

      // 4. Draw Trails
      if (trailRef.current.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(28, 28, 28, 0.4)';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(trailRef.current[0].x, trailRef.current[0].y);
        for(let i=1; i<trailRef.current.length; i++) {
          ctx.lineTo(trailRef.current[i].x, trailRef.current[i].y);
        }
        ctx.stroke();
      }

      // 5. Draw Targets
      targets.forEach(t => {
        const { sx, sy } = toScreen(cx, cy, t.x, t.y);
        
        // Ripple
        if (t.hit && t.rippleTime > 0 && t.rippleTime < 60) {
          ctx.beginPath();
          ctx.arc(sx, sy, 8 + t.rippleTime, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(90, 125, 101, ${1 - t.rippleTime/60})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(sx, sy, 8, 0, Math.PI * 2);
        ctx.fillStyle = t.hit ? '#5a7d65' : '#d44d4d'; // Green vs Red
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(sx, sy, 4, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fill();
      });

      // 6. Draw Particles
      for(let i=particlesRef.current.length-1; i>=0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.size *= 0.95;
        
        if (p.life > p.maxLife || p.size < 0.1) {
          particlesRef.current.splice(i, 1);
          continue;
        }
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
        ctx.fillStyle = `rgba(90, 125, 101, ${1 - p.life/p.maxLife})`;
        ctx.fill();
      }

      // 7. Draw Ball
      if (ballPosRef.current.active) {
        const { sx, sy } = toScreen(cx, cy, ballPosRef.current.x, ballPosRef.current.y);
        
        // Glow
        const gradient = ctx.createRadialGradient(sx, sy, 0, sx, sy, 15);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.beginPath();
        ctx.arc(sx, sy, 15, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(sx, sy, 4, 0, Math.PI*2);
        ctx.fillStyle = '#fff';
        ctx.fill();
      }

      requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(requestRef.current);
  }, [targets, isLaunching, isRevealing, params]);

  return (
    <div className="relative w-screen h-screen bg-background flex flex-col items-center overflow-hidden font-sans">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <motion.div 
          animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[100px] bg-ink-light/10"
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[120px] bg-accent-cyan/10"
        />
      </div>

      {/* TOP: Status Bar */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-6xl px-8 py-6 z-10 flex justify-between items-center text-ink-primary select-none mt-4"
      >
        <div className="flex items-baseline gap-4">
          <h1 className="text-2xl font-semibold tracking-wider">MathBlaster</h1>
          <span className="text-sm font-light text-ink-light opacity-60">| Eastern Modernism</span>
        </div>
        <div className="flex items-center gap-8 text-sm font-mono text-ink-light">
          <div className="flex items-center gap-2">
            <span>Score</span>
            <span className="text-ink-primary font-semibold">{score} / {level.targets.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Attempts</span>
            <span className="text-ink-primary font-semibold">{attempts}</span>
          </div>
        </div>
      </motion.header>

      {/* MIDDLE: Game Container */}
      <main className="flex-1 w-full max-w-6xl px-8 pb-4 relative z-0 flex flex-col justify-center">
        
        {/* Level Controls & Info */}
        <div className="absolute top-4 left-8 z-10 flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentLevelIdx(Math.max(0, currentLevelIdx - 1))} disabled={currentLevelIdx === 0}
              className="p-2 rounded-full hover:bg-ink-light/10 transition-colors disabled:opacity-20 text-ink-light">
              <ChevronLeft size={20} />
            </button>
            <div className="text-center font-mono">
              <div className="text-sm text-ink-light">Level {level.id}</div>
              <div className="text-lg font-medium text-ink-primary tracking-wide">{level.name}</div>
            </div>
            <button onClick={() => setCurrentLevelIdx(Math.min(LEVELS.length - 1, currentLevelIdx + 1))} disabled={currentLevelIdx === LEVELS.length - 1}
              className="p-2 rounded-full hover:bg-ink-light/10 transition-colors disabled:opacity-20 text-ink-light">
              <ChevronRight size={20} />
            </button>
          </div>
          
          <motion.div 
             key={level.id}
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             className="backdrop-blur-md bg-white/30 p-4 rounded-xl border border-ink-light/10 shadow-sm max-w-xs"
          >
            <div className="text-xs font-semibold text-accent-cyan mb-1">{level.difficulty}</div>
            <div className="text-sm text-ink-primary italic font-serif opacity-80">"{level.hint}"</div>
          </motion.div>
        </div>

        {/* Canvas Wrap Container */}
        <div className="w-full h-full relative rounded-3xl overflow-hidden shadow-2xl shadow-ink-light/5 border-[0.5px] border-ink-light/20 bg-white/20 backdrop-blur-sm">
           <canvas ref={canvasRef} className="w-full h-full block" />
        </div>
      </main>

      {/* BOTTOM: Control Console */}
      <motion.footer 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-6xl px-8 pb-8 z-10"
      >
        <div className="backdrop-blur-xl bg-background/60 p-6 rounded-3xl border border-ink-light/15 shadow-xl flex flex-col md:flex-row gap-8 items-center">
          
          {/* Sliders */}
          <div className="flex-1 flex flex-col gap-3 font-mono text-sm">
            {['a', 'b', 'c'].map((param) => (
              <div key={param} className="flex items-center gap-3">
                <label className="text-ink-light w-8">{param} =</label>
                <input 
                  type="range" min="-10" max="10" step="0.1"
                  value={params[param as keyof typeof params]}
                  onChange={(e) => setParams({...params, [param]: parseFloat(e.target.value)})}
                  className="flex-1 accent-ink-primary"
                />
                <span className="w-8 text-right text-ink-primary">{params[param as keyof typeof params].toFixed(1)}</span>
              </div>
            ))}
          </div>

          {/* Function Input */}
          <div className="flex-[2] flex flex-col relative group">
             <div className="absolute -inset-2 bg-gradient-to-r from-transparent via-ink-light/5 to-transparent blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <div className="relative flex items-center gap-4 border-b border-ink-light/40 py-2 focus-within:border-ink-primary transition-colors">
               <span className="text-xl font-mono text-ink-light italic">f(x) =</span>
               <input 
                 className="flex-1 bg-transparent text-2xl font-mono text-ink-primary outline-none"
                 value={expression}
                 onChange={(e) => setExpression(e.target.value)}
                 spellCheck={false}
               />
             </div>
             {!compiledFuncRef.current.isValid && (
               <span className="absolute -bottom-6 left-0 text-xs text-accent-red">Invalid syntax</span>
             )}
          </div>

          {/* Actions */}
          <div className="flex-1 flex justify-end gap-3">
            <button 
              onClick={handleReveal}
              className="px-4 py-2 rounded-full border border-ink-light/20 text-ink-light hover:bg-ink-light/5 hover:text-ink-primary transition-all text-sm flex items-center gap-2"
            >
              <Eye size={16} /> Reveal
            </button>
            <button 
              onClick={resetSimulation}
              className="p-3 rounded-full hover:bg-ink-light/10 text-ink-light transition-all"
            >
              <RotateCcw size={18} />
            </button>
            <button 
              onClick={handleLaunch}
              className="px-8 py-3 rounded-full bg-ink-primary text-background hover:bg-ink-primary/90 shadow-md hover:shadow-lg transition-all flex items-center gap-2 tracking-wide font-medium"
            >
              <Play size={18} fill="currentColor" /> Launch
            </button>
          </div>

        </div>
      </motion.footer>

    </div>
  );
}
