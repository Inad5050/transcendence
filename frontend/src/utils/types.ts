// frontend/src/utils/types.ts

export type MovementDirection = 'up' | 'down' | 'left' | 'right' | null;
export type GameMode = 'ONE_PLAYER' | 'TWO_PLAYERS' | 'FOUR_PLAYERS';
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD' | 'IMPOSSIBLE';

// Ahora 'Score' puede manejar tanto el modo normal como el de 4 jugadores
export interface Score {
  [key: string]: number;
}

export interface DifficultyConfig {
  name: string;
  speedMultiplier: number; 
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
  width: number;
  height: number;
  isAlive: boolean; // Nuevo: para saber si el jugador sigue en partida
}

export interface GameObjects {
  ball: BallObject;
  player1: PaddleObject;
  player2: PaddleObject;
  player3: PaddleObject;
  player4: PaddleObject;
}
