import { where, Op } from "sequelize";
import UserModel from "../models/Users.js";
import TournamentModel from "../models/Tournament.js";
import MatchModel from "../models/match.js";

class TournamentController {
	constructor() { }


	createTournament = async (req, res) => {
		try {
			let { name, game, participants } = req.body;

			if (!participants || participants.length < 4 || (participants.length & (participants.length - 1)) !== 0) {
				return res.status(400).send({ message: 'El número de participantes debe ser una potencia de 2 (4, 8, 16...)' });
			}
			participants = participants.sort(() => Math.random() - 0.5);

			const tournament = await TournamentModel.create({ name, game, participants, status: 'pending' });

			await this.createBracket(tournament, participants);

			res.status(201).send({ message: 'Torneo creado con éxito', tournament });
		} catch (error) {
			console.error('Error creando el torneo:', error);
			res.status(500).send({ error: error.message });
		}
	};


	createBracket = async (tournament, participants) => {
        const numPlayers = participants.length;
        const totalRounds = Math.log2(numPlayers);
        let previousRoundMatches = [];

        // Crea las partidas desde la primera ronda hacia la final
        for (let round = 1; round <= totalRounds; round++) {
            const numMatchesInRound = numPlayers / (2 ** round);
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

            // Enlaza las partidas de la ronda anterior a la actual
            if (previousRoundMatches.length > 0) {
                for (let i = 0; i < previousRoundMatches.length; i++) {
                    // El ganador de la partida 'i' de la ronda anterior
                    // va a la partida 'floor(i/2)' de la ronda actual.
                    await previousRoundMatches[i].update({
                        next_match_id: currentRoundMatches[Math.floor(i / 2)].id
                    });
                }
            }
            previousRoundMatches = currentRoundMatches;
        }
    }


	finishTournament = async (req, res) => {
		try {
			const { id } = req.params;

			// 1. Encontrar la partida final (la que no tiene next_match_id)
			const finalMatch = await MatchModel.findOne({
				where: {
					tournament_id: id,
					next_match_id: null,
					match_status: 'finish'
				}
			});

			if (!finalMatch) {
				return res.status(404).send({ message: 'La partida final del torneo no ha concluido o no se encuentra.' });
			}

			// 2. Determinar el ganador de la partida final
			const winnerId = finalMatch.player_one_points > finalMatch.player_two_points ? finalMatch.player_one_id : finalMatch.player_two_id;

			// 3. Actualizar el torneo con el ganador y el estado 'finished'
			await TournamentModel.update(
				{ winner_id: winnerId, status: 'finished' },
				{ where: { id: id } }
			);

			res.status(200).send({ message: 'Torneo finalizado con éxito', winnerId: winnerId });
		} catch (error) {
			console.error('Error finalizando el torneo:', error);
			res.status(500).send({ error: error.message });
		}
	}
}

export default new TournamentController();
