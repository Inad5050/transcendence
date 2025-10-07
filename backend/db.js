import { Sequelize } from "sequelize";

class DBInstance {
    constructor () {
        // Configuración para SQLite
        this.sequelize = new Sequelize({
            dialect: 'sqlite',
            storage: './database.sqlite', // Archivo donde se guardará la base de datos
            logging: false,
        });
    }
}

export default new DBInstance().sequelize;
