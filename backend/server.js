// Archivo: ./backend/server.js
const express = require('express');
const app = express();
const port = 9000; 

app.get('/', (req, res) =>
{
  res.send('<h1>¡Hola! ¡El Backend (API) de Node.js está funcionando!</h1>');
});

app.get('/health', (req, res) =>
{
  res.status(200).send('OK');
});

app.listen(port, '0.0.0.0', () =>
{
  console.log(`Backend API escuchando en http://0.0.0.0:${port}`);
});
