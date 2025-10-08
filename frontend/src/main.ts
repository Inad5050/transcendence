import { initializePongGame } from './pong';
import './index.css';

// Obtener el contenedor del juego
const pongContainer = document.getElementById('pong-game-container')!;

// Inicializar el juego de Pong
if (pongContainer) {
  try {
    initializePongGame(pongContainer);
  } catch (error) {
    console.error('Error al inicializar el juego de Pong:', error);
  }
}
