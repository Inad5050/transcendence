// src/pong/hooks/useGameEngine.ts
import { useRef, useCallback, useEffect } from 'react';
import { GameObjects, Score } from '../utils/types';
import {
  INITIAL_BALL_SPEED, PADDLE_HEIGHT, PADDLE_WIDTH,
  WINNING_SCORE, BALL_RADIUS, PADDLE_SPEED,
  ACCELERATION_FACTOR, BOUNCE_ANGLE_FACTOR
} from '../utils/constants';

// Props que el hook necesita para funcionar
interface GameEngineProps {
  isPaused: boolean;
  winner: string | null;
  score: Score;
  setScore: React.Dispatch<React.SetStateAction<Score>>;
  setWinner: React.Dispatch<React.SetStateAction<string | null>>;
  movementP1: string | null;
  movementP2: string | null;
  isOnePlayerMode: boolean;
  currentDifficulty: { errorMargin: number };
  isStarted: boolean;
  resetBall: (canvas: HTMLCanvasElement) => void;
}

export const useGameEngine = ({
  isPaused, winner, score, setScore, setWinner,
  movementP1, movementP2, isOnePlayerMode,
  currentDifficulty, isStarted, resetBall
}: GameEngineProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameObjects = useRef<GameObjects | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Inicialización de los objetos del juego
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!gameObjects.current && canvas) {
      gameObjects.current = {
        ball: { x: canvas.width / 2, y: canvas.height / 2, dx: INITIAL_BALL_SPEED, dy: INITIAL_BALL_SPEED },
        player1: { x: 0, y: canvas.height / 2 - PADDLE_HEIGHT / 2 },
        player2: { x: canvas.width - PADDLE_WIDTH, y: canvas.height / 2 - PADDLE_HEIGHT / 2 }
      };
    }
  }, []);

  const gameLoop = useCallback(() => {
    if (isPaused || winner) {
      animationFrameId.current = requestAnimationFrame(gameLoop);
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!context || !canvas || !gameObjects.current) {
      animationFrameId.current = requestAnimationFrame(gameLoop);
      return;
    }
    
    const { ball, player1, player2 } = gameObjects.current;

    ball.x += ball.dx;
    ball.y += ball.dy;

    if (movementP1 === 'up') { player1.y -= PADDLE_SPEED; }
    else if (movementP1 === 'down') { player1.y += PADDLE_SPEED; }
    player1.y = Math.max(0, Math.min(player1.y, canvas.height - PADDLE_HEIGHT));

    if (isOnePlayerMode) {
      const targetY = ball.y - PADDLE_HEIGHT / 2;
      const deltaY = targetY - player2.y;
      if (Math.abs(deltaY) > currentDifficulty.errorMargin) {
        player2.y += Math.sign(deltaY) * Math.min(PADDLE_SPEED, Math.abs(deltaY));
      }
    } else {
      if (movementP2 === 'up') { player2.y -= PADDLE_SPEED; }
      else if (movementP2 === 'down') { player2.y += PADDLE_SPEED; }
    }
    player2.y = Math.max(0, Math.min(player2.y, canvas.height - PADDLE_HEIGHT));

    if (ball.y + BALL_RADIUS > canvas.height || ball.y - BALL_RADIUS < 0) { ball.dy *= -1; }

    if (ball.dx < 0 && ball.x - BALL_RADIUS < PADDLE_WIDTH && ball.y > player1.y && ball.y < player1.y + PADDLE_HEIGHT) {
      const relativeImpact = (ball.y - player1.y) / PADDLE_HEIGHT;
      ball.dy = (relativeImpact - 0.5) * BOUNCE_ANGLE_FACTOR;
      ball.dx *= -ACCELERATION_FACTOR;
    }

    if (ball.dx > 0 && ball.x + BALL_RADIUS > canvas.width - PADDLE_WIDTH && ball.y > player2.y && ball.y < player2.y + PADDLE_HEIGHT) {
      const relativeImpact = (ball.y - player2.y) / PADDLE_HEIGHT;
      ball.dy = (relativeImpact - 0.5) * BOUNCE_ANGLE_FACTOR;
      ball.dx *= -ACCELERATION_FACTOR;
    }

    if (ball.x - BALL_RADIUS < 0) {
      const newScoreP2 = score.player2 + 1;
      setScore(s => ({ ...s, player2: newScoreP2 }));
      if (newScoreP2 === WINNING_SCORE) setWinner(isOnePlayerMode ? 'Jugador 2 (IA)' : 'Jugador 2');
      else resetBall(canvas);
    } else if (ball.x + BALL_RADIUS > canvas.width) {
      const newScoreP1 = score.player1 + 1;
      setScore(s => ({ ...s, player1: newScoreP1 }));
      if (newScoreP1 === WINNING_SCORE) setWinner('Jugador 1');
      else resetBall(canvas);
    }

    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'white';
    context.fillRect(player1.x, player1.y, PADDLE_WIDTH, PADDLE_HEIGHT);
    context.fillRect(player2.x, player2.y, PADDLE_WIDTH, PADDLE_HEIGHT);
    context.beginPath();
    context.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
    context.fill();

    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [
    isPaused, winner, score, movementP1, movementP2, isOnePlayerMode,
    currentDifficulty, resetBall, setScore, setWinner
  ]);

  useEffect(() => {
    if (isStarted && !winner) {
      animationFrameId.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [isStarted, winner, gameLoop]);
  
  // Exponemos la ref del canvas y los objetos para que `resetBall` pueda acceder a ellos
  return { canvasRef, gameObjects };
};
