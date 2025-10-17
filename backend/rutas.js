import UserControler from "./controllers/Users.js";
import AuthController from "./controllers/Auth.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import FriendControler from "./controllers/Friends.js";
import ChatController from "./controllers/Chat.js";
import MatchControler from "./controllers/match.js"

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
		preHandler: authMiddleware,
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
		// preHandler: authMiddleware,
		handler: UserControler.create,
	},
	{
		method: "GET",
		url: "/users",
		preHandler: authMiddleware,
		handler: UserControler.getAll,
	},
	{
		method: "GET",
		url: "/users/:identifier",
		preHandler: authMiddleware,
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
	{
		method: "POST",
		url: "/users/avatar",
		preHandler: authMiddleware,
		handler: UserControler.uploadAvatar // Se vincula el nuevo método
	},

	//Rutas de amigos
	{
		method: "POST",
		url: "/friends",
		handler: FriendControler.createRequest
	},
	{
        method: "GET",
        url: "/friends/requests",
        preHandler: authMiddleware,
        handler: FriendControler.getFriendRequests
    },
	{
		method: "POST",
		url: "/friends/accept/:friendshipId",
		preHandler: authMiddleware,
		handler: FriendControler.acceptFriend
	},
	{
		method: "GET",
		url: "/friends",
		preHandler: authMiddleware,
		handler: FriendControler.getFriends
	},
	{
		method: "DELETE", //Tambien se podria usar para cambiar el estado a "removed" o borrar la solicitud si esta en "pending"
		url: "/friends/:friendshipId",
		preHandler: authMiddleware,
		handler: FriendControler.deleteFriend
	},

	// Rutas de chat
	{
		method: "POST",
		url: "/chat/private",
		preHandler: authMiddleware,
		handler: ChatController.sendMessage
	},
	{
		method: "POST",
		url: "/chat/public",
		preHandler: authMiddleware,
		handler: ChatController.sendPublicMessage
	},
	{
		method: "GET",
		url: "/chat/private/:otherUserId",
		preHandler: authMiddleware,
		handler: ChatController.getMessages
	},
	{
		method: "GET",
		url: "/chat/public",
		preHandler: authMiddleware,
		handler: ChatController.getPublicMessages
	},

	//Rutas de partidas (match)
	{
		method: "POST",
		url: "/match/create",
		preHandler: authMiddleware,
		handler: MatchControler.createMatch
	},
	{
		method: "GET", // si haces /match/getall?match_type=local&player_one_id=4 te devolvera solo los partidos con esas propiedades, puedes poner tantos capos como quieras si no pones nada te devuelve todo
		url: "/match/getall",
		preHandler: authMiddleware,
		handler: MatchControler.getAllMatch
	},
	{
		method: "PUT",
		url: "/match/update/:matchId",
		preHandler: authMiddleware,
		handler: MatchControler.update
	},
]

export default rutas;
