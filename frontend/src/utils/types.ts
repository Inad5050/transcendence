// src/utils/types.ts

export type MovementDirection = 'up' | 'down' | null;
// Se elimina el modo 'TOURNAMENT'
export type GameMode = 'ONE_PLAYER' | 'TWO_PLAYERS';
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD' | 'IMPOSSIBLE';

export interface Score {
  player1: number;
  player2: number;
}

export interface DifficultyConfig {
  name: string;
  errorMargin: number; 
}

export interface BallObject {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

export interface PaddleObject {
  x: number;
  y: number;
}

export interface GameObjects {
  ball: BallObject;
  player1: PaddleObject;
  player2: PaddleObject;
}
