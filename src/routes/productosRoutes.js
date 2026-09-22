const express = require('express');
const router = express.Router();
// Importamos el controlador correspondiente
const productosController = require('../controllers/productosController');

// Definimos los endpoints para el módulo de productos
router.get('/productos', productosController.obtenerProductos);
router.post('/productos', productosController.crearProducto);

module.exports = router;
