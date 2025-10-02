import jwtUtils from '../utils/jwtUtils.js';
import UserModel from '../models/Users.js';

/**
 * Middleware para verificar que el usuario esté autenticado
 */
async function authMiddleware(request, reply) {
	try {
		// Obtener token del header Authorization
		const authHeader = request.headers.authorization;
		
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return reply.code(401).send({
				error: 'Unauthorized',
				message: 'Token no proporcionado'
			});
		}

		const token = authHeader.substring(7); // Remover "Bearer "

		// Verificar validez del token
		const validation = await jwtUtils.isSessionValid(token);

		if (!validation.valid) {
			return reply.code(401).send({
				error: 'Unauthorized',
				message: validation.reason
			});
		}

		// Agregar información del usuario a la request
		request.user = {
			id: validation.decoded.id,
			username: validation.decoded.username,
			email: validation.decoded.email
		};

		// Continuar con la siguiente función
	} catch (error) {
		return reply.code(500).send({
			error: 'Internal Server Error',
			message: 'Error al verificar autenticación'
		});
	}
}

/**
 * Middleware opcional - no falla si no hay token
 */
async function optionalAuthMiddleware(request, reply) {
	try {
		const authHeader = request.headers.authorization;
		
		if (authHeader && authHeader.startsWith('Bearer ')) {
			const token = authHeader.substring(7);
			const validation = await jwtUtils.isSessionValid(token);

			if (validation.valid) {
				request.user = {
					id: validation.decoded.id,
					username: validation.decoded.username,
					email: validation.decoded.email
				};
			}
		}
		
		// Continuar siempre
	} catch (error) {
		// Ignorar errores en modo opcional
	}
}

export { authMiddleware, optionalAuthMiddleware };
