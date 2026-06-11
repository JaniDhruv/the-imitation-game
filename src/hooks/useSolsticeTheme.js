import { useEffect } from 'react';

/**
 * Solstice Day/Night Visual System
 * 
 * Each round maps to a time of day on June 21, 1952 — the solstice.
 * The CRT screen shifts color temperature as the day progresses:
 *   Round 1 (6AM)  → Warm dawn amber
 *   Round 2 (10AM) → Clear bright green phosphor
 *   Round 3 (2PM)  → Peak brightness, golden tint
 *   Round 4 (6PM)  → Sunset amber/orange
 *   Round 5 (9PM)  → Cold, dark blue-green. The light leaving.
 */

const SOLSTICE_THEMES = {
  1: {
    label: 'DAWN',
    time: '06:00',
    bg: '#0f0d07',
    text: '#e0a830',
    textDim: '#7a5a18',
    accent: '#ffcc44',
    glow: '#e0a830',
    scanlineOpacity: 0.15,
    vignetteStrength: 0.3,
    flickerIntensity: 0.02,
  },
  2: {
    label: 'MORNING',
    time: '10:00',
    bg: '#0a0f0a',
    text: '#33ff00',
    textDim: '#1a8000',
    accent: '#ffb000',
    glow: '#33ff00',
    scanlineOpacity: 0.2,
    vignetteStrength: 0.25,
    flickerIntensity: 0.015,
  },
  3: {
    label: 'ZENITH',
    time: '14:00',
    bg: '#0c100a',
    text: '#55ff22',
    textDim: '#2a9910',
    accent: '#ffe044',
    glow: '#66ff33',
    scanlineOpacity: 0.25,
    vignetteStrength: 0.2,
    flickerIntensity: 0.01,
  },
  4: {
    label: 'DUSK',
    time: '18:00',
    bg: '#0d0a07',
    text: '#cc8822',
    textDim: '#664411',
    accent: '#ff6622',
    glow: '#cc8822',
    scanlineOpacity: 0.2,
    vignetteStrength: 0.35,
    flickerIntensity: 0.025,
  },
  5: {
    label: 'NIGHTFALL',
    time: '21:00',
    bg: '#060a0f',
    text: '#4488aa',
    textDim: '#223344',
    accent: '#6699bb',
    glow: '#335577',
    scanlineOpacity: 0.3,
    vignetteStrength: 0.5,
    flickerIntensity: 0.04,
  },
};

export function useSolsticeTheme(round) {
  useEffect(() => {
    const theme = SOLSTICE_THEMES[round] || SOLSTICE_THEMES[2];
    const root = document.documentElement;

    root.style.setProperty('--color-bg', theme.bg);
    root.style.setProperty('--color-text', theme.text);
    root.style.setProperty('--color-text-dim', theme.textDim);
    root.style.setProperty('--color-amber', theme.accent);
    root.style.setProperty('--color-glow', theme.glow);
    root.style.setProperty('--scanline-opacity', theme.scanlineOpacity);
    root.style.setProperty('--vignette-strength', theme.vignetteStrength);
    root.style.setProperty('--flicker-intensity', theme.flickerIntensity);

    // Apply smooth transition on body
    document.body.style.transition = 'background-color 2s ease, color 2s ease';
    document.body.style.backgroundColor = theme.bg;
    document.body.style.color = theme.text;

    return () => {
      document.body.style.transition = '';
    };
  }, [round]);

  return SOLSTICE_THEMES[round] || SOLSTICE_THEMES[2];
}

export { SOLSTICE_THEMES };
export default useSolsticeTheme;
