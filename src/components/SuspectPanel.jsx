import React, { useEffect, useRef } from 'react';
import TypewriterText from './TypewriterText';
import TransmissionIndicator from './TransmissionIndicator';
import { useGame } from '../context/GameContext';
import soundEngine from '../audio/SoundEngine';

const SuspectPanel = ({ suspect, onVote, index }) => {
  const { gameState, setActiveSuspectId } = useGame();
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [suspect.chat]);

  const isActive = gameState.activeSuspectId === suspect.id;
  const isWaitingResponse = suspect.chat.length > 0 && suspect.chat[suspect.chat.length - 1].sender === 'YOU';

  const handleClick = () => {
    setActiveSuspectId(suspect.id);
    soundEngine.uiClick();
  };

  const handleVote = (e) => {
    e.stopPropagation();
    soundEngine.uiClick();
    onVote();
  };

  return (
    <div 
      className={`suspect-panel ${isActive ? 'active' : ''}`}
      style={{ 
        flex: 1, 
        border: `1px solid ${isActive ? 'var(--color-text)' : 'var(--color-text-dim)'}`, 
        display: 'flex', 
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        minWidth: 0,
        animation: `fadeIn ${0.3 + index * 0.15}s ease`,
      }}
      onClick={handleClick}
    >
      {/* Header */}
      <div style={{ 
        borderBottom: '1px solid var(--color-text-dim)', 
        padding: '6px 10px', 
        textAlign: 'center',
        backgroundColor: isActive ? 'rgba(51, 255, 0, 0.08)' : 'transparent',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'background-color 0.3s',
      }}>
        <span style={{ fontSize: '0.75em', color: 'var(--color-text-dim)' }}>
          [{index + 1}]
        </span>
        <span className={isActive ? 'text-glow' : ''}>
          {suspect.id}
        </span>
        <span style={{ 
          fontSize: '0.65em',
          color: suspect.chat.length > 0 ? 'var(--color-amber)' : 'var(--color-text-dim)',
        }}>
          {suspect.chat.filter(m => m.sender !== 'YOU').length} MSG
        </span>
      </div>
      
      {/* Chat area */}
      <div 
        ref={chatRef}
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '8px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px',
          fontSize: '0.9em',
        }}
      >
        {suspect.chat.length === 0 && (
          <div style={{ 
            color: 'var(--color-text-dim)', 
            fontSize: '0.75em', 
            textAlign: 'center',
            padding: '2rem 0.5rem',
            lineHeight: '1.5',
          }}>
            NO TRANSMISSIONS YET.
            <br/>
            SELECT THIS SIGNAL AND TYPE BELOW.
          </div>
        )}
        {suspect.chat.map((msg, idx) => (
          <div 
            key={idx} 
            style={{ 
              textAlign: msg.sender === 'YOU' ? 'right' : 'left',
              animation: 'slideIn 0.3s ease',
            }}
          >
            <span style={{ 
              color: msg.sender === 'YOU' ? 'var(--color-amber)' : 'var(--color-text-dim)', 
              fontSize: '0.7em',
            }}>
              &gt; {msg.sender === 'YOU' ? 'YOU' : suspect.id}
            </span>
            <br />
            <span style={{
              color: msg.sender === 'YOU' ? 'var(--color-amber)' : 'inherit',
              opacity: msg.sender === 'YOU' ? 0.9 : 1,
            }}>
              {msg.sender === 'YOU' ? (
                msg.text
              ) : (
                <TypewriterText text={msg.text} speed={20} />
              )}
            </span>
          </div>
        ))}
        {/* Transmission indicator while waiting */}
        <TransmissionIndicator isActive={isWaitingResponse && suspect.chat[suspect.chat.length - 1]?.sender === 'YOU'} />
      </div>

      {/* Footer — trust bar + vote */}
      <div style={{ borderTop: '1px solid var(--color-text-dim)', padding: '8px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '6px',
          fontSize: '0.8em',
        }}>
          <span style={{ color: 'var(--color-text-dim)' }}>TRUST</span>
          <span style={{ letterSpacing: '1px' }}>
            {'█'.repeat(Math.floor(suspect.trustScore / 10))}
            {'░'.repeat(10 - Math.floor(suspect.trustScore / 10))}
          </span>
        </div>
        <button 
          onClick={handleVote}
          style={{ 
            width: '100%', 
            padding: '8px',
            fontSize: '0.85em',
            letterSpacing: '1px',
          }}
          disabled={gameState.gameStatus !== 'playing'}
        >
          [ IDENTIFY AS HUMAN ]
        </button>
      </div>
    </div>
  );
};

export default SuspectPanel;
