import  sequelize  from "sequelize";
import db from '../db.js';

const UserModel = db.define('users' , {
	id: {
		type: sequelize.STRING,
		primaryKey: true,
		allowNull: false,
	},

	fullname: {
		type: sequelize.STRING,
		allowNull: false,
	},

	password: {
		type: sequelize.STRING,
		allowNull: false,
	}
});

export default UserModel;
