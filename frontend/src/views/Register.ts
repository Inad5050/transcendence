import { navigate } from '../main';
import { playTrack } from '../musicPlayer';

async function handleRegister(event: Event): Promise<void>
{
	event.preventDefault();
	const usernameInput = document.getElementById('username') as HTMLInputElement;
	const emaiInput = document.getElementById('mail') as HTMLInputElement;
	const passwordInput = document.getElementById('password') as HTMLInputElement;

	const userData = {
		username: usernameInput.value, 
		email: emaiInput.value, 
		password: passwordInput.value
	};

	try
	{
		const response = await fetch('/api/users', {
			method: 'POST', 
			headers: {'Content-Type': 'application/json'}, 
			body: JSON.stringify(userData)
		});

		const result = await response.json();

		if (response.ok)
		{
			alert('¡Registro exitoso!');
            navigate('/login');
		}
		else
			throw new Error(result.error?.message || 'Error en el registro.');
	}
	catch (error)
	{
		alert(`Error: ${(error as Error).message}`);
	}
}

export function renderRegister(appElement: HTMLElement): void
{
    if (!appElement)
        return;
    appElement.innerHTML = `
    <div class="min-h-screen flex flex-col items-center p-4 md:p-16">

        <div class="w-full flex justify-center">
            <img src="/assets/logo.gif" alt="Game Logo" class="w-full max-w-sm md:max-w-5xl mt-20 md:mt-28">
        </div>

        <div class="w-full md:max-w-4xl mt-10 md:mt-40">
            <form class="bg-gray-800 bg-opacity-50 shadow-md rounded-xl px-6 py-8 md:px-16 md:pt-12 md:pb-16 mb-8">
                <div class="mb-6 md:mb-9">
                    <label class="block text-white text-lg md:text-2xl font-bold mb-2 md:mb-4" for="username">
                        Username
                    </label>
                    <input class="shadow appearance-none border rounded w-full py-3 px-4 md:py-4 md:px-6 text-gray-700 leading-tight focus-outline-none focus:shadow-outline text-lg md:text-2xl" id="username" type="text" placeholder="Username">
                </div>
                <div class="mb-6 md:mb-9">
                    <label class="block text-white text-lg md:text-2xl font-bold mb-2 md:mb-4" for="mail">
                        Mail
                    </label>
                    <input class="shadow appearance-none border rounded w-full py-3 px-4 md:py-4 md:px-6 text-gray-700 leading-tight focus-outline-none focus:shadow-outline text-lg md:text-2xl" id="mail" type="email" placeholder="Mail">
                </div>
                <div class="mb-8 md:mb-12">
                    <label class="block text-white text-lg md:text-2xl font-bold mb-2 md:mb-4" for="password">
                        Password
                    </label>
                    <input class="shadow appearance-none border rounded w-full py-3 px-4 md:py-4 md:px-6 text-gray-700 mb-4 md:mb-6 leading-tight focus-outline-none focus:shadow-outline text-lg md:text-2xl" id="password" type="password" placeholder="******************">
                </div>
                <div class="flex items-center justify-center">
                    <img src="/assets/register.png" alt="Register" id="registerButton" class="w-[250px] md:w-[400px] cursor-pointer transform hover:scale-125 transition-transform duration-200 drop-shadow-lg hover:drop-shadow-xl">
                </div>
            </form>
        </div>

    </div>
    `;

    playTrack('/assets/After_Dark.mp3');

	const registerButton = document.getElementById('registerButton');
    if (registerButton)
        registerButton.addEventListener('click', handleRegister);
}
