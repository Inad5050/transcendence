// frontend/src/pong.ts

import {
  GameObjects,
  Score,
  GameMode,
  DifficultyLevel,
  PaddleObject,
  BallObject,
} from '../utils/types';
import {
  PADDLE_THICKNESS,
  BALL_RADIUS,
  WINNING_SCORE,
  INITIAL_BALL_SPEED,
  ACCELERATION_FACTOR,
  DIFFICULTY_LEVELS,
  MAX_BOUNCE_ANGLE,
  PADDLE_INFLUENCE_FACTOR,
  MAX_BALL_SPEED,
  PADDLE_LENGTH_CLASSIC,
  PADDLE_SPEED_CLASSIC,
  PADDLE_LENGTH_4P,
  PADDLE_SPEED_4P,
} from '../utils/constants';

function checkCollision(ball: BallObject, paddle: PaddleObject): boolean {
    if (!paddle.isAlive)
      return false;
    
    const closestX = Math.max(paddle.x, Math.min(ball.x, paddle.x + paddle.width));
    const closestY = Math.max(paddle.y, Math.min(ball.y, paddle.y + paddle.height));
    const distanceX = ball.x - closestX;
    const distanceY = ball.y - closestY;
    const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
    return distanceSquared < (BALL_RADIUS * BALL_RADIUS);
}

export function initializePongGame(container: HTMLElement) {
  container.innerHTML = `
    <div class="w-full min-h-screen flex flex-col max-w-4xl mx-auto p-4 text-white">
      <header id="game-controls" class="p-4 bg-gray-800 rounded-xl mb-4 text-center space-y-3">
        <div id="mode-selection" class="flex justify-center items-center gap-4">
          <span class="font-semibold">Modo de Juego:</span>
          <button data-mode="ONE_PLAYER" class="mode-btn px-4 py-2 text-sm font-bold rounded-full bg-white text-black">1P vs IA</button>
          <button data-mode="TWO_PLAYERS" class="mode-btn px-4 py-2 text-sm font-bold rounded-full bg-gray-700 hover:bg-gray-600">2 Jugadores</button>
          <button data-mode="FOUR_PLAYERS" class="mode-btn px-4 py-2 text-sm font-bold rounded-full bg-gray-700 hover:bg-gray-600">4 Jugadores</button>
        </div>
        <div id="difficulty-selection" class="flex justify-center items-center gap-4">
          <span class="font-semibold">Dificultad IA:</span>
          <button data-difficulty="EASY" class="difficulty-btn px-3 py-1 text-xs font-semibold rounded-full bg-white text-black">Fácil</button>
          <button data-difficulty="MEDIUM" class="difficulty-btn px-3 py-1 text-xs font-semibold rounded-full bg-gray-700 hover:bg-gray-600">Medio</button>
          <button data-difficulty="HARD" class="difficulty-btn px-3 py-1 text-xs font-semibold rounded-full bg-gray-700 hover:bg-gray-600">Difícil</button>
          <button data-difficulty="IMPOSSIBLE" class="difficulty-btn px-3 py-1 text-xs font-semibold rounded-full bg-gray-700 hover:bg-gray-600">Imposible</button>
        </div>
      </header>
      <main class="relative">
        <h2 id="scoreboard" class="font-extrabold my-4 text-3xl text-center"></h2>
        <canvas id="pong-canvas" class="w-full block shadow-2xl shadow-cyan-400/50 border-4 border-cyan-400 bg-black"></canvas>
        <div id="game-overlay" class="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center bg-gray-900/80 gap-4">
          <h1 id="winner-message" class="text-5xl font-black text-center text-cyan-400 p-4 rounded-lg border-4 border-cyan-400 animate-pulse hidden"></h1>
          <button id="start-button" class="px-8 py-4 font-bold text-lg rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1 bg-cyan-400 text-gray-900 hover:bg-white">Empezar Partida</button>
        </div>
      </main>
    </div>
  `;

  const canvas = container.querySelector('#pong-canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d')!;
  const scoreboardElement = container.querySelector('#scoreboard')!;
  const gameOverlay = container.querySelector('#game-overlay')!;
  const winnerMessage = container.querySelector('#winner-message')!;
  const startButton = container.querySelector('#start-button')!;
  const difficultySelection = container.querySelector('#difficulty-selection')!;

  type GameState = 'MENU' | 'PLAYING' | 'SCORED' | 'GAME_OVER';
  let gameState: GameState = 'MENU';
  
  let score: Score;
  let gameObjects: GameObjects;
  let animationFrameId: number | null = null;
  let gameMode: GameMode = 'ONE_PLAYER';
  let difficulty: DifficultyLevel = 'EASY';

  const keysPressed: { [key: string]: boolean } = {};
  let playerVelocities = { p1: 0, p2: 0, p3: 0, p4: 0 };

  // --- FUNCIÓN RESETBALL CON LÓGICA DE SAQUE CORREGIDA ---
  function resetBall() {
    const { ball, player1, player2, player3, player4 } = gameObjects;
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;

    // Reposicionamos las palas al centro
    const paddleLengthV = gameMode === 'FOUR_PLAYERS' ? PADDLE_LENGTH_4P : PADDLE_LENGTH_CLASSIC;
    player1.y = canvas.height / 2 - paddleLengthV / 2;
    player2.y = canvas.height / 2 - paddleLengthV / 2;
    if (gameMode === 'FOUR_PLAYERS') {
      const paddleLengthH = PADDLE_LENGTH_4P;
      player3.x = canvas.width / 2 - paddleLengthH / 2;
      player4.x = canvas.width / 2 - paddleLengthH / 2;
    }

    // Calculamos el ángulo de saque
    let angle;
    if (gameMode === 'FOUR_PLAYERS') {
      // En 4P, un ángulo totalmente aleatorio
      angle = Math.random() * 2 * Math.PI;
    } else {
      // En 1v1, un ángulo más horizontal
      const maxAngle = Math.PI / 6; // 30 grados
      angle = (Math.random() - 0.5) * 2 * maxAngle;
      // Dirección aleatoria izquierda o derecha
      if (Math.random() > 0.5) angle += Math.PI;
    }

    ball.dx = Math.cos(angle) * INITIAL_BALL_SPEED;
    ball.dy = Math.sin(angle) * INITIAL_BALL_SPEED;
  }
  // --- FIN DE LA CORRECCIÓN ---

  function resetGame() {
    gameState = 'MENU';

    const PADDLE_LENGTH = gameMode === 'FOUR_PLAYERS' ? PADDLE_LENGTH_4P : PADDLE_LENGTH_CLASSIC;
    if (gameMode === 'FOUR_PLAYERS') {
      canvas.width = 800; canvas.height = 800;
      canvas.classList.add('aspect-square');
      score = { p1: 3, p2: 3, p3: 3, p4: 3 };
    } else {
      canvas.width = 800; canvas.height = 600;
      canvas.classList.remove('aspect-square');
      score = { p1: 0, p2: 0 };
    }
    
    gameObjects = {
      ball: { x: canvas.width / 2, y: canvas.height / 2, dx: 0, dy: 0 },
      player1: { x: PADDLE_THICKNESS, y: canvas.height / 2 - PADDLE_LENGTH / 2, width: PADDLE_THICKNESS, height: PADDLE_LENGTH, isAlive: true },
      player2: { x: canvas.width - PADDLE_THICKNESS * 2, y: canvas.height / 2 - PADDLE_LENGTH / 2, width: PADDLE_THICKNESS, height: PADDLE_LENGTH, isAlive: true },
      player3: { x: canvas.width / 2 - PADDLE_LENGTH / 2, y: PADDLE_THICKNESS, width: PADDLE_LENGTH, height: PADDLE_THICKNESS, isAlive: true },
      player4: { x: canvas.width / 2 - PADDLE_LENGTH / 2, y: canvas.height - PADDLE_THICKNESS * 2, width: PADDLE_LENGTH, height: PADDLE_THICKNESS, isAlive: true },
    };
    updateScoreboard();
    winnerMessage.classList.add('hidden');
    gameOverlay.classList.remove('hidden');
    startButton.textContent = 'Empezar Partida';
  }
  
  function update() {
    if (gameState !== 'PLAYING') 
      return;

    const PADDLE_SPEED = gameMode === 'FOUR_PLAYERS' ? PADDLE_SPEED_4P : PADDLE_SPEED_CLASSIC;
    const { ball, player1, player2, player3, player4 } = gameObjects;

    if (player1.isAlive) {
      playerVelocities.p1 = (keysPressed['s'] ? PADDLE_SPEED : 0) - (keysPressed['w'] ? PADDLE_SPEED : 0);
      player1.y += playerVelocities.p1;
    }
    if (player2.isAlive) {
      if (gameMode === 'ONE_PLAYER') {
        const currentDifficulty = DIFFICULTY_LEVELS[difficulty];
        const targetY = ball.y - player2.height / 2;
        const deltaY = targetY - player2.y;
        if (Math.abs(deltaY) > currentDifficulty.errorMargin) {
          player2.y += Math.sign(deltaY) * Math.min(PADDLE_SPEED, Math.abs(deltaY));
        }
      } else {
        playerVelocities.p2 = (keysPressed['l'] ? PADDLE_SPEED : 0) - (keysPressed['o'] ? PADDLE_SPEED : 0);
        player2.y += playerVelocities.p2;
      }
    }
    
    player1.y = Math.max(0, Math.min(player1.y, canvas.height - player1.height));
    player2.y = Math.max(0, Math.min(player2.y, canvas.height - player2.height));

    if (gameMode === 'FOUR_PLAYERS') {
      if (player3.isAlive) {
        playerVelocities.p3 = (keysPressed['h'] ? PADDLE_SPEED : 0) - (keysPressed['g'] ? PADDLE_SPEED : 0);
        player3.x += playerVelocities.p3;
      }
      if (player4.isAlive) {
        playerVelocities.p4 = (keysPressed['n'] ? PADDLE_SPEED : 0) - (keysPressed['b'] ? PADDLE_SPEED : 0);
        player4.x += playerVelocities.p4;
      }
      player3.x = Math.max(0, Math.min(player3.x, canvas.width - player3.width));
      player4.x = Math.max(0, Math.min(player4.x, canvas.width - player4.width));
    }

    ball.x += ball.dx;
    ball.y += ball.dy;

    if (checkCollision(ball, player1)) handlePaddleBounce(player1, playerVelocities.p1, 'vertical');
    if (checkCollision(ball, player2)) handlePaddleBounce(player2, playerVelocities.p2, 'vertical');
    if (gameMode === 'FOUR_PLAYERS') {
      if (checkCollision(ball, player3)) handlePaddleBounce(player3, playerVelocities.p3, 'horizontal');
      if (checkCollision(ball, player4)) handlePaddleBounce(player4, playerVelocities.p4, 'horizontal');
    }

    handleScoring();
  }

  function handlePaddleBounce(paddle: PaddleObject, paddleVelocity: number, orientation: 'vertical' | 'horizontal') {
      const { ball } = gameObjects;
      const speed = Math.min(Math.sqrt(ball.dx**2 + ball.dy**2) * ACCELERATION_FACTOR, MAX_BALL_SPEED);
      if (orientation === 'vertical') {
          const relativeImpact = (ball.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);
          const bounceAngle = relativeImpact * MAX_BOUNCE_ANGLE;
          ball.dx = speed * Math.cos(bounceAngle) * (ball.dx > 0 ? -1 : 1);
          ball.dy = speed * Math.sin(bounceAngle) + paddleVelocity * PADDLE_INFLUENCE_FACTOR;
          ball.x = paddle.x + (ball.dx > 0 ? paddle.width + BALL_RADIUS : -BALL_RADIUS);
      } else {
          const relativeImpact = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
          const bounceAngle = relativeImpact * MAX_BOUNCE_ANGLE;
          ball.dy = speed * Math.cos(bounceAngle) * (ball.dy > 0 ? -1 : 1);
          ball.dx = speed * Math.sin(bounceAngle) + paddleVelocity * PADDLE_INFLUENCE_FACTOR;
          ball.y = paddle.y + (ball.dy > 0 ? paddle.height + BALL_RADIUS : -BALL_RADIUS);
      }
  }

  function handleScoring() {
      const { ball, player1, player2, player3, player4 } = gameObjects;
      if (gameMode === 'FOUR_PLAYERS') {
          if ((ball.x - BALL_RADIUS < 0 && !player1.isAlive)) { ball.dx *= -1; ball.x = BALL_RADIUS; }
          if ((ball.x + BALL_RADIUS > canvas.width && !player2.isAlive)) { ball.dx *= -1; ball.x = canvas.width - BALL_RADIUS; }
          if ((ball.y - BALL_RADIUS < 0 && !player3.isAlive)) { ball.dy *= -1; ball.y = BALL_RADIUS; }
          if ((ball.y + BALL_RADIUS > canvas.height && !player4.isAlive)) { ball.dy *= -1; ball.y = canvas.height - BALL_RADIUS; }

          if (ball.x < 0 && player1.isAlive) loseLife(1);
          else if (ball.x > canvas.width && player2.isAlive) loseLife(2);
          else if (ball.y < 0 && player3.isAlive) loseLife(3);
          else if (ball.y > canvas.height && player4.isAlive) loseLife(4);

      } else {
          if (ball.y - BALL_RADIUS < 0 || ball.y + BALL_RADIUS > canvas.height) ball.dy *= -1;
          let scorer: number | null = null;
          if (ball.x < 0) { score.p2++; scorer = 2; }
          else if (ball.x > canvas.width) { score.p1++; scorer = 1; }
          
          if (scorer) {
              updateScoreboard();
              if (score.p1 >= WINNING_SCORE || score.p2 >= WINNING_SCORE) {
                endGame(scorer);
              } else {
                gameState = 'SCORED';
                resetBall();
                setTimeout(() => { gameState = 'PLAYING'; }, 1000);
              }
          }
      }
  }

  function loseLife(playerNumber: number) {
      gameState = 'SCORED';
      const playerKey = `p${playerNumber}` as keyof Score;
      score[playerKey]--;
      const gameObjectKey = `player${playerNumber}` as keyof GameObjects;
      if(score[playerKey] <= 0) {
        gameObjects[gameObjectKey].isAlive = false;
      }
      updateScoreboard();

      const playersAlive = Object.values(gameObjects).filter(p => p.isAlive === true).length;
      if (playersAlive <= 1) {
          const winnerKey = Object.keys(score).find(k => score[k] > 0);
          endGame(winnerKey ? parseInt(winnerKey.replace('p', '')) : 0);
      } else {
          resetBall();
          setTimeout(() => { gameState = 'PLAYING'; }, 1000);
      }
  }

  function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);

    const { player1, player2, player3, player4, ball } = gameObjects;
    
    context.fillStyle = player1.isAlive ? 'white' : '#555';
    context.fillRect(player1.x, player1.y, player1.width, player1.height);
    context.fillStyle = player2.isAlive ? 'white' : '#555';
    context.fillRect(player2.x, player2.y, player2.width, player2.height);

    if (gameMode === 'FOUR_PLAYERS') {
        context.fillStyle = player3.isAlive ? 'white' : '#555';
        context.fillRect(player3.x, player3.y, player3.width, player3.height);
        context.fillStyle = player4.isAlive ? 'white' : '#555';
        context.fillRect(player4.x, player4.y, player4.width, player4.height);
    }

    if (gameState === 'PLAYING' || gameState === 'SCORED') {
      context.fillStyle = 'white';
      context.beginPath();
      context.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
      context.fill();
    }
  }
  
  function updateScoreboard() {
      if (gameMode === 'FOUR_PLAYERS') {
          scoreboardElement.innerHTML = `
            <span class="${score.p1 > 0 ? 'text-white' : 'text-gray-600'}">P1 Vidas: ${score.p1}</span> | 
            <span class="${score.p2 > 0 ? 'text-white' : 'text-gray-600'}">P2 Vidas: ${score.p2}</span> | 
            <span class="${score.p3 > 0 ? 'text-white' : 'text-gray-600'}">P3 Vidas: ${score.p3}</span> | 
            <span class="${score.p4 > 0 ? 'text-white' : 'text-gray-600'}">P4 Vidas: ${score.p4}</span>
          `;
      } else {
          const p1Name = 'Jugador 1';
          const p2Name = gameMode === 'ONE_PLAYER' ? 'IA' : 'Jugador 2';
          scoreboardElement.textContent = `${p1Name}: ${score.p1 || 0} - ${p2Name}: ${score.p2 || 0}`;
      }
  }

  function gameLoop() {
    update();
    draw();
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  function startGame() {
      if (gameState === 'PLAYING')
        return;
      gameState = 'PLAYING';
      gameOverlay.classList.add('hidden');
      resetBall();
      
      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(gameLoop);
      }
  }

  function endGame(winner: number) {
      gameState = 'GAME_OVER';
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = null;

      let winnerName = `Jugador ${winner}`;
      if (gameMode === 'ONE_PLAYER' && winner === 2) winnerName = 'IA';

      winnerMessage.textContent = `¡${winnerName} ha ganado!`;
      startButton.textContent = 'Volver a Jugar';
      winnerMessage.classList.remove('hidden');
      gameOverlay.classList.remove('hidden');
  }

  function handleKeyDown(event: KeyboardEvent) { keysPressed[event.key.toLowerCase()] = true; }
  function handleKeyUp(event: KeyboardEvent) { keysPressed[event.key.toLowerCase()] = false; }
  
  container.querySelectorAll('.mode-btn').forEach(button => {
    button.addEventListener('click', () => {
      gameMode = button.getAttribute('data-mode') as GameMode;
      difficultySelection.style.display = gameMode === 'ONE_PLAYER' ? 'flex' : 'none';
      container.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.replace('bg-white', 'bg-gray-700');
        btn.classList.remove('text-black');
      });
      button.classList.add('bg-white', 'text-black');
      button.classList.remove('bg-gray-700');
      resetGame();
      draw();
    });
  });

  container.querySelectorAll('.difficulty-btn').forEach(button => {
    button.addEventListener('click', () => {
      difficulty = button.getAttribute('data-difficulty') as DifficultyLevel;
       container.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.replace('bg-white', 'bg-gray-700');
        btn.classList.remove('text-black');
      });
      button.classList.add('bg-white', 'text-black');
      button.classList.remove('bg-gray-700');
      resetGame();
      draw();
    });
  });

  startButton.addEventListener('click', () => {
    if (gameState === 'MENU' || gameState === 'GAME_OVER') {
        resetGame();
        startGame();
    }
  });
  
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  
  resetGame();
  draw();
}
