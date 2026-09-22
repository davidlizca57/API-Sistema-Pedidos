// Importamos la conexión centralizada que acabamos de crear
const db = require('../config/db');

// 1. Obtener todos los productos del menú (GET)
const obtenerProductos = (req, res) => {
    db.query('SELECT * FROM productos', (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno al obtener los productos' });
        }
        res.json(results);
    });
};

// 2. Registrar un nuevo producto en el menú (POST)
const crearProducto = (req, res) => {
    const { nombre, descripcion, precio, categoria } = req.body;

    // Validación de entrada para asegurar que no manden campos vacíos
    if (!nombre || !precio || !categoria) {
        return res.status(400).json({ error: 'Los campos nombre, precio y categoria son obligatorios' });
    }

    const query = 'INSERT INTO productos (nombre, descripcion, precio, categoria) VALUES (?, ?, ?, ?)';
    db.query(query, [nombre, descripcion, precio, categoria], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error al registrar el producto en la base de datos' });
        }
        res.status(201).json({ 
            mensaje: 'Producto registrado con éxito en el Sistema de Pedidos', 
            id: result.insertId 
        });
    });
};

// Exportamos las funciones para que las rutas las puedan usar
module.exports = {
    obtenerProductos,
    crearProducto
};
