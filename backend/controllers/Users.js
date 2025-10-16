import { where } from "sequelize";
import UserModel from "../models/Users.js";
import { promises as fs } from 'fs';
import util from 'util';
import { pipeline } from 'stream';
import path from 'path';
import { randomBytes } from 'crypto';

const pump = util.promisify(pipeline);

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

			const lista = await UserModel.findAll({ where, attributes: { exclude: ['password'] } });
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

	async uploadAvatar(req, res) {
		try {
			const data = await req.file();
			if (!data) {
				return res.status(400).send({ message: 'No se subió ningún archivo.' });
			}

			const nombreUnico = randomBytes(16).toString('hex');
			const extension = path.extname(data.filename);
			const nombreArchivo = '${nombreUnico}${extension}';

			const uploadPath = path.join(process.cwd(), 'uploads', 'avatars', nombreArchivo);

			await pump(data.file, fs.createWriteStream(uploadPath));

            // Actualizar el usuario en la base de datos
            const userId = req.user.id;
            const user = await UserModel.findByPk(userId);
            if (!user) {
                return res.status(404).send({ message: 'Usuario no encontrado.' });
            }

            user.avatar = newFilename;
            await user.save();
            
            // Construir la URL completa del avatar
            const avatarUrl = `/uploads/avatars/${newFilename}`;

            res.status(200).send({
                message: 'Avatar actualizado correctamente.',
                avatarUrl: avatarUrl
            });

		} catch (error) {
			console.error(error);
			res.status(500).send({ error: 'Error al procesar el archivo.' });
		}
	}

}

export default new UserControler();
