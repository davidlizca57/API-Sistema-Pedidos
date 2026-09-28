const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');

// Definición desacoplada de endpoints de usuarios
router.get('/usuarios', usuariosController.obtenerUsuarios);
router.post('/usuarios', usuariosController.registrarUsuario);
router.post('/usuarios/login', usuariosController.loginUsuario);
router.put('/usuarios/:id', usuariosController.actualizarUsuario);
router.delete('/usuarios/:id', usuariosController.eliminarUsuario);

module.exports = router;
