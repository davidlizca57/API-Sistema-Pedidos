const express = require('express');
const router = express.Router();

// Importamos el controlador de reportes
const { obtenerReporteVentas } = require('../controllers/reporteController');

// Importamos los middlewares de seguridad desde la carpeta correcta
const { verificarToken, autorizarRol } = require('../Middlewares/authMiddleware');

// Definimos la ruta del reporte (el prefijo /reportes se añade en app.js)
router.get('/ventas', verificarToken, autorizarRol(['administrador']), obtenerReporteVentas);

module.exports = router;
