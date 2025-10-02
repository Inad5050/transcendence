import UserControler from "./controllers/Users.js";
import AuthController from "./controllers/Auth.js";


const rutas = [
	// Rutas de autenticación
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
		method: "GET",
		url: "/auth/validate",
		handler: AuthController.validateSession,
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
		handler: UserControler.update,
	},
	{
		method: "DELETE",
		url: "/users/:identifier",
		handler: UserControler.delete,
	},
]

export default rutas;