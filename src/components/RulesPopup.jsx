import React from 'react';

const RULES = {
  EASY: {
    title: "TRAINING PROTOCOL",
    rules: [
      "Three signals. One human. Identify the human.",
      "You have 5 transmissions and 2:30 per round.",
      "AI tells are obvious — watch for patterns in responses.",
      "The same human operative appears across all 5 rounds.",
      "Round 5 contains no human signal.",
      "3 clearance levels — lose them all and operation fails.",
    ]
  },
  MEDIUM: {
    title: "STANDARD PROTOCOL", 
    rules: [
      "Three signals. One human. Identify the human.",
      "You have 5 transmissions and 2:00 per round.",
      "The human operative changes every round.",
      "AI tells are present but require observation.",
      "You cannot send the same message twice in the game.",
      "Round 5 contains no human signal.",
      "3 clearance levels — lose them all and operation fails.",
    ]
  },
  HARD: {
    title: "ADVANCED PROTOCOL",
    rules: [
      "Three signals. One human. Identify the human.",
      "You have 5 transmissions and 1:30 per round.",
      "The human operative changes every round.",
      "AI tells are suppressed — trust nothing obvious.",
      "You cannot send the same message twice in the game.",
      "Each signal can only receive ONE transmission per round.",
      "Round 5 contains no human signal.",
      "3 clearance levels — lose them all and operation fails.",
    ]
  },
  NIGHTMARE: {
    title: "CLASSIFIED PROTOCOL",
    rules: [
      "Three signals. One human. Identify the human.",
      "You have 3 transmissions and 1:30 per round.",
      "The human operative changes every round.",
      "AI tells are fully suppressed. AIs will mimic human inconsistency.",
      "You cannot send the same message twice in the game.",
      "Each signal can only receive ONE transmission per round.",
      "Asking a signal if it is human or AI will terminate that signal.",
      "Not all rounds contain a human signal.",
      "3 clearance levels — lose them all and operation fails.",
    ]
  }
};

const RulesPopup = ({ difficulty, onClose }) => {
  const rules = RULES[difficulty];
  
  if (!rules) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      backgroundColor: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', 
      justifyContent: 'center', zIndex: 999
    }}>
      <div style={{
        border: '1px solid var(--color-text)',
        padding: '2rem', maxWidth: '500px', width: '90%',
        backgroundColor: 'var(--color-bg)',
      }}>
        <h2 style={{ marginBottom: '0.5rem' }}>
          OPERATION: IMITATION
        </h2>
        <p style={{ 
          color: 'var(--color-amber)', 
          marginBottom: '1.5rem',
          fontSize: '0.85em' 
        }}>
          {rules.title} — ANALYST BRIEFING
        </p>
        
        <div style={{ marginBottom: '1.5rem' }}>
          {rules.rules.map((rule, i) => (
            <p key={i} style={{ 
              marginBottom: '0.5rem',
              fontSize: '0.9em',
              color: 'var(--color-text-dim)'
            }}>
              {`>`} {rule}
            </p>
          ))}
        </div>

        {/* Nightmare specific warning */}
        {difficulty === 'NIGHTMARE' && (
          <p style={{ 
            color: 'var(--color-red)',
            fontSize: '0.8em',
            marginBottom: '1.5rem',
            fontStyle: 'italic'
          }}>
            WARNING: INFORMATION IN THIS BRIEFING MAY BE INCOMPLETE.
          </p>
        )}

        <button 
          onClick={onClose}
          style={{ width: '100%', padding: '0.75rem' }}
          autoFocus
        >
          [ ACKNOWLEDGED — BEGIN OPERATION ]
        </button>
      </div>
    </div>
  );
};

export default RulesPopup;
