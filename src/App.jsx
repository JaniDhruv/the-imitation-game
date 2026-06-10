import React, { useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useGame } from './context/GameContext'
import BootSequence from './pages/BootSequence'
import GameTerminal from './pages/GameTerminal'
import EndingScreen from './pages/EndingScreen'

function App() {
  const { gameState } = useGame();
  const navigate = useNavigate();

  useEffect(() => {
    if (gameState.gameStatus === 'booting') {
      navigate('/');
    } else if (gameState.gameStatus === 'playing' || gameState.gameStatus === 'round_over') {
      navigate('/terminal');
    } else if (gameState.gameStatus === 'won' || gameState.gameStatus === 'game_over') {
      navigate('/ending');
    }
  }, [gameState.gameStatus, navigate]);

  return (
    <div className="crt" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Routes>
        <Route path="/" element={<BootSequence />} />
        <Route path="/terminal" element={<GameTerminal />} />
        <Route path="/ending" element={<EndingScreen />} />
      </Routes>
    </div>
  )
}

export default App
