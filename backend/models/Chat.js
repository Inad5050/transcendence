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

// Sincronizar el modelo con la base de datos
// (En producción, considera usar migraciones en lugar de sync)
// ChatModel.sync()
//     .then(() => {
//         console.log('Tabla Chat sincronizada correctamente.');
//     })
//     .catch((error) => {
//         console.error('Error al sincronizar la tabla Chat:', error);
//     });

export default ChatModel;
