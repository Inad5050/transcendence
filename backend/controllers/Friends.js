import { Op } from "sequelize";
import UserModel from "../models/Users.js";
import FriendModel from "../models/Friends.js";
import { create } from "qrcode";

class FriendControler {
    constructor() { };

    async createRequest(req, res) { //one_user_id tiene que ser el que envia la solicitud
        try {
            const friendModel = await FriendModel.create(req.body);
            if (friendModel)
                res.status(200).send({ status: true, message: 'Se ha creado la solicitud de amistad' });
        }
        catch (e) { res.status(500).send({ error: e }) };
    }

    async acceptFriend(req, res) {
        try {
            const { friendshipId } = req.params;
            const userId = req.user.id;
            // Buscar la solicitud pendiente
            const friendRequest = await FriendModel.findOne({
                where: {
                    id: friendshipId,
                    two_user_id: userId, // El usuario autenticado debe ser el receptor
                    state: 'pending'
                }
            });

            if (!friendRequest) {
                return res.status(404).send({
                    status: false,
                    message: 'Solicitud de amistad no encontrada o ya procesada'
                });
            }

            await friendRequest.update({ state: 'accepted' });

            await FriendModel.create({
                one_user_id: userId,
                two_user_id: friendRequest.one_user_id,
                state: 'accepted'
            });

            res.status(200).send({
                status: true,
                message: 'Solicitud de amistad aceptada',
                data: friendRequest
            });
        }
        catch (e) {
            res.status(500).send({ error: e.message });
        }
    }

    async getFriends(req, res) {
        try {
            const userId = req.user.id;

            // Buscar todas las amistades aceptadas donde el usuario es uno de los dos
            const friends = await FriendModel.findAll({
                where: {
                    state: 'accepted',
                    [Op.or]: [
                        { one_user_id: userId },
                        { two_user_id: userId }
                    ]
                }
            });

            const friendIds = friends.map(f => (f.one_user_id === userId ? f.two_user_id : f.one_user_id));

            const friendDetails = await UserModel.findAll({
                where: { id: friendIds },
                attributes: { exclude: ['password', 'email', 'twofa_secret'] }
            });

            res.status(200).send(friendDetails);
        } catch (e) {

            res.status(500).send({ error: e.message });
        }
    }
    async getFriendRequests(req, res) {
        try {
            const userId = req.user.id;

            // Buscar todas las solicitudes de amistad pendientes donde el usuario es el receptor
            const friendRequests = await FriendModel.findAll({
                where: {
                    two_user_id: userId,
                    state: 'pending'
                }
            });
            const requesterIds = friendRequests.map(f => f.one_user_id);

            const requesterDetails = await UserModel.findAll({
                where: { id: requesterIds },
                attributes: { exclude: ['password', 'email', 'twofa_secret'] }
            });

            res.status(200).send(requesterDetails);
        } catch (e) {
            res.status(500).send({ error: e.message });
        }
    }

    async deleteFriend(req, res) {
        try {
            const { friendshipId } = req.params;
            const userId = req.user.id;

            // Buscar la relación (sin importar el estado)
            const friendship = await FriendModel.findOne({
                where: {
                    id: friendshipId,
                    [Op.or]: [
                        { one_user_id: userId },
                        { two_user_id: userId }
                    ]
                }
            });

            if (!friendship) {
                return res.status(404).send({
                    status: false,
                    message: 'Relación no encontrada'
                });
            }

            if (friendship.state === 'pending') {

                if (friendship.one_user_id !== userId && friendship.two_user_id !== userId) {
                    return res.status(403).send({
                        status: false,
                        message: 'No tienes permiso para esta acción'
                    });
                }
            }

            await FriendModel.destroy({
                where: {
                    [Op.or]: [
                        {
                            one_user_id: friendship.one_user_id,
                            two_user_id: friendship.two_user_id
                        },
                        {
                            one_user_id: friendship.two_user_id,
                            two_user_id: friendship.one_user_id
                        }
                    ]
                }
            });

            // Mensaje segun si es eliminar o simplemente recazar
            let message = 'Relación eliminada';
            if (friendship.state === 'pending') {
                message = friendship.one_user_id === userId
                    ? 'Solicitud cancelada'
                    : 'Solicitud rechazada';
            } else if (friendship.state === 'accepted') {
                message = 'Amistad eliminada';
            }
            res.status(200).send({
                status: true,
                message: message
            });
        } catch (e) {
            res.status(500).send({ error: e.message });
        }
    }
}

export default new FriendControler();