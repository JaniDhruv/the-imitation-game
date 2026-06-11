import React, { createContext, useContext, useState, useRef } from 'react';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

const INITIAL_STATE = {
  round: 1,
  timeRemaining: 120,
  transmissionsRemaining: 5,
  clearanceLevel: 3,
  gameStatus: 'booting', // booting, dossier, playing, round_over, round_won, round_over_timeout, game_over, won, ending_sequence
  suspects: [],
  activeSuspectId: null,
  correctPicks: 0,
  totalTransmissionsUsed: 0,
  totalTimeUsed: 0,
  roundHistory: [], // track what happened each round
};

export const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState(INITIAL_STATE);
  const [evidenceNotes, setEvidenceNotes] = useState({});
  const rosterRef = useRef(null);

  const startGame = () => {
    const roster = buildRoundRoster();
    rosterRef.current = roster;
    setGameState({
      ...INITIAL_STATE,
      gameStatus: 'dossier', // Show dossier first
      round: 1,
      suspects: generateSuspects(1, roster),
    });
    setEvidenceNotes({});
  };

  const dismissDossier = () => {
    setGameState(prev => ({ ...prev, gameStatus: 'playing' }));
  };

  const advanceRound = () => {
    if (gameState.round === 5) {
      setGameState(prev => ({ ...prev, gameStatus: 'won' }));
      return;
    }
    const nextRound = gameState.round + 1;
    setGameState(prev => ({
      ...prev,
      round: nextRound,
      timeRemaining: 120,
      transmissionsRemaining: 5,
      gameStatus: 'dossier', // Show dossier before each round
      suspects: generateSuspects(nextRound, rosterRef.current),
      activeSuspectId: null,
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
  
  const recordRoundStats = (isCorrect, votedSuspectId) => {
    setGameState(prev => ({
      ...prev,
      correctPicks: isCorrect ? prev.correctPicks + 1 : prev.correctPicks,
      totalTimeUsed: prev.totalTimeUsed + (120 - prev.timeRemaining),
      roundHistory: [...prev.roundHistory, {
        round: prev.round,
        correct: isCorrect,
        votedId: votedSuspectId,
        suspects: prev.suspects.map(s => ({
          id: s.id,
          persona: s.persona,
          isHuman: s.isHuman,
          chatLength: s.chat.length,
        })),
        timeUsed: 120 - prev.timeRemaining,
        transmissionsUsed: 5 - prev.transmissionsRemaining,
      }],
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
      setGameState,
      dismissDossier,
    }}>
      {children}
    </GameContext.Provider>
  );
};

const ALL_AI_PERSONAS = ['CIPHER', 'ORACLE', 'MARLOWE', 'STATIC', 'WREN', 'ARGUS', 'ECHO'];
const HUMAN_PERSONA = 'NOVAK';

/**
 * Shuffle an array in place (Fisher-Yates).
 */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Build the full 5-round roster up front so every round
 * gets unique AI personas. 7 AIs available:
 *   Rounds 1-4: 2 AIs each = 8 slots, but we have 7 — 
 *   so we allow 1 repeat between round 4 and the earlier pool.
 *   Round 5: 3 remaining AIs (all AI, no human).
 */
function buildRoundRoster() {
  const shuffled = shuffle(ALL_AI_PERSONAS); // e.g. [WREN, STATIC, ECHO, ARGUS, CIPHER, ORACLE, MARLOWE]

  // Rounds 1-4 get 2 unique AIs each (indices 0-1, 2-3, 4-5, 6 + wrap)
  const rounds = {};
  for (let r = 1; r <= 4; r++) {
    const i = (r - 1) * 2;
    const ai1 = shuffled[i % shuffled.length];
    const ai2 = shuffled[(i + 1) % shuffled.length];
    rounds[r] = [HUMAN_PERSONA, ai1, ai2];
  }

  // Round 5: pick 3 AIs not heavily used — just grab last 3 from a fresh shuffle
  const freshShuffle = shuffle(ALL_AI_PERSONAS);
  rounds[5] = [freshShuffle[0], freshShuffle[1], freshShuffle[2]];

  return rounds;
}

function generateSuspects(round, roster) {
  const selected = roster[round] || [HUMAN_PERSONA, 'CIPHER', 'ORACLE'];

  // Shuffle positions so NOVAK isn't always SIGNAL-A
  const shuffledPositions = shuffle(selected);

  return shuffledPositions.map((persona, index) => ({
    id: `SIGNAL-${['A', 'B', 'C'][index]}`,
    persona: persona,
    isHuman: persona === HUMAN_PERSONA,
    chat: [],
    trustScore: 50,
  }));
}
