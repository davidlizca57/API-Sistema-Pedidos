const mysql = require('mysql2');

// Crear la conexión centralizada a la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root1234', 
    database: 'sistema_pedidos'
});

db.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conexión exitosa a la base de datos relacional MySQL');
});

module.exports = db;
