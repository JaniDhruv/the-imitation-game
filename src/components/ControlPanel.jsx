import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import soundEngine from '../audio/SoundEngine';

const ControlPanel = () => {
  const { gameState, addMessageToSuspect, decrementTransmissions, getDifficultyConfig, withdrawSuspect, activeModel } = useGame();
  const [inputMessage, setInputMessage] = useState('');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Auto-focus input when suspect changes
  useEffect(() => {
    if (gameState.activeSuspectId && inputRef.current && gameState.gameStatus === 'playing') {
      inputRef.current.focus();
    }
  }, [gameState.activeSuspectId, gameState.gameStatus]);

  // Cancel on round change or unmount
  useEffect(() => {
    return () => abortControllerRef.current?.abort();
  }, [gameState.round]);

  // On any click in the game terminal, refocus the input
  useEffect(() => {
    const handleClick = () => {
      // Don't focus if we are trying to click a button or interactive element,
      // but the user specifically said "On any click in the game terminal, refocus the input".
      // We will ensure it only focuses if we are playing.
      if (gameState.gameStatus === 'playing') {
        inputRef.current?.focus();
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [gameState.gameStatus]);

  const handleTransmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !gameState.activeSuspectId || gameState.transmissionsRemaining <= 0) return;
    if (gameState.gameStatus !== 'playing') return;

    const messageToSend = inputMessage;
    const targetId = gameState.activeSuspectId;
    const targetSuspect = gameState.suspects.find(s => s.id === targetId);

    // Check for duplicate message (except in EASY mode)
    if (gameState.difficulty !== 'EASY' && gameState.pastTransmissions?.includes(messageToSend.trim().toLowerCase())) {
      setInputMessage('');
      addMessageToSuspect(targetId, messageToSend, 'YOU');
      
      setIsTransmitting(true);
      try { soundEngine.transmitSend(); } catch(e) {}
      
      setTimeout(() => {
        try { soundEngine.startReceiving(); } catch(e) {}
        addMessageToSuspect(targetId, '[DUPLICATE TRANSMISSION BLOCKED]', targetId);
        setIsTransmitting(false);
      }, 600);
      return;
    }

    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    setInputMessage('');
    addMessageToSuspect(targetId, messageToSend, 'YOU');
    decrementTransmissions();
    setIsTransmitting(true);
    
    // Sound effects
    soundEngine.transmitSend();

    try {
      const config = getDifficultyConfig(gameState.difficulty);
      const response = await fetch('/api/transmit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageToSend,
          persona: targetSuspect.persona,
          chatHistory: targetSuspect.chat,
          tellMode: config.tellMode,
          round: gameState.round,
          difficulty: gameState.difficulty,
          useFallback: activeModel === 'fallback'
        }),
        signal: abortControllerRef.current.signal
      });
      
      const data = await response.json();
      
      // Receiving sound
      soundEngine.startReceiving();

      if (data && data.reply) {
         addMessageToSuspect(targetId, data.reply, targetId);
         
         // Nightmare Hostility Withdrawal
         if (gameState.difficulty === 'NIGHTMARE') {
           const isHostile = /are you human|are you an ai|prove it|you.?re a machine/i.test(messageToSend);
           if (isHostile) {
             withdrawSuspect(targetId);
           }
         }
      } else if (data && data.error) {
         addMessageToSuspect(targetId, `[SYSTEM ERROR: ${data.error}]`, targetId);
      } else {
         addMessageToSuspect(targetId, "[SIGNAL CORRUPTED]", targetId);
      }
    } catch (error) {
      if (error.name === 'AbortError') return; // silently ignore
      console.error(error);
      addMessageToSuspect(targetId, "[CONNECTION ERROR. RETRYING LATER.]", targetId);
    } finally {
      setIsTransmitting(false);
    }
  };

  // Handle keypress sound
  const handleKeyDown = (e) => {
    if (e.key.length === 1) { // Only for printable characters
      soundEngine.keyClick();
    }
  };

  const noSuspect = !gameState.activeSuspectId;
  const noTransmissions = gameState.transmissionsRemaining <= 0;
  const activeSuspectObj = gameState.suspects.find(s => s.id === gameState.activeSuspectId);
  const isWithdrawn = activeSuspectObj?.isWithdrawn;
  const isCoolingDown = gameState.difficulty !== 'EASY' && gameState.lastMessagedSignalId === gameState.activeSuspectId;
  const disabled = noSuspect || noTransmissions || isTransmitting || isWithdrawn || isCoolingDown || gameState.gameStatus !== 'playing';

  return (
    <div style={{ 
      border: '1px solid var(--color-text)', 
      padding: '10px', 
      marginTop: '8px',
    }}>
      <form onSubmit={handleTransmit} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <span style={{ 
          color: 'var(--color-text-dim)', 
          fontSize: '0.85em',
          whiteSpace: 'nowrap',
        }}>
          &gt;
        </span>
        <input 
          ref={inputRef}
          type="text" 
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ flex: 1 }}
          autoFocus
          disabled={disabled}
          placeholder={
            noSuspect ? 'SELECT A SIGNAL FIRST [PRESS 1, 2, OR 3]' : 
            noTransmissions ? 'NO TRANSMISSIONS REMAINING — VOTE NOW' :
            isWithdrawn ? '[ SIGNAL WITHDRAWN ]' :
            isCoolingDown ? '[ SIGNAL COOLING DOWN — SELECT ANOTHER ]' :
            `TRANSMIT TO ${gameState.activeSuspectId}...`
          }
        />
        <button 
          type="submit" 
          disabled={disabled || !inputMessage.trim()}
          style={{ whiteSpace: 'nowrap' }}
        >
          {isTransmitting ? '[ ◌◌◌ ]' : '[ SEND → ]'}
        </button>
      </form>
      <div style={{ 
        marginTop: '8px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        color: 'var(--color-text-dim)',
        fontSize: '0.85em',
        flexWrap: 'wrap',
        gap: '5px',
      }}>
        <span>
          TRANSMISSIONS: 
          <span style={{ 
            color: noTransmissions ? 'var(--color-red)' : 'var(--color-amber)', 
            marginLeft: '8px',
            letterSpacing: '2px',
          }}>
             {'●'.repeat(gameState.transmissionsRemaining)}{'○'.repeat(5 - gameState.transmissionsRemaining)}
          </span>
        </span>
        <span>
          SIGNAL: 
          {['SIGNAL-A', 'SIGNAL-B', 'SIGNAL-C'].map((sig, idx) => (
            <span 
              key={sig} 
              style={{ 
                marginLeft: '8px', 
                color: gameState.activeSuspectId === sig ? 'var(--color-text)' : 'inherit',
                textShadow: gameState.activeSuspectId === sig ? '0 0 6px var(--color-glow)' : 'none',
                cursor: 'pointer',
              }}
              onClick={() => {}}
            >
              [{sig.split('-')[1]}]
            </span>
          ))}
        </span>
      </div>
    </div>
  );
};

export default ControlPanel;
