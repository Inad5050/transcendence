import { where, Op } from "sequelize";
import UserModel from "../models/Users.js";
import MatchModel from "../models/match.js";

function calculateNewElo(eloPlayerOne, eloPlayerTwo, playerOneWon) {
  const K = 32;
  const expectedScoreOne = 1 / (1 + 10 ** ((eloPlayerTwo - eloPlayerOne) / 400));
  const expectedScoreTwo = 1 / (1 + 10 ** ((eloPlayerOne - eloPlayerTwo) / 400));
  const actualScoreOne = playerOneWon ? 1 : 0;
  const actualScoreTwo = playerOneWon ? 0 : 1;
  const newEloPlayerOne = Math.round(eloPlayerOne + K * (actualScoreOne - expectedScoreOne));
  const newEloPlayerTwo = Math.round(eloPlayerTwo + K * (actualScoreTwo - expectedScoreTwo));
  return { newEloPlayerOne, newEloPlayerTwo };
}

class MatchControler {

	constructor() { };

	async createMatch(req, res) {
		try {
			const matchData = { ...req.body };

			if (matchData.match_type === 'ia') {
				const iaUser = await UserModel.findOne({ where: { username: 'ia' } });
				if (!iaUser) {
					return res.status(500).send({ error: 'El usuario IA no se encuentra en la base de datos.' });
				}
				matchData.player_two_id = iaUser.id;
			}
			else if (matchData.match_type === 'local') {
				const guessUser = await UserModel.findOne({ where: { username: 'guess' } });
				if (!guessUser) {
					return res.status(500).send({ error: 'El usuario Guest (guess) no se encuentra en la base de datos.' });
				}
				matchData.player_two_id = guessUser.id;
			}

			const matchModel = await MatchModel.create(matchData);
			
			if (matchModel) {
				res.status(200).send({ status: true, message: 'Partida creada correctamente', id: matchModel.id });
			} else {
				res.status(500).send({ error: 'No se pudo crear la partida.' });
			}
		} catch (e) {
			console.error('Error en createMatch:', e);
			res.status(500).send({ error: e.message });
		};
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
	
			const lista = await MatchModel.findAll({
				where: whereClause,
				include: [
					{
						model: UserModel,
						as: 'player_one',
						attributes: ['id', 'username']
					},
					{
						model: UserModel,
						as: 'player_two',
						attributes: ['id', 'username']
					}
				],
				order: [['createdAt', 'DESC']]
			});
	
			res.status(200).send(lista);
		} catch (e) {
			console.error("Error en getAllMatch:", e);
			res.status(500).send({ error: e.message });
		}
	}

	async update(req, res) {
		try {
			const { matchId } = req.params;
			const updates = req.body;
			const match = await MatchModel.findByPk(matchId);
			if (!match) {
				return res.status(404).send({ message: 'Partida no encontrada' });
			}

			Object.assign(match, updates);
			await match.save();

			let updatedPlayerOne = null;
			let updatedPlayerTwo = null;

			if (updates.match_status === 'finish') {
				const playerOne = await UserModel.findByPk(match.player_one_id);
				const playerTwo = await UserModel.findByPk(match.player_two_id);

				if (playerOne && playerTwo) {
					const playerOneWon = match.player_one_points > match.player_two_points;
					const { newEloPlayerOne, newEloPlayerTwo } = calculateNewElo(playerOne.elo, playerTwo.elo, playerOneWon);
					
					playerOne.elo = newEloPlayerOne;
					playerTwo.elo = newEloPlayerTwo;
					
					await playerOne.save();
					await playerTwo.save();
					
					updatedPlayerOne = playerOne.get({ plain: true });
					delete updatedPlayerOne.password;
					delete updatedPlayerOne.twofa_secret;

					updatedPlayerTwo = playerTwo.get({ plain: true });
					delete updatedPlayerTwo.password;
					delete updatedPlayerTwo.twofa_secret;

					console.log(`ELO Actualizado para TODOS: ${playerOne.username} (${newEloPlayerOne}), ${playerTwo.username} (${newEloPlayerTwo})`);
				}
			}

			return res.status(200).send({
				match: match.get({ plain: true }),
				playerOne: updatedPlayerOne,
				playerTwo: updatedPlayerTwo
			});

		} catch (e) {
			console.error("Error al actualizar partida y ELO:", e);
			res.status(500).send({ error: e.message });
		}
	}
}

export default new MatchControler();