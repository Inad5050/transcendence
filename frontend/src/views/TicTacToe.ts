import { navigate } from '../main';
import { playTrack } from '../utils/musicPlayer';

export function renderTicTacToe(container: HTMLElement): void {
	container.innerHTML = `
	<div class="h-screen w-full flex flex-col items-center justify-center p-4 text-white overflow-y-auto">
	  <div class="w-full flex justify-center my-8">
		<button id="homeButton" class="focus:outline-none focus:ring-4 focus:ring-cyan-300 rounded-lg">
			<img src="/assets/logo.gif" alt="Game Logo" class="w-full max-w-sm md:max-w-2xl">
		</button>
	  </div>
	  <div class="w-full max-w-md">
		<header class="p-4 bg-gray-800 rounded-xl mb-4 text-center space-y-3">
		  <div id="mode-selection" class="flex flex-wrap justify-center items-center gap-4">
			<button data-mode="HvsH" class="mode-btn bg-[url('/assets/PvP.png')] bg-contain bg-no-repeat bg-center h-12 w-28 cursor-pointer transition-transform transform hover:scale-110 opacity-100 focus:outline-none focus:ring-4 focus:ring-cyan-300 rounded-lg"></button>
			<button data-mode="HvsAI" class="mode-btn bg-[url('/assets/vs_IA.png')] bg-contain bg-no-repeat bg-center h-12 w-28 cursor-pointer transition-transform transform hover:scale-110 opacity-100 focus:outline-none focus:ring-4 focus:ring-cyan-300 rounded-lg"></button>
		  </div>
		  <h1 id="status-display" class="font-extrabold text-3xl text-cyan-400 pt-2">Turno del Jugador X</h1>
		</header>
		<main class="relative">
		  <div id="game-board" class="grid grid-cols-3 gap-4">
			${Array(9).fill(0).map((_, i) => `
			  <div data-cell-index="${i}" class="cell w-full aspect-square bg-black border-4 border-cyan-400 rounded-lg flex items-center justify-center text-6xl font-black cursor-pointer hover:bg-gray-900 transition-colors duration-200" tabindex="0"></div>
			`).join('')}
		  </div>
		  <div id="game-overlay" class="absolute top-0 left-0 w-full h-full flex-col justify-center items-center bg-gray-900/90 gap-4 hidden">
			<h1 id="winner-message" class="text-5xl font-black text-cyan-400 p-4 rounded-lg"></h1>
			<button id="restart-button" class="px-8 py-4 font-bold text-lg rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1 bg-cyan-400 text-gray-900 hover:bg-white">Jugar de Nuevo</button>
		  </div>
		</main>
	  </div>
	</div>
	`;

  playTrack('/assets/Techno_Syndrome.mp3');
  document.getElementById('homeButton')?.addEventListener('click', () => navigate('/start'));

  const statusDisplay = container.querySelector('#status-display')!;
  const cells = container.querySelectorAll('.cell');
  const gameOverlay = container.querySelector('#game-overlay') as HTMLElement;
  const winnerMessage = container.querySelector('#winner-message')!;
  const restartButton = container.querySelector('#restart-button')!;

  let gameMode = "HvsH";
  let isGameActive = true;
  let currentPlayer = "X";
  let gameState = ["", "", "", "", "", "", "", "", ""];

  const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  function handleResultValidation() {
    let roundWon = false;
    for (const winCondition of winningConditions) {
      const a = gameState[winCondition[0]];
      const b = gameState[winCondition[1]];
      const c = gameState[winCondition[2]];
      if (a === '' || b === '' || c === '') continue;
      if (a === b && b === c) {
        roundWon = true;
        break;
      }
    }

    if (roundWon) {
      const winner = currentPlayer === 'X' ? 'Jugador X' : (gameMode === 'HvsAI' ? 'IA' : 'Jugador O');
      statusDisplay.innerHTML = `¡${winner} ha ganado!`;
      winnerMessage.innerHTML = `¡Gana ${winner}!`;
      isGameActive = false;
      gameOverlay.style.display = 'flex';
      return;
    }

    if (!gameState.includes("")) {
      statusDisplay.innerHTML = `¡Es un empate!`;
      winnerMessage.innerHTML = '¡Empate!';
      isGameActive = false;
      gameOverlay.style.display = 'flex';
      return;
    }

    handlePlayerChange();
  }

  function handlePlayerChange() {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    const nextPlayerText = currentPlayer === 'X' ? 'Jugador X' : (gameMode === 'HvsAI' ? 'IA' : 'Jugador O');
    statusDisplay.innerHTML = `Turno de ${nextPlayerText}`;

    if (gameMode === 'HvsAI' && currentPlayer === 'O' && isGameActive) {
      container.querySelector('#game-board')!.classList.add('pointer-events-none');
      setTimeout(makeAIMove, 700);
    }
  }
  
  function handleCellPlayed(cell: HTMLElement, cellIndex: number) {
    gameState[cellIndex] = currentPlayer;
    cell.innerHTML = currentPlayer;
    cell.classList.add(currentPlayer === 'X' ? 'text-cyan-400' : 'text-white');
    handleResultValidation();
  }

  function handleCellClick(event: Event) {
    const clickedCell = event.target as HTMLElement;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index')!);

    if (gameState[clickedCellIndex] !== "" || !isGameActive) {
      return;
    }
    if (gameMode === 'HvsAI' && currentPlayer === 'O') {
      return;
    }
    
    handleCellPlayed(clickedCell, clickedCellIndex);
  }

  function makeAIMove() {
    const bestMove = findBestMove();
    if (bestMove !== -1) {
      const cell = container.querySelector(`[data-cell-index='${bestMove}']`) as HTMLElement;
      handleCellPlayed(cell, bestMove);
    }
    container.querySelector('#game-board')!.classList.remove('pointer-events-none');
  }

  function findBestMove(): number {
    for (let i = 0; i < 9; i++) {
      if (gameState[i] === "") {
        gameState[i] = "O";
        if (checkWinner("O")) {
          gameState[i] = "";
          return i;
        }
        gameState[i] = "";
      }
    }

    for (let i = 0; i < 9; i++) {
      if (gameState[i] === "") {
        gameState[i] = "X";
        if (checkWinner("X")) {
          gameState[i] = "";
          return i;
        }
        gameState[i] = "";
      }
    }
    
    if (gameState[4] === "") return 4;

    const corners = [0, 2, 6, 8];
    const emptyCorners = corners.filter(i => gameState[i] === "");
    if (emptyCorners.length > 0) {
      return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
    }

    const sides = [1, 3, 5, 7];
    const emptySides = sides.filter(i => gameState[i] === "");
    if (emptySides.length > 0) {
      return emptySides[Math.floor(Math.random() * emptySides.length)];
    }
    
    return -1;
  }

  function checkWinner(player: string): boolean {
    return winningConditions.some(condition => {
      return condition.every(index => gameState[index] === player);
    });
  }

  function handleRestartGame() {
    isGameActive = true;
    currentPlayer = "X";
    gameState = ["", "", "", "", "", "", "", "", ""];
    statusDisplay.innerHTML = `Turno del Jugador X`;
    cells.forEach(cell => {
      cell.innerHTML = "";
      cell.classList.remove('text-cyan-400', 'text-white');
    });
    gameOverlay.style.display = 'none';
    container.querySelector('#game-board')!.classList.remove('pointer-events-none');
  }

  cells.forEach(cell => {
      cell.addEventListener('click', handleCellClick);
      cell.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
              handleCellClick(e);
          }
      });
  });

  restartButton.addEventListener('click', handleRestartGame);
  container.querySelectorAll('.mode-btn').forEach(button => {
    button.addEventListener('click', () => {
      gameMode = button.getAttribute('data-mode') as string;
      handleRestartGame();

      container.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('opacity-100');
        btn.classList.add('opacity-50');
      });
      button.classList.add('opacity-100');
      button.classList.remove('opacity-50');
    });
  });
}