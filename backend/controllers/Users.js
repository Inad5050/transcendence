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

			const lista = await UserModel.findAll({ where , attributes: { exclude: ['password'] }});
			res.status(200).send(lista);

		} catch (error) {
			res.status(500).send({ error: error });
		}
	}

    async getOne(req, res) {
        try {
            const { identifier } = req.params;

            let userModel;
            if (/^\d+$/.test(identifier)) {
                // Buscar por id (numérico)
                userModel = await UserModel.findByPk(Number(identifier), {
                    attributes: { exclude: ['password'] }
                });
            } else {
                // Buscar por username
                userModel = await UserModel.findOne({
                    where: { username: identifier },
                    attributes: { exclude: ['password'] }
                });
            }

            if (userModel)
                return res.status(200).send(userModel);
            return res.status(404).send({ message: 'Registro no encontrado' });

        } catch (error) {
            return res.status(500).send({ error });
        }
    }

    async update(req, res) {
        try {
            const { identifier } = req.params;

            // Localizar por id numérico o por username
            let userModel = /^\d+$/.test(identifier)
                ? await UserModel.findByPk(Number(identifier))
                : await UserModel.findOne({ where: { username: identifier } });

            if (!userModel)
                return res.status(404).send({ message: 'Registro no encontrado' });

            // Evitar sobrescribir id
            if ('id' in req.body) delete req.body.id;

            // Asignar cambios
            Object.assign(userModel, req.body);
            await userModel.save(); // dispara hooks (hash password si cambió)

            const plain = userModel.get({ plain: true });
            delete plain.password;

            return res.status(200).send(plain);
        } catch (error) {
            return res.status(500).send({ error });
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
