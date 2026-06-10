import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

const ControlPanel = () => {
  const { gameState, addMessageToSuspect, decrementTransmissions } = useGame();
  const [inputMessage, setInputMessage] = useState('');
  const [isTransmitting, setIsTransmitting] = useState(false);

  const handleTransmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !gameState.activeSuspectId || gameState.transmissionsRemaining <= 0) return;
    if (gameState.gameStatus !== 'playing') return;

    const messageToSend = inputMessage;
    const targetId = gameState.activeSuspectId;
    const targetSuspect = gameState.suspects.find(s => s.id === targetId);
    
    setInputMessage('');
    addMessageToSuspect(targetId, messageToSend, 'YOU');
    decrementTransmissions();
    setIsTransmitting(true);

    try {
      const response = await fetch('/api/transmit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageToSend,
          persona: targetSuspect.persona,
          chatHistory: targetSuspect.chat
        })
      });
      
      const data = await response.json();
      
      if (data && data.reply) {
         addMessageToSuspect(targetId, data.reply, targetId);
      } else if (data && data.error) {
         addMessageToSuspect(targetId, `[SYSTEM ERROR: ${data.error}]`, targetId);
      } else {
         addMessageToSuspect(targetId, "[SIGNAL CORRUPTED]", targetId);
      }
    } catch (error) {
      console.error(error);
      addMessageToSuspect(targetId, "[CONNECTION ERROR. RETRYING LATER.]", targetId);
    } finally {
      setIsTransmitting(false);
    }
  };

  return (
    <div style={{ border: '1px solid var(--color-text)', padding: '10px', marginTop: '10px' }}>
      <form onSubmit={handleTransmit} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <span>&gt; TYPE YOUR TRANSMISSION:</span>
        <input 
          type="text" 
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          style={{ flex: 1 }}
          autoFocus
          disabled={!gameState.activeSuspectId || gameState.transmissionsRemaining <= 0 || isTransmitting}
          placeholder={gameState.activeSuspectId ? `To ${gameState.activeSuspectId}...` : 'SELECT A SIGNAL FIRST'}
        />
        <button 
          type="submit" 
          disabled={!gameState.activeSuspectId || gameState.transmissionsRemaining <= 0 || isTransmitting || !inputMessage.trim()}
        >
          {isTransmitting ? '[ TRANSMITTING... ]' : '[ → ]'}
        </button>
      </form>
      <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-dim)' }}>
        <span>TRANSMISSIONS REMAINING: 
          <span style={{ color: 'var(--color-amber)', marginLeft: '10px' }}>
             {'●'.repeat(gameState.transmissionsRemaining)}{'○'.repeat(5 - gameState.transmissionsRemaining)}
          </span>
        </span>
        <span>
          ACTIVE SIGNAL: 
          {['SIGNAL-A', 'SIGNAL-B', 'SIGNAL-C'].map(sig => (
            <span key={sig} style={{ marginLeft: '10px', color: gameState.activeSuspectId === sig ? 'var(--color-text)' : 'inherit' }}>
              [{sig.split('-')[1]}]
            </span>
          ))}
        </span>
      </div>
    </div>
  );
};

export default ControlPanel;
