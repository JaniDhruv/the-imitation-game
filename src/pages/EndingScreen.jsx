import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import TypewriterText from '../components/TypewriterText';
import { useNavigate } from 'react-router-dom';

const EndingScreen = () => {
  const { gameState, startGame } = useGame();
  const [stage, setStage] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Sequence the ending display
    const timeouts = [
      setTimeout(() => setStage(1), 2000),
      setTimeout(() => setStage(2), 6000)
    ];

    return () => timeouts.forEach(clearTimeout);
  }, []);

  const getRating = () => {
    if (gameState.clearanceLevel === 0 && gameState.round < 5) return "TERMINATED";
    
    // Calculate a score based on correct picks, time, and transmissions
    let score = (gameState.correctPicks * 20); // up to 80 points (4 possible correct picks)
    score -= (gameState.totalTransmissionsUsed * 2); // penalty for transmissions
    
    if (score >= 60 && gameState.round >= 5) return "TURING-LEVEL";
    if (score >= 40 && gameState.round >= 4) return "SENIOR CRYPTANALYST";
    if (score >= 20) return "ANALYST";
    return "ROOKIE ANALYST";
  };

  const isEarlyLoss = gameState.clearanceLevel === 0 && gameState.round < 5;

  return (
    <div style={{ padding: '3rem', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: '800px', width: '100%' }}>
        <h1 className="text-glow" style={{ fontSize: '3rem', marginBottom: '2rem', textAlign: 'center' }}>
          OPERATION IMITATION: CONCLUDED
        </h1>

        {stage >= 1 && isEarlyLoss && (
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="text-red text-glow" style={{ fontSize: '2.5rem' }}>OPERATION FAILED.<br/>ANALYST TERMINATED.</h2>
          </div>
        )}

        {stage >= 1 && !isEarlyLoss && (
          <div style={{ textAlign: 'center', fontStyle: 'italic', color: 'var(--color-amber)', marginBottom: '3rem' }}>
            <p style={{ maxWidth: '600px', margin: '0 auto', lineHeight: '1.5' }}>
              "Sometimes it is the people no one imagines anything of who do the things no one can imagine."
            </p>
            <br /><br />
            <span style={{ fontSize: '0.8em', color: 'var(--color-text-dim)' }}>
              ALAN MATHISON TURING<br/>
              b. June 23, 1912<br/>
              Prosecuted: March 31, 1952<br/>
              Lost: June 7, 1954
            </span>
          </div>
        )}

        {stage >= 2 && (
          <div style={{ border: '2px solid var(--color-text)', padding: '2rem', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '1rem' }}>ANALYST PERFORMANCE DOSSIER</h2>
            <p>CORRECT IDENTIFICATIONS: {gameState.correctPicks} / 4</p>
            <p>CLEARANCE REMAINING: {gameState.clearanceLevel} / 3</p>
            <p style={{ marginTop: '1rem', fontSize: '1.2rem' }}>
              RATING: <span className="text-glow" style={{ borderBottom: '1px solid' }}>{getRating()}</span>
            </p>
            <p style={{ marginTop: '2rem', fontSize: '0.8em', color: 'var(--color-text-dim)', marginBottom: '2rem' }}>
              This game was built on the longest day of 1952.<br/>
              He never got to see another one.
            </p>
            <button 
              onClick={() => { startGame(); navigate('/'); }}
              style={{ padding: '10px 20px', fontSize: '1.2rem', cursor: 'pointer', backgroundColor: 'transparent', color: 'var(--color-text)', border: '1px solid var(--color-text)' }}
            >
              [ PLAY AGAIN ]
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EndingScreen;
