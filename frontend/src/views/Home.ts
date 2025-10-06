import { initializeAudio, playTrack } from '../MusicPlayer';

export function HomeView(appElement: HTMLElement): void
{
	if (appElement)
	{
	    appElement.innerHTML = `
		<div class="min-h-screen flex flex-col p-8">
			
			<div class="w-full flex-1 flex justify-center items-center">
					<img src="/assets/logo.gif" alt="Game Logo" class="max-w-2xl w-full mt-40">
			</div>

	        <div class="text-white min-h-screen flex flex-col items-center justify-center p-8">           
	            <button id="gameButton" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-lg">
	                START
	            </button>
	        </div>
		</div>
	    `;

		playTrack('/assets/After_Dark.mp3');

	    const gameButton = document.getElementById('gameButton');
	    if (gameButton)
	    {
	        gameButton.addEventListener('click', () => 
	        {
				initializeAudio(); // La primera interacción del usuario debe inicializar el audio.
	            alert('Lógica del juego iniciada.');
	        });
	    }
	}
}