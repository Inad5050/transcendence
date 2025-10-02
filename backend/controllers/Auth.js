import UserModel from "../models/Users.js";
import jwtUtils from "../utils/jwtUtils.js";
import twoFAUtils from "../utils/twoFAUtils.js";

class AuthController {
	constructor() {
	}

	async login(req, res) {
		try {
			const { username, password, twofa_code } = req.body;

			// Validar que se proporcionen ambos campos
			if (!username || !password) {
				return res.status(400).send({ 
					message: 'Usuario y contraseña son requeridos',
					error: 'Bad Request'
				});
			}

			// Buscar usuario por username o email
			let userModel = await UserModel.findOne({
				where: { username: username }
			});

			// Si no se encuentra por username, intentar por email
			if (!userModel) {
				userModel = await UserModel.findOne({
					where: { email: username }
				});
			}

			// Si no existe el usuario
			if (!userModel) {
				return res.status(401).send({ 
					message: 'Credenciales inválidas',
					error: 'Unauthorized'
				});
			}

			// Verificar contraseña
			const isPasswordValid = await userModel.verifyPassword(password);

			if (!isPasswordValid) {
				return res.status(401).send({ 
					message: 'Credenciales inválidas',
					error: 'Unauthorized'
				});
			}

			 // Si el usuario tiene 2FA activado, verificar el código
			if (userModel.twofa_enabled) {
				if (!twofa_code) {
					return res.status(403).send({
						message: 'Código 2FA requerido',
						error: 'TwoFARequired',
						requires_2fa: true
					});
				}

				// Verificar el código 2FA
				const isValid = twoFAUtils.verifyToken(userModel.twofa_secret, twofa_code);
				
				if (!isValid) {
					return res.status(401).send({
						message: 'Código 2FA inválido',
						error: 'Invalid2FACode'
					});
				}
			}

			// Actualizar last_login
			userModel.last_login = new Date();
			await userModel.save();

			// Generar tokens JWT
			const accessToken = jwtUtils.generateAccessToken(
				userModel.id,
				userModel.username,
				userModel.email
			);
			const refreshToken = jwtUtils.generateRefreshToken(userModel.id);

			// Guardar sesión en la base de datos
			await jwtUtils.saveSession(userModel.id, accessToken, refreshToken, req);

			// Obtener datos del usuario sin la contraseña ni el secreto 2FA
			const userData = userModel.get({ plain: true });
			delete userData.password;
			delete userData.twofa_secret;

			// Respuesta exitosa
			return res.status(200).send({
				status: true,
				message: 'Login exitoso',
				user: userData,
				access_token: accessToken,
				refresh_token: refreshToken
			});

		} catch (error) {
			console.error('Error en login:', error);
			return res.status(500).send({ 
				message: 'Error en el servidor',
				error: error.message 
			});
		}
	}

	async logout(req, res) {
		try {
			 // Obtener el token del header
			const authHeader = req.headers.authorization;
			
			if (authHeader && authHeader.startsWith('Bearer ')) {
				const token = authHeader.substring(7);
				await jwtUtils.invalidateSession(token);
			}

			return res.status(200).send({
				status: true,
				message: 'Logout exitoso'
			});
		} catch (error) {
			console.error('Error en logout:', error);
			return res.status(500).send({ 
				message: 'Error en el servidor',
				error: error.message 
			});
		}
	}

	async validateSession(req, res) {
		try {
			// El middleware ya validó la sesión, solo retornar éxito
			return res.status(200).send({
				status: true,
				message: 'Sesión válida',
				user: req.user
			});
		} catch (error) {
			console.error('Error en validación de sesión:', error);
			return res.status(500).send({ 
				message: 'Error en el servidor',
				error: error.message 
			});
		}
	}

	async refreshToken(req, res) {
		try {
			const { refresh_token } = req.body;

			if (!refresh_token) {
				return res.status(400).send({
					message: 'Refresh token requerido',
					error: 'Bad Request'
				});
			}

			const newAccessToken = await jwtUtils.refreshAccessToken(refresh_token);

			return res.status(200).send({
				status: true,
				message: 'Token refrescado',
				access_token: newAccessToken
			});
		} catch (error) {
			console.error('Error al refrescar token:', error);
			return res.status(401).send({
				message: 'No se pudo refrescar el token',
				error: error.message
			});
		}
	}

	// ========== ENDPOINTS PARA 2FA ==========

	/**
	 * Genera un secreto 2FA para el usuario
	 */
	async setup2FA(req, res) {
		try {
			const userId = req.user.id;

			// Buscar usuario
			const user = await UserModel.findByPk(userId);

			if (!user) {
				return res.status(404).send({
					message: 'Usuario no encontrado',
					error: 'Not Found'
				});
			}

			if (user.twofa_enabled) {
				return res.status(400).send({
					message: '2FA ya está activado',
					error: 'Bad Request'
				});
			}

			// Generar secreto
			const { secret, otpauth_url } = twoFAUtils.generateSecret(user.username);

			// Guardar el secreto temporalmente (sin activar 2FA aún)
			user.twofa_secret = secret;
			await user.save();

			// Generar código QR
			const qrCode = await twoFAUtils.generateQRCode(otpauth_url);

			return res.status(200).send({
				status: true,
				message: 'Secreto 2FA generado. Escanea el código QR con Google Authenticator',
				secret: secret,
				qr_code: qrCode,
				otpauth_url: otpauth_url
			});

		} catch (error) {
			console.error('Error en setup 2FA:', error);
			return res.status(500).send({
				message: 'Error al configurar 2FA',
				error: error.message
			});
		}
	}

	/**
	 * Verifica y activa el 2FA
	 */
	async enable2FA(req, res) {
		try {
			const userId = req.user.id;
			const { code } = req.body;

			if (!code) {
				return res.status(400).send({
					message: 'Código 2FA requerido',
					error: 'Bad Request'
				});
			}

			const user = await UserModel.findByPk(userId);

			if (!user) {
				return res.status(404).send({
					message: 'Usuario no encontrado',
					error: 'Not Found'
				});
			}

			if (user.twofa_enabled) {
				return res.status(400).send({
					message: '2FA ya está activado',
					error: 'Bad Request'
				});
			}

			if (!user.twofa_secret) {
				return res.status(400).send({
					message: 'Primero debes configurar 2FA con /api/auth/setup-2fa',
					error: 'Bad Request'
				});
			}

			// Verificar el código
			const isValid = twoFAUtils.verifyToken(user.twofa_secret, code);

			if (!isValid) {
				return res.status(401).send({
					message: 'Código 2FA inválido',
					error: 'Invalid Code'
				});
			}

			// Activar 2FA
			user.twofa_enabled = true;
			await user.save();

			return res.status(200).send({
				status: true,
				message: '2FA activado exitosamente'
			});

		} catch (error) {
			console.error('Error al activar 2FA:', error);
			return res.status(500).send({
				message: 'Error al activar 2FA',
				error: error.message
			});
		}
	}

	/**
	 * Desactiva el 2FA
	 */
	async disable2FA(req, res) {
		try {
			const userId = req.user.id;
			const { code, password } = req.body;

			if (!code || !password) {
				return res.status(400).send({
					message: 'Código 2FA y contraseña requeridos',
					error: 'Bad Request'
				});
			}

			const user = await UserModel.findByPk(userId);

			if (!user) {
				return res.status(404).send({
					message: 'Usuario no encontrado',
					error: 'Not Found'
				});
			}

			if (!user.twofa_enabled) {
				return res.status(400).send({
					message: '2FA no está activado',
					error: 'Bad Request'
				});
			}

			// Verificar contraseña
			const isPasswordValid = await user.verifyPassword(password);
			if (!isPasswordValid) {
				return res.status(401).send({
					message: 'Contraseña incorrecta',
					error: 'Unauthorized'
				});
			}

			// Verificar código 2FA
			const isValid = twoFAUtils.verifyToken(user.twofa_secret, code);
			if (!isValid) {
				return res.status(401).send({
					message: 'Código 2FA inválido',
					error: 'Invalid Code'
				});
			}

			// Desactivar 2FA
			user.twofa_enabled = false;
			user.twofa_secret = null;
			await user.save();

			// Invalidar todas las sesiones por seguridad
			await jwtUtils.invalidateAllUserSessions(userId);

			return res.status(200).send({
				status: true,
				message: '2FA desactivado. Todas las sesiones han sido cerradas por seguridad'
			});

		} catch (error) {
			console.error('Error al desactivar 2FA:', error);
			return res.status(500).send({
				message: 'Error al desactivar 2FA',
				error: error.message
			});
		}
	}
}

export default new AuthController();
