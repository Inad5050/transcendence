import { navigate } from '../main';
import { playTrack } from '../utils/musicPlayer';
import i18next from '../utils/i18n';

export function renderAbout(appElement: HTMLElement): void
{
	if (!appElement)
		return;
	appElement.innerHTML = `
    <div class="h-screen flex flex-col p-4 md:p-8 overflow-y-auto">
        <div class="w-full flex justify-center">
            <button id="homeButton" class="focus:outline-none focus:ring-4 focus:ring-cyan-300 rounded-lg">
                <img src="/assets/logo.gif" alt="Game Logo" class="w-full max-w-sm md:max-w-5xl mt-10 md:mt-40">
            </button>
        </div>
        <div class="flex-grow flex items-center justify-center">
            <div class="bg-blue-900 bg-opacity-75 border-4 border-black rounded-xl p-6 md:p-8 w-full max-w-4xl text-white text-center shadow-lg">
                <h1 class="text-lg md:text-3xl font-semibold mb-4">
                    ${i18next.t('aboutText1')}
                </h1>
                <p class="text-base md:text-3xl">
                    ${i18next.t('aboutText2')}
                </p>
            </div>
        </div>
    </div>
    `;

	playTrack('/assets/Techno_Syndrome.mp3');
    document.getElementById('homeButton')?.addEventListener('click', () => navigate('/start'));
}