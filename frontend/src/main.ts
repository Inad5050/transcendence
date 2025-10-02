// Importa el archivo CSS que contiene las directivas de Tailwind.
// Vite se encargará de procesar este archivo y generar el CSS final
// que se aplicará a la página. Sin esta línea, los estilos de Tailwind no funcionarían.
import './style.css';

// DOM (Document Object Model) -> Es una interfaz de programación que representa la estructura de un documento HTML como un árbol de objetos. 
// Cada elemento, atributo y texto dentro del HTML se convierte en un "objeto" o "nodo" en una estructura de árbol. 
// La etiqueta <html> es el nodo raíz, <body> es un hijo de <html>, y el <div id="app"> es un hijo de <body>.
// document.querySelector busca en el DOM un elemento que coincida con el selector CSS proporcionado.
// Aquí, busca el elemento con el id 'app' que definimos en index.html.
// '<HTMLDivElement>' es una aserción de tipo en TypeScript, que le dice al compilador que esperamos que el elemento encontrado sea un <div>.
const appElement = document.querySelector<HTMLDivElement>('#app');

if (appElement) // Es una buena práctica verificar si el elemento fue encontrado antes de intentar manipularlo. Si el selector estuviera mal escrito o el elemento no existiera, appElement sería 'null'.
{
    // innerHTML es una propiedad que permite leer o reemplazar el contenido HTML de un elemento.
    // Aquí, estamos inyectando un bloque de HTML directamente dentro del <div id="app">.
    // Usamos plantillas literales (template literals, con comillas invertidas ``) para escribir HTML multilínea de forma más legible.
    appElement.innerHTML = `
        <div class="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-8">
            <h1 class="text-4xl font-bold mb-4">
                Bienvenido a ft_transcendence
            </h1>
            <p class="text-gray-400 mb-8">
                Interfaz controlada por TypeScript puro.
            </p>
            <button id="gameButton" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Iniciar Partida
            </button>
        </div>
    `;

    const gameButton = document.getElementById('gameButton'); // Ahora que el HTML está en la página, podemos añadirle interactividad. Seleccionamos el botón por su id.

    if (gameButton)  // Verificamos que el botón fue encontrado.
    {
        gameButton.addEventListener('click', () => // addEventListener adjunta una función que se ejecutará cuando ocurra un evento específico. En este caso, la función se ejecutará cada vez que se haga 'click' en el botón.
        {
            alert('Lógica del juego iniciada.'); // La función que se ejecuta es una 'arrow function'. Por ahora, solo muestra una alerta simple. Aquí iría la lógica para iniciar el juego o navegar a otra vista.
        });
    }
}

// Por que usamos typescript para modificar el archivo HTML en lugar de modificar el index.html?
// HTML estático: Lo que escribe en el archivo .html es fijo. Para cambiar el contenido, el usuario tendría que recargar la página o navegar a una nueva.
// HTML con TypeScript: Puede cambiar el contenido de la página en respuesta a acciones del usuario -> single page application.
// HTML estático: No puede mostrar datos que cambian con el tiempo, como el estado de un juego.
// HTML con TypeScript: Puede obtener datos de una API (su backend, por ejemplo) y luego usar la lógica de TypeScript (bucles, condicionales) para generar el HTML necesario.
// HTML con TypeScript: Puede crear funciones que generen fragmentos de HTML. Esto reduce la duplicación de código y hace que el mantenimiento sea mucho más sencillo.
// index.html se mantiene extremadamente simple. Su única responsabilidad es ser el punto de entrada y proporcionar un "ancla" (como <div id="app">).