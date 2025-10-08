// src/utils/constants.ts
import { DifficultyLevel, DifficultyConfig } from './types';

export const PADDLE_WIDTH = 10;
export const PADDLE_HEIGHT = 100;
export const BALL_RADIUS = 10;
export const WINNING_SCORE = 3;
export const PADDLE_SPEED = 8;
export const INITIAL_BALL_SPEED = 5;
export const ACCELERATION_FACTOR = 1.05;
export const BOUNCE_ANGLE_FACTOR = 15;
export const MAX_BOUNCE_ANGLE = Math.PI / 4;

export const DIFFICULTY_LEVELS: Record<DifficultyLevel, DifficultyConfig> = {
  EASY: { name: 'Fácil', errorMargin: 70 },
  MEDIUM: { name: 'Medio', errorMargin: 50 },
  HARD: { name: 'Difícil', errorMargin: 15 },
  IMPOSSIBLE: { name: 'Imposible', errorMargin: 0 },
};

// Función de ayuda para mezclar un array
export const shuffleArray = <T,>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};
