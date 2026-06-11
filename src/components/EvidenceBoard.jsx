import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { INTERROGATION_STRATEGIES } from '../data/turingTimeline';

const EvidenceBoard = () => {
  const { gameState, evidenceNotes, setEvidenceNotes } = useGame();
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' or 'strategies'

  const handleNoteChange = (suspectId, text) => {
    setEvidenceNotes(prev => ({
      ...prev,
      [suspectId]: text
    }));
  };

  return (
    <div style={{ 
      flex: 1, 
      border: '1px solid var(--color-text-dim)', 
      padding: '10px', 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: 0,
    }}>
      {/* Tab header */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '1px solid var(--color-text-dim)', 
        paddingBottom: '5px', 
        marginBottom: '8px',
        gap: '5px',
      }}>
        <button 
          onClick={() => setActiveTab('notes')}
          style={{ 
            flex: 1,
            fontSize: '0.8em',
            padding: '3px',
            border: activeTab === 'notes' ? '1px solid var(--color-text)' : '1px solid var(--color-text-dim)',
            color: activeTab === 'notes' ? 'var(--color-text)' : 'var(--color-text-dim)',
          }}
        >
          EVIDENCE
        </button>
        <button 
          onClick={() => setActiveTab('strategies')}
          style={{ 
            flex: 1,
            fontSize: '0.8em',
            padding: '3px',
            border: activeTab === 'strategies' ? '1px solid var(--color-text)' : '1px solid var(--color-text-dim)',
            color: activeTab === 'strategies' ? 'var(--color-text)' : 'var(--color-text-dim)',
          }}
        >
          STRATEGIES
        </button>
      </div>

      {/* Notes tab */}
      {activeTab === 'notes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto' }}>
          {gameState.suspects.map(suspect => (
            <div key={suspect.id} style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ 
                fontSize: '0.75em', 
                color: gameState.activeSuspectId === suspect.id ? 'var(--color-text)' : 'var(--color-text-dim)', 
                marginBottom: '3px',
                transition: 'color 0.3s',
              }}>
                {suspect.id} NOTES:
              </label>
              <textarea 
                value={evidenceNotes[suspect.id] || ''}
                onChange={(e) => handleNoteChange(suspect.id, e.target.value)}
                style={{ 
                  background: 'rgba(255, 176, 0, 0.05)', 
                  border: `1px solid ${gameState.activeSuspectId === suspect.id ? 'var(--color-amber)' : 'var(--color-text-dim)'}`, 
                  color: 'var(--color-amber)',
                  minHeight: '60px',
                  padding: '5px',
                  fontFamily: 'inherit',
                  fontSize: '0.8em',
                  resize: 'vertical',
                  transition: 'border-color 0.3s',
                }}
                placeholder="OBSERVATIONS..."
              />
            </div>
          ))}
        </div>
      )}

      {/* Strategies tab */}
      {activeTab === 'strategies' && (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px', 
          flex: 1, 
          overflowY: 'auto',
          fontSize: '0.8em',
        }}>
          <p style={{ 
            color: 'var(--color-text-dim)', 
            fontSize: '0.85em', 
            marginBottom: '4px',
            lineHeight: '1.4',
          }}>
            ▸ INTERROGATION TECHNIQUES FOR IDENTIFYING AI:
          </p>
          {INTERROGATION_STRATEGIES.map((strategy, i) => (
            <div key={i} style={{ 
              padding: '6px 8px',
              borderLeft: '2px solid var(--color-amber)',
              background: 'rgba(255, 176, 0, 0.03)',
              animation: `fadeIn ${0.2 + i * 0.1}s ease`,
            }}>
              <div style={{ color: 'var(--color-amber)', fontSize: '0.85em', marginBottom: '2px' }}>
                {strategy.title}
              </div>
              <div style={{ color: 'var(--color-text-dim)', fontSize: '0.85em', lineHeight: '1.4' }}>
                {strategy.tip}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EvidenceBoard;
