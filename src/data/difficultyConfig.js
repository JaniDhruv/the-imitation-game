/**
 * Difficulty Configuration
 * Defines the 4 difficulty tiers and their gameplay parameters.
 */

export const TRANSMISSION_SCHEDULE = {
  EASY:      [5, 5, 5, 5, 5],
  MEDIUM:    [5, 5, 4, 3, 3],
  HARD:      [4, 4, 3, 3, 2],
  NIGHTMARE: [3, 3, 3, 2, 2],
};

export const DIFFICULTY_MODES = {
  EASY: {
    key: 'EASY',
    label: 'EASY',
    subtitle: 'TRAINING PROTOCOL',
    description: 'OBVIOUS TELLS. SAME OPERATIVE. 2:30 TIMER.',
    timerSeconds: 150,
    clearanceLevels: 3,
    humanPersonaMode: 'fixed',       // Same human every round
    aiPool: ['ORACLE', 'STATIC'],    // Only the most obvious AIs
    tellMode: 'obvious',             // AIs lean into their tells
    twistRound: 5,                   // Normal twist timing
  },
  MEDIUM: {
    key: 'MEDIUM',
    label: 'MEDIUM',
    subtitle: 'STANDARD PROTOCOL',
    description: 'THE INTENDED EXPERIENCE. 2:00 TIMER.',
    timerSeconds: 120,
    clearanceLevels: 3,
    humanPersonaMode: 'rotating',    // Different human each round
    aiPool: null,                    // Full AI pool
    tellMode: 'normal',              // Tells as designed
    twistRound: 5,
    recommended: true,
  },
  HARD: {
    key: 'HARD',
    label: 'HARD',
    subtitle: 'ADVANCED PROTOCOL',
    description: 'TELLS SUPPRESSED. PERSONAS ROTATE. 1:30 TIMER.',
    timerSeconds: 90,
    clearanceLevels: 3,
    humanPersonaMode: 'rotating',
    aiPool: null,
    tellMode: 'suppressed',          // AIs occasionally break pattern
    twistRound: 5,
  },
  NIGHTMARE: {
    key: 'NIGHTMARE',
    label: 'NIGHTMARE',
    subtitle: 'CLASSIFIED',
    description: '[REDACTED]',
    timerSeconds: 90,
    clearanceLevels: 3,
    humanPersonaMode: 'rotating',
    aiPool: null,
    tellMode: 'nightmare',
    twistRound: 3,                   // Twist hits early — no human in rounds 3, 4, 5
  },
};

/**
 * All human persona keys for rotation.
 * NOVAK is always first (used in Easy fixed mode and as round 1 default).
 */
export const HUMAN_PERSONA_KEYS = ['NOVAK', 'WELLS', 'CARR', 'SHAW', 'FLEET'];

/**
 * Difficulty mode keys in display order.
 */
export const DIFFICULTY_ORDER = ['EASY', 'MEDIUM', 'HARD', 'NIGHTMARE'];
