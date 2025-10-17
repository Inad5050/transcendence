import db from '../db.js';
import sequelize from "sequelize";

const TournamentModel = db.define('tournament', {
	id: {
		type: sequelize.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	name: {
		type: sequelize.STRING,
		allowNull: false
	},
	status: {
		type: sequelize.ENUM('pending', 'in_progress', 'finished'),
		allowNull: false,
		defaultValue: 'pending'
	},
	game: {
        type: sequelize.ENUM('pong', 'tictactoe'),
        allowNull: false
    },
	winner_id: {
		type: sequelize.INTEGER,
		allowNull: true,
		references: {
			model: 'users',
			key: 'id'
		}
	},
	participants: {
		type: sequelize.JSON,
		allowNull: false
	},
	current_round: {
        type: sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
    }
});

export default TournamentModel;