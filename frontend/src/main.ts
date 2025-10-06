// En TypeScript el código se organiza en módulos. Cada archivo es un módulo que puede compartir explícitamente funciones o variables 
// usando la palabra clave export. Para utilizar el código de otro módulo se usa import. 
import { HomeView } from './views/Home';

// DOM (Document Object Model) -> Es una interfaz de programación que representa la estructura de un documento HTML como un árbol de objetos. 
// Cada elemento, atributo y texto dentro del HTML se convierte en un "objeto" o "nodo" en una estructura de árbol. 
// La etiqueta <html> es el nodo raíz, <body> es un hijo de <html>, y el <div id="app"> es un hijo de <body>.
// document.querySelector busca en el DOM un elemento que coincida con el selector CSS proporcionado.
// Aquí, busca el elemento con el id 'app' que definimos en index.html.
// '<HTMLDivElement>' es una aserción de tipo en TypeScript, que le dice al compilador que esperamos que el elemento encontrado sea un <div>.
const appElement = document.querySelector<HTMLDivElement>('#app');

if (appElement) {
	HomeView(appElement);
}
