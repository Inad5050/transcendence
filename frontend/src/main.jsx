// Este archivo es el punto de arranque de toda la aplicación de React. Su responsabilidad es encontrar 
// el punto de anclaje en el archivo index.html (el <div id="root"></div>) y decirle a React que renderice 
// el componente principal de la aplicación, <App />, dentro de ese anclaje. 
// También es donde se importan los estilos globales.

// Importa las bibliotecas fundamentales de React.
// 'react' es el núcleo que permite crear componentes y usar JSX.
// 'react-dom/client' es el renderizador que interactúa con el DOM del navegador web.
import React from 'react'
import ReactDOM from 'react-dom/client'

// Importa el componente principal de la aplicación desde el archivo App.jsx.
// Este es el componente de más alto nivel que contendrá todo lo demás.
import App from './App.jsx'

// Importa la hoja de estilos CSS. Al importarla aquí, en el punto de entrada,
// los estilos definidos en index.css se aplican de forma global a toda la aplicación.
import './index.css'

// Esta es la secuencia que inicia la aplicación:
// 1. `document.getElementById('root')`: Busca en el archivo index.html un elemento con el id "root".
// 2. `ReactDOM.createRoot(...)`: Crea una "raíz" de renderizado de React en ese elemento del DOM.
// 3. `.render(...)`: Le dice a React qué debe dibujar dentro de esa raíz.
ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode> es un componente especial que no renderiza UI visible.
  // Solo se activa en desarrollo y ayuda a detectar problemas potenciales en la aplicación.
  <React.StrictMode>
    {/* Aquí se renderiza el componente App, que es el corazón de la interfaz de usuario. */}
    <App />
  </React.StrictMode>,
)
