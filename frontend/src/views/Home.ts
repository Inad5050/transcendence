import { navigate } from '../main';
import { initializeAudio, playTrack } from '../utils/musicPlayer';

export function renderHome(appElement: HTMLElement): void
{
	if (!appElement)
		return;
	appElement.innerHTML = `
	<div class="h-screen flex flex-col items-center justify-start md:justify-center p-4 md:p-8 overflow-y-auto">
		<div class="w-full flex justify-center">
            <button id="homeButton" class="focus:outline-none focus:ring-4 focus:ring-cyan-300 rounded-lg">
			    <img src="/assets/logo.gif" alt="Game Logo" class="w-full max-w-sm md:max-w-5xl mt-20 md:mt-40">
            </button>
		</div>
		<div class="flex-grow flex flex-col justify-center items-center w-full mt-10 space-y-8">
			<button id="loginButton" class="bg-[url('/assets/login.png')] bg-contain bg-no-repeat bg-center w-[280px] h-[85px] md:w-[400px] md:h-[120px] cursor-pointer transform hover:scale-125 transition-transform duration-200 drop-shadow-lg hover:drop-shadow-xl focus:outline-none focus:ring-4 focus:ring-cyan-300 rounded-lg"></button>
			<button id="registerButton" class="bg-[url('/assets/register.png')] bg-contain bg-no-repeat bg-center w-[280px] h-[85px] md:w-[400px] md:h-[120px] cursor-pointer transform hover:scale-125 transition-transform duration-200 drop-shadow-lg hover:drop-shadow-xl focus:outline-none focus:ring-4 focus:ring-cyan-300 rounded-lg"></button>
		</div>
	</div>
	`;

	playTrack('/assets/After_Dark.mp3');

	document.getElementById('homeButton')?.addEventListener('click', () => navigate('/'));
	const registerButton = document.getElementById('registerButton');
	const loginButton = document.getElementById('loginButton');

	if (registerButton) {
		registerButton.addEventListener('click', () => {
			initializeAudio();
			navigate('/register');
		});
	}

	if (loginButton) {
		loginButton.addEventListener('click', () => {
			initializeAudio();
			navigate('/login');
		});
	}
}