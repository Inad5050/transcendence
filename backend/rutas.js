import UserControler from "./controllers/Users.js";


const rutas = [
	{
		method: "POST",
		url: "/api/usuarios",
		handler: UserControler.create,
	},
	{
		method: "GET",
		url: "/api/usuarios",
		handler: UserControler.getAll,
	},
	{
		method: "GET",
		url: "/api/usuarios/:id",
		handler: UserControler.getOne,
	},
	{
		method: "PUT",
		url: "/api/usuarios/:id",
		handler: UserControler.update,
	},
	{
		method: "DELETE",
		url: "/api/usuarios/:id",
		handler: UserControler.delete,
	},
]

export default rutas;