import { DifficultyLevel, DifficultyConfig } from './types';

// --- CONSTANTES PARA MODO 1 VS 1 Y 2 JUGADORES ---
export const PADDLE_LENGTH_CLASSIC = 100;
export const PADDLE_SPEED_CLASSIC = 8;

// --- CONSTANTES PARA MODO 4 JUGADORES ---
export const PADDLE_LENGTH_4P = 150;
export const PADDLE_SPEED_4P = 12;

// --- CONSTANTES GLOBALES ---
export const PADDLE_THICKNESS = 15;
export const BALL_RADIUS = 10;
export const WINNING_SCORE = 3;
export const INITIAL_BALL_SPEED = 8;
export const ACCELERATION_FACTOR = 1.05;
export const MAX_BOUNCE_ANGLE = Math.PI / 4;
export const PADDLE_INFLUENCE_FACTOR = 0.3;
export const MAX_BALL_SPEED = 15;

export const DIFFICULTY_LEVELS: Record<DifficultyLevel, DifficultyConfig> = {
  EASY: { name: 'Fácil', errorMargin: 70 },
  MEDIUM: { name: 'Medio', errorMargin: 50 },
  HARD: { name: 'Difícil', errorMargin: 15 },
  IMPOSSIBLE: { name: 'Imposible', errorMargin: 0 },
};

export const shuffleArray = <T,>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};
