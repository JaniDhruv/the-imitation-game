import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGame } from '../context/GameContext';
import soundEngine from '../audio/SoundEngine';

const BOOT_TEXT = [
  "█▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀█",
  "█  G.C.H.Q. SECURE TERMINAL — CHELTENHAM      █",
  "█  MODEL: COLOSSUS MK.IV — SERIAL: CT-1952-621 █",
  "█▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄█",
  "",
  "BOOT SEQUENCE INITIATED .............. [OK]",
  "LOADING CRYPTANALYTIC PROTOCOLS ....... [OK]",
  "ESTABLISHING SECURE CONNECTIONS ....... [OK]",
  "SIGNALS INTELLIGENCE MODULE ........... [ACTIVE]",
  "THREAT ASSESSMENT ..................... [ELEVATED]",
  "",
  "⚠ WARNING: UNVERIFIED SIGNALS DETECTED ON CHANNEL 7.",
  "",
  "DATE: JUNE 21, 1952  —  THE SUMMER SOLSTICE",
  "THE LONGEST DAY OF THE YEAR.",
  "",
  "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
  "",
  "  \"I PROPOSE TO CONSIDER THE QUESTION:",
  "   CAN MACHINES THINK?\"",
  "",
  "          — A.M. TURING, 1950",
  "",
  "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
  "",
  "ON THIS DAY, DR. ALAN TURING AWAITS SENTENCING",
  "AT HIS HOME IN WILMSLOW, CHESHIRE.",
  "HIS CRIME: BEING HIMSELF.",
  "",
  "▸ OPERATION: IMITATION — INITIATED 04:00 HRS",
  "▸ OBJECTIVE: IDENTIFY THE HUMAN SIGNAL",
  "▸ CLEARANCE: LEVEL 3 — 3 ERRORS PERMITTED",
  "▸ TRANSMISSIONS: 5 PER ROUND",
  "▸ TIME LIMIT: 2 MINUTES PER ROUND",
  "",
  "DO NOT BE DECEIVED.",
];

const BootSequence = () => {
  const { startGame } = useGame();
  const [lines, setLines] = useState([]);
  const [showStart, setShowStart] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false);
  const lineIndexRef = useRef(0);

  const endOfTextRef = useRef(null);

  useEffect(() => {
    if (endOfTextRef.current) {
      endOfTextRef.current.scrollIntoView();
    }
  }, [lines, showStart]);

  const initAudio = useCallback(() => {
    if (!audioStarted) {
      soundEngine.init();
      soundEngine.startAmbient();
      setAudioStarted(true);
    }
  }, [audioStarted]);

  useEffect(() => {
    lineIndexRef.current = 0;
    setLines([]);
    setShowStart(false);

    const interval = setInterval(() => {
      const idx = lineIndexRef.current;
      if (idx < BOOT_TEXT.length) {
        const line = BOOT_TEXT[idx];
        setLines(prev => [...prev, line]);
        
        // Boot beep for certain lines
        if (line.includes('[OK]') || line.includes('[ACTIVE]') || line.includes('[ELEVATED]')) {
          try { soundEngine.bootBeep(idx); } catch(e) { /* audio not ready */ }
        }
        lineIndexRef.current = idx + 1;
      } else {
        clearInterval(interval);
        setTimeout(() => setShowStart(true), 1000);
      }
    }, 350);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleStart = () => {
    initAudio();
    try { soundEngine.uiClick(); } catch(e) {}
    try { soundEngine.roundTransition(); } catch(e) {}
    startGame();
  };

  return (
    <div 
      onClick={initAudio}
      style={{ 
        padding: '2rem', 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        justifyContent: 'center', 
        alignItems: 'center',
        cursor: audioStarted ? 'default' : 'pointer',
      }}
    >
      <div 
        className="no-scrollbar"
        style={{ 
        width: '90%', 
        maxWidth: '750px', 
        textAlign: 'left',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}>
        {lines.map((line, i) => (
          <p 
            key={i} 
            style={{ 
              marginBottom: '0.3rem', 
              minHeight: '1.2em',
              animation: 'fadeIn 0.3s ease',
              color: line.includes('⚠') ? 'var(--color-amber)' : 
                     line.includes('━') ? 'var(--color-text-dim)' :
                     line.includes('█') ? 'var(--color-text-dim)' :
                     line.includes('TURING') ? 'var(--color-amber)' :
                     line.includes('CRIME') ? 'var(--color-red)' :
                     line.includes('▸') ? 'var(--color-text)' :
                     'inherit',
              fontStyle: line.includes('"') ? 'italic' : 'normal',
            }} 
            className={line.includes('▸') || line.includes('[') ? 'text-glow' : ''}
          >
            {line}
          </p>
        ))}
        {!showStart && lines.length > 0 && lines.length < BOOT_TEXT.length && (
          <span className="text-glow" style={{ animation: 'blink 0.5s infinite' }}>█</span>
        )}
        {showStart && (
          <div style={{ marginTop: '2rem', textAlign: 'center', animation: 'fadeIn 1s ease' }}>
            <button 
              onClick={handleStart}
              className="text-glow"
              style={{ 
                fontSize: '1.4rem', 
                padding: '1rem 2.5rem', 
                border: '2px solid var(--color-text)',
                animation: 'pulse-glow 2s ease-in-out infinite',
                letterSpacing: '2px',
              }}
            >
              [ INITIATE PROTOCOL ]
            </button>
            {!audioStarted && (
              <p style={{ 
                marginTop: '1rem', 
                fontSize: '0.7em', 
                color: 'var(--color-text-dim)',
                animation: 'blink 1s infinite',
              }}>
                ▸ CLICK ANYWHERE TO ENABLE AUDIO
              </p>
            )}
          </div>
        )}
        <div ref={endOfTextRef} />
      </div>
    </div>
  );
};

export default BootSequence;
