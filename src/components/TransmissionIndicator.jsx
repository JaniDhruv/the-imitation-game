import React, { useState, useEffect } from 'react';

/**
 * TransmissionIndicator — animated signal processing display
 * Shows while waiting for AI response
 */
const TransmissionIndicator = ({ isActive }) => {
  const [frame, setFrame] = useState(0);
  const [waveform, setWaveform] = useState('');

  const WAVE_CHARS = '▁▂▃▄▅▆▇█▇▆▅▄▃▂▁';
  const STATIC_CHARS = '░▒▓█▓▒░ ';
  const SPINNER = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setFrame(f => f + 1);

      // Generate random waveform
      let wave = '';
      for (let i = 0; i < 24; i++) {
        const idx = Math.floor(Math.random() * WAVE_CHARS.length);
        wave += WAVE_CHARS[idx];
      }
      setWaveform(wave);
    }, 80);

    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive) return null;

  const spinner = SPINNER[frame % SPINNER.length];
  const dots = '.'.repeat((frame % 3) + 1).padEnd(3, ' ');

  return (
    <div style={{
      padding: '8px 12px',
      borderLeft: '2px solid var(--color-text-dim)',
      marginTop: '4px',
      fontFamily: 'var(--font-main)',
      fontSize: '0.85em',
      opacity: 0.9,
      animation: 'pulse-dim 1.5s ease-in-out infinite',
    }}>
      <div style={{ color: 'var(--color-text-dim)', marginBottom: '2px' }}>
        {spinner} DECRYPTING SIGNAL{dots}
      </div>
      <div style={{
        color: 'var(--color-text)',
        letterSpacing: '1px',
        opacity: 0.6,
        fontFamily: 'monospace',
        fontSize: '0.9em',
      }}>
        ┃{waveform}┃
      </div>
    </div>
  );
};

export default TransmissionIndicator;
