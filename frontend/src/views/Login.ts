// localStorage es un almacenamiento clave-valor en el navegador

import { navigate } from '../main';
import { playTrack } from '../musicPlayer';

async function handleLogin(event: Event): Promise<void>
{
	event.preventDefault();
	const usernameInput = document.getElementById('username') as HTMLInputElement;
	const passwordInput = document.getElementById('password') as HTMLInputElement;
	
	const userData = {
		username: usernameInput.value,
		password: passwordInput.value,
	};

	try
	{
		const response = await fetch('/api/auth/login', {
			method: 'POST', 
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify(userData)
		});

		const result = await response.json();

		if (response.ok)
		{
			localStorage.setItem('access_token', result.access_token);
			localStorage.setItem('refresh_token', result.refresh_token);
            localStorage.setItem('user', JSON.stringify(result.user));
			navigate('/start');
		}
		else
			throw new Error(result.error?.message || 'Error en el login.');
	}
	catch (error)
	{
		alert(`Error: ${error.message}`);
	}
}

export function renderLogin(appElement: HTMLElement): void
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
                    <input class="shadow appearance-none border rounded w-full py-4 px-6 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-2xl" id="username" type="text" placeholder="Username">
                </div>
                <div class="mb-12">
                    <label class="block text-white text-2xl font-bold mb-4" for="password">
                        Password
                    </label>
                    <input class="shadow appearance-none border rounded w-full py-4 px-6 text-gray-700 mb-6 leading-tight focus-outline-none focus:shadow-outline text-2xl" id="password" type="password" placeholder="******************">
                </div>
                <div class="flex items-center justify-center">
                    <img src="/assets/login.png" alt="Login" id="loginButton" class="w-[400px] cursor-pointer transform hover:scale-125 transition-transform duration-200 drop-shadow-lg hover:drop-shadow-xl">
                </div>
            </form>
        </div>

    </div>
    `;

    playTrack('/assets/After_Dark.mp3');

	const loginButton = document.getElementById('loginButton');
    if (loginButton)
        loginButton.addEventListener('click', handleLogin);
}
