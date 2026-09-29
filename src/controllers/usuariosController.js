const db = require('../config/db');
const bcrypt = require('bcrypt'); // Importamos la librería de cifrado exigida por el SENA

// 1. LEER TODOS (GET)
const obtenerUsuarios = (req, res) => {
    db.query('SELECT id, nombre, correo, rol FROM usuarios', (err, results) => {
        if (err) return res.status(500).json({ error: 'Error interno del servidor' });
        res.json(results);
    });
};

// 2. REGISTRO DE USUARIOS (POST) - ¡Ahora con cifrado de seguridad!
const registrarUsuario = async (req, res) => {
    const { nombre, correo, password, rol } = req.body;

    if (!nombre || !correo || !password) {
        return res.status(400).json({ error: 'Todos los campos (nombre, correo, password) son obligatorios' });
    }

    try {
        // Encriptamos la contraseña aplicando 10 rondas de seguridad (saltRounds)
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = 'INSERT INTO usuarios (nombre, correo, password, rol) VALUES (?, ?, ?, ?)';
        db.query(query, [nombre, correo, hashedPassword, rol || 'cliente'], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
                }
                return res.status(500).json({ error: 'Error al registrar el usuario' });
            }
            res.status(201).json({ mensaje: 'Usuario registrado con éxito y protegido con Bcrypt', id: result.insertId });
        });
    } catch (error) {
        return res.status(500).json({ error: 'Error del sistema al encriptar la credencial' });
    }
};

// 3. INICIO DE SESIÓN / LOGIN (POST) - ¡Cotejando hashes de forma segura!
const loginUsuario = (req, res) => {
    const { correo, password } = req.body;

    if (!correo || !password) {
        return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
    }

    // Buscamos al usuario por su correo
    const query = 'SELECT * FROM usuarios WHERE correo = ?';
    db.query(query, [correo], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Error en el servidor' });
        
        if (results.length === 0) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        const usuario = results[0];

        // Comparamos de forma segura la contraseña escrita con el hash oculto de la BD
        const coinciden = await bcrypt.compare(password, usuario.password);
        
        if (!coinciden) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        res.json({ 
            mensaje: 'Inicio de sesión exitoso bajo estándares Bcrypt', 
            usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol } 
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
