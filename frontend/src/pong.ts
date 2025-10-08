// transcen/frontend/src/pong.ts

import {
  GameObjects,
  MovementDirection,
  Score,
  GameMode,
  DifficultyLevel,
  PaddleObject,
  BallObject,
} from './utils/types';
import {
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  BALL_RADIUS,
  WINNING_SCORE,
  PADDLE_SPEED,
  INITIAL_BALL_SPEED,
  ACCELERATION_FACTOR,
  DIFFICULTY_LEVELS,
  MAX_BOUNCE_ANGLE,
  PADDLE_INFLUENCE_FACTOR, // Nueva constante para el efecto
  MAX_BALL_SPEED,          // Nueva constante para la velocidad máxima
} from './utils/constants';

// --- NUEVA LÓGICA DE COLISIÓN MEJORADA ---
// Esta función ahora es más precisa para detectar colisiones entre un círculo (pelota) y un rectángulo (pala).
function checkCollision(ball: BallObject, paddle: PaddleObject): boolean {
    const closestX = Math.max(paddle.x, Math.min(ball.x, paddle.x + PADDLE_WIDTH));
    const closestY = Math.max(paddle.y, Math.min(ball.y, paddle.y + PADDLE_HEIGHT));
    const distanceX = ball.x - closestX;
    const distanceY = ball.y - closestY;
    const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
    return distanceSquared < (BALL_RADIUS * BALL_RADIUS);
}

export function initializePongGame(container: HTMLElement) {
  // El HTML del juego no cambia, se mantiene la estructura.
  container.innerHTML = `
    <div class="w-full max-w-4xl mx-auto p-4 text-white">
      <header id="game-controls" class="p-4 bg-gray-800 rounded-xl mb-4 text-center space-y-3">
        <div id="mode-selection" class="flex justify-center items-center gap-4">
          <span class="font-semibold">Modo de Juego:</span>
          <button data-mode="ONE_PLAYER" class="mode-btn px-4 py-2 text-sm font-bold rounded-full bg-white text-black">1 Jugador (vs IA)</button>
          <button data-mode="TWO_PLAYERS" class="mode-btn px-4 py-2 text-sm font-bold rounded-full bg-gray-700 hover:bg-gray-600">2 Jugadores</button>
        </div>
        <div id="difficulty-selection" class="flex justify-center items-center gap-4">
          <span class="font-semibold">Dificultad:</span>
          <button data-difficulty="EASY" class="difficulty-btn px-3 py-1 text-xs font-semibold rounded-full bg-white text-black">Fácil</button>
          <button data-difficulty="MEDIUM" class="difficulty-btn px-3 py-1 text-xs font-semibold rounded-full bg-gray-700 hover:bg-gray-600">Medio</button>
          <button data-difficulty="HARD" class="difficulty-btn px-3 py-1 text-xs font-semibold rounded-full bg-gray-700 hover:bg-gray-600">Difícil</button>
          <button data-difficulty="IMPOSSIBLE" class="difficulty-btn px-3 py-1 text-xs font-semibold rounded-full bg-gray-700 hover:bg-gray-600">Imposible</button>
        </div>
      </header>
      <main class="relative">
        <h2 id="scoreboard" class="font-extrabold my-4 text-3xl text-center"></h2>
        <canvas id="pong-canvas" width="800" height="600" class="w-full block shadow-2xl shadow-cyan-400/50 border-4 border-cyan-400 bg-black"></canvas>
        <div id="game-overlay" class="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center bg-gray-900/80 gap-4">
          <h1 id="winner-message" class="text-5xl font-black text-cyan-400 p-4 rounded-lg border-4 border-cyan-400 animate-pulse hidden"></h1>
          <button id="start-button" class="px-8 py-4 font-bold text-lg rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1 bg-cyan-400 text-gray-900 hover:bg-white">Empezar Partida</button>
        </div>
      </main>
    </div>
  `;

  // --- VARIABLES Y ESTADO DEL JUEGO ---
  const canvas = container.querySelector('#pong-canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d')!;
  const scoreboardElement = container.querySelector('#scoreboard')!;
  const gameOverlay = container.querySelector('#game-overlay')!;
  const winnerMessage = container.querySelector('#winner-message')!;
  const startButton = container.querySelector('#start-button')!;
  const difficultySelection = container.querySelector('#difficulty-selection')!;

  // Introducimos un estado de juego para un control más claro.
  type GameState = 'MENU' | 'PLAYING' | 'SCORED' | 'GAME_OVER';
  let gameState: GameState = 'MENU';
  
  let score: Score;
  let gameObjects: GameObjects;
  let animationFrameId: number | null = null;
  let gameMode: GameMode = 'ONE_PLAYER';
  let difficulty: DifficultyLevel = 'EASY';

  // --- NUEVA LÓGICA DE MOVIMIENTO DE PALAS ---
  // Guardamos el estado de las teclas para un movimiento más fluido y para calcular la velocidad.
  const keysPressed: { [key: string]: boolean } = {};
  let player1VelocityY = 0;
  let player2VelocityY = 0;

  // --- LÓGICA PRINCIPAL DEL JUEGO ---

  function resetBall(serveToPlayer: 1 | 2) {
    gameObjects.ball.x = canvas.width / 2;
    gameObjects.ball.y = canvas.height / 2;
    // La pelota siempre sale hacia el jugador que no marcó.
    gameObjects.ball.dx = (serveToPlayer === 1 ? -1 : 1) * INITIAL_BALL_SPEED;
    // Añadimos una pequeña aleatoriedad vertical inicial.
    gameObjects.ball.dy = (Math.random() - 0.5) * (INITIAL_BALL_SPEED / 2);
  }

  function resetGame() {
    gameState = 'MENU';
    score = { player1: 0, player2: 0 };
    const initialPaddleY = canvas.height / 2 - PADDLE_HEIGHT / 2;
    gameObjects = {
      ball: { x: canvas.width / 2, y: canvas.height / 2, dx: 0, dy: 0 }, // La pelota empieza parada
      player1: { x: PADDLE_WIDTH, y: initialPaddleY },
      player2: { x: canvas.width - PADDLE_WIDTH * 2, y: initialPaddleY },
    };
    updateScoreboard();
    winnerMessage.classList.add('hidden');
    gameOverlay.classList.remove('hidden');
    startButton.textContent = 'Empezar Partida';
  }
  
  // --- FUNCIÓN UPDATE TOTALMENTE REHECHA ---
  function update() {
    if (gameState !== 'PLAYING') return;

    const { ball, player1, player2 } = gameObjects;

    // 1. Actualizar movimiento de las palas basado en las teclas pulsadas.
    player1VelocityY = 0;
    if (keysPressed['w']) player1VelocityY = -PADDLE_SPEED;
    if (keysPressed['s']) player1VelocityY = PADDLE_SPEED;
    player1.y += player1VelocityY;
    player1.y = Math.max(0, Math.min(player1.y, canvas.height - PADDLE_HEIGHT));

    if (gameMode === 'TWO_PLAYERS') {
      player2VelocityY = 0;
      if (keysPressed['o']) player2VelocityY = -PADDLE_SPEED;
      if (keysPressed['l']) player2VelocityY = PADDLE_SPEED;
      player2.y += player2VelocityY;
    } else {
      // Lógica de la IA (sin cambios)
      const currentDifficulty = DIFFICULTY_LEVELS[difficulty];
      const targetY = ball.y - PADDLE_HEIGHT / 2;
      const deltaY = targetY - player2.y;
      if (Math.abs(deltaY) > currentDifficulty.errorMargin) {
        player2.y += Math.sign(deltaY) * Math.min(PADDLE_SPEED, Math.abs(deltaY));
      }
    }
    player2.y = Math.max(0, Math.min(player2.y, canvas.height - PADDLE_HEIGHT));

    // 2. Mover la pelota.
    ball.x += ball.dx;
    ball.y += ball.dy;

    // 3. Colisiones con los bordes superior e inferior.
    if ((ball.y - BALL_RADIUS < 0 && ball.dy < 0) || (ball.y + BALL_RADIUS > canvas.height && ball.dy > 0)) {
      ball.dy *= -1;
    }

    // 4. --- LÓGICA DE REBOTE AVANZADA ---
    const paddle = ball.dx < 0 ? player1 : player2;
    if (checkCollision(ball, paddle)) {
        const paddleCenterY = paddle.y + PADDLE_HEIGHT / 2;
        const relativeImpact = (ball.y - paddleCenterY) / (PADDLE_HEIGHT / 2);
        const bounceAngle = relativeImpact * MAX_BOUNCE_ANGLE;
        
        // La velocidad de la pelota aumenta con cada golpe.
        let currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        let newSpeed = Math.min(currentSpeed * ACCELERATION_FACTOR, MAX_BALL_SPEED);
        
        // Invertimos la dirección horizontal.
        ball.dx = newSpeed * Math.cos(bounceAngle) * (ball.dx > 0 ? -1 : 1);
        
        // --- REALISMO AÑADIDO: EFECTO DE LA PALA ---
        // La velocidad vertical de la pala afecta al rebote de la pelota.
        const paddleVelocity = paddle === player1 ? player1VelocityY : player2VelocityY;
        let baseVerticalSpeed = newSpeed * Math.sin(bounceAngle);
        ball.dy = baseVerticalSpeed + (paddleVelocity * PADDLE_INFLUENCE_FACTOR);

        // Aseguramos que la pelota no se quede "pegada" a la pala.
        ball.x = (paddle === player1) 
            ? paddle.x + PADDLE_WIDTH + BALL_RADIUS 
            : paddle.x - BALL_RADIUS;
    }

    // 5. Lógica de Puntuación.
    if (ball.x - BALL_RADIUS < 0) {
      score.player2++;
      handleScore(2);
    } else if (ball.x + BALL_RADIUS > canvas.width) {
      score.player1++;
      handleScore(1);
    }
  }

  function handleScore(scoringPlayer: 1 | 2) {
    updateScoreboard();
    if (score.player1 >= WINNING_SCORE || score.player2 >= WINNING_SCORE) {
      endGame(scoringPlayer);
    } else {
      gameState = 'SCORED';
      // Reiniciamos la pelota sirviendo al jugador que no marcó.
      resetBall(scoringPlayer === 1 ? 2 : 1); 
      // Pausa de 1 segundo antes de reanudar.
      setTimeout(() => { gameState = 'PLAYING'; }, 1000);
    }
  }

  // --- FUNCIONES DE DIBUJO Y VISUALIZACIÓN ---
  function draw() {
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'white';
    context.fillRect(gameObjects.player1.x, gameObjects.player1.y, PADDLE_WIDTH, PADDLE_HEIGHT);
    context.fillRect(gameObjects.player2.x, gameObjects.player2.y, PADDLE_WIDTH, PADDLE_HEIGHT);
    
    // Solo dibujamos la pelota si el juego está activo o recién se ha marcado.
    if (gameState === 'PLAYING' || gameState === 'SCORED') {
      context.beginPath();
      context.arc(gameObjects.ball.x, gameObjects.ball.y, BALL_RADIUS, 0, Math.PI * 2);
      context.fill();
    }
  }
  
  function updateScoreboard() {
    const p1Name = 'Jugador 1';
    const p2Name = gameMode === 'ONE_PLAYER' ? 'IA' : 'Jugador 2';
    scoreboardElement.textContent = `${p1Name}: ${score.player1} - ${p2Name}: ${score.player2}`;
  }

  // --- BUCLE PRINCIPAL Y GESTIÓN DE ESTADOS ---

  function gameLoop() {
    update();
    draw();
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  function startGame() {
      if (gameState === 'PLAYING') return;
      gameState = 'PLAYING';
      gameOverlay.classList.add('hidden');
      resetBall(Math.random() > 0.5 ? 1 : 2); // Saque inicial aleatorio
      
      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(gameLoop);
      }
  }

  function endGame(winner: 1 | 2) {
      gameState = 'GAME_OVER';
      const winnerName = winner === 1 ? 'Jugador 1' : (gameMode === 'ONE_PLAYER' ? 'IA' : 'Jugador 2');
      winnerMessage.textContent = `¡${winnerName} ha ganado!`;
      startButton.textContent = 'Volver a Jugar';
      winnerMessage.classList.remove('hidden');
      gameOverlay.classList.remove('hidden');
  }

  // --- MANEJO DE EVENTOS (TECLADO Y BOTONES) ---

  function handleKeyDown(event: KeyboardEvent) {
    keysPressed[event.key.toLowerCase()] = true;
  }
  function handleKeyUp(event: KeyboardEvent) {
    keysPressed[event.key.toLowerCase()] = false;
  }
  
  // Event Listeners para la UI
  container.querySelectorAll('.mode-btn').forEach(button => {
    button.addEventListener('click', () => {
      gameMode = button.getAttribute('data-mode') as GameMode;
      difficultySelection.style.display = gameMode === 'ONE_PLAYER' ? 'flex' : 'none';
      container.querySelectorAll('.mode-btn').forEach(btn => btn.classList.replace('bg-white', 'bg-gray-700'));
      button.classList.replace('bg-gray-700', 'bg-white');
      resetGame();
      draw();
    });
  });

  container.querySelectorAll('.difficulty-btn').forEach(button => {
    button.addEventListener('click', () => {
      difficulty = button.getAttribute('data-difficulty') as DifficultyLevel;
      container.querySelectorAll('.difficulty-btn').forEach(btn => btn.classList.replace('bg-white', 'bg-gray-700'));
      button.classList.replace('bg-gray-700', 'bg-white');
      resetGame();
      draw();
    });
  });

  startButton.addEventListener('click', () => {
    if (gameState === 'MENU' || gameState === 'GAME_OVER') {
        resetGame(); // Resetea el marcador y todo si la partida había terminado
        startGame();
    }
  });
  
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  
  // Inicialización del juego
  resetGame();
  draw(); // Dibujamos el estado inicial del menú.
}
