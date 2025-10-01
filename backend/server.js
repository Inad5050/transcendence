// Este es el corazón del backend. Crea una instancia del servidor Fastify, define las 
// rutas (endpoints) que la API expondrá y pone el servidor a escuchar peticiones. 
// Incluye la ruta raíz (/) para una respuesta básica, y la ruta /health que el 
// healthcheck de Docker usará para verificar que el servicio está activo.

// Importa la biblioteca Fastify. Se usa 'fastify' en lugar de 'express'.
import Fastify from "fastify";
import db from "./db.js";
import rutas from "./rutas.js";
import cors from '@fastify/cors';

// Crea una instancia de la aplicación Fastify. El objeto 'logger: true'
// // activará logs detallados en la consola, muy útil para depuración.
const fastify = Fastify({logger: true});

await fastify.register(cors, {});

fastify.get("/", async function name(req, res) {
  return ({hello : " world"})
});

rutas.forEach((ruta) => {
  fastify.route(ruta);
});

async function database() {
  try {
    db.sync();
		console.log("Conectado a la base de datos");
	} catch (error)
	{
    console.log(error);
	}
}

fastify.get('/health', async (request, reply) => {
  // .code(200) establece explícitamente el código de estado HTTP.
  return reply.code(200).send({ status: 'ok' });
});

// Arranque unificado asegurando host 0.0.0.0
(async () => {
  try {
    await database();
    await fastify.listen({
      port: Number(process.env.PORT) || 9000,
      host: '0.0.0.0'
    });
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
})();






  // // Define una ruta para el método GET en la raíz de la API (`/`).
  // // Nginx redirigirá las peticiones a `/api/` aquí (después de quitar el prefijo).
  // fastify.get('/', async (request, reply) => {
  //   return { message: '¡Hola! ¡El Backend (API) de Fastify está funcionando!' };
  // });
  
  // // Define la ruta `/health` para el healthcheck de Docker.
  // // Simplemente responde con un código de estado 200 (OK) y un objeto simple.
  // fastify.get('/health', async (request, reply) => {
  //   // .code(200) establece explí// // Define una ruta para el método GET en la raíz de la API (`/`).
  // // Nginx redirigirá las peticiones a `/api/` aquí (después de quitar el prefijo).
  // fastify.get('/', async (request, reply) => {
  //   return { message: '¡Hola! ¡El Backend (API) de Fastify está funcionando!' };
  // });
  
  // // Define la ruta `/health` para el healthcheck de Docker.
  // // Simplemente responde con un código de estado 200 (OK) y un objeto simple.

  
  // Inicia el servidor.
  // const start = async () => {
  //   try {
  //     // El servidor se pone a escuchar en el puerto 9000, que es el que Nginx espera.
  //     // '0.0.0.0' es crucial para que el servidor acepte conexiones desde fuera
  //     // del contenedor (específicamente, desde el contenedor de Nginx).
  //     await fastify.listen({ port: 9000, host: '0.0.0.0' });
  //   } catch (err) {
  //     // Si hay un error al iniciar, se registra y se sale del proceso.
  //     fastify.log.error(err);
  //     process.exit(1);
  //   }
  // };
  
  
  // // Llama a la función para iniciar el servidor.
  // start();

  //   try {
  //     // El servidor se pone a escuchar en el puerto 9000, que es el que Nginx espera.
  //     // '0.0.0.0' es crucial para que el servidor acepte conexiones desde fuera
  //     // del contenedor (específicamente, desde el contenedor de Nginx).
  //     await fastify.listen({ port: 9000, host: '0.0.0.0' });
  //   } catch (err) {
  //     // Si hay un error al iniciar, se registra y se sale del proceso.
  //     fastify.log.error(err);
  //     process.exit(1);
  //   }
  // };
  
  
  // // Llama a la función para iniciar el servidor.
  // start();
