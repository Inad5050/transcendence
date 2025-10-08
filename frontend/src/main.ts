// const appElement =>
// Busca en el index.html el elemento <div> con el id 'app'.
// Este <div> actuará como el contenedor principal donde se renderizará toda la aplicación.
// 'as' es una aserción de tipo para que TypeScript sepa que es un div.

// const routes: =>
// Este objeto es el cerebro del router. Asocia una URL (ej: '/')
// con la función que debe ejecutarse para renderizar la vista correspondiente (ej: HomeView).
// : { ... }: => anotación de tipo de TypeScript. Define la "forma" que debe tener el objeto.
// [key: string] => establece que la clave debe ser un string.
// : (element: HTMLElement) => void -> Define el tipo del valor asociado a cada clave. En este caso una función.
// (element: HTMLElement): => La función debe aceptar un único argumento del tipo HTMLElement -> un tipo base para todos los elementos HTML (<div>, <img>, etc.).
// = { ... }: => inicialización del objeto. Los objetos constantes tienen que se inicialiados durante la declaración.

// function router() =>
// Lee la ruta actual de la URL del navegador (ej: '/', '/selection', '/profile').
// const path => Se usa 'pathname' para obtener URLs limpias (sin el '#').
// const view => Busca en el mapa de rutas si hay una función asociada a la ruta actual.
// Si se encuentra una vista para la ruta, se ejecuta esa función. Se pasa 'appElement' para que sepa dónde dibujar el HTML.
// Si no se encuentra ninguna ruta, muestra un mensaje de "Página no encontrada".

// window =>
// es el objeto global proporcionado por el entorno del navegador web. No es parte del lenguaje JavaScript, sino de la API del navegador.
// Representa la ventana o pestaña del navegador en la que se está ejecutando el código. Contiene todas las funciones y variables globales del navegador:
//	- window.document: El DOM (Document Object Model), la representación del index.html.
//	- window.location: Información sobre la URL actual de la página. 
//	- window.location.pathname: es la parte de la ruta de la URL (ej: /selection).
//	- window.history: Permite interactuar con el historial de sesión del navegador.
//	- window.addEventListener: Para escuchar eventos que ocurren a nivel de la ventana, como load o resize.
// En C++, un programa se ejecuta en su propio proceso. En un navegador, el código JavaScript se ejecuta dentro del contexto del objeto window.

// function navigate() =>
// Permite cambiar de "página" desde cualquier parte del código sin recargar la web.
// Navegación de la Aplicación (Activa): el código decide que quiere cambiar de página.
// Cambia la URL del navegador mediante la History API y 
// llama manualmente al router para que renderice la nueva vista sin recargar la página.

// window.addEventListener('popstate', router); =>
// Navegación del Usuario (Pasiva): el usuario usa los botones de atrás/adelante del navegador. El código no inicia esta acción, solo reacciona a ella. 
// El evento popstate se dispara cuando: El usuario hace clic en el botón "Atrás/Adelante" del navegador o
// el código llama a history.back(), history.forward() o history.go().

// if (!appElement) =>
// Comprobación crítica inicial. Si falla, el script se detiene.
// Sin un catch{} throw termina el programa.

// router(); =>
// Ejecuta el router por primera vez para cargar la vista inicial.

import { renderHomeView } from './views/Home.ts';
import { renderRegister } from './views/Register.ts';
import { renderLogin } from './views/Login.ts';
import { initializePongGame } from './views/Pong.ts';

const appElement = document.querySelector('#app') as HTMLDivElement;

const routes: { [key: string]: (element: HTMLElement) => void } =
{
	'/': renderHomeView,
	'/register': renderRegister,
	'/login': renderLogin,
	'/pong': initializePongGame,
};

function router()
{
	if (!appElement)
		return;
    const path = window.location.pathname;
    const view = routes[path];
    if (view)
		view(appElement);
	else
		appElement.innerHTML = `<div class="text-white text-center p-8"><h1>404 - Not Found</h1></div>`;
}

export function navigate(path: string)
{
    window.history.pushState({}, '', path);
    router();
}

window.addEventListener('popstate', router);

if (!appElement)
	throw new Error('Fatal Error: #app element not found in DOM.');

router();
