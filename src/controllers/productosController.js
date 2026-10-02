const db = require('../config/db');

// 1. Obtener todos los productos del menú
const obtenerProductos = async (req, res, next) => {
    try {
        const [rows] = await db.query('SELECT * FROM productos');
        res.status(200).json(rows);
    } catch (error) {
        next(error);
    }
};

// 2. Crear un nuevo producto en el catálogo
const crearProducto = async (req, res, next) => {
    const { nombre, descripcion, precio, categoria, stock } = req.body;
    try {
        if (!nombre || !precio || !categoria) {
            return res.status(400).json({ error: 'Nombre, precio y categoría son campos obligatorios' });
        }

        const [resultado] = await db.query(
            'INSERT INTO productos (nombre, descripcion, precio, categoria, stock) VALUES (?, ?, ?, ?, ?)',
            [nombre, descripcion, precio, categoria, stock || 50]
        );

        res.status(201).json({
            message: 'Producto creado exitosamente',
            productoId: resultado.insertId
        });
    } catch (error) {
        next(error);
    }
};

// Aseguramos la exportación correcta de ambas funciones
module.exports = {
    obtenerProductos,
    crearProducto
};
