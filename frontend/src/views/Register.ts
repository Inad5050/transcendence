import { navigate } from '../main';
import { initializeAudio, playTrack } from '../MusicPlayer';

export function renderRegister(appElement: HTMLElement): void
{
    if (!appElement)
    {
        return;
    }
    appElement.innerHTML = `
    <div class="min-h-screen flex flex-col items-center p-16">
        <div class="w-full flex justify-center">
            <img src="/assets/logo.gif" alt="Game Logo" class="max-w-5xl w-full mt-28">
        </div>
        <div class="w-full max-w-4xl mt-40">
            <form class="bg-gray-800 bg-opacity-50 shadow-md rounded-xl px-16 pt-12 pb-16 mb-8">
                <div class="mb-9">
                    <label class="block text-white text-2xl font-bold mb-4" for="username">
                        Username
                    </label>
                    <input class="shadow appearance-none border rounded w-full py-4 px-6 text-gray-700 leading-tight focus-outline-none focus:shadow-outline text-2xl" id="username" type="text" placeholder="Username">
                </div>
                <div class="mb-9">
                    <label class="block text-white text-2xl font-bold mb-4" for="mail">
                        Mail
                    </label>
                    <input class="shadow appearance-none border rounded w-full py-4 px-6 text-gray-700 leading-tight focus-outline-none focus:shadow-outline text-2xl" id="mail" type="email" placeholder="Mail">
                </div>
                <div class="mb-12">
                    <label class="block text-white text-2xl font-bold mb-4" for="password">
                        Password
                    </label>
                    <input class="shadow appearance-none border rounded w-full py-4 px-6 text-gray-700 mb-6 leading-tight focus-outline-none focus:shadow-outline text-2xl" id="password" type="password" placeholder="******************">
                </div>
                <div class="flex items-center justify-center">
                    <img src="/assets/register.png" alt="Register" id="registerButton" class="w-[400px] cursor-pointer transform hover:scale-110 transition-transform duration-200 drop-shadow-lg hover:drop-shadow-xl">
                </div>
            </form>
        </div>
    </div>
    `;g

    playTrack('/assets/After_Dark.mp3');
}