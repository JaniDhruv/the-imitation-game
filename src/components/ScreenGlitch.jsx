import React, { useState, useEffect, useCallback } from 'react';

/**
 * ScreenGlitch — triggered visual corruption overlay
 * Shows brief digital glitch effects for dramatic moments.
 */
const ScreenGlitch = ({ trigger, duration = 600, intensity = 'medium' }) => {
  const [active, setActive] = useState(false);
  const [glitchStyle, setGlitchStyle] = useState({});

  const intensityMap = {
    light: { slices: 3, maxShift: 8, opacity: 0.6 },
    medium: { slices: 6, maxShift: 20, opacity: 0.8 },
    heavy: { slices: 10, maxShift: 40, opacity: 1.0 },
  };

  const generateGlitchSlices = useCallback(() => {
    const config = intensityMap[intensity] || intensityMap.medium;
    const slices = [];
    for (let i = 0; i < config.slices; i++) {
      const top = Math.random() * 100;
      const height = 2 + Math.random() * 15;
      const shift = (Math.random() * 2 - 1) * config.maxShift;
      slices.push({ top, height, shift, hueRotate: Math.random() * 360 });
    }
    return slices;
  }, [intensity]);

  useEffect(() => {
    if (!trigger) return;
    
    setActive(true);
    
    // Generate multiple glitch frames
    const interval = setInterval(() => {
      const slices = generateGlitchSlices();
      setGlitchStyle({ slices });
    }, 50);

    const timeout = setTimeout(() => {
      setActive(false);
      clearInterval(interval);
    }, duration);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [trigger, duration, generateGlitchSlices]);

  if (!active) return null;

  const config = intensityMap[intensity] || intensityMap.medium;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 9999,
      pointerEvents: 'none',
      opacity: config.opacity,
      mixBlendMode: 'screen',
    }}>
      {/* Color channel separation */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'transparent',
        boxShadow: `
          ${2 + Math.random() * 4}px 0 0 rgba(255,0,0,0.3),
          ${-2 - Math.random() * 4}px 0 0 rgba(0,255,0,0.3),
          0 ${1 + Math.random() * 2}px 0 rgba(0,0,255,0.3)
        `,
        animation: 'glitch-chromatic 0.1s infinite',
      }} />
      
      {/* Horizontal slice displacements */}
      {glitchStyle.slices?.map((slice, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: `${slice.top}%`,
            left: 0,
            right: 0,
            height: `${slice.height}%`,
            background: `linear-gradient(90deg, 
              transparent ${40 + Math.random() * 20}%, 
              rgba(51,255,0,0.1) ${50}%, 
              transparent ${60 + Math.random() * 20}%
            )`,
            transform: `translateX(${slice.shift}px)`,
            filter: `hue-rotate(${slice.hueRotate}deg)`,
            borderTop: Math.random() > 0.5 ? '1px solid rgba(255,255,255,0.1)' : 'none',
            borderBottom: Math.random() > 0.5 ? '1px solid rgba(255,255,255,0.05)' : 'none',
          }}
        />
      ))}

      {/* Static noise overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='1' height='1' fill='%23fff' fill-opacity='0.05' x='${Math.floor(Math.random()*4)}' y='${Math.floor(Math.random()*4)}'/%3E%3C/svg%3E")`,
        opacity: 0.3,
      }} />
    </div>
  );
};

export default ScreenGlitch;
