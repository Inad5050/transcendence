import { navigate } from '../main';
import { playTrack } from '../utils/musicPlayer';
import i18next from '../utils/i18n';

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
            <button data-mode="HvsH" class="mode-btn relative h-12 w-28 cursor-pointer transition-transform transform hover:scale-110 opacity-100 focus:outline-none focus:ring-4 focus:ring-cyan-300 rounded-lg">
                <img src="/assets/PvP.png" alt="PvP" class="absolute inset-0 w-full h-full object-contain">
            </button>
            <button data-mode="HvsAI" class="mode-btn relative h-12 w-28 cursor-pointer transition-transform transform hover:scale-110 opacity-50 focus:outline-none focus:ring-4 focus:ring-cyan-300 rounded-lg">
                <img src="/assets/vs_IA.png" alt="${i18next.t('vsIA')}" class="absolute inset-0 w-full h-full object-contain">
            </button>
		  </div>
		</header>
        <div id="game-board" class="grid grid-cols-3 gap-2 bg-black">
            ${Array.from({ length: 9 }).map((_, i) => `<div class="cell w-28 h-28 md:w-40 md:h-40 bg-gray-800 flex items-center justify-center text-6xl cursor-pointer border-2 border-cyan-400 hover:bg-gray-700" data-cell-index="${i}" role="button" tabindex="0"></div>`).join('')}
        </div>
        <div id="game-overlay" class="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center bg-black bg-opacity-75 gap-4" style="display: none;">
            <h1 id="winner-message" class="text-5xl font-black text-center text-cyan-400 p-4 rounded-lg"></h1>
            <button id="restart-button" class="px-8 py-4 text-2xl rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-110 bg-cyan-400 text-gray-900 hover:bg-white">${i18next.t('playAgain')}</button>
        </div>
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
      const winnerText = currentPlayer === 'X' ? i18next.t('playerXWins') : i18next.t('playerOWins');
      winnerMessage.innerHTML = winnerText;
      isGameActive = false;
      gameOverlay.style.display = 'flex';
      return;
    }

    if (!gameState.includes("")) {
      winnerMessage.innerHTML = i18next.t('draw');
      isGameActive = false;
      gameOverlay.style.display = 'flex';
      return;
    }

    handlePlayerChange();
  }

  function handlePlayerChange() {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
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
          if ((e as KeyboardEvent).key === 'Enter' || (e as KeyboardEvent).key === ' ') {
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
        btn.classList.remove('opacity-100', 'border-b-4', 'border-cyan-400');
        btn.classList.add('opacity-50');
      });
      button.classList.add('opacity-100', 'border-b-4', 'border-cyan-400');
      button.classList.remove('opacity-50');
    });
  });
}