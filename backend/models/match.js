import sequelize from "sequelize";
import db from '../db.js';
import UserModel from "./Users.js"

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
    match_type: {
        type: sequelize.ENUM('local', 'friends', 'ia'),
        allowNull: false
    },
    match_status: {
        type: sequelize.ENUM()
    }

}

)