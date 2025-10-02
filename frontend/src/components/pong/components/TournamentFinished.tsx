// src/pong/components/TournamentFinished.tsx
import React from 'react';
import { GameMode } from '../utils/types';

interface TournamentFinishedProps {
  tournamentWinner: string | null;
  handleGameModeChange: (mode: GameMode) => void;
}

const TournamentFinished: React.FC<TournamentFinishedProps> = ({ tournamentWinner, handleGameModeChange }) => {
  const primaryButtonClasses = "px-6 py-3 font-bold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-0.5 bg-cyan-400 text-gray-900 hover:bg-white";

  return (
    <div className="mt-5 p-8 bg-gray-800 rounded-xl shadow-2xl shadow-green-400/50">
      <h1 className="text-5xl font-extrabold mb-4 text-green-400">¡TORNEO FINALIZADO! 👑</h1>
      <h2 className="text-3xl font-semibold text-cyan-400">El Campeón es: {tournamentWinner}</h2>
      <button
        className={`${primaryButtonClasses} mt-6`}
        onClick={() => handleGameModeChange('TOURNAMENT')}
      >Configurar Nuevo Torneo</button>
    </div>
  );
};

export default TournamentFinished;
