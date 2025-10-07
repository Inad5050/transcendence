import UserControler from "./controllers/Users.js";
import AuthController from "./controllers/Auth.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import FriendControler from "./controllers/Friends.js";

const rutas = [
	// Rutas de autenticación (públicas)
	{
		method: "POST",
		url: "/auth/login",
		handler: AuthController.login,
	},
	{
		method: "POST",
		url: "/auth/logout",
		handler: AuthController.logout,
	},
	{
		method: "POST",
		url: "/auth/refresh",
		handler: AuthController.refreshToken,
	},
	{
		method: "GET",
		url: "/auth/validate",
		preHandler: authMiddleware,
		handler: AuthController.validateSession,
	},
	
	// Rutas de 2FA (requieren autenticación)
	{
		method: "POST",
		url: "/auth/2fa/setup",
		preHandler: authMiddleware,
		handler: AuthController.setup2FA,
	},
	{
		method: "POST",
		url: "/auth/2fa/enable",
		preHandler: authMiddleware,
		handler: AuthController.enable2FA,
	},
	{
		method: "POST",
		url: "/auth/2fa/disable",
		preHandler: authMiddleware,
		handler: AuthController.disable2FA,
	},
	
	// Rutas de usuarios
	{
		method: "POST",
		url: "/users",
		handler: UserControler.create,
	},
	{
		method: "GET",
		url: "/users",
		handler: UserControler.getAll,
	},
	{
		method: "GET",
		url: "/users/:identifier",
		handler: UserControler.getOne,
	},
	{
		method: "PUT",
		url: "/users/:identifier",
		preHandler: authMiddleware,
		handler: UserControler.update,
	},
	{
		method: "DELETE",
		url: "/users/:identifier",
		preHandler: authMiddleware,
		handler: UserControler.delete,
	},

	//Rutas de amigos
	{
		method: "POST",
		url: "/friends",
		handler: FriendControler.createRequest
	}
]

export default rutas;