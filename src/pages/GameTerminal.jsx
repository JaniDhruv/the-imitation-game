import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import SuspectPanel from '../components/SuspectPanel';
import ControlPanel from '../components/ControlPanel';
import EvidenceBoard from '../components/EvidenceBoard';
import { useNavigate } from 'react-router-dom';

const GameTerminal = () => {
  const { gameState, updateTime, advanceRound, decreaseClearance, setGameState, recordRoundStats } = useGame();
  const navigate = useNavigate();

  // Timer Logic
  useEffect(() => {
    if (gameState.gameStatus !== 'playing') return;

    const timer = setInterval(() => {
      updateTime(gameState.timeRemaining - 1);
      
      if (gameState.timeRemaining <= 1) {
        clearInterval(timer);
        // Time ran out before voting
        setGameState(prev => ({ ...prev, gameStatus: 'round_over_timeout' }));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.timeRemaining, gameState.gameStatus, updateTime, setGameState]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getClockTime = (round) => {
    const times = ["06:00 AM", "10:00 AM", "02:00 PM", "06:00 PM", "09:00 PM"];
    return times[round - 1] || "12:00 AM";
  };

  const handleVote = (suspectId) => {
    const suspect = gameState.suspects.find(s => s.id === suspectId);
    
    if (gameState.round === 5) {
      // Round 5: No human, any vote fails, leads to ending
      recordRoundStats(false);
      setGameState(prev => ({ ...prev, gameStatus: 'ending_sequence' }));
      setTimeout(() => navigate('/ending'), 2000);
      return;
    }

    if (suspect && suspect.isHuman) {
      // Correct!
      recordRoundStats(true);
      setGameState(prev => ({ ...prev, gameStatus: 'round_won' }));
    } else {
      // Wrong!
      recordRoundStats(false);
      decreaseClearance();
    }
  };

  const renderStatusModal = () => {
    if (gameState.gameStatus === 'playing') return null;

    return (
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 100,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
      }}>
        {gameState.gameStatus === 'round_won' && (
          <>
            <h1 className="text-glow" style={{ fontSize: '3rem', marginBottom: '2rem' }}>CONFIRMED HUMAN</h1>
            <p>SIGNAL LOST.</p>
            <button onClick={advanceRound} style={{ marginTop: '2rem' }}>[ PROCEED TO NEXT HOUR ]</button>
          </>
        )}
        {(gameState.gameStatus === 'round_over' || gameState.gameStatus === 'round_over_timeout') && (
          <>
            <h1 className="stamped negative" style={{ fontSize: '4rem', marginBottom: '2rem' }}>CLEARANCE REVOKED</h1>
            <p>HUMAN: NEGATIVE.</p>
            {gameState.clearanceLevel > 0 ? (
                 <button onClick={advanceRound} style={{ marginTop: '2rem' }}>[ PROCEED TO NEXT HOUR ]</button>
            ) : (
                 <button onClick={() => navigate('/ending')} style={{ marginTop: '2rem' }}>[ VIEW FINAL DOSSIER ]</button>
            )}
          </>
        )}
      </div>
    );
  };

  const clockProgress = (gameState.round / 5) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '10px' }}>
      {renderStatusModal()}
      
      {/* Header Panel */}
      <div style={{ border: '1px solid var(--color-text)', padding: '10px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>☀ OPERATION: IMITATION</div>
        <div>ROUND {gameState.round}/5</div>
        <div style={{ color: gameState.timeRemaining < 20 ? 'var(--color-red)' : 'inherit' }}>
          ⏱ {formatTime(gameState.timeRemaining)}
        </div>
        <div>CLEARANCE: {'█'.repeat(gameState.clearanceLevel)}{'░'.repeat(3 - gameState.clearanceLevel)}</div>
        <div style={{ display: 'flex', alignItems: 'center', width: '200px' }}>
          [SOLSTICE: {getClockTime(gameState.round)} 
          <div style={{ flex: 1, height: '2px', background: 'var(--color-text-dim)', marginLeft: '10px', position: 'relative' }}>
             <div style={{ position: 'absolute', top: -4, left: `${clockProgress}%`, width: '10px', height: '10px', background: 'var(--color-text)' }}></div>
          </div>]
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'flex', flex: 1, gap: '10px', overflow: 'hidden' }}>
        {/* Suspect Panels */}
        <div style={{ flex: 3, display: 'flex', gap: '10px' }}>
          {gameState.suspects.map(suspect => (
            <SuspectPanel key={suspect.id} suspect={suspect} onVote={() => handleVote(suspect.id)} />
          ))}
        </div>

        {/* Sidebar */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <EvidenceBoard />
        </div>
      </div>

      {/* Control Panel */}
      <ControlPanel />
    </div>
  );
};

export default GameTerminal;
