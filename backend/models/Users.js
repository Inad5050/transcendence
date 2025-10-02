import sequelize from "sequelize";
import bcrypt from "bcryptjs";
import db from '../db.js';

const UserModel = db.define('users', {
	id: {
		type: sequelize.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	username: {
		type: sequelize.STRING(40),
		allowNull: false,
		unique: true
	},
	fullname: {
		type: sequelize.STRING,
		allowNull: false
	},
	password: {
		type: sequelize.STRING,
		allowNull: false
	},
	elo: {
		type: sequelize.INTEGER,
		allowNull: false,
		defaultValue: 20
	},
	last_login: {
		type: sequelize.DATE,
		allowNull: true,
		defaultValue: null
	}

}, {
	indexes: [{ unique: true, fields: ["username"] }]
});

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;

//Logica para haseo de la contraseña
UserModel.beforeCreate(async (user) => {
	if (user.password) {
		user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
	}
});

UserModel.beforeUpdate(async (user) => {
	if (user.changed('password')) {
		user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
	}
});

// Método de instancia para validar contraseña
UserModel.prototype.verifyPassword = function (plain) {
	return bcrypt.compare(plain, this.password);
};

export default UserModel;
