const express = require('express');
const router = express.Router();

// Importamos el controlador de pedidos correcto
const { crearPedidoCompleto } = require('../controllers/pedidosController');

//  Cambiamos a 'Middlewares' con M mayúscula para que coincida con tu VS Code
const { verificarToken } = require('../Middlewares/authMiddleware');

// El registro de pedidos requiere token obligatorio
router.post('/pedidos', verificarToken, crearPedidoCompleto);

module.exports = router;
