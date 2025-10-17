import sequelize from "sequelize";
import db from '../db.js';
import UserModel from "./Users.js"
import ChatModel from "./Chat.js";

const MatchModel = db.define( 'match', {
    id: {
        type: sequelize.INTEGER,
        primaryKey:true,
        autoIncrement: true,
    },
    player_one_id: {
        type: sequelize.INTEGER,
        allowNull: false
    },
    player_two_id: {
        type: sequelize.INTEGER,
        allowNull: false,
    },
	game: {
		type: sequelize.ENUM('pong', 'tictactoe'),
		allowNull: false
	},
    match_type: {
        type: sequelize.ENUM('local', 'friends', 'ia', 'gues'),
        allowNull: true,
        defaultValue: null
    },
    match_status: {
        type: sequelize.ENUM('pending', 'playing', 'finish'),
        allowNull: true,
        defaultValue: null
    },
    player_one_points: {
        type: sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    player_two_points: {
        type: sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
});

MatchModel.belongsTo(UserModel, { as: 'player_one', foreignKey: 'player_one_id' });
MatchModel.belongsTo(UserModel, { as: 'player_two', foreignKey: 'player_two_id' });

UserModel.hasMany(ChatModel, {
    foreignKey: 'player_one_id',
    as: 'player_one'
});

UserModel.hasMany(ChatModel, {
    foreignKey: 'player_two_id',
    as: 'player_two'
});

export default MatchModel;
