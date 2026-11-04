const express = require('express');
const router = express.Router();

// Importamos las funciones destructuradas directamente del controlador
const {
    obtenerUsuarios,
    registrarUsuario,
    loginUsuario,
    actualizarUsuario,
    eliminarUsuario
} = require('../controllers/usuariosController');

// Middlewares de autenticación (token) y autorización (rol)
const { verificarToken, autorizarRol } = require('../middlewares/authMiddleware');

// Rutas públicas: registro (siempre crea clientes) e inicio de sesión
router.post('/usuarios', registrarUsuario);
router.post('/usuarios/login', loginUsuario);

// Rutas protegidas: solo un administrador con token válido
router.get('/usuarios', verificarToken, autorizarRol(['administrador']), obtenerUsuarios);
router.put('/usuarios/:id', verificarToken, autorizarRol(['administrador']), actualizarUsuario);
router.delete('/usuarios/:id', verificarToken, autorizarRol(['administrador']), eliminarUsuario);

module.exports = router;