const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidosController');

// Endpoints desacoplados para el flujo de ventas e inventario
router.post('/pedidos', pedidosController.crearPedidoCompleto);
router.get('/pedidos', pedidosController.obtenerHistorialPedidos);

module.exports = router;
