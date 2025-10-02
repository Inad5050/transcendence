// src/pong/components/TournamentSetup.tsx
import React from 'react';

interface TournamentSetupProps {
  players: string[];
  newPlayerName: string;
  setNewPlayerName: (name: string) => void;
  handleAddPlayer: (e: React.FormEvent) => void;
  startTournament: () => void;
}

const TournamentSetup: React.FC<TournamentSetupProps> = ({
  players, newPlayerName, setNewPlayerName, handleAddPlayer, startTournament
}) => {
  const primaryButtonClasses = "px-6 py-3 font-bold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-0.5 bg-cyan-400 text-gray-900 hover:bg-white";
  const modeButtonClasses = "px-4 py-2 text-sm font-semibold rounded-full shadow-inner transition duration-150";

  return (
    <div className="p-5 border border-cyan-400 rounded-xl max-w-md mx-auto my-5 bg-gray-800">
      <h3 className="text-xl font-semibold mb-4 text-cyan-400">Registro de Participantes 📝</h3>
      <form onSubmit={handleAddPlayer} className="flex gap-2 mb-4">
        <input
          type="text"
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
          placeholder="Nombre del jugador"
          className="p-2 flex-grow border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-cyan-400 focus:border-cyan-400"
        />
        <button type="submit" className={`${modeButtonClasses} bg-cyan-400 text-gray-900 hover:bg-white`}>Añadir</button>
      </form>

      <h4 className="text-lg font-medium mb-2">Jugadores Registrados ({players.length}):</h4>
      <div className="max-h-40 overflow-y-auto text-left pl-6 mb-4 bg-gray-700 p-3 rounded-md">
        {players.length > 0 ? (
          <ol className="list-decimal list-inside space-y-1">{players.map((p) => <li key={p}>{p}</li>)}</ol>
        ) : (
          <p className="text-gray-400 italic">Añade al menos 2 jugadores.</p>
        )}
      </div>

      <button
        className={`${primaryButtonClasses} ${players.length < 2 ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={startTournament}
        disabled={players.length < 2}
      >Iniciar Torneo de {players.length} Jugadores</button>
      {players.length % 2 !== 0 && players.length >= 2 && (
        <p className="text-sm text-yellow-400 mt-2 font-semibold">* Número impar de jugadores. Uno recibirá un pase libre (BYE).</p>
      )}
    </div>
  );
};

export default TournamentSetup;
