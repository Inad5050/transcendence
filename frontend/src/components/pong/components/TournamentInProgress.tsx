// src/pong/components/TournamentInProgress.tsx
import React from 'react';
import { Match } from '../utils/types';

interface TournamentInProgressProps {
  matchSchedule: Match[];
  currentMatchIndex: number;
}

const TournamentInProgress: React.FC<TournamentInProgressProps> = ({ matchSchedule, currentMatchIndex }) => {
  const currentMatch = matchSchedule[currentMatchIndex];
  if (!currentMatch) return null;

  return (
    <div className="mt-5 p-4 bg-gray-800 rounded-xl shadow-xl border border-gray-700 w-full max-w-4xl mx-auto">
      <h3 className="text-2xl font-bold mb-4 text-cyan-400">🏆 Torneo de Eliminación</h3>
      <div className="border-2 border-cyan-400 p-4 mb-4 rounded-lg bg-cyan-400/10">
        <h4 className="text-xl font-medium">
          {matchSchedule.length === 1 ? '¡FINAL DEL TORNEO!' : `Partido ${currentMatchIndex + 1} de ${matchSchedule.length}`}
        </h4>
        <h1 className="text-4xl font-extrabold text-cyan-400 my-2">
          {currentMatch.p1} <span className="text-white mx-2">VS</span> {currentMatch.p2}
        </h1>
        {currentMatch.p2 === 'BYE (Pasa de ronda)' && (
          <p className="text-yellow-400 font-bold mt-1">{currentMatch.p1} pasa automáticamente a la siguiente ronda.</p>
        )}
        <p className="text-sm text-gray-400 mt-2">Controles: Izquierda (W/S o ↑/↓) | Derecha (O/L)</p>
      </div>

      <div className="max-w-xl mx-auto text-left">
        <h4 className="font-semibold mb-2 text-lg border-b border-gray-700 pb-1">Progreso de la Ronda Actual:</h4>
        <div className="max-h-40 overflow-y-auto space-y-1 p-2 bg-gray-700 rounded-md">
          {matchSchedule.map((match, index) => (
            <div
              key={index}
              className={`p-2 rounded-md flex justify-between items-center ${index === currentMatchIndex && !match.winner ? 'bg-cyan-400/30 font-bold border border-cyan-400' : match.winner ? 'bg-green-600/50' : 'bg-gray-600'}`}
            >
              <span>{match.p1} vs {match.p2}</span>
              <span className="font-bold">{match.winner ? `Ganador: ${match.winner.replace('BYE (Pasa de ronda)', 'BYE')}` : (index === currentMatchIndex ? 'ACTIVO' : 'Pendiente')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TournamentInProgress;
