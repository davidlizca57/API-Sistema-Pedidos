const db = require('../config/db');

// CREAR UN PEDIDO REAL E INSERTAR SUS DETALLES (Operación de Integración Completa)
const crearPedidoCompleto = async (req, res) => {
    const { usuario_id, total, items } = req.body; // 'items' será un array con los platos comprados

    // Validación estricta para asegurar la integridad de datos exigida por el SENA
    if (!usuario_id || !total || !items || items.length === 0) {
        return res.status(400).json({ error: 'Faltan datos obligatorios para procesar la transacción del pedido' });
    }

    // Iniciamos la inserción del Pedido General (Cabecera)
    const queryPedido = 'INSERT INTO pedidos (usuario_id, total) VALUES (?, ?)';
    
    db.query(queryPedido, [usuario_id, total], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno al registrar la cabecera del pedido en MySQL' });
        }

        const pedidoId = result.insertId; // Capturamos el ID autogenerado del pedido
        
        // Mapeamos e preparamos las consultas para insertar cada plato en detalles_pedidos
        const queryDetalle = 'INSERT INTO detalles_pedidos (pedido_id, producto_id, cantidad, precio_unitario) VALUES ?';
        
        // Transformamos el array de productos del frontend en la estructura que acepta MySQL
        const valoresDetalles = items.map(item => [
            pedidoId,
            item.producto_id,
            item.cantidad,
            item.precio_unitario
        ]);

        // Insertamos masivamente todos los detalles del pedido de un solo golpe
        db.query(queryDetalle, [valoresDetalles], (errDetalle) => {
            if (errDetalle) {
                return res.status(500).json({ error: 'Error al persistir el desglose de productos en la base de datos' });
            }

            res.status(201).json({
                mensaje: 'Pedido y detalles registrados con éxito absoluto en el backend',
                pedido_id: pedidoId
            });
        });
    });
};

// CONSULTAR HISTORIAL REAL DE PEDIDOS (GET)
const obtenerHistorialPedidos = (req, res) => {
    const query = `
        SELECT p.id AS pedido_id, p.fecha, p.total, p.estado, u.nombre AS cliente 
        FROM pedidos p 
        INNER JOIN usuarios u ON p.usuario_id = u.id 
        ORDER BY p.fecha DESC`;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: 'Error al consultar el historial relacional' });
        res.json(results);
    });
};

module.exports = {
    crearPedidoCompleto,
    obtenerHistorialPedidos
};
