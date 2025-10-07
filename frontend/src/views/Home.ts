// appElement.innerHTML = \...`; => Asigna una cadena de texto multilínea (template literal) a la propiedad innerHTML del elemento appElement.
// Esto reemplaza todo el contenido del <div>` con el nuevo HTML.
// const gameButton = document.getElementById('gameButton');: Busca un elemento por su id específico, gameButton.
// gameButton.addEventListener('click', () => { ... });: Asocia un evento al botón.
// 'click': Es el tipo de evento a escuchar.
// () => { ... }: Es una función de flecha (arrow function), una sintaxis concisa para definir una función anónima.
// initializeAudio(); => La primera interacción del usuario debe inicializar el audio.

import { navigate } from '../main';
import { initializeAudio, playTrack } from '../MusicPlayer';

export function renderHomeView(appElement: HTMLElement): void
{
	if (appElement)
	{
		appElement.innerHTML = `
		<div class="min-h-screen flex flex-col p-8">
			
			<div class="w-full flex justify-center">
					<img src="/assets/logo.gif" alt="Game Logo" class="max-w-5xl w-full mt-40">
			</div>

			<div class="absolute bottom-[400px] left-1/2 -translate-x-1/2">           
				<img src="/assets/register.png" alt="Register" id="registerButton" 
				class="w-[400px] cursor-pointer transform hover:scale-110 transition-transform duration-200 drop-shadow-lg hover:drop-shadow-xl">
			</div>

			<div class="absolute bottom-[500px] left-1/2 -translate-x-1/2">           
				<img src="/assets/login.png" alt="Login" id="loginButton" 
				class="w-[400px] cursor-pointer transform hover:scale-110 transition-transform duration-200 drop-shadow-lg hover:drop-shadow-xl">
			</div>

		</div>
		`;

		playTrack('/assets/After_Dark.mp3');

		const registerButton = document.getElementById('registerButton');
		const loginButton = document.getElementById('loginButton');

		if (registerButton)
		{
			registerButton.addEventListener('click', () =>
			{
				initializeAudio();
				navigate('/register');
			});
		}

		if (loginButton)
		{
			loginButton.addEventListener('click', () =>
			{
				initializeAudio();
				navigate('/login');
			});
		}
	}
}
