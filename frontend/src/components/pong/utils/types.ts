// src/pong/utils/types.ts

export type MovementDirection = 'up' | 'down' | null;
export type GameMode = 'ONE_PLAYER' | 'TWO_PLAYERS' | 'TOURNAMENT';
export type TournamentState = 'SETUP' | 'IN_PROGRESS' | 'FINISHED';
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';

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

export interface Match {
  p1: string;
  p2: string;
  winner: string | null;
}
