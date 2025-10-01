import UserControler from "./controllers/Users.js";
// import StoreControler from "./controllers/Stores.js";
// import TiketControler from "./controllers/Tickets.js";

const rutas = [
	{
		method: "POST",
		url: "/usuarios",
		handler: UserControler.create,
	},
	{
		method: "GET",
		url: "/usuarios",
		handler: UserControler.getAll,
	},
	{
		method: "GET",
		url: "/usuarios/:id",
		handler: UserControler.getOne,
	},
	{
		method: "PUT",
		url: "/usuarios/:id",
		handler: UserControler.update,
	},
	{
		method: "DELETE",
		url: "/usuarios/:id",
		handler: UserControler.delete,
	},
]

export default rutas;