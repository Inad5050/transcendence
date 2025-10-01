import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App.tsx'

// IMPORTACIÓN CLAVE: Aquí es donde Tailwind toma el control.
// El contenido de este archivo será modificado para solo importar Tailwind.
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
