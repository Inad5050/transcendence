import UserModel from "../models/Users.js";
import { Op } from "sequelize";

export function startActivityCheck() {
    // Ejecutar inmediatamente una vez
    checkInactiveUsers();
    
    // Luego cada N minutos
    const intervalId = setInterval(checkInactiveUsers, 4 * 60 * 1000); // 4 minutos
    
    return intervalId;
}

export function stopActivityCheck(intervalId) {
    if (intervalId) {
        clearInterval(intervalId);
        console.log('✅ Job de inactividad detenido');
    }
}

async function checkInactiveUsers() {
    try {
        const result = await UserModel.update(
            {status: 'offline'},
            {
                where: {
                    status: 'online',
                    last_activity: {
                        [Op.lt]: new Date(Date.now() - 5 * 60 * 1000) // 5 minutos de inactividad
                    }
                }
            }
        );
        const affectedRows = result[0];
        
        if (affectedRows > 0) {
            console.log(`🔄 ${affectedRows} usuarios marcados como offline`);
        }
    } catch (error) {
        console.error('❌ Error en job de inactividad:', error.message);
    }
}

export default (checkInactiveUsers, startActivityCheck, stopActivityCheck);