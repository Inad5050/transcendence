import { where, Op } from "sequelize";
import UserModel from "../models/Users.js";
import FriendModel from "../models/Friends.js";
import MatchModel from "../models/match.js";

class MatchControler {

	constructor() { };

	async createMatch(req, res) {
		try {
			const userId = req.user.id;
			const matchModel = await MatchModel.create(req.body);
			if (matchModel)
				res.status(200).send({ status: true, message: 'Partida ceada correctamente' });
		}
		catch (e) { res.status(500).send({ error: e }) };
	}

	async getAllMatch(req, res) {
		try {
			const queryParams = { ...req.query };
			const whereClause = {};

			if (queryParams.user_id) {
				whereClause[Op.or] = [
					{ player_one_id: queryParams.user_id },
					{ player_two_id: queryParams.user_id }
				];
				delete queryParams.user_id;
			}
			Object.assign(whereClause, queryParams);
			const lista = await MatchModel.findAll({ where: whereClause });
			res.status(200).send(lista);
		} catch (e) { res.status(500).send({ error: e }) };
	}

	async update(req, res) {
		try {
			const { matchId } = req.params;
			const userId = req.user.id;

			const match = await MatchModel.findOne({
				where: {
					id: matchId,
					[where.or]: [
						{ player_one_id: userId },
						{ player_two_id: userId },
					]
				}
			});

			if (!match)
				return res.status(404).send({ message: 'Partida no encontrada' });

			if ('id' in req.body) delete req.body.id;

			Object.assign(match, req.body);
			await match.save();
			const plain = match.get({ plain: true });

			return res.status(200).send(plain);

		} catch (e) { res.status(500).send({ error: e }) };
	}


}

export default new MatchControler();
