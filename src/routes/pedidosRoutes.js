const express = require('express');
const router = express.Router();

// Importación explícita del controlador y destructuración de los middlewares de seguridad
const pedidosController = require('../controllers/pedidosController');
const { verificarToken } = require('../middlewares/authMiddleware');

// Definición de endpoints mapeados con validación de seguridad por token JWT
router.get('/pedidos', verificarToken, pedidosController.obtenerHistorialPedidos);
router.post('/pedidos', verificarToken, pedidosController.crearPedidoCompleto);

module.exports = router;
