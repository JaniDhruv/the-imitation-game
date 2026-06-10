import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

const EvidenceBoard = () => {
  const { gameState, evidenceNotes, setEvidenceNotes } = useGame();

  const handleNoteChange = (suspectId, text) => {
    setEvidenceNotes(prev => ({
      ...prev,
      [suspectId]: text
    }));
  };

  return (
    <div style={{ flex: 1, border: '1px solid var(--color-text-dim)', padding: '10px', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ borderBottom: '1px solid var(--color-text-dim)', paddingBottom: '5px', marginBottom: '10px' }}>EVIDENCE BOARD</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1, overflowY: 'auto' }}>
        {gameState.suspects.map(suspect => (
          <div key={suspect.id} style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '0.8em', color: 'var(--color-text-dim)', marginBottom: '5px' }}>{suspect.id} NOTES:</label>
            <textarea 
              value={evidenceNotes[suspect.id] || ''}
              onChange={(e) => handleNoteChange(suspect.id, e.target.value)}
              style={{ 
                background: 'rgba(255, 176, 0, 0.1)', 
                border: '1px solid var(--color-amber)', 
                color: 'var(--color-amber)',
                minHeight: '80px',
                padding: '5px',
                fontFamily: 'inherit',
                fontSize: '0.9em',
                resize: 'vertical'
              }}
              placeholder="Type observations here..."
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default EvidenceBoard;
