// src/views/Pong.ts
import {
	GameObjects,
	MovementDirection,
	Score,
	GameMode,
	DifficultyLevel,
	PaddleObject,
	BallObject,
  } from '../utils/types';
  import {
	PADDLE_WIDTH,
	PADDLE_HEIGHT,
	BALL_RADIUS,
	WINNING_SCORE,
	PADDLE_SPEED,
	INITIAL_BALL_SPEED,
	ACCELERATION_FACTOR,
	DIFFICULTY_LEVELS,
  } from '../utils/constants';
  
  const MAX_BOUNCE_ANGLE = Math.PI / 4;
  
  function checkCollision(ball: BallObject, paddle: PaddleObject): boolean {
	  const closestX = Math.max(paddle.x, Math.min(ball.x, paddle.x + PADDLE_WIDTH));
	  const closestY = Math.max(paddle.y, Math.min(ball.y, paddle.y + PADDLE_HEIGHT));
	  const distanceX = ball.x - closestX;
	  const distanceY = ball.y - closestY;
	  const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
	  return distanceSquared < (BALL_RADIUS * BALL_RADIUS);
  }
  
  export function initializePongGame(container: HTMLElement) {
	const selectedCharId = localStorage.getItem('selectedCharacter') || '1';
	const characterIds = ['1', '2', '3', '4'];
	const opponentIds = characterIds.filter(id => id !== selectedCharId);
	const opponentCharId = opponentIds[Math.floor(Math.random() * opponentIds.length)];
  
	// Determinar la clase de altura para cada personaje
	const playerHeightClass = selectedCharId === '2' ? 'h-[50vh]' : 'h-[60vh]';
	const opponentHeightClass = opponentCharId === '2' ? 'h-[50vh]' : 'h-[60vh]';git
  
	container.innerHTML = `
	  <div class="w-full min-h-screen flex flex-col items-center justify-center p-4 text-white">
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
		<main class="relative flex items-center justify-center gap-8">
		  <div class="w-1/4 flex justify-center items-center">
			  <img src="/assets/char${selectedCharId}_full.png" class="${playerHeightClass} max-w-full object-contain">
		  </div>
  
		  <div class="relative">
			  <h2 id="scoreboard" class="font-extrabold my-4 text-3xl text-center"></h2>
			  <canvas id="pong-canvas" width="1200" height="900" class="w-full block shadow-2xl shadow-cyan-400/50 border-4 border-cyan-400 bg-black"></canvas>
			  <div id="game-overlay" class="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center bg-gray-900/80 gap-4">
				  <h1 id="winner-message" class="text-5xl font-black text-cyan-400 p-4 rounded-lg border-4 border-cyan-400 animate-pulse hidden"></h1>
				  <button id="start-button" class="px-8 py-4 font-bold text-lg rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1 bg-cyan-400 text-gray-900 hover:bg-white">Empezar Partida</button>
			  </div>
		  </div>
  
		  <div class="w-1/4 flex justify-center items-center">
			  <img src="/assets/char${opponentCharId}_full.png" class="${opponentHeightClass} max-w-full object-contain transform -scale-x-100">
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
  
	let score: Score;
	let movementP1: MovementDirection = null;
	let movementP2: MovementDirection = null;
	let gameObjects: GameObjects;
	let animationFrameId: number | null = null;
	let gameMode: GameMode = 'ONE_PLAYER';
	let difficulty: DifficultyLevel = 'EASY';
  
	function resetBall() {
	  gameObjects.ball.x = canvas.width / 2;
	  gameObjects.ball.y = canvas.height / 2;
	  gameObjects.ball.dx = (gameObjects.ball.dx > 0 ? -1 : 1) * INITIAL_BALL_SPEED;
	  gameObjects.ball.dy = (Math.random() > 0.5 ? 1 : -1) * INITIAL_BALL_SPEED;
	  const initialPaddleY = canvas.height / 2 - PADDLE_HEIGHT / 2;
	  gameObjects.player1.y = initialPaddleY;
	  gameObjects.player2.y = initialPaddleY;
	}
  
	function resetGame() {
	  if (animationFrameId) {
		cancelAnimationFrame(animationFrameId);
		animationFrameId = null;
	  }
	  score = { player1: 0, player2: 0 };
	  gameObjects = {
		ball: { x: canvas.width / 2, y: canvas.height / 2, dx: INITIAL_BALL_SPEED, dy: INITIAL_BALL_SPEED },
		player1: { x: 0, y: canvas.height / 2 - PADDLE_HEIGHT / 2 },
		player2: { x: canvas.width - PADDLE_WIDTH, y: canvas.height / 2 - PADDLE_HEIGHT / 2 },
	  };
	  updateScoreboard();
	  winnerMessage.classList.add('hidden');
	  gameOverlay.classList.remove('hidden');
	  startButton.textContent = 'Empezar Partida';
	  draw();
	}
	
	function update() {
	  const { ball, player1, player2 } = gameObjects;
	  
	  ball.x += ball.dx;
	  ball.y += ball.dy;
  
	  if (movementP1 === 'up') player1.y -= PADDLE_SPEED;
	  if (movementP1 === 'down') player1.y += PADDLE_SPEED;
	  player1.y = Math.max(0, Math.min(player1.y, canvas.height - PADDLE_HEIGHT));
  
	  if (gameMode === 'ONE_PLAYER') {
		const currentDifficulty = DIFFICULTY_LEVELS[difficulty];
		const targetY = ball.y - PADDLE_HEIGHT / 2;
		const deltaY = targetY - player2.y;
		if (Math.abs(deltaY) > currentDifficulty.errorMargin) {
		  player2.y += Math.sign(deltaY) * Math.min(PADDLE_SPEED, Math.abs(deltaY));
		}
	  } else {
		if (movementP2 === 'up') player2.y -= PADDLE_SPEED;
		if (movementP2 === 'down') player2.y += PADDLE_SPEED;
	  }
	  player2.y = Math.max(0, Math.min(player2.y, canvas.height - PADDLE_HEIGHT));
  
	  if ((ball.y - BALL_RADIUS < 0 && ball.dy < 0) || (ball.y + BALL_RADIUS > canvas.height && ball.dy > 0)) {
		ball.dy *= -1;
	  }
  
	  let paddle = ball.dx < 0 ? player1 : player2;
	  if (checkCollision(ball, paddle)) {
		  const paddleCenterY = paddle.y + PADDLE_HEIGHT / 2;
		  const impactPointY = ball.y;
  
		  if (impactPointY < paddle.y + BALL_RADIUS || impactPointY > paddle.y + PADDLE_HEIGHT - BALL_RADIUS) {
			  ball.dy *= -1;
		  }
  
		  const relativeImpact = (impactPointY - paddleCenterY) / (PADDLE_HEIGHT / 2);
		  const bounceAngle = relativeImpact * MAX_BOUNCE_ANGLE;
		  const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy) * ACCELERATION_FACTOR;
		  
		  ball.dx = speed * Math.cos(bounceAngle) * (ball.dx > 0 ? -1 : 1);
		  ball.dy = speed * Math.sin(bounceAngle);
  
		  ball.x = (paddle === player1) 
			  ? paddle.x + PADDLE_WIDTH + BALL_RADIUS 
			  : paddle.x - BALL_RADIUS;
	  }
  
	  if (ball.x - BALL_RADIUS < 0) {
		score.player2++;
		updateScoreboard();
		if (score.player2 === WINNING_SCORE) {
		  endGame(2); return;
		} else {
		  resetBall();
		}
	  } else if (ball.x + BALL_RADIUS > canvas.width) {
		score.player1++;
		updateScoreboard();
		if (score.player1 === WINNING_SCORE) {
		  endGame(1); return;
		} else {
		  resetBall();
		}
	  }
	}
  
	function draw() {
	  context.fillStyle = 'black';
	  context.fillRect(0, 0, canvas.width, canvas.height);
	  context.fillStyle = 'white';
	  context.fillRect(gameObjects.player1.x, gameObjects.player1.y, PADDLE_WIDTH, PADDLE_HEIGHT);
	  context.fillRect(gameObjects.player2.x, gameObjects.player2.y, PADDLE_WIDTH, PADDLE_HEIGHT);
	  context.beginPath();
	  context.arc(gameObjects.ball.x, gameObjects.ball.y, BALL_RADIUS, 0, Math.PI * 2);
	  context.fill();
	}
	
	function updateScoreboard() {
	  let p1Name = 'Jugador 1';
	  let p2Name = gameMode === 'ONE_PLAYER' ? 'IA' : 'Jugador 2';
	  scoreboardElement.textContent = `${p1Name}: ${score.player1} - ${p2Name}: ${score.player2}`;
	}
  
	function gameLoop() {
	  update();
	  draw();
	  animationFrameId = requestAnimationFrame(gameLoop);
	}
  
	function handleKeyDown(event: KeyboardEvent) {
	  switch (event.key.toLowerCase()) {
		case 'w': case 'arrowup': movementP1 = 'up'; break;
		case 's': case 'arrowdown': movementP1 = 'down'; break;
		case 'o': if (gameMode === 'TWO_PLAYERS') movementP2 = 'up'; break;
		case 'l': if (gameMode === 'TWO_PLAYERS') movementP2 = 'down'; break;
	  }
	}
  
	function handleKeyUp(event: KeyboardEvent) {
	  switch (event.key.toLowerCase()) {
		case 'w': case 'arrowup': if (movementP1 === 'up') movementP1 = null; break;
		case 's': case 'arrowdown': if (movementP1 === 'down') movementP1 = null; break;
		case 'o': if (movementP2 === 'up') movementP2 = null; break;
		case 'l': if (movementP2 === 'down') movementP2 = null; break;
	  }
	}
	
	function startGame() {
		if (animationFrameId) return;
		gameOverlay.classList.add('hidden');
		animationFrameId = requestAnimationFrame(gameLoop);
	}
  
	function endGame(winnerPlayerNumber: 1 | 2) {
		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId);
			animationFrameId = null;
		}
		
		const winnerName = winnerPlayerNumber === 1 ? 'Jugador 1' : (gameMode === 'ONE_PLAYER' ? 'IA' : 'Jugador 2');
		winnerMessage.textContent = `¡${winnerName} ha ganado!`;
		startButton.textContent = 'Volver a Jugar';
  
		winnerMessage.classList.remove('hidden');
		gameOverlay.classList.remove('hidden');
	}
  
	container.querySelectorAll('.mode-btn').forEach(button => {
	  button.addEventListener('click', () => {
		gameMode = button.getAttribute('data-mode') as GameMode;
		difficultySelection.style.display = gameMode === 'ONE_PLAYER' ? 'flex' : 'none';
		
		container.querySelectorAll('.mode-btn').forEach(btn => {
		  btn.classList.remove('bg-white', 'text-black');
		  btn.classList.add('bg-gray-700', 'hover:bg-gray-600');
		});
		button.classList.add('bg-white', 'text-black');
		button.classList.remove('bg-gray-700', 'hover:bg-gray-600');
		resetGame();
	  });
	});
  
	container.querySelectorAll('.difficulty-btn').forEach(button => {
	  button.addEventListener('click', () => {
		difficulty = button.getAttribute('data-difficulty') as DifficultyLevel;
		container.querySelectorAll('.difficulty-btn').forEach(btn => {
		  btn.classList.remove('bg-white', 'text-black');
		  btn.classList.add('bg-gray-700', 'hover:bg-gray-600');
		});
		button.classList.add('bg-white', 'text-black');
		button.classList.remove('bg-gray-700', 'hover:bg-gray-600');
	  });
	});
  
	startButton.addEventListener('click', () => {
	  if (animationFrameId) {
		  resetGame();
	  } else {
		  startGame();
	  }
	});
	
	window.addEventListener('keydown', handleKeyDown);
	window.addEventListener('keyup', handleKeyUp);
	resetGame();
  }
  