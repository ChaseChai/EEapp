"use client";

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { compileExpression } from '@/core/mathEngine';

interface Particle {
  x: number;
  y: number;
  t: number;
  color: string;
  size: number;
}

export default function MathCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [expressionX, setExpressionX] = useState<string>('sin(t) * 150');
  const [expressionY, setExpressionY] = useState<string>('cos(t) * 150');
  
  const [errorX, setErrorX] = useState<string | null>(null);
  const [errorY, setErrorY] = useState<string | null>(null);

  // Time tracking
  const timeRef = useRef(0);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize handler
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    const compiledX = compileExpression(expressionX);
    const compiledY = compileExpression(expressionY);

    if (!compiledX.isValid) setErrorX(compiledX.error); else setErrorX(null);
    if (!compiledY.isValid) setErrorY(compiledY.error); else setErrorY(null);

    const colors = ['#1c1c1c', '#5e5e5e', '#d44d4d', '#5a7d65', '#d1b46b', '#4f8a8b'];

    const render = () => {
      ctx.fillStyle = 'rgba(251, 251, 249, 0.1)'; // 米白宣纸拖影
      // Dark mode support snippet could be added here based on media query or body bg
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      timeRef.current += 0.05;
      const t = timeRef.current;

      if (compiledX.isValid && compiledY.isValid) {
        try {
          const x = cx + compiledX.evaluate({ t });
          const y = cy + compiledY.evaluate({ t });

          particlesRef.current.push({
            x,
            y,
            t,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 3 + 1
          });
        } catch (e) {
          // ignore eval errors mid-frame
        }
      }

      // Render ink particles
      particlesRef.current.forEach((p, i) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        p.size *= 0.95; // ink fades
      });
      
      particlesRef.current = particlesRef.current.filter(p => p.size > 0.5);

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [expressionX, expressionY]);

  return (
    <div className="relative w-screen h-screen bg-background">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col gap-4 bg-background/80 p-6 rounded-2xl shadow-xl backdrop-blur-md border border-ink-light/20 w-[90%] max-w-2xl">
        <div className="flex justify-between items-center text-ink-primary font-mono select-none">
          <span className="text-sm font-semibold uppercase tracking-widest text-ink-light">Eastern Modernism</span>
          <span className="text-xs text-ink-light">Try parsing 't * sin(t)'</span>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <label className="text-xs text-ink-light font-mono">X(t) =</label>
            <input 
              type="text" 
              value={expressionX}
              onChange={(e) => setExpressionX(e.target.value)}
              className="w-full bg-transparent border-b border-ink-light/30 focus:border-ink-primary outline-none py-1 text-lg font-mono transition-colors text-ink-primary"
            />
            <AnimatePresence>
              {errorX && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-xs text-accent-red mt-1"
                >
                  {errorX}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex-1 space-y-2">
            <label className="text-xs text-ink-light font-mono">Y(t) =</label>
            <input 
              type="text" 
              value={expressionY}
              onChange={(e) => setExpressionY(e.target.value)}
              className="w-full bg-transparent border-b border-ink-light/30 focus:border-ink-primary outline-none py-1 text-lg font-mono transition-colors text-ink-primary"
            />
            <AnimatePresence>
              {errorY && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-xs text-accent-red mt-1"
                >
                  {errorY}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
