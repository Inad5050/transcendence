// Archivo: ./backend/server.js
const express = require('express');
const app = express();
// Debe coincidir con el puerto en docker-compose (4173)
const port = 4173; 

app.get('/', (req, res) => {
  res.send('<h1>¡Hola! ¡El Backend (API) de Node.js está funcionando!</h1>');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Backend API escuchando en http://0.0.0.0:${port}`);
});
