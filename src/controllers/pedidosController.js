const db = require('../config/db'); // Ajusta la ruta a tu conexión de base de datos

const crearPedidoCompleto = async (req, res, next) => {
    const { usuario_id, productos } = req.body; // 'productos' es un array de objetos [{ producto_id: 1, cantidad: 2 }]

    if (!productos || productos.length === 0) {
        return res.status(400).json({ error: 'No se puede procesar un pedido sin ítems o productos' });
    }

    // Obtenemos una conexión limpia del pool para poder ejecutar la transacción manual
    const conexion = await db.getConnection();

    try {
        // 1. INICIAR LA TRANSACCIÓN ATÓMICA DE MYSQL
        await conexion.beginTransaction();

        let totalPedidoCalculado = 0;
        const listaDetallesParaInsertar = [];

        // 2. CAPA DE VALIDACIÓN FINANCIERA: Consultar precios directamente de la base de datos
        for (const item of productos) {
            const [productoRows] = await conexion.query(
                'SELECT id, precio, stock FROM productos WHERE id = ?', 
                [item.producto_id]
            );

            if (productoRows.length === 0) {
                throw new Error(`El producto con ID ${item.producto_id} no existe en el catálogo.`);
            }

            const productoBD = productoRows[0];

            // Validación opcional de inventario (Stock)
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

        // 3. INSERTAR LA CABECERA DEL PEDIDO (Tabla: pedidos)
        const [resultadoPedido] = await conexion.query(
            'INSERT INTO pedidos (usuario_id, total, estado, fecha) VALUES (?, ?, ?, NOW())',
            [usuario_id, totalPedidoCalculado, 'pendiente']
        );

        const nuevoPedidoId = resultadoPedido.insertId;

        // 4. INSERTAR LOS DETALLES DEL PEDIDO (Tabla: detalles_pedidos)
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

        // 5. SI TODO SALIÓ BIEN, CONFIRMAR Y GUARDAR LOS CAMBIOS DE MANERA DEFINITIVA
        await conexion.commit();

        res.status(201).json({
            success: true,
            message: 'Pedido registrado con éxito mediante transacción atómica',
            pedido_id: nuevoPedidoId,
            total_cobrado: totalPedidoCalculado
        });

    } catch (error) {
        // 6. EN CASO DE CUALQUIER FALLA, SE CANCELA TODO Y LA BASE DE DATOS REGRESA A SU ESTADO ORIGINAL
        await conexion.rollback();
        
        // Formateamos el error para enviarlo al manejador centralizado
        error.statusCode = 400;
        next(error);
    } finally {
        // Liberar la conexión de vuelta al pool obligatoriamente
        conexion.release();
    }
};

module.exports = { crearPedidoCompleto };
