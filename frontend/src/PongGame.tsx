// src/PongGame.tsx

import React, { useRef, useEffect, useState, useCallback, FC } from 'react';

// ------------------------------------------
// 1. DEFINICIÓN DE TIPOS Y INTERFACES (TypeScript)
// ------------------------------------------

type MovementDirection = 'up' | 'down' | null;
type GameMode = 'ONE_PLAYER' | 'TWO_PLAYERS' | 'TOURNAMENT';
type TournamentState = 'SETUP' | 'IN_PROGRESS' | 'FINISHED';
type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';

interface Score {
  player1: number;
  player2: number;
}

interface DifficultyConfig {
  name: string;
  errorMargin: number;
}

interface BallObject {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

interface PaddleObject {
  x: number;
  y: number;
}

interface GameObjects {
  ball: BallObject;
  player1: PaddleObject;
  player2: PaddleObject;
}

interface Match {
  p1: string;
  p2: string;
  winner: string | null;
}

// ------------------------------------------
// 2. CONSTANTES DEL JUEGO
// ------------------------------------------

const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const BALL_RADIUS = 10;
const WINNING_SCORE = 3;
const PADDLE_SPEED = 8;
const INITIAL_BALL_SPEED = 5;
const ACCELERATION_FACTOR = 1.1;

const DIFFICULTY_LEVELS: Record<DifficultyLevel, DifficultyConfig> = {
  EASY: { name: 'Fácil', errorMargin: 80 },
  MEDIUM: { name: 'Medio', errorMargin: 50 },
  HARD: { name: 'Difícil', errorMargin: 0.1 },
};

// Función de ayuda para mezclar un array (Algoritmo de Fisher-Yates)
const shuffleArray = <T,>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};


const PongGame: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // --- ESTADOS DE JUEGO TIPADOS ---
  const [score, setScore] = useState<Score>({ player1: 0, player2: 0 });
  const [isPaused, setIsPaused] = useState<boolean>(false); 
  const [winner, setWinner] = useState<string | null>(null); 
  const [movementP1, setMovementP1] = useState<MovementDirection>(null); 
  const [movementP2, setMovementP2] = useState<MovementDirection>(null); 
  const [gameMode, setGameMode] = useState<GameMode>('ONE_PLAYER'); 
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('EASY'); 
  const [isStarted, setIsStarted] = useState<boolean>(false); 
  
  // --- ESTADOS DE TORNEO TIPADOS ---
  const [players, setPlayers] = useState<string[]>([]); 
  const [newPlayerName, setNewPlayerName] = useState<string>(''); 
  const [tournamentState, setTournamentState] = useState<TournamentState>('SETUP'); 
  const [matchSchedule, setMatchSchedule] = useState<Match[]>([]); 
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(0); 
  const [tournamentWinner, setTournamentWinner] = useState<string | null>(null); 
  const [initialPlayersCount, setInitialPlayersCount] = useState<number>(0); 

  // useRef TIPADO: Almacena las posiciones de los objetos, evitando re-renderizados innecesarios.
  const gameObjects = useRef<GameObjects | null>(null);
  const animationFrameId = useRef<number | null>(null);
  
  const currentDifficulty = DIFFICULTY_LEVELS[difficulty]; 
  const isOnePlayerMode = gameMode === 'ONE_PLAYER';

  // --- FUNCIÓN PARA REINICIAR LA BOLA ---
  const resetBall = (canvas: HTMLCanvasElement) => {
    if (gameObjects.current) {
      const currentDx = gameObjects.current.ball.dx;
      gameObjects.current.ball = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        // Invierte la dirección de la última dirección horizontal para el saque
        dx: currentDx > 0 ? -INITIAL_BALL_SPEED : INITIAL_BALL_SPEED,
        dy: INITIAL_BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
      };
    }
  };

  // --- FUNCIÓN PARA REINICIAR EL PARTIDO (Llamada al cambiar de match/modo) ---
  const handleGameReset = useCallback(() => {
    if (!canvasRef.current) return; 
    
    setScore({ player1: 0, player2: 0 });
    setWinner(null);
    setIsPaused(false);
    setIsStarted(false); 
    resetBall(canvasRef.current);
    setMovementP1(null);
    setMovementP2(null);
  }, []); 

  // ------------------------------------------
  // FUNCIÓN CORREGIDA: CAMBIO DE MODO
  // ------------------------------------------
  const handleGameModeChange = (newMode: GameMode) => {
    // 1. Reiniciar el juego actual (limpia marcador, pausa y bola)
    handleGameReset(); 
    
    // 2. Establecer el nuevo modo
    setGameMode(newMode);

    // 3. Si cambiamos a/desde Torneo, reiniciamos el estado del torneo
    if (newMode === 'TOURNAMENT' || gameMode === 'TOURNAMENT') {
        setPlayers([]); // Limpiamos la lista de jugadores
        setTournamentState('SETUP');
        setMatchSchedule([]);
        setCurrentMatchIndex(0);
        setTournamentWinner(null);
    }
};

  // ------------------------------------------
  // 3. LÓGICA DEL TORNEO (Con tipos)
  // ------------------------------------------

  const startTournament = () => {
    if (players.length < 2) {
      alert('Necesitas al menos 2 jugadores para iniciar un torneo.');
      return;
    }
    
    setInitialPlayersCount(players.length);
    const shuffledPlayers = shuffleArray([...players]);
    const matches: Match[] = [];
    
    // Generación de la primera ronda (manejo de BYE si es impar)
    for (let i = 0; i < shuffledPlayers.length; i += 2) {
      const p1 = shuffledPlayers[i];
      const p2 = shuffledPlayers[i + 1] || 'BYE (Pasa de ronda)'; 
      matches.push({ p1, p2, winner: null });
    }
    
    setMatchSchedule(matches);
    setCurrentMatchIndex(0);
    setTournamentState('IN_PROGRESS');
    setGameMode('TWO_PLAYERS'); // Los partidos de torneo siempre son 2 JUGADORES
    handleGameReset();
  };

  const advanceTournament = (matchWinner: string) => {
    const currentMatch = matchSchedule[currentMatchIndex];
    
    // 1. Actualizar el ganador del partido actual
    const updatedSchedule = matchSchedule.map((match, index) => 
      index === currentMatchIndex ? { ...match, winner: matchWinner } : match
    );
    setMatchSchedule(updatedSchedule);
    
    // 2. Verificar si hay más partidos en la ronda actual
    if (currentMatchIndex < matchSchedule.length - 1) {
      setCurrentMatchIndex(prevIndex => prevIndex + 1);
      handleGameReset(); // Prepara la cancha para el nuevo partido
    } else {
      // 3. La ronda ha terminado: Recopilar ganadores
      // Filtramos 'BYE (Pasa de ronda)' porque ya están incluidos en 'matchWinner' si ganaron por default
      const winners = updatedSchedule.map(match => match.winner).filter((w): w is string => w !== null && w !== 'BYE (Pasa de ronda)');
      
      // 4. ¿Es el campeón final?
      if (winners.length === 1) {
        setTournamentWinner(winners[0]);
        setTournamentState('FINISHED');
      } else {
        // 5. Crear la siguiente ronda con los ganadores
        const nextRoundMatches: Match[] = [];
        const shuffledWinners = shuffleArray(winners);
        for (let i = 0; i < shuffledWinners.length; i += 2) {
          const p1 = shuffledWinners[i];
          const p2 = shuffledWinners[i + 1] || 'BYE (Pasa de ronda)';
          nextRoundMatches.push({ p1, p2, winner: null });
        }
        setMatchSchedule(nextRoundMatches);
        setCurrentMatchIndex(0);
        handleGameReset(); // Inicia la siguiente ronda
      }
    }
  };

  // --- MANEJADORES DE ESTADO DE JUEGO ---

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newPlayerName.trim();
    if (name && !players.includes(name) && players.length < 16) {
      setPlayers([...players, name]);
      setNewPlayerName('');
    } else if (players.length >= 16) {
      alert('Máximo 16 jugadores por torneo.');
    }
  };
  
  const handleButtonClick = () => {
    if (winner) {
      if (gameMode === 'TOURNAMENT') {
        const currentMatch = matchSchedule[currentMatchIndex];
        const matchWinner = winner === 'Jugador 1' ? currentMatch.p1 : currentMatch.p2;
        
        // Si el ganador es 'BYE (Pasa de ronda)', no avanzamos. Solo avanzamos si es un partido real.
        if (currentMatch.p2 === 'BYE (Pasa de ronda)') {
             // Si hay un BYE, el ganador es p1, pero la lógica de advanceTournament lo maneja:
             advanceTournament(currentMatch.p1);
        } else {
             advanceTournament(matchWinner);
        }
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


  // ------------------------------------------
  // 4. EL BUCLE DEL JUEGO (GAME LOOP)
  // ------------------------------------------
  const gameLoop = useCallback(() => {
    if (isPaused || winner) {
      animationFrameId.current = requestAnimationFrame(gameLoop);
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    const { ball, player1, player2 } = gameObjects.current!;

    if (!context || !canvas) {
        animationFrameId.current = requestAnimationFrame(gameLoop);
        return;
    }
    
    // 1. Mover la bola
    ball.x += ball.dx;
    ball.y += ball.dy;

    // 2. Movimiento del Jugador 1 
    if (movementP1 === 'up') { player1.y -= PADDLE_SPEED; } 
    else if (movementP1 === 'down') { player1.y += PADDLE_SPEED; }
    player1.y = Math.max(0, Math.min(player1.y, canvas.height - PADDLE_HEIGHT));

    // 3. Movimiento del Jugador 2 (IA o Humano)
    if (isOnePlayerMode) {
        // Lógica de la IA 
        const targetY = ball.y - PADDLE_HEIGHT / 2;
        const deltaY = targetY - player2.y;
        
        if (Math.abs(deltaY) > currentDifficulty.errorMargin) {
            const AISpeed = 6; 
            if (deltaY > 0) {
                player2.y += Math.min(AISpeed, deltaY);
            } else if (deltaY < 0) {
                player2.y += Math.max(-AISpeed, deltaY);
            }
        }
    } else { 
        // Lógica del Jugador Humano 2 (O/L)
        if (movementP2 === 'up') { player2.y -= PADDLE_SPEED; } 
        else if (movementP2 === 'down') { player2.y += PADDLE_SPEED; }
    }
    
    player2.y = Math.max(0, Math.min(player2.y, canvas.height - PADDLE_HEIGHT));

    // 4. Colisión y Aceleración
    if (ball.y + BALL_RADIUS > canvas.height || ball.y - BALL_RADIUS < 0) { ball.dy = -ball.dy; }
    
    // Colisión Paleta 1
    if (ball.x - BALL_RADIUS < PADDLE_WIDTH && ball.y > player1.y && ball.y < player1.y + PADDLE_HEIGHT) {
      ball.dx = ball.dx * -ACCELERATION_FACTOR; 
    }
    
    // Colisión Paleta 2
    if (ball.x + BALL_RADIUS > canvas.width - PADDLE_WIDTH && ball.y > player2.y && ball.y < player2.y + PADDLE_HEIGHT) {
      ball.dx = ball.dx * -ACCELERATION_FACTOR;
    }
    
    // 5. Marcar punto y determinar ganador
    if (ball.x - BALL_RADIUS < 0) { 
      const newScoreP2 = score.player2 + 1;
      setScore(s => ({ ...s, player2: newScoreP2 }));
      if (newScoreP2 === WINNING_SCORE) {
        setWinner(isOnePlayerMode ? 'Jugador 2 (IA)' : 'Jugador 2');
      } else {
        resetBall(canvas); 
      }
    } else if (ball.x + BALL_RADIUS > canvas.width) { 
      const newScoreP1 = score.player1 + 1;
      setScore(s => ({ ...s, player1: newScoreP1 }));
      if (newScoreP1 === WINNING_SCORE) {
        setWinner('Jugador 1');
      } else {
        resetBall(canvas); 
      }
    }
    
    // 6. Lógica de Dibujo
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'white';
    context.fillRect(player1.x, player1.y, PADDLE_WIDTH, PADDLE_HEIGHT);
    context.fillRect(player2.x, player2.y, PADDLE_WIDTH, PADDLE_HEIGHT);
    context.beginPath();
    context.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
    context.fill();

    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [isPaused, winner, score, movementP1, movementP2, isOnePlayerMode, currentDifficulty, handleGameReset]);


  // --- EFECTOS (Teclado e Inicialización) ---
  
  // EFECTO: MANEJO DE TECLADO
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        switch (event.key.toLowerCase()) {
          case 'w':
          case 'arrowup':
            setMovementP1('up');
            break;
          case 's':
          case 'arrowdown':
            setMovementP1('down');
            break;
          case 'o':
            if (!isOnePlayerMode) setMovementP2('up');
            break;
          case 'l':
            if (!isOnePlayerMode) setMovementP2('down');
            break;
          default:
            break;
        }
      };
  
      const handleKeyUp = (event: KeyboardEvent) => {
        switch (event.key.toLowerCase()) {
          case 'w':
          case 'arrowup':
            if (movementP1 === 'up') setMovementP1(null);
            break;
          case 's':
          case 'arrowdown':
            if (movementP1 === 'down') setMovementP1(null);
            break;
          case 'o':
            if (movementP2 === 'up') setMovementP2(null);
            break;
          case 'l':
            if (movementP2 === 'down') setMovementP2(null);
            break;
          default:
            break;
        }
      };
  
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
  
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
  }, [movementP1, movementP2, isOnePlayerMode]); 

  // EFECTO: INICIALIZACIÓN Y GESTIÓN DEL BUCLE
  useEffect(() => {
    const canvas = canvasRef.current;
    
    if (!gameObjects.current && canvas) {
        gameObjects.current = {
            ball: { x: canvas.width / 2, y: canvas.height / 2, dx: INITIAL_BALL_SPEED, dy: INITIAL_BALL_SPEED }, 
            player1: { x: 0, y: canvas.height / 2 - PADDLE_HEIGHT / 2 },
            player2: { x: canvas.width - PADDLE_WIDTH, y: canvas.height / 2 - PADDLE_HEIGHT / 2 }
        };
    }
    
    if (isStarted && !winner) {
        animationFrameId.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationFrameId.current !== null) {
          cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isStarted, winner, gameLoop]); 
  
  // ------------------------------------------
  // 5. RENDERIZADO (Con Tailwind CSS)
  // ------------------------------------------

  // Clases de utilidad para botones (simula game-button)
  const buttonBaseClasses = "px-6 py-3 font-bold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-0.5";
  const primaryButtonClasses = `bg-cyan-400 text-gray-900 ${buttonBaseClasses} hover:bg-white`;
  const modeButtonClasses = `px-4 py-2 text-sm font-semibold rounded-full shadow-inner transition duration-150`;

  const renderTournamentSetup = () => (
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
        <button type="submit" className={`${modeButtonClasses} bg-cyan-400 text-gray-900 hover:bg-white`}>
          Añadir
        </button>
      </form>
      
      <h4 className="text-lg font-medium mb-2">Jugadores Registrados ({players.length}):</h4>
      <div className="max-h-40 overflow-y-auto text-left pl-6 mb-4 bg-gray-700 p-3 rounded-md">
        {players.length > 0 ? (
          <ol className="list-decimal list-inside space-y-1">
            {players.map((p) => <li key={p}>{p}</li>)}
          </ol>
        ) : (
          <p className="text-gray-400 italic">Añade al menos 2 jugadores.</p>
        )}
      </div>

      <button 
        className={`${primaryButtonClasses} ${players.length < 2 ? 'opacity-50 cursor-not-allowed' : ''}`} 
        onClick={startTournament} 
        disabled={players.length < 2}
      >
        Iniciar Torneo de {players.length} Jugadores
      </button>
      {players.length % 2 !== 0 && players.length >= 2 && (
          <p className="text-sm text-yellow-400 mt-2 font-semibold">
            * Número impar de jugadores. Uno recibirá un pase libre (BYE).
          </p>
      )}
    </div>
  );

  const renderTournamentInProgress = () => {
    const currentMatch = matchSchedule[currentMatchIndex];
    
    return (
      <div className="mt-5 p-4 bg-gray-800 rounded-xl shadow-xl border border-gray-700 w-full max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold mb-4 text-cyan-400">🏆 Torneo de Eliminación</h3>
        
        {/* Anuncio del Partido Actual */}
        <div className="border-2 border-cyan-400 p-4 mb-4 rounded-lg bg-cyan-400/10">
          <h4 className="text-xl font-medium">
            {matchSchedule.length === 1 ? '¡FINAL DEL TORNEO!' : `Partido ${currentMatchIndex + 1} de ${matchSchedule.length}`}
          </h4>
          <h1 className="text-4xl font-extrabold text-cyan-400 my-2">
            {currentMatch.p1} <span className="text-white mx-2">VS</span> {currentMatch.p2}
          </h1>
          {currentMatch.p2 === 'BYE (Pasa de ronda)' && (
            <p className="text-yellow-400 font-bold mt-1">
                {currentMatch.p1} pasa automáticamente a la siguiente ronda.
            </p>
          )}
          <p className="text-sm text-gray-400 mt-2">
            Controles: Izquierda (W/S o ↑/↓) | Derecha (O/L)
          </p>
        </div>

        {/* Progreso de la Ronda */}
        <div className="max-w-xl mx-auto text-left">
            <h4 className="font-semibold mb-2 text-lg border-b border-gray-700 pb-1">Progreso de la Ronda Actual:</h4>
            <div className="max-h-40 overflow-y-auto space-y-1 p-2 bg-gray-700 rounded-md">
                {matchSchedule.map((match, index) => (
                    <div 
                    key={index} 
                    className={`p-2 rounded-md flex justify-between items-center ${
                        index === currentMatchIndex && !match.winner ? 'bg-cyan-400/30 font-bold border border-cyan-400' 
                        : match.winner ? 'bg-green-600/50' : 'bg-gray-600'
                    }`}
                    >
                        <span>{match.p1} vs {match.p2}</span>
                        <span className="font-bold">
                            {match.winner ? `Ganador: ${match.winner.replace('BYE (Pasa de ronda)', 'BYE')}` : (index === currentMatchIndex ? 'ACTIVO' : 'Pendiente')}
                        </span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    );
  };
  
  const renderTournamentFinished = () => (
    <div className="mt-5 p-8 bg-gray-800 rounded-xl shadow-2xl shadow-green-400/50">
      <h1 className="text-5xl font-extrabold mb-4 text-green-400">¡TORNEO FINALIZADO! 👑</h1>
      <h2 className="text-3xl font-semibold text-cyan-400">El Campeón es: {tournamentWinner}</h2>
      <button 
        className={`${primaryButtonClasses} mt-6`}
        onClick={() => handleGameModeChange('TOURNAMENT')} // Cambiamos a setup al terminar
      >
        Configurar Nuevo Torneo
      </button>
    </div>
  );
  
  // --- RENDERIZADO PRINCIPAL ---
  
  // Determinación de los nombres de los jugadores para el marcador
  const currentMatch = matchSchedule[currentMatchIndex] || {};
  const player1Name = gameMode === 'TOURNAMENT' ? currentMatch.p1 : 'Jugador 1';
  const player2Name = gameMode === 'TOURNAMENT' ? currentMatch.p2 : (isOnePlayerMode ? 'IA' : 'Jugador 2');
  
  let mainContent;
  
  if (gameMode === 'TOURNAMENT' && tournamentState !== 'IN_PROGRESS') {
    if (tournamentState === 'SETUP') {
      mainContent = renderTournamentSetup();
    } else { // 'FINISHED'
      mainContent = renderTournamentFinished();
    }
  }

  // Renderiza el canvas si es ONE_PLAYER, TWO_PLAYERS o si el TORNEO está EN PROGRESO
  if (gameMode !== 'TOURNAMENT' || tournamentState === 'IN_PROGRESS') {
    
    const gameActiveContent = (
        <>
            {/* TÍTULO DE MARCADOR */}
            <h2 className={`font-extrabold my-4 ${gameMode === 'TOURNAMENT' ? 'text-2xl' : 'text-3xl'}`}>
                {player1Name}: {score.player1} - {player2Name}: {score.player2}
            </h2>
            
            {/* Botones de control y modo de juego */}
            <div className="flex flex-col items-center gap-3">
                
                {/* SELECCIÓN DE MODO DE JUEGO */}
                <div className="flex gap-2">
                    <span className="self-center font-medium">Modo:</span>
                    <button 
                    className={`${modeButtonClasses} ${gameMode === 'ONE_PLAYER' ? 'bg-white text-black' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                    // USO DE LA FUNCIÓN CORREGIDA
                    onClick={() => handleGameModeChange('ONE_PLAYER')} 
                    >
                    1 JUGADOR (vs IA)
                    </button>
                    <button 
                    className={`${modeButtonClasses} ${gameMode === 'TWO_PLAYERS' ? 'bg-white text-black' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                    // USO DE LA FUNCIÓN CORREGIDA
                    onClick={() => handleGameModeChange('TWO_PLAYERS')}
                    >
                    2 JUGADORES (Local)
                    </button>
                    <button 
                    className={`${modeButtonClasses} ${gameMode === 'TOURNAMENT' ? 'bg-white text-black' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                    // USO DE LA FUNCIÓN CORREGIDA
                    onClick={() => handleGameModeChange('TOURNAMENT')}
                    >
                    TORNEO 🏆
                    </button>
                </div>

                {/* Botones de Dificultad (Solo visibles en modo 1 JUGADOR) */}
                {isOnePlayerMode && gameMode === 'ONE_PLAYER' && (
                    <div className="flex gap-2 mb-4">
                        <span className="self-center font-medium">Dificultad de la IA:</span>
                        {(Object.keys(DIFFICULTY_LEVELS) as DifficultyLevel[]).map((key) => (
                        <button 
                            key={key} 
                            className={`${modeButtonClasses} ${difficulty === key ? 'bg-white text-black' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                            onClick={() => setDifficulty(key)}
                        >
                            {DIFFICULTY_LEVELS[key].name}
                        </button>
                        ))}
                    </div>
                )}
                
                {/* Botón Principal: Empezar/Pausa/Reanudar/Siguiente Partido */}
                <button className={primaryButtonClasses} onClick={handleButtonClick}>
                    {winner 
                        ? (gameMode === 'TOURNAMENT' 
                            ? (matchSchedule.length === 1 && currentMatchIndex === 0 && winner ? 'Ver Campeón' : 'Siguiente Partido')
                            : 'Reiniciar Partida') 
                        : (!isStarted ? 'Empezar Partida' : (isPaused ? 'Reanudar' : 'Pausar')) 
                    }
                </button>
            </div>

            {/* Contenedor del canvas (simula canvas-container) */}
            <div className="relative shadow-2xl shadow-cyan-400/50 border-4 border-cyan-400 mt-4">
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={600}
                />
                {/* Mensaje de ganador */}
                {winner && (
                    <h1 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-black text-cyan-400 bg-gray-900/80 p-4 rounded-lg border-4 border-cyan-400 animate-pulse">
                        ¡{winner} ha ganado!
                    </h1>
                )}
            </div>
        </>
    );

    if (gameMode === 'TOURNAMENT' && tournamentState === 'IN_PROGRESS') {
        mainContent = (
            <>
                {renderTournamentInProgress()}
                <div className="mt-8 flex flex-col items-center">
                    {gameActiveContent}
                </div>
            </>
        );
    } else {
        mainContent = gameActiveContent;
    }
  }

  // El renderizado final en el div principal
  return (
    <div className="flex flex-col items-center p-8 bg-gray-900 min-h-screen text-white" tabIndex={0}> 
      {mainContent}
    </div>
  );
}

export default PongGame;
