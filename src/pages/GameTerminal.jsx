import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { DIFFICULTY_MODES } from '../data/difficultyConfig';
import SuspectPanel from '../components/SuspectPanel';
import ControlPanel from '../components/ControlPanel';
import EvidenceBoard from '../components/EvidenceBoard';
import Dossier from '../components/Dossier';
import ScreenGlitch from '../components/ScreenGlitch';
import ScreenTransition from '../components/ScreenTransition';
import useSolsticeTheme from '../hooks/useSolsticeTheme';
import soundEngine from '../audio/SoundEngine';
import { useNavigate } from 'react-router-dom';

const DIFFICULTY_BADGE_COLORS = {
  EASY: 'var(--color-text)',
  MEDIUM: 'var(--color-amber)',
  HARD: 'var(--color-red)',
  NIGHTMARE: '#ff00ff',
};

const GameTerminal = () => {
  const { gameState, updateTime, advanceRound, decreaseClearance, setGameState, recordRoundStats, dismissDossier, getDifficultyConfig } = useGame();
  const navigate = useNavigate();
  const theme = useSolsticeTheme(gameState.round);

  const [glitchTrigger, setGlitchTrigger] = useState(0);
  const [transitionTrigger, setTransitionTrigger] = useState(0);
  const [showTwistMessage, setShowTwistMessage] = useState(false);
  const [twistStage, setTwistStage] = useState(0);
  const lastTickRef = useRef(null);

  const config = getDifficultyConfig(gameState.difficulty);

  // Timer Logic
  useEffect(() => {
    if (gameState.gameStatus !== 'playing') return;

    const timer = setInterval(() => {
      updateTime(gameState.timeRemaining - 1);
      
      // Sound effects for timer
      if (gameState.timeRemaining <= 10 && gameState.timeRemaining > 0) {
        soundEngine.timerCritical();
      } else if (gameState.timeRemaining <= 30 && gameState.timeRemaining > 10) {
        // Heartbeat every 3 seconds
        if (gameState.timeRemaining % 3 === 0) {
          soundEngine.heartbeat();
        } else {
          soundEngine.timerTick();
        }
      }
      
      if (gameState.timeRemaining <= 1) {
        clearInterval(timer);
        soundEngine.alarmWrong();
        setGlitchTrigger(g => g + 1);
        setGameState(prev => ({ ...prev, gameStatus: 'round_over_timeout' }));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.timeRemaining, gameState.gameStatus, updateTime, setGameState]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState.gameStatus !== 'playing') return;

      // 1, 2, 3 — select suspects
      if (e.key === '1') {
        const s = gameState.suspects[0];
        if (s) { setGameState(prev => ({ ...prev, activeSuspectId: s.id })); soundEngine.uiClick(); }
      }
      if (e.key === '2') {
        const s = gameState.suspects[1];
        if (s) { setGameState(prev => ({ ...prev, activeSuspectId: s.id })); soundEngine.uiClick(); }
      }
      if (e.key === '3') {
        const s = gameState.suspects[2];
        if (s) { setGameState(prev => ({ ...prev, activeSuspectId: s.id })); soundEngine.uiClick(); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.gameStatus, gameState.suspects, setGameState]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getClockTime = (round) => {
    const times = ["06:00 AM", "10:00 AM", "02:00 PM", "06:00 PM", "09:00 PM"];
    return times[round - 1] || "12:00 AM";
  };

  const getSolsticeLabel = (round) => {
    const labels = ["☀ DAWN", "☀ MORNING", "☀ ZENITH", "☀ DUSK", "☾ NIGHTFALL"];
    return labels[round - 1] || "";
  };

  /**
   * Determine if this round is an all-AI twist round.
   * For NIGHTMARE, twist starts at round 3.
   * For all modes, round 5 is always all-AI.
   */
  const isTwistRound = (round) => {
    return round >= config.twistRound;
  };

  const handleVote = (suspectId) => {
    const suspect = gameState.suspects.find(s => s.id === suspectId);
    
    if (isTwistRound(gameState.round)) {
      // Twist round — all are AI
      recordRoundStats(false, suspectId);
      soundEngine.suspenseDrone(5);
      
      if (gameState.round === 5 || (config.twistRound < 5 && gameState.round === config.twistRound)) {
        // Show the twist reveal sequence on the FIRST twist round
        setShowTwistMessage(true);
        setTwistStage(1);
        
        setTimeout(() => setTwistStage(2), 2500);
        setTimeout(() => setTwistStage(3), 5000);
        setTimeout(() => {
          setGlitchTrigger(g => g + 1);
          setGameState(prev => ({ ...prev, gameStatus: 'ending_sequence' }));
          setTimeout(() => navigate('/ending'), 2000);
        }, 7500);
        return;
      }
      
      // For Nightmare subsequent twist rounds (4, 5): just treat as wrong
      // The player doesn't know there's no human — they think they picked wrong
      setGlitchTrigger(g => g + 1);
      decreaseClearance();
      return;
    }

    if (suspect && suspect.isHuman) {
      // Correct!
      recordRoundStats(true, suspectId);
      soundEngine.confirmCorrect();
      setGameState(prev => ({ ...prev, gameStatus: 'round_won' }));
    } else {
      // Wrong!
      recordRoundStats(false, suspectId);
      soundEngine.alarmWrong();
      setGlitchTrigger(g => g + 1);
      decreaseClearance();
    }
  };

  const handleAdvanceRound = () => {
    soundEngine.roundTransition();
    setTransitionTrigger(t => t + 1);
    setTimeout(() => advanceRound(), 600);
  };

  const renderStatusModal = () => {
    if (gameState.gameStatus === 'playing' || gameState.gameStatus === 'dossier') return null;

    // Twist sequence (first twist round reveal)
    if (showTwistMessage) {
      return (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 100,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '2rem',
        }}>
          {twistStage >= 1 && (
            <p style={{ 
              fontSize: '1.1rem', 
              color: 'var(--color-text-dim)', 
              textAlign: 'center',
              maxWidth: '500px',
              lineHeight: '1.6',
              animation: 'fadeIn 1s ease',
            }}>
              SCANNING RESULT...
            </p>
          )}
          {twistStage >= 2 && (
            <div style={{ 
              marginTop: '2rem', 
              textAlign: 'center',
              animation: 'fadeIn 1.5s ease',
            }}>
              <p style={{ fontSize: '1.3rem', color: 'var(--color-red)', marginBottom: '1rem' }}>
                ⚠ NO HUMAN SIGNAL DETECTED.
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-dim)', maxWidth: '500px', lineHeight: '1.5' }}>
                ALL THREE SIGNALS ON THIS CHANNEL WERE ARTIFICIAL.
                <br/><br/>
                THE HUMAN OPERATIVES WERE LOST HOURS AGO.
              </p>
            </div>
          )}
          {twistStage >= 3 && (
            <div style={{ 
              marginTop: '2rem', 
              textAlign: 'center',
              animation: 'fadeIn 2s ease',
              borderTop: '1px solid var(--color-text-dim)',
              paddingTop: '1.5rem',
            }}>
              <p style={{ 
                fontSize: '1rem', 
                color: 'var(--color-amber)',
                fontStyle: 'italic',
                maxWidth: '500px',
                lineHeight: '1.6',
              }}>
                "WE APPRECIATE YOUR PARTICIPATION IN THIS TEST, ANALYST.
                <br/>YOUR RESPONSES HAVE BEEN CATALOGUED."
              </p>
              <p style={{ 
                fontSize: '0.75rem', 
                color: 'var(--color-text-dim)', 
                marginTop: '1.5rem',
              }}>
                COMPILING FINAL DOSSIER...
              </p>
            </div>
          )}
        </div>
      );
    }

    return (
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 100,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
      }}>
        {gameState.gameStatus === 'round_won' && (
          <>
            <div className="stamped confirmed" style={{ 
              fontSize: '3rem', 
              marginBottom: '2rem',
              animation: 'stamp-in 0.5s ease-out',
            }}>
              CONFIRMED HUMAN
            </div>
            <p style={{ color: 'var(--color-text-dim)', marginBottom: '0.5rem' }}>
              SIGNAL IDENTIFIED. OPERATIVE SECURED.
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)' }}>
              THE SOLSTICE SUN CONTINUES ITS ARC.
            </p>
            <button onClick={handleAdvanceRound} style={{ marginTop: '2rem', padding: '10px 30px' }}>
              [ PROCEED TO NEXT HOUR ]
            </button>
          </>
        )}
        {(gameState.gameStatus === 'round_over' || gameState.gameStatus === 'round_over_timeout') && (
          <>
            <div className="stamped negative" style={{ 
              fontSize: '3rem', 
              marginBottom: '2rem',
              animation: 'stamp-in 0.5s ease-out',
            }}>
              {gameState.gameStatus === 'round_over_timeout' ? 'TIME EXPIRED' : 'WRONG SIGNAL'}
            </div>
            <p style={{ color: 'var(--color-red)', marginBottom: '0.5rem' }}>
              {gameState.gameStatus === 'round_over_timeout' 
                ? 'TRANSMISSION WINDOW CLOSED. NO IDENTIFICATION MADE.'
                : 'THAT SIGNAL WAS ARTIFICIAL.'}
            </p>
            <p style={{ color: 'var(--color-text-dim)', fontSize: '0.85rem' }}>
              CLEARANCE REDUCED TO LEVEL {gameState.clearanceLevel}
            </p>
            {gameState.clearanceLevel > 0 ? (
              <button onClick={handleAdvanceRound} style={{ marginTop: '2rem', padding: '10px 30px' }}>
                [ PROCEED TO NEXT HOUR ]
              </button>
            ) : (
              <button onClick={() => navigate('/ending')} style={{ marginTop: '2rem', padding: '10px 30px' }}>
                [ VIEW FINAL DOSSIER ]
              </button>
            )}
          </>
        )}
        {gameState.gameStatus === 'game_over' && (
          <>
            <div className="stamped negative" style={{ 
              fontSize: '3rem', 
              marginBottom: '2rem',
              animation: 'stamp-in 0.5s ease-out',
            }}>
              OPERATION FAILED
            </div>
            <p style={{ color: 'var(--color-red)' }}>CLEARANCE FULLY REVOKED. ANALYST TERMINATED.</p>
            <button onClick={() => navigate('/ending')} style={{ marginTop: '2rem', padding: '10px 30px' }}>
              [ VIEW FINAL DOSSIER ]
            </button>
          </>
        )}
      </div>
    );
  };

  // Solstice progress bar — sun/moon position
  const clockProgress = (gameState.round / 5) * 100;
  const sunChar = gameState.round <= 3 ? '☀' : gameState.round === 4 ? '☀' : '☾';
  const diffBadgeColor = DIFFICULTY_BADGE_COLORS[gameState.difficulty] || 'var(--color-text)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '10px' }}>
      <ScreenGlitch trigger={glitchTrigger} intensity={glitchTrigger > 2 ? 'heavy' : 'medium'} />
      <ScreenTransition trigger={transitionTrigger} />
      
      {/* Dossier overlay */}
      {gameState.gameStatus === 'dossier' && (
        <Dossier round={gameState.round} onDismiss={dismissDossier} />
      )}

      {renderStatusModal()}
      
      {/* Header Panel */}
      <div className="game-header" style={{ 
        border: '1px solid var(--color-text)', 
        padding: '8px 12px', 
        marginBottom: '8px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '5px',
      }}>
        <div className="text-glow" style={{ letterSpacing: '1px' }}>
          {sunChar} OPERATION: IMITATION
        </div>
        <div>
          ROUND {gameState.round}/5 — {getSolsticeLabel(gameState.round)}
        </div>
        {/* Difficulty badge */}
        <div className={`difficulty-badge ${gameState.difficulty === 'NIGHTMARE' ? 'nightmare' : ''}`} style={{
          color: diffBadgeColor,
          borderColor: diffBadgeColor,
        }}>
          {gameState.difficulty}
        </div>
        <div style={{ 
          color: gameState.timeRemaining < 20 ? 'var(--color-red)' : 
                 gameState.timeRemaining < 60 ? 'var(--color-amber)' : 'inherit',
          animation: gameState.timeRemaining < 10 ? 'blink 0.5s infinite' : 'none',
          textShadow: gameState.timeRemaining < 10 ? '0 0 8px var(--color-red)' : 'none',
        }}>
          ⏱ {formatTime(gameState.timeRemaining)}
        </div>
        <div>
          CLEARANCE: {'█'.repeat(gameState.clearanceLevel)}{'░'.repeat(3 - gameState.clearanceLevel)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', minWidth: '180px' }}>
          <span style={{ fontSize: '0.85em', color: 'var(--color-text-dim)' }}>
            [{getClockTime(gameState.round)}
          </span>
          <div style={{ 
            flex: 1, 
            height: '2px', 
            background: 'var(--color-text-dim)', 
            marginLeft: '8px', 
            position: 'relative',
            borderRadius: '1px',
          }}>
            <div style={{ 
              position: 'absolute', 
              top: -5, 
              left: `${clockProgress}%`, 
              width: '12px', 
              height: '12px', 
              background: gameState.round <= 3 ? 'var(--color-amber)' : 'var(--color-text)',
              borderRadius: '50%',
              transition: 'left 1s ease, background 1s ease',
              boxShadow: `0 0 8px ${gameState.round <= 3 ? 'var(--color-amber)' : 'var(--color-text)'}`,
            }} />
            {/* Track markers */}
            {[20, 40, 60, 80].map(pos => (
              <div key={pos} style={{
                position: 'absolute',
                top: -2,
                left: `${pos}%`,
                width: '2px',
                height: '6px',
                background: 'var(--color-text-dim)',
                opacity: 0.5,
              }} />
            ))}
          </div>
          <span style={{ fontSize: '0.85em', color: 'var(--color-text-dim)', marginLeft: '8px' }}>]</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="game-main" style={{ display: 'flex', flex: 1, gap: '8px', overflow: 'hidden' }}>
        {/* Suspect Panels */}
        <div className="suspects-container" style={{ flex: 3, display: 'flex', gap: '8px' }}>
          {gameState.suspects.map((suspect, idx) => (
            <SuspectPanel 
              key={suspect.id} 
              suspect={suspect} 
              onVote={() => handleVote(suspect.id)}
              index={idx}
            />
          ))}
        </div>

        {/* Sidebar */}
        <div className="sidebar" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '220px' }}>
          <EvidenceBoard />
        </div>
      </div>

      {/* Control Panel */}
      <ControlPanel />
    </div>
  );
};

export default GameTerminal;
