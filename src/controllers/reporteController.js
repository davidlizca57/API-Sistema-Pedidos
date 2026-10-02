const db = require('../config/db');

// Generar métricas y estadísticas de ventas para el administrador
const obtenerReporteVentas = async (req, res, next) => {
    try {
        // 1. Obtener la suma total de ingresos y cantidad total de pedidos aprobados
        const [metricasRows] = await db.query(
            "SELECT SUM(total) AS ingresos_totales, COUNT(id) AS conteo_pedidos FROM pedidos WHERE estado != 'Cancelado'"
        );

        // 2. Obtener el top de los 3 productos más vendidos en el restaurante
        const [productosTopRows] = await db.query(
            "SELECT p.nombre, SUM(dp.cantidad) AS unidades_vendidas FROM detalles_pedidos dp INNER JOIN productos p ON dp.producto_id = p.id GROUP BY dp.producto_id ORDER BY unidades_vendidas DESC LIMIT 3"
        );

        // Extraemos la primera fila de las métricas de forma segura
        const datos = metricasRows[0] || { ingresos_totales: 0, conteo_pedidos: 0 };

        res.status(200).json({
            success: true,
            fecha_generacion: new Date(),
            resumen: {
                ingresos_totales: parseFloat(datos.ingresos_totales || 0),
                total_pedidos: parseInt(datos.conteo_pedidos || 0)
            },
            productos_estrella: productosTopRows
        });

    } catch (error) {
        next(error);
    }
};

module.exports = { obtenerReporteVentas };
