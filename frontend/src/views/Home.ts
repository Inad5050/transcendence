// En TRANSCENDENCE/frontend/src/views/Home.ts

// ... (el resto del archivo se mantiene igual) ...

export function HomeView(appElement: HTMLElement): void
{
	if (appElement)
	{
	    appElement.innerHTML = `
	        <div class="text-white min-h-screen flex flex-col items-center justify-center p-8">
	            
	            <h1 class="text-4xl font-bold mb-4 text-white border-8 border-white-800">
	                Hola! Bienvenido a ft_transcendence
	            </h1>

	            <p class="text-gray-400 mb-8 text-3xl text-lime-400">
	                Interfaz controlada por TypeScript puro.
	            </p>

	            <button id="gameButton" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-lg">
	                Iniciar Partida
	            </button>
	        </div>
	    `;

	    const gameButton = document.getElementById('gameButton');

	    if (gameButton) 
	    {
	        gameButton.addEventListener('click', () => 
	        {
	            alert('Lógica del juego iniciada.');
	        });
	    }
	}
}