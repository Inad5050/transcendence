import { navigate } from '../main';
import { playTrack } from '../utils/musicPlayer';
import { GameMode, DifficultyLevel } from '../utils/types';

export function renderCharQP(appElement: HTMLElement): void
{
	if (!appElement)
		return;

	appElement.innerHTML = `
	<div id="main-container" class="h-screen flex flex-col items-center justify-start md:justify-center p-4 md:p-8 relative overflow-y-auto">
        <div class="w-full flex justify-center mb-8">
            <button id="homeButton" class="focus:outline-none focus:ring-4 focus:ring-cyan-300 rounded-lg">
                <img src="/assets/logo.gif" alt="Game Logo" class="w-full max-w-sm md:max-w-2xl">
            </button>
        </div>
		<div class="flex flex-col items-center">
			<div class="bg-gray-800 bg-opacity-75 shadow-lg rounded-xl p-4 md:p-8 flex flex-col items-center space-y-6 mb-8">
				<div id="mode-selection" class="flex flex-wrap justify-center items-center gap-4 md:gap-6">
					<button data-mode="ONE_PLAYER" class="mode-btn bg-[url('/assets/vs_IA.png')] bg-contain bg-no-repeat bg-center h-10 w-28 md:h-12 md:w-36 cursor-pointer transition-transform transform hover:scale-110 opacity-100 border-b-4 border-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-300 rounded-lg"></button>
					<button data-mode="TWO_PLAYERS" class="mode-btn bg-[url('/assets/2_players.png')] bg-contain bg-no-repeat bg-center h-10 w-28 md:h-12 md:w-36 cursor-pointer transition-transform transform hover:scale-110 opacity-50 focus:outline-none focus:ring-4 focus:ring-cyan-300 rounded-lg"></button>
					<button data-mode="FOUR_PLAYERS" class="mode-btn bg-[url('/assets/4_players.png')] bg-contain bg-no-repeat bg-center h-10 w-28 md:h-12 md:w-36 cursor-pointer transition-transform transform hover:scale-110 opacity-50 focus:outline-none focus:ring-4 focus:ring-cyan-300 rounded-lg"></button>
				</div>
				<div id="difficulty-selection" class="flex flex-wrap justify-center items-center gap-4 md:gap-6">
					<button data-difficulty="EASY" class="difficulty-btn bg-[url('/assets/easy.png')] bg-contain bg-no-repeat bg-center h-8 w-24 md:h-10 md:w-32 cursor-pointer transition-transform transform hover:scale-110 opacity-50 focus:outline-none focus:ring-4 focus:ring-cyan-300 rounded-lg"></button>
					<button data-difficulty="MEDIUM" class="difficulty-btn bg-[url('/assets/medium.png')] bg-contain bg-no-repeat bg-center h-8 w-24 md:h-10 md:w-32 cursor-pointer transition-transform transform hover:scale-110 opacity-50 focus:outline-none focus:ring-4 focus:ring-cyan-300 rounded-lg"></button>
					<button data-difficulty="HARD" class="difficulty-btn bg-[url('/assets/hard.png')] bg-contain bg-no-repeat bg-center h-8 w-24 md:h-10 md:w-32 cursor-pointer transition-transform transform hover:scale-110 opacity-100 border-b-4 border-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-300 rounded-lg"></button>
					<button data-difficulty="IMPOSSIBLE" class="difficulty-btn bg-[url('/assets/impossible.png')] bg-contain bg-no-repeat bg-center h-8 w-24 md:h-10 md:w-32 cursor-pointer transition-transform transform hover:scale-110 opacity-50 focus:outline-none focus:ring-4 focus:ring-cyan-300 rounded-lg"></button>
				</div>
			</div>

			<div class="bg-gray-800 bg-opacity-75 shadow-lg rounded-xl p-6 md:p-16 flex flex-col items-center mb-8">
				<img src="/assets/chooseYourFighter.png" alt="Elige tu luchador" class="w-full max-w-sm md:max-w-2xl mb-8 md:mb-12">
				<div id="character-selection" class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-12">
					<img src="/assets/char1_profile.png" alt="Character 1" class="character-portrait w-32 h-32 md:w-64 md:h-64 cursor-pointer border-4 border-white transform hover:scale-110 transition-all duration-200" data-char="1" tabindex="0">
					<img src="/assets/char2_profile.png" alt="Character 2" class="character-portrait w-32 h-32 md:w-64 md:h-64 cursor-pointer border-4 border-white transform hover:scale-110 transition-all duration-200" data-char="2" tabindex="0">
					<img src="/assets/char3_profile.png" alt="Character 3" class="character-portrait w-32 h-32 md:w-64 md:h-64 cursor-pointer border-4 border-white transform hover:scale-110 transition-all duration-200" data-char="3" tabindex="0">
					<img src="/assets/char4_profile.png" alt="Character 4" class="character-portrait w-32 h-32 md:w-64 md:h-64 cursor-pointer border-4 border-white transform hover:scale-110 transition-all duration-200" data-char="4" tabindex="0">
				</div>
			</div>

			<div id="accept-container">
                <button id="accept-button" class="bg-[url('/assets/accept.png')] bg-contain bg-no-repeat bg-center w-64 h-[60px] md:w-80 md:h-[75px] cursor-pointer transform hover:scale-110 transition-transform duration-200 focus:outline-none focus:ring-4 focus:ring-cyan-300 rounded-lg"></button>
			</div>
		</div>
	</div>
	`;

	playTrack('/assets/DangerZone.mp3');

    document.getElementById('homeButton')?.addEventListener('click', () => navigate('/start'));
	const acceptButton = document.getElementById('accept-button');
	const difficultySelectionContainer = document.getElementById('difficulty-selection')!;
	const characterPortraits = document.querySelectorAll('.character-portrait');

	let selectedPortrait: HTMLElement | null = null;
	let gameMode: GameMode = 'ONE_PLAYER';
	let difficulty: DifficultyLevel = 'HARD';

	localStorage.setItem('gameMode', gameMode);
	localStorage.setItem('difficulty', difficulty);

	function selectCharacter(portrait: HTMLElement) {
		if (selectedPortrait) {
			selectedPortrait.classList.remove('border-cyan-400', 'border-8');
			selectedPortrait.classList.add('border-white', 'border-4');
		}
		selectedPortrait = portrait;
		selectedPortrait.classList.remove('border-white', 'border-4');
		selectedPortrait.classList.add('border-cyan-400', 'border-8');
	}

	characterPortraits.forEach(portrait => {
		portrait.addEventListener('click', () => {
			selectCharacter(portrait as HTMLElement);
		});

		portrait.addEventListener('keydown', (event) => {
			if ((event as KeyboardEvent).key === 'Enter') {
				selectCharacter(portrait as HTMLElement);
			}
		});
	});

	acceptButton?.addEventListener('click', (event) => {
		event.stopPropagation();
		if (selectedPortrait) {
			localStorage.setItem('selectedCharacter', selectedPortrait.dataset.char || '1');
			const nextRoute = localStorage.getItem('nextRoute') || '/pong';
			navigate(nextRoute);
		} else {
			alert("Por favor, elige un personaje.");
		}
	});

	appElement.querySelectorAll('.mode-btn').forEach(button => {
		button.addEventListener('click', () => {
			gameMode = button.getAttribute('data-mode') as GameMode;
			localStorage.setItem('gameMode', gameMode);
			difficultySelectionContainer.style.display = gameMode === 'ONE_PLAYER' ? 'flex' : 'none';
			
			appElement.querySelectorAll('.mode-btn').forEach(btn => {
				btn.classList.remove('opacity-100', 'border-b-4', 'border-cyan-400');
				btn.classList.add('opacity-50');
			});
			button.classList.add('opacity-100', 'border-b-4', 'border-cyan-400');
			button.classList.remove('opacity-50');
		});
	});
  
	appElement.querySelectorAll('.difficulty-btn').forEach(button => {
		button.addEventListener('click', () => {
			difficulty = button.getAttribute('data-difficulty') as DifficultyLevel;
			localStorage.setItem('difficulty', difficulty);
			appElement.querySelectorAll('.difficulty-btn').forEach(btn => {
				btn.classList.remove('opacity-100', 'border-b-4', 'border-cyan-400');
				btn.classList.add('opacity-50');
			});
			button.classList.add('opacity-100', 'border-b-4', 'border-cyan-400');
			button.classList.remove('opacity-50');
		});
	});
}