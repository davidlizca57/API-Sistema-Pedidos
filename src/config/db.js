
require('dotenv').config();

const mysql = require('mysql2/promise');

const variablesRequeridas = [
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME'
];

for (const variable of variablesRequeridas) {
    if (!process.env[variable]) {
        throw new Error(`Falta configurar la variable de entorno: ${variable}`);
    }
}

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: process.env.DB_SSL === 'true'
        ? { rejectUnauthorized: true }
        : undefined
});

db.getConnection()
    .then((connection) => {
        console.log('Conexión exitosa a MySQL');
        connection.release();
    })
    .catch((err) => {
        console.error('Error al conectar con MySQL:', err.message);
    });

module.exports = db;

