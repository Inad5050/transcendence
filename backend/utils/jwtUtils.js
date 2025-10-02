import jwt from 'jsonwebtoken';
import SessionModel from '../models/Session.js';

const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_muy_segura_cambiar_en_produccion';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'; // 1 hora
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'; // 7 días

class JWTUtils {
	/**
	 * Genera un access token JWT
	 */
	generateAccessToken(userId, username, email) {
		return jwt.sign(
			{ 
				id: userId, 
				username: username,
				email: email,
				type: 'access'
			},
			JWT_SECRET,
			{ expiresIn: JWT_EXPIRES_IN }
		);
	}

	/**
	 * Genera un refresh token JWT
	 */
	generateRefreshToken(userId) {
		return jwt.sign(
			{ 
				id: userId,
				type: 'refresh'
			},
			JWT_SECRET,
			{ expiresIn: REFRESH_TOKEN_EXPIRES_IN }
		);
	}

	/**
	 * Verifica y decodifica un token
	 */
	verifyToken(token) {
		try {
			return jwt.verify(token, JWT_SECRET);
		} catch (error) {
			throw new Error('Token inválido o expirado');
		}
	}

	/**
	 * Guarda una sesión en la base de datos
	 */
	async saveSession(userId, accessToken, refreshToken, req) {
		const decoded = this.verifyToken(accessToken);
		const expiresAt = new Date(decoded.exp * 1000);

		return await SessionModel.create({
			user_id: userId,
			token: accessToken,
			refresh_token: refreshToken,
			ip_address: req.ip || req.headers['x-forwarded-for'] || 'unknown',
			user_agent: req.headers['user-agent'] || 'unknown',
			expires_at: expiresAt,
			is_active: true
		});
	}

	/**
	 * Invalida una sesión específica
	 */
	async invalidateSession(token) {
		const session = await SessionModel.findOne({ where: { token } });
		if (session) {
			session.is_active = false;
			await session.save();
			return true;
		}
		return false;
	}

	/**
	 * Invalida todas las sesiones de un usuario
	 */
	async invalidateAllUserSessions(userId) {
		await SessionModel.update(
			{ is_active: false },
			{ where: { user_id: userId, is_active: true } }
		);
	}

	/**
	 * Verifica si una sesión es válida
	 */
	async isSessionValid(token) {
		try {
			// Verificar firma y expiración del token
			const decoded = this.verifyToken(token);
			
			// Verificar que exista en la base de datos y esté activa
			const session = await SessionModel.findOne({
				where: {
					token: token,
					is_active: true
				}
			});

			if (!session) {
				return { valid: false, reason: 'Sesión no encontrada o inactiva' };
			}

			// Verificar que no haya expirado en la base de datos
			if (new Date() > session.expires_at) {
				return { valid: false, reason: 'Sesión expirada' };
			}

			return { valid: true, decoded, session };
		} catch (error) {
			return { valid: false, reason: error.message };
		}
	}

	/**
	 * Refresca un access token usando un refresh token
	 */
	async refreshAccessToken(refreshToken) {
		try {
			const decoded = this.verifyToken(refreshToken);
			
			if (decoded.type !== 'refresh') {
				throw new Error('Token inválido');
			}

			// Buscar sesión con ese refresh token
			const session = await SessionModel.findOne({
				where: {
					refresh_token: refreshToken,
					is_active: true
				}
			});

			if (!session) {
				throw new Error('Sesión no encontrada');
			}

			// Generar nuevo access token
			const newAccessToken = this.generateAccessToken(
				decoded.id,
				decoded.username,
				decoded.email
			);

			// Actualizar token en la sesión
			const newDecoded = this.verifyToken(newAccessToken);
			session.token = newAccessToken;
			session.expires_at = new Date(newDecoded.exp * 1000);
			await session.save();

			return newAccessToken;
		} catch (error) {
			throw new Error('No se pudo refrescar el token: ' + error.message);
		}
	}

	/**
	 * Limpia sesiones expiradas (útil para ejecutar periódicamente)
	 */
	async cleanExpiredSessions() {
		const deleted = await SessionModel.destroy({
			where: {
				expires_at: {
					[db.Sequelize.Op.lt]: new Date()
				}
			}
		});
		return deleted;
	}
}

export default new JWTUtils();
