// src/pong/components/GameControls.tsx
import React from 'react';
import { GameMode, DifficultyLevel } from '../utils/types';
import { DIFFICULTY_LEVELS } from '../utils/constants';

interface GameControlsProps {
  gameMode: GameMode;
  isOnePlayerMode: boolean;
  difficulty: DifficultyLevel;
  winner: string | null;
  isStarted: boolean;
  isPaused: boolean;
  matchScheduleLength: number;
  currentMatchIndex: number;
  handleGameModeChange: (mode: GameMode) => void;
  setDifficulty: (level: DifficultyLevel) => void;
  handleButtonClick: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  gameMode, isOnePlayerMode, difficulty, winner, isStarted, isPaused,
  matchScheduleLength, currentMatchIndex,
  handleGameModeChange, setDifficulty, handleButtonClick
}) => {
  const buttonBaseClasses = "px-6 py-3 font-bold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-0.5";
  const primaryButtonClasses = `bg-cyan-400 text-gray-900 ${buttonBaseClasses} hover:bg-white`;
  const modeButtonClasses = `px-4 py-2 text-sm font-semibold rounded-full shadow-inner transition duration-150`;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-2">
        <span className="self-center font-medium">Modo:</span>
        <button
          className={`${modeButtonClasses} ${gameMode === 'ONE_PLAYER' ? 'bg-white text-black' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
          onClick={() => handleGameModeChange('ONE_PLAYER')}
        >1 JUGADOR (vs IA)</button>
        <button
          className={`${modeButtonClasses} ${gameMode === 'TWO_PLAYERS' ? 'bg-white text-black' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
          onClick={() => handleGameModeChange('TWO_PLAYERS')}
        >2 JUGADORES (Local)</button>
        <button
          className={`${modeButtonClasses} ${gameMode === 'TOURNAMENT' ? 'bg-white text-black' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
          onClick={() => handleGameModeChange('TOURNAMENT')}
        >TORNEO 🏆</button>
      </div>

      {isOnePlayerMode && gameMode === 'ONE_PLAYER' && (
        <div className="flex gap-2 mb-4">
          <span className="self-center font-medium">Dificultad de la IA:</span>
          {(Object.keys(DIFFICULTY_LEVELS) as DifficultyLevel[]).map((key) => (
            <button
              key={key}
              className={`${modeButtonClasses} ${difficulty === key ? 'bg-white text-black' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
              onClick={() => setDifficulty(key)}
            >{DIFFICULTY_LEVELS[key].name}</button>
          ))}
        </div>
      )}

      <button className={primaryButtonClasses} onClick={handleButtonClick}>
        {winner
          ? (gameMode === 'TOURNAMENT'
            ? (matchScheduleLength === 1 && currentMatchIndex === 0 && winner ? 'Ver Campeón' : 'Siguiente Partido')
            : 'Reiniciar Partida')
          : (!isStarted ? 'Empezar Partida' : (isPaused ? 'Reanudar' : 'Pausar'))
        }
      </button>
    </div>
  );
};

export default GameControls;
