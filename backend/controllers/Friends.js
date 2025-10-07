import { where } from "sequelize";
import UserModel from "../models/Users.js";
import FriendModel from "../models/Friends.js";
import { create } from "qrcode";

class FriendControler{
    constructor() {};

    async createRequest(req, res)
    {
        try
        {
            const  friendModel = await FriendModel.create(req.body);
            if (friendModel)
                res.status(200).send({ status: true, message: 'Se ha creado la solicitud de amistad'});
        }
        catch (e) {res.status(500).send({error: e})};
    }

}

export default new FriendControler();