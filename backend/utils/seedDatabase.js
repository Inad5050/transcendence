import UserModel from '../models/Users.js';

async function seedDatabase() {
  try {
    // Verificar si ya hay usuarios en la base de datos
    const userCount = await UserModel.count();
    
    if (userCount > 0) {
      console.log(`✓ Base de datos ya contiene ${userCount} usuarios. No se crearán usuarios de prueba.`);
      return;
    }

    console.log('Poblando base de datos con usuarios de prueba...');

    // Crear 10 usuarios de prueba
    const users = [
      { username: 'user1', email: 'user1@test.com', fullname: 'Usuario Uno', password: '1234' },
      { username: 'user2', email: 'user2@test.com', fullname: 'Usuario Dos', password: '1234' },
      { username: 'user3', email: 'user3@test.com', fullname: 'Usuario Tres', password: '1234' },
      { username: 'user4', email: 'user4@test.com', fullname: 'Usuario Cuatro', password: '1234' },
      { username: 'user5', email: 'user5@test.com', fullname: 'Usuario Cinco', password: '1234' },
      { username: 'user6', email: 'user6@test.com', fullname: 'Usuario Seis', password: '1234' },
      { username: 'user7', email: 'user7@test.com', fullname: 'Usuario Siete', password: '1234' },
      { username: 'user8', email: 'user8@test.com', fullname: 'Usuario Ocho', password: '1234' },
      { username: 'user9', email: 'user9@test.com', fullname: 'Usuario Nueve', password: '1234' },
      { username: 'user10', email: 'user10@test.com', fullname: 'Usuario Diez', password: '1234' },
      { username: 'ia', email: 'ia@test.com', fullname: 'IA', password: '1234' },
      { username: 'guess', email: 'guess@test.com', fullname: 'GUESS', password: '1234' }
    ];

    // Insertar usuarios en la base de datos
    await UserModel.bulkCreate(users, {
      individualHooks: true // Esto activa los hooks beforeCreate para hashear las contraseñas
    });

    console.log(`✓ ${users.length} usuarios de prueba creados exitosamente`);
    console.log('  Usuarios: user1, user2, user3, ..., user10');
    console.log('  Contraseña para todos: 1234');

  } catch (error) {
    console.error('Error al poblar la base de datos:', error);
  }
}


export default seedDatabase;