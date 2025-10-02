import UserModel from "../models/Users.js";

class AuthController {
	constructor() {
	}

	async login(req, res) {
		try {
			const { username, password } = req.body;

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

			// Actualizar last_login
			userModel.last_login = new Date();
			await userModel.save();

			// Obtener datos del usuario sin la contraseña
			const userData = userModel.get({ plain: true });
			delete userData.password;

			// Respuesta exitosa
			return res.status(200).send({
				status: true,
				message: 'Login exitoso',
				user: userData
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
			// Por ahora solo retornamos un mensaje de éxito
			// En el futuro aquí se invalidaría el token JWT o sesión
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
			// Endpoint para validar si una sesión es válida
			// Por ahora retorna éxito, en el futuro validará JWT
			return res.status(200).send({
				status: true,
				message: 'Sesión válida'
			});
		} catch (error) {
			console.error('Error en validación de sesión:', error);
			return res.status(500).send({ 
				message: 'Error en el servidor',
				error: error.message 
			});
		}
	}
}

export default new AuthController();
