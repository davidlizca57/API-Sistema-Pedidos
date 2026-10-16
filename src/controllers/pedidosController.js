const db = require('../config/db'); // Ajusta la ruta a tu conexión de base de datos

// 1. CREAR UN NUEVO PEDIDO MEDIANTE TRANSACCIÓN ATÓMICA
const crearPedidoCompleto = async (req, res, next) => {
    //  Extraemos el ID del token verificado (req.usuario.id) y NO del body
    const usuario_id = req.usuario.id;
    const { productos } = req.body; // 'productos' es un array de objetos [{ producto_id: 1, cantidad: 2 }]

    if (!productos || productos.length === 0) {
        return res.status(400).json({ error: 'No se puede procesar un pedido sin ítems o productos' });
    }

    // Obtenemos una conexión limpia del pool para poder ejecutar la transacción manual
    const conexion = await db.getConnection();

    try {
        // INICIAR LA TRANSACCIÓN ATÓMICA DE MYSQL
        await conexion.beginTransaction();

        let totalPedidoCalculado = 0;
        const listaDetallesParaInsertar = [];

        // CAPA DE VALIDACIÓN FINANCIERA: Consultar precios directamente de la base de datos
        for (const item of productos) {
            const [productoRows] = await conexion.query(
                'SELECT id, precio, stock FROM productos WHERE id = ?', 
                [item.producto_id]
            );

            if (productoRows.length === 0) {
                throw new Error(`El producto con ID ${item.producto_id} no existe en el catálogo.`);
            }

            const productoBD = productoRows[0];

            // Validación de inventario (Stock)
            if (productoBD.stock < item.cantidad) {
                throw new Error(`Inconsistencia: Stock insuficiente para el producto ID ${item.producto_id}`);
            }

            // Calcular el subtotal usando el precio real del backend
            const subtotalItem = productoBD.precio * item.cantidad;
            totalPedidoCalculado += subtotalItem;

            // Guardamos los datos validados para la inserción posterior del detalle
            listaDetallesParaInsertar.push({
                producto_id: productoBD.id,
                cantidad: item.cantidad,
                precio_unitario: productoBD.precio
            });
        }

        // INSERTAR LA CABECERA DEL PEDIDO (Tabla: pedidos)
        const [resultadoPedido] = await conexion.query(
            'INSERT INTO pedidos (usuario_id, total, estado, fecha) VALUES (?, ?, ?, NOW())',
            [usuario_id, totalPedidoCalculado, 'pendiente']
        );

        const nuevoPedidoId = resultadoPedido.insertId;

        // INSERTAR LOS DETALLES DEL PEDIDO (Tabla: detalles_pedidos)
        for (const detalle of listaDetallesParaInsertar) {
            await conexion.query(
                'INSERT INTO detalles_pedidos (pedido_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
                [nuevoPedidoId, detalle.producto_id, detalle.cantidad, detalle.precio_unitario]
            );

            // Actualizar o rebajar el stock del producto de forma automática
            await conexion.query(
                'UPDATE productos SET stock = stock - ? WHERE id = ?',
                [detalle.cantidad, detalle.producto_id]
            );
        }

        // SI TODO SALIÓ BIEN, CONFIRMAR Y GUARDAR LOS CAMBIOS DE MANERA DEFINITIVA
        await conexion.commit();

        res.status(201).json({
            success: true,
            message: 'Pedido registrado con éxito mediante transacción atómica',
            pedido_id: nuevoPedidoId,
            total_cobrado: totalPedidoCalculado
        });

    } catch (error) {
        // EN CASO DE CUALQUIER FALLA, SE CANCELA TODO Y LA BASE DE DATOS REGRESA A SU ESTADO ORIGINAL
        await conexion.rollback();
        
        // Formateamos el error para enviarlo al manejador centralizado
        error.statusCode = 400;
        next(error);
    } finally {
        // Liberar la conexión de vuelta al pool obligatoriamente
        conexion.release();
    }
};

// 2. 👁️ SOLUCIÓN PARA LA INSTRUCTORA: NUEVA FUNCIÓN PARA TRAER EL HISTORIAL DE PEDIDOS (GET /api/pedidos)
const obtenerHistorialPedidos = async (req, res, next) => {
    const usuario_id = req.usuario.id;
    const rol = req.usuario.role || req.usuario.rol; // Soporta ambos nombres de propiedad del token

    try {
        let consultaSql;
        let parametros = [];

        // Si es administrador ve todos los pedidos del restaurante; si es cliente solo los suyos
        if (rol === 'administrador') {
            consultaSql = `
                SELECT p.id AS pedido_id, p.fecha, p.total, p.estado, u.nombre AS cliente 
                FROM pedidos p 
                INNER JOIN usuarios u ON p.usuario_id = u.id 
                ORDER BY p.fecha DESC
            `;
        } else {
            consultaSql = `
                SELECT id AS pedido_id, fecha, total, estado, usuario_id AS cliente 
                FROM pedidos 
                WHERE usuario_id = ? 
                ORDER BY fecha DESC
            `;
            parametros.push(usuario_id);
        }

        const [rows] = await db.query(consultaSql, parametros);
        res.status(200).json(rows);
    } catch (error) {
        next(error);
    }
};

module.exports = { 
    crearPedidoCompleto,
    obtenerHistorialPedidos // Exportamos la nueva función requerida
};
