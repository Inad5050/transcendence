// import {}: Importa dos funciones, initializeAudio y playTrack, desde el archivo MusicPlayer.ts
// function HomeView(...): Define una función llamada HomeView.
// appElement: HTMLElement: Define un parámetro llamado appElement y especifica su tipo como HTMLElement.
// : void: Indica que la función no devuelve ningún valor.

// appElement.innerHTML = \...`; => Asigna una cadena de texto multilínea (template literal) a la propiedad innerHTMLdel elementoappElement. Esto reemplaza todo el contenido del <div>` con el nuevo HTML.
// playTrack('/assets/After_Dark.mp3');: Llama a la función playTrack para reproducir la música de fondo.
// const gameButton = document.getElementById('gameButton');: Busca un elemento por su id específico, gameButton.
// gameButton.addEventListener('click', () => { ... });: Asocia un evento al botón.
// 'click': Es el tipo de evento a escuchar.
// () => { ... }: Es una función de flecha (arrow function), una sintaxis concisa para definir una función anónima.

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

	        <div class="absolute bottom-[500px] left-1/2 -translate-x-1/2">           
	            <img src="/assets/start.gif" alt="Start Game" id="gameButton" 
				class="w-[500px] cursor-pointer transform hover:scale-110 transition-transform duration-200 drop-shadow-lg hover:drop-shadow-xl">
	        </div>

		</div>
	    `;

		playTrack('/assets/After_Dark.mp3');

	    const gameButton = document.getElementById('gameButton');
	    if (gameButton)
	    {
	        gameButton.addEventListener('click', () => // es una función flecha (sintaxis simplificada) pasada como argumento
	        {
				initializeAudio(); // La primera interacción del usuario debe inicializar el audio.
	            renderSelectionView(appElement);
	        });
	    }
	}
}
