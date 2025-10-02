// src/pong/PongGame.tsx
import React, { useState, useCallback, FC } from 'react';

// Importaciones de la nueva estructura
import { Score, GameMode, TournamentState, DifficultyLevel, Match } from './utils/types';
import { DIFFICULTY_LEVELS, shuffleArray, INITIAL_BALL_SPEED, PADDLE_HEIGHT } from './utils/constants';
import { useKeyboardControls } from './hooks/useKeyboardControls';
import { useGameEngine } from './hooks/useGameEngine';

import Scoreboard from './components/Scoreboard';
import GameControls from './components/GameControls';
import GameCanvas from './components/GameCanvas';
import TournamentSetup from './components/TournamentSetup';
import TournamentInProgress from './components/TournamentInProgress';
import TournamentFinished from './components/TournamentFinished';

const PongGame: FC = () => {
  // --- ESTADOS DE JUEGO ---
  const [score, setScore] = useState<Score>({ player1: 0, player2: 0 });
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('ONE_PLAYER');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('EASY');
  const [isStarted, setIsStarted] = useState<boolean>(false);

  // --- ESTADOS DE TORNEO ---
  const [players, setPlayers] = useState<string[]>([]);
  const [newPlayerName, setNewPlayerName] = useState<string>('');
  const [tournamentState, setTournamentState] = useState<TournamentState>('SETUP');
  const [matchSchedule, setMatchSchedule] = useState<Match[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(0);
  const [tournamentWinner, setTournamentWinner] = useState<string | null>(null);

  const isOnePlayerMode = gameMode === 'ONE_PLAYER';
  const currentDifficulty = DIFFICULTY_LEVELS[difficulty];
  
  // --- HOOKS PERSONALIZADOS ---
  const { movementP1, movementP2, setMovementP1, setMovementP2 } = useKeyboardControls(isOnePlayerMode);
  
  const resetBall = useCallback((canvas: HTMLCanvasElement) => {
    if (gameObjects.current) {
      const currentDx = gameObjects.current.ball.dx;
      gameObjects.current.ball = {
        x: canvas.width / 2, y: canvas.height / 2,
        dx: currentDx > 0 ? -INITIAL_BALL_SPEED : INITIAL_BALL_SPEED,
        dy: INITIAL_BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
      };
      const initialPaddleY = canvas.height / 2 - PADDLE_HEIGHT / 2;
      gameObjects.current.player1.y = initialPaddleY;
      gameObjects.current.player2.y = initialPaddleY;
    }
  }, []);

  const { canvasRef, gameObjects } = useGameEngine({
    isPaused, winner, score, setScore, setWinner, movementP1, movementP2,
    isOnePlayerMode, currentDifficulty, isStarted, resetBall
  });

  // --- FUNCIONES DE LÓGICA ---
  const handleGameReset = useCallback(() => {
    if (canvasRef.current) resetBall(canvasRef.current);
    setScore({ player1: 0, player2: 0 });
    setWinner(null);
    setIsPaused(false);
    setIsStarted(false);
    setMovementP1(null);
    setMovementP2(null);
  }, [canvasRef, resetBall, setMovementP1, setMovementP2]);

  const handleGameModeChange = (newMode: GameMode) => {
    handleGameReset();
    setGameMode(newMode);
    if (newMode === 'TOURNAMENT' || gameMode === 'TOURNAMENT') {
      setPlayers([]);
      setTournamentState('SETUP');
      setMatchSchedule([]);
      setCurrentMatchIndex(0);
      setTournamentWinner(null);
    }
  };
  
  // Lógica de Torneo
  const startTournament = () => {
    if (players.length < 2) return;
    const shuffled = shuffleArray([...players]);
    const matches = shuffled.reduce((acc, _, i) => {
      if (i % 2 === 0) {
        acc.push({ p1: shuffled[i], p2: shuffled[i + 1] || 'BYE (Pasa de ronda)', winner: null });
      }
      return acc;
    }, [] as Match[]);
    setMatchSchedule(matches);
    setCurrentMatchIndex(0);
    setTournamentState('IN_PROGRESS');
    setGameMode('TWO_PLAYERS');
    handleGameReset();
  };

  const advanceTournament = (matchWinner: string) => {
    const updatedSchedule = matchSchedule.map((match, i) => i === currentMatchIndex ? { ...match, winner: matchWinner } : match);
    setMatchSchedule(updatedSchedule);

    if (currentMatchIndex < matchSchedule.length - 1) {
      setCurrentMatchIndex(prev => prev + 1);
      handleGameReset();
    } else {
      const winners = updatedSchedule.map(m => m.winner).filter((w): w is string => w !== null && w !== 'BYE (Pasa de ronda)');
      if (winners.length === 1) {
        setTournamentWinner(winners[0]);
        setTournamentState('FINISHED');
      } else {
        const nextRound = winners.reduce((acc, _, i) => {
          if (i % 2 === 0) {
            acc.push({ p1: winners[i], p2: winners[i + 1] || 'BYE (Pasa de ronda)', winner: null });
          }
          return acc;
        }, [] as Match[]);
        setMatchSchedule(nextRound);
        setCurrentMatchIndex(0);
        handleGameReset();
      }
    }
  };

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newPlayerName.trim();
    if (name && !players.includes(name) && players.length < 16) {
      setPlayers([...players, name]);
      setNewPlayerName('');
    }
  };

  const handleButtonClick = () => {
    if (winner) {
      if (gameMode === 'TOURNAMENT') {
        const match = matchSchedule[currentMatchIndex];
        const matchWinner = winner === 'Jugador 1' ? match.p1 : match.p2;
        advanceTournament(match.p2 === 'BYE (Pasa de ronda)' ? match.p1 : matchWinner);
      } else {
        handleGameReset();
      }
    } else if (!isStarted) {
      setIsStarted(true);
      setIsPaused(false);
    } else {
      setIsPaused(!isPaused);
    }
  };

  // --- LÓGICA DE RENDERIZADO ---
  const currentMatch = matchSchedule[currentMatchIndex] || {};
  const player1Name = gameMode === 'TOURNAMENT' ? currentMatch.p1 : 'Jugador 1';
  const player2Name = gameMode === 'TOURNAMENT' ? currentMatch.p2 : (isOnePlayerMode ? 'IA' : 'Jugador 2');
  
  const renderContent = () => {
    if (gameMode === 'TOURNAMENT') {
      if (tournamentState === 'SETUP') {
        return <TournamentSetup players={players} newPlayerName={newPlayerName} setNewPlayerName={setNewPlayerName} handleAddPlayer={handleAddPlayer} startTournament={startTournament} />;
      }
      if (tournamentState === 'FINISHED') {
        return <TournamentFinished tournamentWinner={tournamentWinner} handleGameModeChange={handleGameModeChange} />;
      }
    }

    // Renderiza el juego para 1J, 2J, o si el torneo está en progreso
    return (
      <>
        {gameMode === 'TOURNAMENT' && tournamentState === 'IN_PROGRESS' && (
          <TournamentInProgress matchSchedule={matchSchedule} currentMatchIndex={currentMatchIndex} />
        )}
        <div className="mt-8 flex flex-col items-center">
            <Scoreboard player1Name={player1Name} player2Name={player2Name} score={score} gameMode={gameMode} />
            <GameControls
                gameMode={gameMode} isOnePlayerMode={isOnePlayerMode} difficulty={difficulty}
                winner={winner} isStarted={isStarted} isPaused={isPaused}
                matchScheduleLength={matchSchedule.length} currentMatchIndex={currentMatchIndex}
                handleGameModeChange={handleGameModeChange} setDifficulty={setDifficulty} handleButtonClick={handleButtonClick}
            />
            <GameCanvas canvasRef={canvasRef} winner={winner} />
        </div>
      </>
    );
  };

  return (
    <div className="flex flex-col items-center p-8 bg-gray-900 min-h-screen text-white" tabIndex={0}>
      {renderContent()}
    </div>
  );
};

export default PongGame;
