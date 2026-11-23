
require('dotenv').config();

const cors = require('cors');
const express = require('express');

const productosRoutes = require('./routes/productosRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
const pedidosRoutes = require('./routes/pedidosRoutes');
const reportesRoutes = require('./routes/reportesRoutes');
const recomendacionesRoutes = require('./routes/recomendacionesRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración CORS
const origenesPermitidos = [
    'http://localhost:5173',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: origenesPermitidos
}));

app.use(express.json());

// Ruta de salud del servidor
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API del Sistema Inteligente de Pedidos funcionando correctamente'
    });
});

// Rutas del sistema
app.use('/api', productosRoutes);
app.use('/api', usuariosRoutes);
app.use('/api', pedidosRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api', recomendacionesRoutes);

// Manejo global de errores
app.use((err, req, res, next) => {
    console.error('Fallo detectado en el sistema:', err.stack);

    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        error: err.message || 'Error interno del servidor en el sistema de pedidos'
    });
});

// Inicio del servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
