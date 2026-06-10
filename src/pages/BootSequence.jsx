import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';

const BootSequence = () => {
  const { startGame } = useGame();
  const [lines, setLines] = useState([]);
  const [showStart, setShowStart] = useState(false);

  const bootText = [
    "OPERATION IMITATION. INITIATED 04:00 HRS. JUNE 21 1952.",
    "LOADING CRYPTANALYTIC PROTOCOLS...",
    "ESTABLISHING SECURE CONNECTIONS...",
    "WARNING: UNVERIFIED SIGNALS DETECTED.",
    "",
    "\"I propose to consider the question: can machines think?\"",
    "     -- A.M. Turing",
    "",
    "YOUR OBJECTIVE: IDENTIFY THE HUMAN SIGNAL.",
    "YOU HAVE 5 TRANSMISSIONS PER ROUND.",
    "DO NOT BE DECEIVED."
  ];

  useEffect(() => {
    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < bootText.length) {
        setLines(prev => [...prev, bootText[currentLine]]);
        currentLine++;
      } else {
        clearInterval(interval);
        setTimeout(() => setShowStart(true), 1000);
      }
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: '80%', maxWidth: '800px', textAlign: 'left' }}>
        {lines.map((line, i) => (
          <p key={i} style={{ marginBottom: '1rem', minHeight: '1.2em' }} className="text-glow">
            {line}
          </p>
        ))}
        {showStart && (
          <div style={{ marginTop: '3rem', textAlign: 'center' }}>
            <button 
              onClick={startGame}
              className="text-glow"
              style={{ fontSize: '1.5rem', padding: '1rem 2rem', border: '2px solid var(--color-text)' }}
            >
              [ INITIATE PROTOCOL ]
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BootSequence;
