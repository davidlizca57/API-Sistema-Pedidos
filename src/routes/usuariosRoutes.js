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

// Definición de endpoints de usuarios enlazando funciones directas
router.get('/usuarios', obtenerUsuarios);
router.post('/usuarios', registrarUsuario);
router.post('/usuarios/login', loginUsuario);
router.put('/usuarios/:id', actualizarUsuario);
router.delete('/usuarios/:id', eliminarUsuario);

module.exports = router;
