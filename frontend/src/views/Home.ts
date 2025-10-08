import { navigate } from '../main';
import { initializeAudio, playTrack } from '../musicPlayer';

export function renderHomeView(appElement: HTMLElement): void
{
	if (!appElement)
		return;
	appElement.innerHTML = `
	<div class="min-h-screen flex flex-col p-8">
		
		<div class="w-full flex justify-center">
			<img src="/assets/logo.gif" alt="Game Logo" class="max-w-5xl w-full mt-40">
		</div>

		<div class="absolute bottom-[400px] left-1/2 -translate-x-1/2">           
			<img src="/assets/register.png" alt="Register" id="registerButton" 
		class="w-[400px] cursor-pointer transform hover:scale-110 transition-transform duration-200 drop-shadow-lg hover:drop-shadow-xl">
		</div>

		<div class="absolute bottom-[550px] left-1/2 -translate-x-1/2">           
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
