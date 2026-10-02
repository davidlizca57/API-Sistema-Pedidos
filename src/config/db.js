const mysql = require('mysql2/promise');
require('dotenv').config();

// Creamos un Pool de conexiones permanente para soportar transacciones seguras
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root1234',
    database: process.env.DB_NAME || 'sistema_pedidos',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Verificación inicial de la conexión (Reemplaza al db.connect antiguo)
db.getConnection()
    .then((connection) => {
        console.log('Conexión exitosa a la base de datos MySQL mediante Pool de Promesas');
        connection.release(); // Devolvemos la conexión al pool inmediatamente
    })
    .catch((err) => {
        console.error('Error crítico al conectar a la base de datos MySQL:', err.message);
    });

module.exports = db;
