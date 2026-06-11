import React, { useEffect, useState, useRef } from 'react';
import { useGame } from '../context/GameContext';
import ShareCard from '../components/ShareCard';
import soundEngine from '../audio/SoundEngine';
import { TURING_MEMORIAL, PERSONA_TELLS } from '../data/turingTimeline';
import { useNavigate } from 'react-router-dom';

const EndingScreen = () => {
  const { gameState, startGame } = useGame();
  const [stage, setStage] = useState(0);
  const [showReveal, setShowReveal] = useState(false);
  const navigate = useNavigate();
  const endOfContentRef = useRef(null);

  useEffect(() => {
    if (endOfContentRef.current) {
      endOfContentRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [stage, showReveal]);

  useEffect(() => {
    soundEngine.endingReveal();

    const timeouts = [
      setTimeout(() => setStage(1), 2000),
      setTimeout(() => setStage(2), 5000),
      setTimeout(() => setStage(3), 8000),
      setTimeout(() => setStage(4), 11000),
    ];

    return () => timeouts.forEach(clearTimeout);
  }, []);

  const getRating = () => {
    if (gameState.clearanceLevel === 0 && gameState.round < 5) return "TERMINATED";
    
    if (gameState.correctPicks === 4) return "TURING-LEVEL";
    if (gameState.correctPicks === 3) return "SENIOR CRYPTANALYST";
    if (gameState.correctPicks === 2) return "ANALYST";
    return "ROOKIE ANALYST";
  };

  const isEarlyLoss = gameState.clearanceLevel === 0 && gameState.round < 5;
  const rating = getRating();

  return (
    <div 
      className="no-scrollbar"
      style={{ 
      padding: '2rem', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      overflow: 'auto',
    }}>
      <div style={{ maxWidth: '800px', width: '100%' }}>
        
        {/* Title */}
        <h1 className="text-glow" style={{ 
          fontSize: '2.5rem', 
          marginBottom: '1.5rem', 
          textAlign: 'center',
          animation: 'fadeIn 2s ease',
          letterSpacing: '3px',
        }}>
          OPERATION IMITATION: CONCLUDED
        </h1>

        {/* Stage 1: Outcome */}
        {stage >= 1 && isEarlyLoss && (
          <div style={{ textAlign: 'center', marginBottom: '2rem', animation: 'fadeIn 1.5s ease' }}>
            <div className="stamped negative" style={{ fontSize: '2.5rem', animation: 'stamp-in 0.5s ease-out' }}>
              OPERATION FAILED
            </div>
            <p style={{ color: 'var(--color-text-dim)', marginTop: '1rem' }}>
              ANALYST CLEARANCE FULLY REVOKED. ROUND {gameState.round}/5.
            </p>
          </div>
        )}

        {stage >= 1 && !isEarlyLoss && (
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '2rem', 
            animation: 'fadeIn 1.5s ease',
            padding: '1.5rem',
            border: '1px solid var(--color-text-dim)',
          }}>
            <p style={{ 
              fontStyle: 'italic', 
              color: 'var(--color-amber)', 
              maxWidth: '550px', 
              margin: '0 auto', 
              lineHeight: '1.6',
              fontSize: '1.1rem',
            }}>
              "{TURING_MEMORIAL.finalQuote.text}"
            </p>
          </div>
        )}

        {/* Stage 2: Turing memorial */}
        {stage >= 2 && !isEarlyLoss && (
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '2rem', 
            animation: 'fadeIn 1.5s ease',
            padding: '1.5rem',
          }}>
            <p style={{ color: 'var(--color-text-dim)', fontSize: '0.85rem', lineHeight: '1.8' }}>
              ALAN MATHISON TURING<br/>
              {TURING_MEMORIAL.born}<br/>
              {TURING_MEMORIAL.died}<br/>
              <br/>
              <span style={{ color: 'var(--color-red)', fontSize: '0.8rem' }}>
                {TURING_MEMORIAL.persecution}
              </span>
            </p>
            <div style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--color-text-dim)', lineHeight: '1.6' }}>
              {TURING_MEMORIAL.achievements.map((a, i) => (
                <p key={i} style={{ marginBottom: '0.3rem' }}>▸ {a}</p>
              ))}
            </div>
          </div>
        )}

        {/* Stage 3: Legacy */}
        {stage >= 3 && !isEarlyLoss && (
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '2rem', 
            animation: 'fadeIn 1.5s ease',
            borderTop: '1px solid var(--color-text-dim)',
            paddingTop: '1.5rem',
          }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-amber)', marginBottom: '1rem' }}>
              HIS LEGACY:
            </p>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)', lineHeight: '1.6' }}>
              {TURING_MEMORIAL.legacy.map((l, i) => (
                <p key={i} style={{ marginBottom: '0.3rem' }}>▸ {l}</p>
              ))}
            </div>
            <p style={{ 
              marginTop: '1.5rem', 
              fontSize: '0.75rem', 
              color: 'var(--color-text-dim)', 
              fontStyle: 'italic',
              maxWidth: '500px',
              margin: '1.5rem auto 0',
              lineHeight: '1.5',
            }}>
              {TURING_MEMORIAL.finalQuote.note}
            </p>
          </div>
        )}

        {/* Stage 4: Performance Dossier */}
        {stage >= 4 && (
          <div style={{ 
            border: '2px solid var(--color-text)', 
            padding: '2rem', 
            textAlign: 'center',
            animation: 'fadeIn 1.5s ease',
          }}>
            <h2 style={{ marginBottom: '1.5rem', letterSpacing: '2px' }}>
              ANALYST PERFORMANCE DOSSIER
            </h2>
            
            {/* Stats */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '0.8rem', 
              maxWidth: '400px', 
              margin: '0 auto',
              textAlign: 'left',
              fontSize: '0.9rem',
            }}>
              <span style={{ color: 'var(--color-text-dim)' }}>CORRECT IDENTIFICATIONS:</span>
              <span>{gameState.correctPicks}/4</span>
              <span style={{ color: 'var(--color-text-dim)' }}>CLEARANCE REMAINING:</span>
              <span>{gameState.clearanceLevel}/3</span>
              <span style={{ color: 'var(--color-text-dim)' }}>ROUNDS COMPLETED:</span>
              <span>{gameState.round}/5</span>
              <span style={{ color: 'var(--color-text-dim)' }}>TRANSMISSIONS USED:</span>
              <span>{gameState.totalTransmissionsUsed}</span>
              <span style={{ color: 'var(--color-text-dim)' }}>TIME ELAPSED:</span>
              <span>{Math.floor(gameState.totalTimeUsed / 60)}m {gameState.totalTimeUsed % 60}s</span>
            </div>

            {/* Rating */}
            <div style={{ 
              marginTop: '1.5rem', 
              padding: '1rem',
              border: '1px solid var(--color-amber)',
            }}>
              <span style={{ color: 'var(--color-text-dim)' }}>FINAL RATING: </span>
              <span className="text-glow" style={{ 
                fontSize: '1.3rem', 
                color: rating === 'TURING-LEVEL' ? 'var(--color-amber)' : 'var(--color-text)',
              }}>
                {rating}
              </span>
            </div>

            {/* Round-by-round reveal toggle */}
            <div style={{ marginTop: '1.5rem' }}>
              <button 
                onClick={() => { setShowReveal(!showReveal); soundEngine.uiClick(); }}
                style={{ padding: '8px 20px', fontSize: '0.9rem' }}
              >
                {showReveal ? '[ HIDE SIGNAL ANALYSIS ]' : '[ REVEAL WHO WAS WHO ]'}
              </button>
            </div>

            {/* Post-game reveal */}
            {showReveal && (
              <div style={{ 
                marginTop: '1.5rem', 
                textAlign: 'left',
                animation: 'fadeIn 0.5s ease',
              }}>
                <h3 style={{ 
                  marginBottom: '1rem', 
                  textAlign: 'center', 
                  color: 'var(--color-amber)',
                  fontSize: '1rem',
                }}>
                  DECLASSIFIED — SIGNAL ANALYSIS
                </h3>
                {gameState.roundHistory.map((rh, i) => (
                  <div key={i} style={{ 
                    marginBottom: '1.2rem', 
                    padding: '0.8rem',
                    border: '1px solid var(--color-text-dim)',
                    animation: `fadeIn ${0.3 + i * 0.2}s ease`,
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      marginBottom: '0.5rem',
                      color: rh.correct ? 'var(--color-text)' : 'var(--color-red)',
                    }}>
                      <span>ROUND {rh.round}</span>
                      <span>{rh.correct ? '✓ CORRECT' : '✗ INCORRECT'}</span>
                    </div>
                    {rh.suspects.map((s) => {
                      const tell = PERSONA_TELLS[s.persona];
                      const wasVoted = s.id === rh.votedId;
                      return (
                        <div key={s.id} style={{ 
                          marginBottom: '0.5rem',
                          padding: '0.4rem 0.6rem',
                          borderLeft: wasVoted ? '3px solid var(--color-amber)' : '3px solid transparent',
                          background: wasVoted ? 'rgba(255,176,0,0.05)' : 'transparent',
                          fontSize: '0.8rem',
                        }}>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            color: s.isHuman ? 'var(--color-text)' : 'var(--color-red)',
                          }}>
                            <span>{s.id}</span>
                          </div>
                          {tell && (
                            <p style={{ 
                              color: 'var(--color-text-dim)', 
                              fontSize: '0.75rem', 
                              marginTop: '0.3rem',
                              lineHeight: '1.4',
                            }}>
                              TELL: {tell.tell}
                            </p>
                          )}
                          {wasVoted && (
                            <span style={{ 
                              fontSize: '0.7rem', 
                              color: 'var(--color-amber)',
                            }}>
                              ← YOUR PICK
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            {/* Share Card */}
            <ShareCard stats={{
              rating,
              correctPicks: gameState.correctPicks,
              totalRounds: gameState.round,
              clearanceLevel: gameState.clearanceLevel,
              totalTransmissionsUsed: gameState.totalTransmissionsUsed,
              totalTimeUsed: gameState.totalTimeUsed,
            }} />

            {/* Play Again */}
            <div style={{ marginTop: '1.5rem' }}>
              <button 
                onClick={() => { 
                  soundEngine.uiClick();
                  startGame(); 
                  navigate('/'); 
                }}
                style={{ 
                  padding: '10px 30px', 
                  fontSize: '1.1rem',
                }}
              >
                [ PLAY AGAIN ]
              </button>
            </div>

            {/* Final line */}
            <p style={{ 
              marginTop: '2rem', 
              fontSize: '0.7rem', 
              color: 'var(--color-text-dim)', 
              lineHeight: '1.5',
              fontStyle: 'italic',
            }}>
              THIS GAME WAS BUILT ON THE LONGEST DAY OF 1952.
              <br/>HE NEVER GOT TO SEE ANOTHER ONE.
              <br/><br/>
              BUILT WITH THE GEMINI API — THE KIND OF MIND HE IMAGINED.
            </p>
          </div>
        )}
        <div ref={endOfContentRef} />
      </div>
    </div>
  );
};

export default EndingScreen;
