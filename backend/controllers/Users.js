import { where } from "sequelize";
import UserModel from "../models/Users.js";

class UserControler {
	cosntructor() {
	}

	async create(req, res) {
		try {
			const userModel = await UserModel.create(req.body);
			if (userModel)
				res.status(200).send({ status: true, id: userModel.id });
		}
		catch (error) {
			res.status(500).send({ error: error });
		}
	}

	async getAll(req, res) {
		try {
			const where = { ...req.query };

			const lista = await UserModel.findAll({ where });
			res.status(200).send(lista);

		} catch (error) {
			res.status(500).send({ error: error });
		}
	}

	async getOne(req, res) {
		try {
			const { id } = req.params;
			const userModel = await UserModel.findByPk(id);

			if (userModel)
				res.status(200).send(userModel);
			else {
				res.status(404).send({ message: 'Registro no encontrado', });
			}

		} catch (error) {
			res.status(500).send({ error: error });
		}
	}

	async update(req, res) {
		try {
			const { id } = req.params;
			const userModel = await UserModel.update(req.body,
				{ where: { id } });
			if (typeof (userModel[0]) !== 'undefined' && userModel[0] === 1) {
				res.status(200).send({ status: true });
			}
			else {
				res.status(404).send({ message: 'Registro no encontrado', });
			}
		} catch (error) {
			res.status(500).send({ error: error });
		}
	}

	async delete(req, res) {
		try {
			const { id } = req.params;
			const userModel = await UserModel.destroy({ where: { id } });
			if (userModel)
				res.status(200).send({ status: true });
			else {
				res.status(404).send({ message: 'Registro no encontrado', });
			}
		} catch (error) {
			res.status(500).send({ error: error });
		}
	}
}

export default new UserControler();