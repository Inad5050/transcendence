import sequelize from "sequelize";
import bcrypt from "bcryptjs";
import db from '../db.js';
import UserModel from "./Users.js"

const FriendModel = db.define('friend', {
    id: {
        type: sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    one_user_id: {
        type: sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    two_user_id: {
        type: sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    state: {
        type: sequelize.ENUM('pending', 'accepted', 'refused'),
        allowNull: false,
        defaultValue: 'pending',
    }
},{
    indexes: [
        {
            unique: true,
            fields: ['one_user_id', 'two_user_id'],
            name: 'unique_friendship'
        }
]});


// Definir las relaciones
FriendModel.belongsTo(UserModel, {
    foreignKey: 'one_user_id',
    as: 'userOne'
});

FriendModel.belongsTo(UserModel, {
    foreignKey: 'two_user_id',
    as: 'userTwo'
});

// Si quieres acceder a las amistades desde el usuario
UserModel.hasMany(FriendModel, {
    foreignKey: 'one_user_id',
    as: 'friendshipsAsUserOne'
});

UserModel.hasMany(FriendModel, {
    foreignKey: 'two_user_id',
    as: 'friendshipsAsUserTwo'
});

export default FriendModel;
