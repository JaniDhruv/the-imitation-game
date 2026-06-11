import React, { useState, useEffect, useRef } from 'react';

/**
 * ScreenTransition — static burst overlay between rounds
 */
const ScreenTransition = ({ trigger, duration = 1200, onComplete }) => {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState('idle'); // idle, burst, settle
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    if (!trigger) return;

    setActive(true);
    setPhase('burst');

    // Phase 2: settle
    const settleTimer = setTimeout(() => setPhase('settle'), duration * 0.6);

    // Phase 3: done
    const doneTimer = setTimeout(() => {
      setActive(false);
      setPhase('idle');
      if (onComplete) onComplete();
    }, duration);

    return () => {
      clearTimeout(settleTimer);
      clearTimeout(doneTimer);
    };
  }, [trigger, duration, onComplete]);

  // Canvas-based static noise
  useEffect(() => {
    if (!active || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth / 4; // low-res for performance
    canvas.height = window.innerHeight / 4;

    const draw = () => {
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;
      const intensity = phase === 'burst' ? 0.8 : 0.3;

      for (let i = 0; i < data.length; i += 4) {
        const val = Math.random() * 255 * intensity;
        const green = val * (0.5 + Math.random() * 0.5);
        data[i] = val * 0.2;     // R
        data[i + 1] = green * 0.6; // G (green tint)
        data[i + 2] = val * 0.1;  // B
        data[i + 3] = phase === 'burst' ? 200 : 100; // A
      }

      // Add some horizontal lines
      for (let y = 0; y < canvas.height; y++) {
        if (Math.random() > 0.97) {
          for (let x = 0; x < canvas.width; x++) {
            const idx = (y * canvas.width + x) * 4;
            data[idx] = 80;
            data[idx + 1] = 255;
            data[idx + 2] = 80;
            data[idx + 3] = 180;
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [active, phase]);

  if (!active) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 10000,
      pointerEvents: 'none',
    }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
          opacity: phase === 'settle' ? 0.4 : 0.9,
          transition: 'opacity 0.3s ease',
        }}
      />
    </div>
  );
};

export default ScreenTransition;
