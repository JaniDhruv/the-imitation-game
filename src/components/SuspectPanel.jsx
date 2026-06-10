import React, { useEffect, useRef } from 'react';
import TypewriterText from './TypewriterText';
import { useGame } from '../context/GameContext';

const SuspectPanel = ({ suspect, onVote }) => {
  const { gameState, setActiveSuspectId } = useGame();
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [suspect.chat]);

  const isActive = gameState.activeSuspectId === suspect.id;

  return (
    <div 
      style={{ 
        flex: 1, 
        border: `1px solid ${isActive ? 'var(--color-text)' : 'var(--color-text-dim)'}`, 
        display: 'flex', 
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
      onClick={() => setActiveSuspectId(suspect.id)}
    >
      <div style={{ 
        borderBottom: '1px solid var(--color-text-dim)', 
        padding: '5px', 
        textAlign: 'center',
        backgroundColor: isActive ? 'rgba(51, 255, 0, 0.1)' : 'transparent'
      }}>
        {suspect.id}
      </div>
      
      <div 
        ref={chatRef}
        style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}
      >
        {suspect.chat.map((msg, idx) => (
          <div key={idx} style={{ textAlign: msg.sender === 'YOU' ? 'right' : 'left' }}>
            <span style={{ color: msg.sender === 'YOU' ? 'var(--color-amber)' : 'inherit', fontSize: '0.8em' }}>
              &gt; {msg.sender}
            </span>
            <br />
            {msg.sender === 'YOU' ? (
              msg.text
            ) : (
              <TypewriterText text={msg.text} speed={20} />
            )}
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid var(--color-text-dim)', padding: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span>TRUST</span>
          <span>
            {'█'.repeat(Math.floor(suspect.trustScore / 10))}
            {'░'.repeat(10 - Math.floor(suspect.trustScore / 10))}
          </span>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onVote(); }}
          style={{ width: '100%', padding: '10px' }}
          disabled={gameState.gameStatus !== 'playing'}
        >
          [ IDENTIFY AS HUMAN ]
        </button>
      </div>
    </div>
  );
};

export default SuspectPanel;
