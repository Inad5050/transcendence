import jwtUtils from '../utils/jwtUtils.js';
import UserModel from '../models/Users.js';

/**
 * Middleware para verificar que el usuario esté autenticado
 */

async function authMiddleware(req, res) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).send({
                message: 'Token no proporcionado',
                error: 'Unauthorized'
            });
        }

        const token = authHeader.substring(7);
        const decoded = jwtUtils.verifyAccessToken(token);

        if (!decoded) {
            return res.status(401).send({
                message: 'Token inválido o expirado',
                error: 'Unauthorized'
            });
        }

        // Verificar que la sesión existe y es válida
        const isValidSession = await jwtUtils.isSessionValid(token);
        if (!isValidSession) {
            return res.status(401).send({
                message: 'Sesión inválida o expirada',
                error: 'Unauthorized'
            });
        }

        // Añadir usuario al request
        req.user = {
            id: decoded.id,
            username: decoded.username,
            email: decoded.email
        };

        // ✅ ACTUALIZAR ACTIVIDAD AQUÍ
        // Hacerlo de forma asíncrona sin bloquear la request
        UserModel.update(
            { 
                last_activity: new Date(),
                status: 'online'
            },
            { 
                where: { id: decoded.id },
                silent: true
            }
        ).catch(error => {
            // Log pero no falla la request
            console.error('Error actualizando actividad:', error);
        });

    } catch (error) {
        console.error('Error en authMiddleware:', error);
        return res.status(401).send({
            message: 'Error de autenticación',
            error: error.message
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
