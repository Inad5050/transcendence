import React from 'react';
import PongGame from './pong/PongGame.tsx'; 

// Ya no usamos las clases de CSS como App-header, Tailwind se encargará del estilo.
// Usamos clases de Tailwind para centrar y estilizar.
function App() 
{
  return (
    // Tailwind: Usamos flex para centrar todo el contenido
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <header className="text-center mb-6">
        <h1 className="text-5xl font-extrabold text-cyan-400 mb-2">ft_transcender Pong</h1>
      </header>
      <PongGame />
    </div>
  )
}

export default App
