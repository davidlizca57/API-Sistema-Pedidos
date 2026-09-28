const db = require('../config/db');

// 1. LEER TODOS (GET)
const obtenerUsuarios = (req, res) => {
    db.query('SELECT id, nombre, correo, rol FROM usuarios', (err, results) => {
        if (err) return res.status(500).json({ error: 'Error interno del servidor' });
        res.json(results);
    });
};

// 2. REGISTRO DE USUARIOS (POST)
const registrarUsuario = (req, res) => {
    const { nombre, correo, password, rol } = req.body;

    if (!nombre || !correo || !password) {
        return res.status(400).json({ error: 'Todos los campos (nombre, correo, password) son obligatorios' });
    }

    const query = 'INSERT INTO usuarios (nombre, correo, password, rol) VALUES (?, ?, ?, ?)';
    db.query(query, [nombre, correo, password, rol || 'cliente'], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
            }
            return res.status(500).json({ error: 'Error al registrar el usuario' });
        }
        res.status(201).json({ mensaje: 'Usuario registrado con éxito', id: result.insertId });
    });
};

// 3. INICIO DE SESIÓN / LOGIN (POST)
const loginUsuario = (req, res) => {
    const { correo, password } = req.body;

    if (!correo || !password) {
        return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
    }

    const query = 'SELECT * FROM usuarios WHERE correo = ? AND password = ?';
    db.query(query, [correo, password], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error en el servidor' });
        
        if (results.length === 0) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        res.json({ 
            mensaje: 'Inicio de sesión exitoso', 
            usuario: { id: results[0].id, nombre: results[0].nombre, rol: results[0].rol } 
        });
    });
};

// 4. ACTUALIZAR USUARIO (PUT)
const actualizarUsuario = (req, res) => {
    const { id } = req.params;
    const { nombre, correo, password, rol } = req.body;
    const query = 'UPDATE usuarios SET nombre = ?, correo = ?, password = ?, rol = ? WHERE id = ?';
    db.query(query, [nombre, correo, password, rol, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: 'Usuario actualizado correctamente' });
    });
};

// 5. ELIMINAR USUARIO (DELETE)
const eliminarUsuario = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM usuarios WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: 'Usuario eliminado correctamente' });
    });
};

module.exports = {
    obtenerUsuarios,
    registrarUsuario,
    loginUsuario,
    actualizarUsuario,
    eliminarUsuario
};
