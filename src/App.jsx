import React, { useEffect, useState, useCallback } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useGame } from './context/GameContext'
import BootSequence from './pages/BootSequence'
import GameTerminal from './pages/GameTerminal'
import EndingScreen from './pages/EndingScreen'
import soundEngine from './audio/SoundEngine'

function App() {
  const { gameState } = useGame();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMuted, setIsMuted] = useState(false);

  // Route based on game status — only navigate when the target differs from current path
  useEffect(() => {
    let targetPath = null;

    if (gameState.gameStatus === 'booting') {
      targetPath = '/';
    } else if (['playing', 'round_over', 'dossier', 'round_won', 'round_over_timeout', 'ending_sequence'].includes(gameState.gameStatus)) {
      targetPath = '/terminal';
    } else if (gameState.gameStatus === 'won' || gameState.gameStatus === 'game_over') {
      targetPath = '/ending';
    }

    if (targetPath && location.pathname !== targetPath) {
      navigate(targetPath, { replace: true });
    }
  }, [gameState.gameStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggleSound = useCallback(() => {
    soundEngine.ensureContext();
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  }, []);

  return (
    <div className="crt" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Routes>
        <Route path="/" element={<BootSequence />} />
        <Route path="/terminal" element={<GameTerminal />} />
        <Route path="/ending" element={<EndingScreen />} />
      </Routes>
      
      {/* Sound toggle */}
      <button 
        className="sound-toggle"
        onClick={handleToggleSound}
        title={isMuted ? 'Unmute audio' : 'Mute audio'}
      >
        {isMuted ? '🔇 MUTED' : '🔊 AUDIO'}
      </button>
    </div>
  )
}

export default App
