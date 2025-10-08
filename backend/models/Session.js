import sequelize from "sequelize";
import db from '../db.js';

const SessionModel = db.define('sessions', {
	id: {
		type: sequelize.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	user_id: {
		type: sequelize.INTEGER,
		allowNull: false,
		references: {
			model: 'users',
			key: 'id'
		}
	},
	token: {
		type: sequelize.TEXT,
		allowNull: false,
		unique: true
	},
	refresh_token: {
		type: sequelize.TEXT,
		allowNull: true
	},
	ip_address: {
		type: sequelize.STRING,
		allowNull: true
	},
	user_agent: {
		type: sequelize.STRING,
		allowNull: true
	},
	expires_at: {
		type: sequelize.DATE,
		allowNull: false
	},
	is_active: {
		type: sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: true
	}
}, {
	indexes: [
		{ fields: ["user_id"] },
		{ fields: ["token"] },
		{ fields: ["is_active"] }
	]
});

export default SessionModel;
