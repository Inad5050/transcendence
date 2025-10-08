// FLUJO: Usuario hace clic en "Register" -> evento click -> addEventListener() detecta el evento -> ejecuta handleRegister() ->
// Lee los datos ya introducidos en los campos -> llama a fetch('/api/users', ...), esta operación tiene una duración variable ->
// esperamos con await fetch -> como la función es asincrona, mientras esperamos el resto de la web no se bloquea
// async/await: sirve para esperar a que se completen operaciones lentas.

// async function -> permite el uso del operador await dentro de la función. Una función async siempre devuelve un objeto Promise.

// Event -> tipo de dato incorporado en el navegador y en TypeScript que representa cualquier suceso que ocurre en el DOM (Document Object Model)

// event.preventDefault() -> Evita que el formulario recarge la página

// document -> es una propiedad del objeto global window que el navegador proporciona. Representa la totalidad de la página web cargada en la ventana del navegador -> el DOM
// document es un atajo para window.document

// await: Pausa la ejecución dentro de la función async hasta que la Promise (la operación asíncrona) se resuelve o es rechazada.

// const loginRegister -> el evento 'submit' se procesa cuando el user pulsa enter mientras rellena el cuestionario

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
		alert(`Error: ${error.message}`);
	}
}

export function renderRegister(appElement: HTMLElement): void
{
    if (!appElement)
        return;
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
                    <img src="/assets/register.png" alt="Register" id="registerButton" class="w-[400px] cursor-pointer transform hover:scale-125 transition-transform duration-200 drop-shadow-lg hover:drop-shadow-xl">
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
