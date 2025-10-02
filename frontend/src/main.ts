import './style.css'; // Importa los estilos de Tailwind

// Selecciona el elemento principal del DOM donde se renderizará la aplicación
const appElement = document.querySelector<HTMLDivElement>('#app');

if (appElement)
{
    // Inyecta contenido HTML directamente usando innerHTML
    // Las clases de Tailwind se aplican como en HTML normal
    appElement.innerHTML = `
        <div class="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-8">
            <h1 class="text-4xl font-bold mb-4">
                Bienvenido a ft_transcendence (Sin React)
            </h1>
            <p class="text-gray-400 mb-8">
                Interfaz controlada por TypeScript puro.
            </p>
            <button id="gameButton" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Iniciar Partida
            </button>
        </div>
    `;

    // Ejemplo de cómo añadir interactividad
    const gameButton = document.getElementById('gameButton');
    if (gameButton)
    {
        gameButton.addEventListener('click', () => 
        {
            alert('Lógica del juego iniciada.');
        });
    }
}