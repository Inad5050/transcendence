import { navigate } from '../main';
import { initializeAudio, playTrack } from '../utils/musicPlayer';

export function renderHome(appElement: HTMLElement): void
{
	if (!appElement)
		return;
	
	appElement.innerHTML = `
	<div class="min-h-screen flex flex-col p-4 md:p-8">
		
		<div class="w-full flex justify-center">
			<img src="/assets/logo.gif" alt="Game Logo" class="w-full max-w-sm md:max-w-5xl mt-20 md:mt-40">
		</div>

		<div class="flex-grow flex flex-col justify-center items-center w-full mt-10 space-y-8">
			<img src="/assets/login.png" alt="Login" id="loginButton" 
				class="w-[280px] md:w-[400px] cursor-pointer transform hover:scale-125 transition-transform duration-200 drop-shadow-lg hover:drop-shadow-xl">
		
			<img src="/assets/register.png" alt="Register" id="registerButton" 
				class="w-[280px] md:w-[400px] cursor-pointer transform hover:scale-125 transition-transform duration-200 drop-shadow-lg hover:drop-shadow-xl">
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
