import React, { createContext, useContext, useState, useEffect } from 'react';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

const INITIAL_STATE = {
  round: 1,
  timeRemaining: 120,
  transmissionsRemaining: 5,
  clearanceLevel: 3,
  gameStatus: 'booting', // booting, playing, round_over, game_over, won, ending_sequence
  suspects: [],
  activeSuspectId: null,
  correctPicks: 0,
  totalTransmissionsUsed: 0,
  totalTimeUsed: 0,
};

export const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState(INITIAL_STATE);
  const [evidenceNotes, setEvidenceNotes] = useState({});

  const startGame = () => {
    setGameState({
      ...INITIAL_STATE,
      gameStatus: 'playing',
      suspects: generateSuspects(1)
    });
  };

  const advanceRound = () => {
    if (gameState.round === 5) {
      setGameState(prev => ({ ...prev, gameStatus: 'won' }));
      return;
    }
    setGameState(prev => ({
      ...prev,
      round: prev.round + 1,
      timeRemaining: 120,
      transmissionsRemaining: 5,
      gameStatus: 'playing',
      suspects: generateSuspects(prev.round + 1)
    }));
  };

  const decreaseClearance = () => {
    setGameState(prev => {
      const newClearance = prev.clearanceLevel - 1;
      if (newClearance <= 0) {
        return { ...prev, clearanceLevel: 0, gameStatus: 'game_over' };
      }
      return { ...prev, clearanceLevel: newClearance, gameStatus: 'round_over' };
    });
  };

  const updateTime = (time) => setGameState(prev => ({ ...prev, timeRemaining: time }));
  const decrementTransmissions = () => setGameState(prev => ({ 
    ...prev, 
    transmissionsRemaining: prev.transmissionsRemaining - 1,
    totalTransmissionsUsed: prev.totalTransmissionsUsed + 1
  }));
  
  const recordRoundStats = (isCorrect) => {
    setGameState(prev => ({
      ...prev,
      correctPicks: isCorrect ? prev.correctPicks + 1 : prev.correctPicks,
      totalTimeUsed: prev.totalTimeUsed + (120 - prev.timeRemaining)
    }));
  };

  const setActiveSuspectId = (id) => setGameState(prev => ({ ...prev, activeSuspectId: id }));

  const addMessageToSuspect = (suspectId, message, sender) => {
    setGameState(prev => ({
      ...prev,
      suspects: prev.suspects.map(s => 
        s.id === suspectId ? { ...s, chat: [...s.chat, { sender, text: message }] } : s
      )
    }));
  };

  return (
    <GameContext.Provider value={{
      gameState,
      startGame,
      advanceRound,
      decreaseClearance,
      updateTime,
      decrementTransmissions,
      setActiveSuspectId,
      addMessageToSuspect,
      recordRoundStats,
      evidenceNotes,
      setEvidenceNotes,
      setGameState
    }}>
      {children}
    </GameContext.Provider>
  );
};

const PERSONAS = ['CIPHER', 'ORACLE', 'MARLOWE', 'STATIC', 'WREN', 'ARGUS', 'ECHO'];
const HUMAN_PERSONA = 'NOVAK';

function generateSuspects(round) {
  // Logic to generate 3 suspects.
  // In rounds 1-4, 1 is NOVAK (human), 2 are AI.
  // In round 5, all 3 are AI.
  let selected = [];
  const shuffledAI = [...PERSONAS].sort(() => 0.5 - Math.random());
  
  if (round < 5) {
    selected = [HUMAN_PERSONA, shuffledAI[0], shuffledAI[1]];
  } else {
    selected = [shuffledAI[0], shuffledAI[1], shuffledAI[2]];
  }
  
  // Shuffle the 3 selected
  selected.sort(() => 0.5 - Math.random());
  
  return selected.map((persona, index) => ({
    id: `SIGNAL-${['A', 'B', 'C'][index]}`,
    persona: persona,
    isHuman: persona === HUMAN_PERSONA,
    chat: [],
    trustScore: 50 // initial trust score
  }));
}
