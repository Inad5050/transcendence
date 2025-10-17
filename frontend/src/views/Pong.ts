import { navigate } from '../main';
import { playTrack } from '../utils/musicPlayer';
import { GameObjects, Score, GameMode, DifficultyLevel, PaddleObject, BallObject } from '../utils/types';
import { PADDLE_THICKNESS, BALL_RADIUS, WINNING_SCORE, INITIAL_BALL_SPEED, ACCELERATION_FACTOR, DIFFICULTY_LEVELS, MAX_BOUNCE_ANGLE, PADDLE_INFLUENCE_FACTOR, MAX_BALL_SPEED, PADDLE_LENGTH_CLASSIC, PADDLE_SPEED_CLASSIC, PADDLE_LENGTH_4P, PADDLE_SPEED_4P, shuffleArray } from '../utils/constants';
import i18next from '../utils/i18n';
import { authenticatedFetch } from '../utils/auth';

export function initializePongGame(container: HTMLElement) {
	container.innerHTML = `
	  <div class="h-screen w-full flex flex-col items-center justify-center p-4 text-white font-press-start">
		<main class="relative w-full max-w-6xl">
			<canvas id="pong-canvas" class="w-full block shadow-2xl shadow-cyan-400/50 border-4 border-cyan-400 bg-black"></canvas>
			<div id="game-overlay" class="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center bg-black bg-opacity-75 gap-4">
			  <h1 id="winner-message" class="text-5xl font-black text-center text-cyan-400 p-4 rounded-lg hidden"></h1>
			  <button id="start-button" class="px-8 py-4 text-2xl rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-110 bg-cyan-400 text-gray-900 hover:bg-white">Empezar Partida</button>
			</div>
		</main>
		<button id="homeButton" class="mt-8 px-8 py-4 text-lg rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-110 bg-gray-700 text-white hover:bg-gray-600">Volver al Inicio</button>
	  </div>
	`;

	playTrack('/assets/DangerZone.mp3');
    document.getElementById('homeButton')?.addEventListener('click', () => navigate('/start'));

	const canvas = container.querySelector('#pong-canvas') as HTMLCanvasElement;
	const context = canvas.getContext('2d')!;
	const gameOverlay = container.querySelector('#game-overlay') as HTMLElement;
	const winnerMessage = container.querySelector('#winner-message')!;
	const startButton = container.querySelector('#start-button')!;
	
	type GameState = 'MENU' | 'PLAYING' | 'SCORED' | 'GAME_OVER';
	let gameState: GameState = 'MENU';
	
	let score: Score;
	let gameObjects: GameObjects;
	let animationFrameId: number | null = null;
  	let matchId: number | null = null;
  
	const gameMode: GameMode = localStorage.getItem('gameMode') as GameMode || 'ONE_PLAYER';
	const difficulty: DifficultyLevel = localStorage.getItem('difficulty') as DifficultyLevel || 'EASY';
	
	const keysPressed: { [key: string]: boolean } = {};
	let playerVelocities = { p1: 0, p2: 0, p3: 0, p4: 0 };
  
	function checkCollision(ball: BallObject, paddle: PaddleObject): boolean {
		if (!paddle.isAlive) return false;
		const closestX = Math.max(paddle.x, Math.min(ball.x, paddle.x + paddle.width));
		const closestY = Math.max(paddle.y, Math.min(ball.y, paddle.y + paddle.height));
		const distanceX = ball.x - closestX;
		const distanceY = ball.y - closestY;
		const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
		return distanceSquared < (BALL_RADIUS * BALL_RADIUS);
	}

	function resetBall() {
		const { ball, player1, player2, player3, player4 } = gameObjects;
		ball.x = canvas.width / 2;
		ball.y = canvas.height / 2;
	
		const paddleLengthV = gameMode === 'FOUR_PLAYERS' ? PADDLE_LENGTH_4P : PADDLE_LENGTH_CLASSIC;
		player1.y = canvas.height / 2 - paddleLengthV / 2;
		player2.y = canvas.height / 2 - paddleLengthV / 2;
		if (gameMode === 'FOUR_PLAYERS') {
		  const paddleLengthH = PADDLE_LENGTH_4P;
		  player3.x = canvas.width / 2 - paddleLengthH / 2;
		  player4.x = canvas.width / 2 - paddleLengthH / 2;
		}
	
		let angle;
		if (gameMode === 'FOUR_PLAYERS') {
		  angle = Math.random() * 2 * Math.PI;
		} else {
		  const maxAngle = Math.PI / 6;
		  angle = (Math.random() - 0.5) * 2 * maxAngle;
		  if (Math.random() > 0.5) angle += Math.PI;
		}
	
		ball.dx = Math.cos(angle) * INITIAL_BALL_SPEED;
		ball.dy = Math.sin(angle) * INITIAL_BALL_SPEED;
	}

	function resetGame() {
		gameState = 'MENU';
	
		const PADDLE_LENGTH = gameMode === 'FOUR_PLAYERS' ? PADDLE_LENGTH_4P : PADDLE_LENGTH_CLASSIC;
		if (gameMode === 'FOUR_PLAYERS') {
		  canvas.width = 1000; canvas.height = 1000;
		  canvas.classList.add('aspect-square');
		  score = { p1: 3, p2: 3, p3: 3, p4: 3 };
		} else {
		  canvas.width = 1200; canvas.height = 900;
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

		winnerMessage.classList.add('hidden');
		gameOverlay.classList.remove('hidden');
		startButton.textContent = 'Empezar Partida';
	}

	function update() {
		if (gameState !== 'PLAYING') return;
	
		const PADDLE_SPEED = gameMode === 'FOUR_PLAYERS' ? PADDLE_SPEED_4P : PADDLE_SPEED_CLASSIC;
		const { ball, player1, player2, player3, player4 } = gameObjects;
	
		if (player1.isAlive) {
		  playerVelocities.p1 = (keysPressed['s'] ? PADDLE_SPEED : 0) - (keysPressed['w'] ? PADDLE_SPEED : 0);
		  player1.y += playerVelocities.p1;
		}
		if (player2.isAlive) {
		  if (gameMode === 'ONE_PLAYER') {
			const currentDifficulty = DIFFICULTY_LEVELS[difficulty];
				const aiMaxSpeed = PADDLE_SPEED * currentDifficulty.speedMultiplier;
				const targetY = ball.y - player2.height / 2;
				const deltaY = targetY - player2.y;
				player2.y += Math.max(-aiMaxSpeed, Math.min(aiMaxSpeed, deltaY));
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
	
		const alivePlayers = Object.values(gameObjects).filter(obj => obj && obj.isAlive).length;
	
		if (gameMode === 'FOUR_PLAYERS' && alivePlayers <= 1) {
			const winnerKey = Object.keys(score).find(k => (score as any)[k] > 0);
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
	
		context.strokeStyle = 'rgba(255, 255, 255, 0.75)';
		context.lineWidth = 5;
		context.setLineDash([15, 15]);
		context.beginPath();
		if (gameMode === 'FOUR_PLAYERS') {
			context.moveTo(0, canvas.height / 2);
			context.lineTo(canvas.width, canvas.height / 2);
		}
		context.moveTo(canvas.width / 2, 0);
		context.lineTo(canvas.width / 2, canvas.height);
		context.stroke();
		context.setLineDash([]);
	
		context.font = "48px 'Press Start 2P'";
		context.fillStyle = 'rgba(255, 255, 255, 0.75)';
		context.textAlign = 'center';
	
		if (gameMode === 'FOUR_PLAYERS') {
			context.fillText(`${score.p3 || 3}`, canvas.width / 2, 60);
			context.fillText(`${score.p1 || 3}`, 60, canvas.height / 2 + 15);
			context.fillText(`${score.p2 || 3}`, canvas.width - 60, canvas.height / 2 + 15);
			context.fillText(`${score.p4 || 3}`, canvas.width / 2, canvas.height - 30);
		} else {
			context.fillText(`${score.p1 || 0}`, canvas.width / 4, 60);
			context.fillText(`${score.p2 || 0}`, (canvas.width / 4) * 3, 60);
		}
	
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

	function gameLoop() {
		update();
		draw();
		animationFrameId = requestAnimationFrame(gameLoop);
	}

	async function startGame() {
		if (gameState === 'PLAYING') return;
	  
		const user = JSON.parse(localStorage.getItem('user') || '{}');
		const player_one_id = user.id;
		const player_two_id = (gameMode === 'ONE_PLAYER') ? 0 : -1; 
	  
		const matchData = {
		  player_one_id: player_one_id,
		  player_two_id: player_two_id,
		  game: 'pong',
		  match_type: gameMode === 'ONE_PLAYER' ? 'ia' : 'local',
		  match_status: 'playing',
		};
	  
		try {
		  const response = await authenticatedFetch('/api/match/create', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(matchData),
		  });
	  
		  if (!response.ok) {
            const errorData = await response.json();
			throw new Error(errorData.error?.message || 'Failed to create match on the server.');
		  }
	  
		  const result = await response.json();
		  if (!result.id) {
			throw new Error('Server did not return a match ID.');
		  }
		  matchId = result.id;
	  
		  gameState = 'PLAYING';
		  gameOverlay.classList.add('hidden');
		  resetBall();
	  
		  if (!animationFrameId) {
			animationFrameId = requestAnimationFrame(gameLoop);
		  }
		} catch (error) {
		  console.error("Error starting game:", error);
		  alert("Error al iniciar la partida: " + (error as Error).message);
		}
	}

	async function endGame(winner: number) {
		gameState = 'GAME_OVER';
		if (animationFrameId) cancelAnimationFrame(animationFrameId);
		animationFrameId = null;
  
		let winnerName = `${i18next.t('player')} ${winner}`;
		if (gameMode === 'ONE_PLAYER' && winner === 2) winnerName = i18next.t('ai');
  
		winnerMessage.textContent = i18next.t('winnerMessage', { winnerName });
		startButton.textContent = i18next.t('playAgain');
		winnerMessage.classList.remove('hidden');
		gameOverlay.classList.remove('hidden');

		if (matchId) {
			const finalData = {
			  match_status: 'finish',
			  player_one_points: score.p1,
			  player_two_points: score.p2
			};
		
			try {
				const response = await authenticatedFetch(`/api/match/update/${matchId}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(finalData),
				});
				if (!response.ok) {
					throw new Error('Failed to update match on server.');
				}
				const { playerOne: updatedPlayerOne, playerTwo: updatedPlayerTwo } = await response.json();
				const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
				if (updatedPlayerOne && currentUser.id === updatedPlayerOne.id) {
					localStorage.setItem('user', JSON.stringify(updatedPlayerOne));
					console.log('ELO actualizado en localStorage para Jugador 1:', updatedPlayerOne.elo);
				} else if (updatedPlayerTwo && currentUser.id === updatedPlayerTwo.id) {
					localStorage.setItem('user', JSON.stringify(updatedPlayerTwo));
					console.log('ELO actualizado en localStorage para Jugador 2:', updatedPlayerTwo.elo);
				}
			} catch (error) {
			  console.error("Error updating match and user ELO:", error);
			}
		}
	}

	function handleKeyDown(event: KeyboardEvent) { keysPressed[event.key.toLowerCase()] = true; }
	function handleKeyUp(event: KeyboardEvent) { keysPressed[event.key.toLowerCase()] = false; }
	
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
