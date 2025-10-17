import { where, Op } from "sequelize";
import UserModel from "../models/Users.js";
import TournamentModel from "../models/Tournament.js";
import MatchModel from "../models/match.js";

class TournamentController {
	constructor() { }


	async createTournament(req, res) {
		try {
			let { name, game, participants } = req.body;

			// 1. Validar y barajar participantes
			if (!participants || participants.length < 4 || (participants.length & (participants.length - 1)) !== 0) {
				return res.status(400).send({ message: 'El número de participantes debe ser una potencia de 2 (4, 8, 16...)' });
			}
			participants = participants.sort(() => Math.random() - 0.5);

			// 2. Crear el registro del torneo
			const tournament = await TournamentModel.create({ name, game, participants, status: 'pending' });

			// 3. Generar el bracket
			await this.createBracket(tournament, participants);

			res.status(201).send({ message: 'Torneo creado con éxito', tournament });
		} catch (error) {
			console.error('Error creando el torneo:', error);
			res.status(500).send({ error: error.message });
		}
	};


	async createBracket(tournament, participants) {
		const numPlayers = participants.length;
		const totalRounds = Math.log2(numPlayers);

		let lastRoundMatches = [];

		// Crea las partidas desde la final hacia atrás
		for (let round = totalRounds; round >= 1; round--) {
			const numMatchesInRound = 2 ** (round - 1);
			const currentRoundMatches = [];

			for (let i = 0; i < numMatchesInRound; i++) {
				const newMatch = await MatchModel.create({
					tournament_id: tournament.id,
					round: round,
					game: tournament.game,
					match_status: 'pending',
					// Si es la ronda 1, asigna los jugadores
					player_one_id: round === 1 ? participants[i * 2] : null,
					player_two_id: round === 1 ? participants[i * 2 + 1] : null,
				});
				currentRoundMatches.push(newMatch);
			}

			// Enlaza las partidas de la ronda anterior
			if (lastRoundMatches.length > 0) {
				for (let i = 0; i < lastRoundMatches.length; i++) {
					await lastRoundMatches[i].update({
						next_match_id: currentRoundMatches[Math.floor(i / 2)].id
					});
				}
			}
			lastRoundMatches = currentRoundMatches;
		}
	}


	// async finishTournament(req, res) {
	// 	const { id } = req.params;

	// 	const matches = await MatchModel.findAll({ where: { tournament_id: id, match_status: 'finish' } });

	// 	const playerWins = {};
	// 	matches.forEach(match => {
	// 		const winnerId = match.player_one_points > match.player_two_points ? match.player_one_id : match.player_two_id;
	// 		playerWins[winnerId] = (playerWins[winnerId] || 0) + 1;
	// 	});

	// 	const tournamentWinnerId = Object.keys(playerWins).reduce((a, b) => playerWins[a] > playerWins[b] ? a : b);
	// 	await TournamentModel.update(
	// 		{ winner_id: tournamentWinnerId, status: 'finished' },
	// 		{ where: { id: id } }
	// 	);

	// 	res.status(200).send({ message: 'Torneo finalizado', winnerId: tournamentWinnerId });
	// }
}

export default new TournamentController();
