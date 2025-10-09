import { navigate } from '../main';
import { playTrack } from '../musicPlayer';
import { GameMode, DifficultyLevel } from '../utils/types';

export function renderCharQP(appElement: HTMLElement): void
{
	if (!appElement)
		return;

	appElement.innerHTML = `
	<div id="main-container" class="min-h-screen flex flex-col items-center justify-center p-8 relative">

		<div class="relative flex justify-center items-start">
			
			<div id="character-art-container" class="absolute right-full top-0 h-full w-[30vw] min-w-[450px] flex items-center justify-end pr-8">
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
	</div>
	`;

	playTrack('/assets/Techno_Syndrome.mp3');

	const artContainer = document.getElementById('character-art-container') as HTMLDivElement;
	const selectionContainer = document.getElementById('character-selection');
	const acceptButton = document.getElementById('accept-button');
	const difficultySelectionContainer = document.getElementById('difficulty-selection')!;
	const portraits = appElement.querySelectorAll('.character-portrait');

	let selectedPortrait: HTMLElement | null = null;
	let gameMode: GameMode = 'ONE_PLAYER';
	let difficulty: DifficultyLevel = 'EASY';

	localStorage.setItem('gameMode', gameMode);
	localStorage.setItem('difficulty', difficulty);

	function showCharacterArt(charId: string | null) {
		if (charId) {
			// Usamos una altura basada en el viewport para un tamaño grande y consistente
			const heightClass = 'h-[75vh]'; 
			artContainer.innerHTML = `<img src="/assets/char${charId}_full.png" alt="Character ${charId} Full Art" class="${heightClass} max-w-full object-contain">`;
		}
	}
	
	function hideCharacterArt() {
		artContainer.innerHTML = '';
	}

	portraits.forEach(portrait => {
		portrait.addEventListener('mouseover', () => {
			const charId = (portrait as HTMLElement).dataset.char;
			if (!selectedPortrait || selectedPortrait !== portrait) {
				showCharacterArt(charId || null);
			}
		});

		portrait.addEventListener('mouseout', () => {
			if (!selectedPortrait) {
				hideCharacterArt();
			} else {
				showCharacterArt(selectedPortrait.dataset.char || null);
			}
		});
	});

	selectionContainer?.addEventListener('click', (event) => {
		const target = event.target as HTMLElement;

		if (target.classList.contains('character-portrait')) {
			if (selectedPortrait) {
				selectedPortrait.classList.remove('border-cyan-400', 'border-8');
				selectedPortrait.classList.add('border-white', 'border-4');
			}
			
			selectedPortrait = target;
			selectedPortrait.classList.remove('border-white', 'border-4');
			selectedPortrait.classList.add('border-cyan-400', 'border-8');
			
			showCharacterArt(selectedPortrait.dataset.char || null);
		}
	});

	acceptButton?.addEventListener('click', (event) => {
		event.stopPropagation();
		if (selectedPortrait) {
			localStorage.setItem('selectedCharacter', selectedPortrait.dataset.char || '1');
			navigate('/pong');
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
