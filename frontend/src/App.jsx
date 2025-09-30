// Este archivo define el componente principal de la aplicación, llamado App. Un componente en React 
// es una pieza de interfaz de usuario reutilizable, escrita como una función de JavaScript que devuelve 
// una estructura similar a HTML llamada JSX. Este componente define la estructura básica de lo que se ve en la pantalla.

// Se importa la biblioteca de React para poder usar la sintaxis JSX.
import React from 'react';

// Se define el componente como una función de JavaScript llamada "App".
function App() 
{
  // La función devuelve JSX, que describe la estructura de la UI.
  // Se parece a HTML, pero se convierte en JavaScript.
  return (
    // El `div` principal con la clase "App". `className` se usa en lugar de `class` en JSX.
    <div className="App">
      {/* El encabezado de la página. Utiliza la clase "App-header", 
          cuyos estilos están definidos en el archivo index.css. 
          Aquí se ve la relación directa entre el componente y sus estilos. */}
      <header className="App-header">
        <h1>Frontend de React Funcionando</h1>
        <p>
          Esta página está siendo servida desde el contenedor del frontend.
        </p>
      </header>
    </div>
  )
}

// `export default App` hace que el componente App esté disponible para ser
// importado por otros archivos. En este caso, es importado por `main.jsx` para ser renderizado.
export default App


