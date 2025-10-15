import { navigate } from '../main';
import { playTrack } from '../utils/musicPlayer';

let isAwaiting2FA = false;
let tempUsername = '';
let tempPassword = '';

async function handleLogin(event: Event): Promise<void> 
{
	event.preventDefault(); // evita el comportamiento predeterminado de un evento del navegador. El comportamiento predeterminado de un navegador al enviar un formulario HTML es recargar la página.

	const usernameInput = document.getElementById('username') as HTMLInputElement;
	const passwordInput = document.getElementById('password') as HTMLInputElement;
	tempUsername = usernameInput.value;
	tempPassword = passwordInput.value;

	try 
	{
		const response = await fetch('/api/auth/login', {
			method: 'POST', 
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({ username: tempUsername,password: tempPassword })
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
		{
			if (response.status === 403 && result.requires_2fa === true) 
			{
				console.log('2FA requerido. Mostrando formulario para el código.');
				isAwaiting2FA = true;
				renderLogin(document.getElementById('app') as HTMLElement);
			}
			else
				throw new Error(result.message || 'Error en el login.');
		}
	}
	catch (error)
	{
		alert(`Error: ${(error as Error).message}`);
		tempUsername = '';
		tempPassword = '';
	}
}

async function handle2FAVerification(event: Event): Promise<void> 
{
    event.preventDefault();

    const twoFACodeInput = document.getElementById('2fa-code') as HTMLInputElement;
    const code = twoFACodeInput.value;
    if (!code) 
	{
        alert('Por favor, introduce el código de 6 dígitos.');
        return;
    }

    try 
	{
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: tempUsername, password: tempPassword, twofa_code: code })
        });

        const result = await response.json();
        if (response.ok) 
		{
            localStorage.setItem('access_token', result.access_token);
            localStorage.setItem('refresh_token', result.refresh_token);
            localStorage.setItem('user', JSON.stringify(result.user));
            tempUsername = '';
            tempPassword = '';
            isAwaiting2FA = false;
            navigate('/start');
        }
		else
            throw new Error(result.message || 'Código 2FA inválido o error en el login.');
    }
	catch (error) 
	{
        alert(`Error: ${(error as Error).message}`);
        isAwaiting2FA = false;
        tempUsername = '';
        tempPassword = '';
        renderLogin(document.getElementById('app') as HTMLElement);
    }
}


export function renderLogin(appElement: HTMLElement): void 
{
    if (!appElement)
        return;

    if (isAwaiting2FA) 
	{
		appElement.innerHTML = `
		<div class="h-screen flex flex-col items-center justify-start md:justify-center p-4 md:p-16 overflow-y-auto">
			<div class="w-full flex justify-center">
				<button id="homeButton" class="focus:outline-none focus:ring-4 focus:ring-cyan-300 rounded-lg">
					<img src="/assets/logo.gif" alt="Game Logo" class="w-full max-w-sm md:max-w-5xl mt-20 md:mt-28">
				</button>
			</div>
			<div class="w-full md:max-w-4xl mt-10 md:mt-40">
				<form id="2faForm" class="bg-gray-800 bg-opacity-50 shadow-md rounded-xl px-6 py-8 md:px-16 md:pt-12 md:pb-16 mb-8">
					<div class="mb-6 md:mb-9">
						<label class="block text-white text-lg md:text-2xl font-bold mb-2 md:mb-4" for="2fa-code">Código de Autenticación</label>
						<input class="shadow appearance-none border rounded w-full py-3 px-4 md:py-4 md:px-6 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-lg md:text-2xl" id="2fa-code" type="text" placeholder="123456" maxlength="6" autofocus>
					</div>
					<div class="flex items-center justify-center">
						<button type="submit" class="bg-[url('/assets/en/accept.png')] bg-contain bg-no-repeat bg-center w-[250px] h-[75px] md:w-[400px] md:h-[120px] cursor-pointer transform hover:scale-125 transition-transform duration-200 drop-shadow-lg hover:drop-shadow-xl focus:outline-none focus:ring-4 focus:ring-cyan-300 rounded-lg"></button>
					</div>
				</form>
			</div>
		</div>
		`;

        document.getElementById('homeButton')?.addEventListener('click', () => { isAwaiting2FA = false; navigate('/'); });
        document.getElementById('2faForm')?.addEventListener('submit', handle2FAVerification);
    }
    else
	{
		appElement.innerHTML = `
		<div class="h-screen flex flex-col items-center justify-start md:justify-center p-4 md:p-16 overflow-y-auto">
			<div class="w-full flex justify-center">
				<button id="homeButton" class="focus:outline-none focus:ring-4 focus:ring-cyan-300 rounded-lg">
					<img src="/assets/logo.gif" alt="Game Logo" class="w-full max-w-sm md:max-w-5xl mt-20 md:mt-28">
				</button>
			</div>
			<div class="w-full md:max-w-4xl mt-10 md:mt-40">
				<form id="loginForm" class="bg-gray-800 bg-opacity-50 shadow-md rounded-xl px-6 py-8 md:px-16 md:pt-12 md:pb-16 mb-8">
					<div class="mb-6 md:mb-9">
						<label class="block text-white text-lg md:text-2xl font-bold mb-2 md:mb-4" for="username">Username</label>
						<input class="shadow appearance-none border rounded w-full py-3 px-4 md:py-4 md:px-6 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-lg md:text-2xl" id="username" type="text" placeholder="Username">
					</div>
					<div class="mb-8 md:mb-12">
						<label class="block text-white text-lg md:text-2xl font-bold mb-2 md:mb-4" for="password">Password</label>
						<input class="shadow appearance-none border rounded w-full py-3 px-4 md:py-4 md:px-6 text-gray-700 mb-4 md:mb-6 leading-tight focus:outline-none focus:shadow-outline text-lg md:text-2xl" id="password" type="password" placeholder="******************">
					</div>
					<div class="flex items-center justify-center">
						<button type="submit" id="loginButton" class="bg-[url('/assets/en/login.png')] bg-contain bg-no-repeat bg-center w-[250px] h-[75px] md:w-[400px] md:h-[120px] cursor-pointer transform hover:scale-125 transition-transform duration-200 drop-shadow-lg hover:drop-shadow-xl focus:outline-none focus:ring-4 focus:ring-cyan-300 rounded-lg"></button>
					</div>
				</form>
			</div>
		</div>
		`;
		
		
        document.getElementById('homeButton')?.addEventListener('click', () => navigate('/'));
        document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    }

    playTrack('/assets/After_Dark.mp3');
}
