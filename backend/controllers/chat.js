import UserModel from "../models/Users.js";
import jwtUtils from "../utils/jwtUtils.js";
import twoFAUtils from "../utils/twoFAUtils.js";
import ChatModel from "../models/Chat.js";

class ChatController {
    constructor() {
    }

    async sendMessage(req, res) {
        try {

            const { recipientId, message } = req.body;
            const senderId = req.user.id;
            // berificacion de los usuarios, que existan y que no sean el mismo
            if (senderId === recipientId) {
                return res.status(400).send({ status: false, message: "No puedes enviarte mensajes a ti mismo." });
            }
            const recipient = await UserModel.findByPk(recipientId);
            if (!recipient) {
                return res.status(404).send({ status: false, message: "El destinatario no existe." });
            }

            // Crear el mensaje en la base de datos
            const chatMessage = await ChatModel.create({
                senderId,
                recipientId,
                message,
                timestamp: new Date()
            });

            res.status(200).send({ status: true, message: "Mensaje enviado.", data: chatMessage });
        } catch (e) {
            res.status(500).send({ error: e.message });
        }
    }

    async sendPublicMessage(req, res) {
        try {
            const { message } = req.body;
            const senderId = req.user.id;

            // Crear el mensaje público en la base de datos
            const chatMessage = await ChatModel.create({
                senderId,
                recipientId: null, // null indica que es un mensaje público
                message,
                timestamp: new Date()
            });

            res.status(200).send({ status: true, message: "Mensaje público enviado.", data: chatMessage });
        } catch (e) {
            res.status(500).send({ error: e.message });
        }
    }

    async getPublicMessages(req, res) {
        try {
            // Obtener todos los mensajes públicos (recipientId es null)
            const messages = await ChatModel.findAll({
                where: { recipientId: null },
                order: [['timestamp', 'ASC']]
            });

            res.status(200).send({ status: true, data: messages });
        } catch (e) {
            res.status(500).send({ error: e.message });
        }
    }

    async getMessages(req, res) {
        try {
            const userId = req.user.id;
            const { withUserId } = req.params;

            // Verificar que el usuario con el que se quiere chatear exista
            const withUser = await UserModel.findByPk(withUserId);
            if (!withUser) {
                return res.status(404).send({ status: false, message: "El usuario con el que quieres chatear no existe." });
            }

            // Obtener los mensajes entre los dos usuarios
            const messages = await ChatModel.findAll({
                where: {
                    [ChatModel.sequelize.Op.or]: [
                        { senderId: userId, recipientId: withUserId },
                        { senderId: withUserId, recipientId: userId }
                    ]
                },
                order: [['timestamp', 'ASC']]
            });

            res.status(200).send({ status: true, data: messages });
        } catch (e) {
            res.status(500).send({ error: e.message });
        }
    }
}

export default new ChatController();