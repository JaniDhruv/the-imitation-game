import React, { createContext, useContext, useState, useRef } from 'react';
import { DIFFICULTY_MODES, HUMAN_PERSONA_KEYS, TRANSMISSION_SCHEDULE } from '../data/difficultyConfig';

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
  difficulty: 'MEDIUM', // EASY, MEDIUM, HARD, NIGHTMARE
  pastTransmissions: [], // array of lowercase trimmed strings sent by user
  lastMessagedSignalId: null,
};

export const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState(INITIAL_STATE);
  const [activeModel, setActiveModel] = useState('env');
  const [evidenceNotes, setEvidenceNotes] = useState(() => {
    const saved = sessionStorage.getItem('operation_imitation_notes');
    return saved ? JSON.parse(saved) : {};
  });

  const updateEvidenceNotes = (notesOrUpdater) => {
    setEvidenceNotes(prev => {
      const newNotes = typeof notesOrUpdater === 'function' ? notesOrUpdater(prev) : notesOrUpdater;
      sessionStorage.setItem('operation_imitation_notes', JSON.stringify(newNotes));
      return newNotes;
    });
  };
  const rosterRef = useRef(null);

  const pingAPI = async () => {
    try {
      const res = await fetch('/api/transmit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPing: true, useFallback: false })
      });
      const data = await res.json();
      if (data.error) {
        const fallbackRes = await fetch('/api/transmit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isPing: true, useFallback: true })
        });
        const fallbackData = await fallbackRes.json();
        if (fallbackData.error) {
          return 'fatal';
        }
        setActiveModel('fallback');
        return 'fallback';
      }
      setActiveModel('env');
      return 'env';
    } catch (err) {
      return 'fatal';
    }
  };

  const getDifficultyConfig = (diff) => DIFFICULTY_MODES[diff || gameState.difficulty] || DIFFICULTY_MODES.MEDIUM;

  const startGame = (difficulty = 'MEDIUM') => {
    const config = getDifficultyConfig(difficulty);
    const roster = buildRoundRoster(config);
    rosterRef.current = roster;
    setGameState({
      ...INITIAL_STATE,
      difficulty,
      gameStatus: 'dossier', // Show dossier first
      round: 1,
      timeRemaining: config.timerSeconds,
      transmissionsRemaining: TRANSMISSION_SCHEDULE[difficulty][0],
      clearanceLevel: config.clearanceLevels,
      suspects: generateSuspects(1, roster),
    });
    updateEvidenceNotes({});
  };

  const dismissDossier = () => {
    setGameState(prev => ({ ...prev, gameStatus: 'playing' }));
  };

  const advanceRound = () => {
    const config = getDifficultyConfig(gameState.difficulty);
    if (gameState.round === 5) {
      setGameState(prev => ({ ...prev, gameStatus: 'won' }));
      return;
    }
    const nextRound = gameState.round + 1;
    setGameState(prev => ({
      ...prev,
      round: nextRound,
      timeRemaining: config.timerSeconds,
      transmissionsRemaining: TRANSMISSION_SCHEDULE[gameState.difficulty][nextRound - 1],
      gameStatus: 'dossier', // Show dossier before each round
      suspects: generateSuspects(nextRound, rosterRef.current),
      activeSuspectId: null,
      lastMessagedSignalId: null,
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
    const config = getDifficultyConfig(gameState.difficulty);
    setGameState(prev => ({
      ...prev,
      correctPicks: isCorrect ? prev.correctPicks + 1 : prev.correctPicks,
      totalTimeUsed: prev.totalTimeUsed + (config.timerSeconds - prev.timeRemaining),
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
        timeUsed: config.timerSeconds - prev.timeRemaining,
        transmissionsUsed: 5 - prev.transmissionsRemaining,
      }],
    }));
  };

  const setActiveSuspectId = (id) => setGameState(prev => ({ ...prev, activeSuspectId: id }));

  const withdrawSuspect = (id) => setGameState(prev => ({
    ...prev,
    suspects: prev.suspects.map(s => s.id === id ? { ...s, isWithdrawn: true } : s)
  }));

  const addMessageToSuspect = (suspectId, message, sender) => {
    setGameState(prev => {
      const suspects = prev.suspects.map(s => {
        if (s.id !== suspectId) return s;

        let newTrustScore = s.trustScore;
        // Apply simple heuristics to trust score when receiving a message
        if (sender !== 'YOU') {
          const textLower = message.toLowerCase();
          let trustDelta = 0;

          // Numbers/enumeration -> trust DOWN slightly
          if (/\b(\d+|first|second|third|1\.|2\.)\b/.test(textLower)) trustDelta -= 5;
          // Personal name/detail -> trust UP
          if (/\b(wife|husband|mum|dad|brother|sister|son|daughter|fiancé|robert|eleanor|dorothy|william)\b/.test(textLower)) trustDelta += 10;
          // Very short and deflects -> trust DOWN
          if (message.length < 30 && /\?/.test(message)) trustDelta -= 10;
          // Contradicts earlier message -> trust UP a lot
          if (/\b(wait, no|i mean|sorry, i|actually|correction)\b/.test(textLower)) trustDelta += 20;

          newTrustScore = Math.max(0, Math.min(100, newTrustScore + trustDelta));
        }

        return { 
          ...s, 
          chat: [...s.chat, { sender, text: message }],
          trustScore: newTrustScore,
          hasBeenMessaged: sender === 'YOU' ? true : s.hasBeenMessaged
        };
      });

      if (sender === 'YOU') {
        return {
          ...prev,
          suspects,
          lastMessagedSignalId: suspectId,
          pastTransmissions: [...(prev.pastTransmissions || []), message.trim().toLowerCase()]
        };
      }
      
      return { ...prev, suspects };
    });
  };

  return (
    <GameContext.Provider value={{
      gameState,
      activeModel,
      pingAPI,
      startGame,
      advanceRound,
      decreaseClearance,
      updateTime,
      decrementTransmissions,
      setActiveSuspectId,
      addMessageToSuspect,
      recordRoundStats,
      evidenceNotes,
      setEvidenceNotes: updateEvidenceNotes,
      setGameState,
      dismissDossier,
      getDifficultyConfig,
      withdrawSuspect,
    }}>
      {children}
    </GameContext.Provider>
  );
};

const ALL_AI_PERSONAS = ['CIPHER', 'ORACLE', 'MARLOWE', 'STATIC', 'WREN', 'ARGUS', 'ECHO'];

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
 * Build the full 5-round roster based on difficulty config.
 * 
 * EASY:      Same human (NOVAK) all rounds. Only ORACLE + STATIC as AIs.
 * MEDIUM:    Rotating humans, full AI pool, normal tells.
 * HARD:      Rotating humans, full AI pool, suppressed tells.
 * NIGHTMARE: Rotating humans, full AI pool, suppressed tells, twist at round 3.
 */
function buildRoundRoster(config) {
  const { humanPersonaMode, aiPool, twistRound } = config;
  
  // Determine which AI personas to use
  const availableAIs = aiPool ? [...aiPool] : [...ALL_AI_PERSONAS];
  
  // Determine human personas for each round
  let humanForRound;
  if (humanPersonaMode === 'fixed') {
    // EASY: Same human every round
    humanForRound = [null, 'NOVAK', 'NOVAK', 'NOVAK', 'NOVAK', 'NOVAK'];
  } else {
    // MEDIUM/HARD/NIGHTMARE: Rotating humans
    const shuffledHumans = shuffle(HUMAN_PERSONA_KEYS);
    humanForRound = [null, ...shuffledHumans.slice(0, 5)]; // index 1-5
  }
  
  const shuffledAIs = shuffle(availableAIs);
  const rounds = {};
  
  for (let r = 1; r <= 5; r++) {
    const isAllAIRound = r >= twistRound && r === 5 || (twistRound < 5 && r >= twistRound);
    
    if (isAllAIRound) {
      // All-AI round (twist round and beyond)
      if (availableAIs.length >= 3) {
        const freshShuffle = shuffle(availableAIs);
        rounds[r] = [freshShuffle[0], freshShuffle[1], freshShuffle[2]];
      } else {
        // Easy mode: limited pool, may need repeats
        const pool = shuffle(availableAIs);
        rounds[r] = [pool[0], pool[1 % pool.length], pool[0]];
      }
    } else {
      // Normal round with 1 human + 2 AIs
      const aiIndex = (r - 1) * 2;
      const ai1 = shuffledAIs[aiIndex % shuffledAIs.length];
      const ai2 = shuffledAIs[(aiIndex + 1) % shuffledAIs.length];
      rounds[r] = [humanForRound[r], ai1, ai2];
    }
  }
  
  return rounds;
}

function generateSuspects(round, roster) {
  const selected = roster[round] || ['NOVAK', 'CIPHER', 'ORACLE'];

  // Shuffle positions so human isn't always SIGNAL-A
  const shuffledPositions = shuffle(selected);

  // Determine which personas are human
  const HUMAN_KEYS = new Set(HUMAN_PERSONA_KEYS);

  return shuffledPositions.map((persona, index) => ({
    id: `SIGNAL-${['A', 'B', 'C'][index]}`,
    persona: persona,
    isHuman: HUMAN_KEYS.has(persona),
    chat: [],
    trustScore: 50,
    hasBeenMessaged: false,
    isWithdrawn: false,
  }));
}
