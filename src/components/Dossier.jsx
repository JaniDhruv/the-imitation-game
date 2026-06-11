import React, { useState, useEffect } from 'react';
import { ROUND_DOSSIERS } from '../data/turingTimeline';
import soundEngine from '../audio/SoundEngine';

/**
 * Dossier — classified briefing shown between rounds
 */
const Dossier = ({ round, onDismiss }) => {
  const [revealIndex, setRevealIndex] = useState(0);
  const [showFootnote, setShowFootnote] = useState(false);
  const [showButton, setShowButton] = useState(false);

  const dossier = ROUND_DOSSIERS[round];

  useEffect(() => {
    if (!dossier) return;

    const contentLines = dossier.content.split('\n');
    const totalLines = contentLines.length;

    // Reveal lines one by one
    const interval = setInterval(() => {
      setRevealIndex(prev => {
        const next = prev + 1;
        if (next <= totalLines) {
          soundEngine.bootBeep(next);
        }
        if (next >= totalLines) {
          clearInterval(interval);
          setTimeout(() => setShowFootnote(true), 800);
          setTimeout(() => setShowButton(true), 2000);
        }
        return next;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [dossier]);

  if (!dossier) return null;

  const contentLines = dossier.content.split('\n');
  const classColors = {
    'RESTRICTED': 'var(--color-amber)',
    'SECRET': '#ff8844',
    'TOP SECRET': 'var(--color-red)',
    'TOP SECRET — EYES ONLY': '#ff2222',
    'ULTRA — CODE RED': '#ff0044',
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.95)',
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{
        maxWidth: '700px',
        width: '100%',
        border: `2px solid ${classColors[dossier.classification] || 'var(--color-text)'}`,
        padding: '2rem',
        position: 'relative',
      }}>
        {/* Classification stamp */}
        <div style={{
          position: 'absolute',
          top: '-12px',
          right: '20px',
          background: 'var(--color-bg)',
          padding: '0 10px',
          color: classColors[dossier.classification] || 'var(--color-text)',
          fontSize: '0.85em',
          letterSpacing: '2px',
          border: `1px solid ${classColors[dossier.classification] || 'var(--color-text)'}`,
        }}>
          {dossier.classification}
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: '1.1rem',
          marginBottom: '1.5rem',
          paddingBottom: '0.5rem',
          borderBottom: '1px solid var(--color-text-dim)',
          color: 'var(--color-text)',
          textShadow: '0 0 6px var(--color-glow, var(--color-text))',
        }}>
          {dossier.title}
        </h2>

        {/* Content — revealed line by line */}
        <div style={{
          fontSize: '0.9rem',
          lineHeight: '1.6',
          minHeight: '200px',
        }}>
          {contentLines.slice(0, revealIndex).map((line, i) => (
            <p key={i} style={{
              marginBottom: line === '' ? '0.8rem' : '0.3rem',
              opacity: i === revealIndex - 1 ? 0.9 : 1,
              minHeight: line === '' ? '0.5em' : 'auto',
            }}>
              {line}
            </p>
          ))}
          {revealIndex < contentLines.length && (
            <span className="text-glow" style={{ animation: 'blink 0.5s infinite' }}>█</span>
          )}
        </div>

        {/* Historical footnote */}
        {showFootnote && (
          <div style={{
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px dashed var(--color-text-dim)',
            fontSize: '0.75rem',
            color: 'var(--color-text-dim)',
            fontStyle: 'italic',
            lineHeight: '1.5',
            animation: 'fadeIn 1s ease',
          }}>
            ▸ HISTORICAL NOTE: {dossier.footnote}
          </div>
        )}

        {/* Proceed button */}
        {showButton && (
          <div style={{ textAlign: 'center', marginTop: '1.5rem', animation: 'fadeIn 0.5s ease' }}>
            <button
              onClick={onDismiss}
              style={{
                padding: '10px 30px',
                fontSize: '1rem',
                border: '1px solid var(--color-text)',
              }}
            >
              [ BEGIN HOUR {round} ]
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dossier;
