import sequelize from "sequelize";
import db from '../db.js';
import UserModel from "./Users.js"

const ChatModel = db.define('chat', {
    id: {
        type: sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    sender_id: {
        type: sequelize.INTEGER,
        allowNull: false
    },
    reciver_id: {
        type: sequelize.INTEGER,
        allowNull: true
    },
    message: {
        type: sequelize.TEXT,
        allowNull: false
    },
    timestamp: {
        type: sequelize.DATE,
        defaultValue: sequelize.NOW
    },
    is_private: {
        type: sequelize.BOOLEAN,
        defaultValue: false
    },
});

// Relación con UserModel (un usuario puede enviar muchos mensajes)
ChatModel.belongsTo(UserModel, { as: 'sender', foreignKey: 'sender_id' });
ChatModel.belongsTo(UserModel, { as: 'reciver', foreignKey: 'reciver_id' });

// En UserModel.js o en un archivo de asociaciones
UserModel.hasMany(ChatModel, {
    foreignKey: 'sender_id',
    as: 'sentMessages'
});

UserModel.hasMany(ChatModel, {
    foreignKey: 'reciver_id',
    as: 'receivedMessages'
});
export default ChatModel;
