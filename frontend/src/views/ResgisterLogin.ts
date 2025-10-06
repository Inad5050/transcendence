import { initializeAudio, playTrack } from '../MusicPlayer';

export function HomeView(appElement: HTMLElement): void // export: Hace que la función HomeView esté disponible para ser importada por otros archivos (como main.ts).
{
	if (appElement)
	{
		appElement.innerHTML = `
		<div class="min-h-screen flex flex-col p-8">
			
			<div class="w-full flex justify-center">
					<img src="/assets/logo.gif" alt="Game Logo" class="max-w-5xl w-full mt-40">
			</div>

			<div class="absolute bottom-[150px] left-1/2 -translate-x-1/2">           
				<img src="/assets/start.gif" alt="Start Game" id="gameButton" 
				class="w-[250px] cursor-pointer transform hover:scale-110 transition-transform duration-200 drop-shadow-lg hover:drop-shadow-xl">
			</div>

			<div class="absolute bottom-[300px] left-1/2 -translate-x-1/2">           
				<img src="/assets/start.gif" alt="Start Game" id="gameButton" 
				class="w-[250px] cursor-pointer transform hover:scale-110 transition-transform duration-200 drop-shadow-lg hover:drop-shadow-xl">
			</div>

		</div>
		`;

		playTrack('/assets/After_Dark.mp3');

		const gameButton = document.getElementById('gameButton');
		if (gameButton)
		{
			gameButton.addEventListener('click', () => // es una función flecha (sintaxis simplificada) pasada como argumento
			{
				alert('Lógica del juego iniciada.');
			});
		}
	}
}
