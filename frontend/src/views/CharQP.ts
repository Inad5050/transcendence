import { navigate } from '../main';
import { playTrack } from '../musicPlayer';
import { GameMode, DifficultyLevel } from '../utils/types';

export function renderCharQP(appElement: HTMLElement): void
{
	if (!appElement)
		return;

	appElement.innerHTML = `
	<div id="main-container" class="min-h-screen flex flex-col items-center justify-center p-8 relative">

		<div id="character-art-container" class="absolute left-0 top-0 h-full w-1/3 flex items-center justify-center">
		</div>

		<div class="flex flex-col items-center">
			
			<div class="bg-gray-800 bg-opacity-75 shadow-lg rounded-xl p-8 flex flex-col items-center space-y-6 mb-8">
				<div id="mode-selection" class="flex justify-center items-center gap-6">
					<img src="/assets/vs_IA.png" alt="vs IA" data-mode="ONE_PLAYER" class="mode-btn h-12 cursor-pointer transition-transform transform hover:scale-110 opacity-100 border-b-4 border-cyan-400">
					<img src="/assets/2_players.png" alt="2 Players" data-mode="TWO_PLAYERS" class="mode-btn h-12 cursor-pointer transition-transform transform hover:scale-110 opacity-50">
					<img src="/assets/4_players.png" alt="4 Players" data-mode="FOUR_PLAYERS" class="mode-btn h-12 cursor-pointer transition-transform transform hover:scale-110 opacity-50">
				</div>
				<div id="difficulty-selection" class="flex justify-center items-center gap-6">
					<img src="/assets/easy.png" alt="Easy" data-difficulty="EASY" class="difficulty-btn h-10 cursor-pointer transition-transform transform hover:scale-110 opacity-100 border-b-4 border-cyan-400">
					<img src="/assets/medium.png" alt="Medium" data-difficulty="MEDIUM" class="difficulty-btn h-10 cursor-pointer transition-transform transform hover:scale-110 opacity-50">
					<img src="/assets/hard.png" alt="Hard" data-difficulty="HARD" class="difficulty-btn h-10 cursor-pointer transition-transform transform hover:scale-110 opacity-50">
					<img src="/assets/impossible.png" alt="Impossible" data-difficulty="IMPOSSIBLE" class="difficulty-btn h-10 cursor-pointer transition-transform transform hover:scale-110 opacity-50">
				</div>
			</div>

			<div class="bg-gray-800 bg-opacity-75 shadow-lg rounded-xl p-16 flex flex-col items-center mb-8">
				<img src="/assets/chooseYourFighter.png" alt="Elige tu luchador" class="w-full max-w-2xl mb-12">
				<div id="character-selection" class="grid grid-cols-4 gap-12">
					<img src="/assets/char1_profile.png" alt="Character 1" class="character-portrait w-64 h-64 cursor-pointer border-4 border-white transform hover:scale-110 transition-all duration-200" data-char="1">
					<img src="/assets/char2_profile.png" alt="Character 2" class="character-portrait w-64 h-64 cursor-pointer border-4 border-white transform hover:scale-110 transition-all duration-200" data-char="2">
					<img src="/assets/char3_profile.png" alt="Character 3" class="character-portrait w-64 h-64 cursor-pointer border-4 border-white transform hover:scale-110 transition-all duration-200" data-char="3">
					<img src="/assets/char4_profile.png" alt="Character 4" class="character-portrait w-64 h-64 cursor-pointer border-4 border-white transform hover:scale-110 transition-all duration-200" data-char="4">
				</div>
			</div>

			<div id="accept-container">
				<img src="/assets/accept.png" alt="Accept" id="accept-button" class="w-80 cursor-pointer transform hover:scale-110 transition-transform duration-200">
			</div>
		</div>
	</div>
	`;

	playTrack('/assets/Techno_Syndrome.mp3');

	const mainContainer = document.getElementById('main-container') as HTMLDivElement;
	const artContainer = document.getElementById('character-art-container') as HTMLDivElement;
	const selectionContainer = document.getElementById('character-selection');
	const acceptButton = document.getElementById('accept-button');
	const difficultySelectionContainer = document.getElementById('difficulty-selection')!;

	let selectedPortrait: HTMLElement | null = null;
	let gameMode: GameMode = 'ONE_PLAYER';
	let difficulty: DifficultyLevel = 'EASY';

	// Guardar las selecciones por defecto en localStorage
	localStorage.setItem('gameMode', gameMode);
	localStorage.setItem('difficulty', difficulty);

	function deselect() {
		if (selectedPortrait) {
			selectedPortrait.classList.remove('border-8');
			selectedPortrait.classList.add('border-4');
		}
		selectedPortrait = null;
		artContainer.innerHTML = '';
	}

	selectionContainer?.addEventListener('click', (event) => {
		event.stopPropagation();
		const target = event.target as HTMLElement;

		if (target.classList.contains('character-portrait')) {
			if (selectedPortrait) {
				selectedPortrait.classList.remove('border-8');
				selectedPortrait.classList.add('border-4');
			}
			
			selectedPortrait = target;
			selectedPortrait.classList.remove('border-4');
			selectedPortrait.classList.add('border-8');
			
			const charId = selectedPortrait.dataset.char;
			if (charId) {
				const heightClass = charId === '2' ? 'h-[50vh]' : 'h-[60vh]';
				artContainer.innerHTML = `<img src="/assets/char${charId}_full.png" alt="Character ${charId} Full Art" class="${heightClass} max-w-full object-contain">`;
			}
		}
	});

	mainContainer.addEventListener('click', deselect);

	acceptButton?.addEventListener('click', (event) => {
		event.stopPropagation();
		if (selectedPortrait) {
			localStorage.setItem('selectedCharacter', selectedPortrait.dataset.char || '1');
			navigate('/pong');
		}
	});

	// Lógica para los botones de modo de juego y dificultad
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
