const db = require('../config/db'); // Ajusta la ruta a tu conexión de base de datos
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'desbloquearsistema';

// 0. OBTENER TODOS LOS USUARIOS (GET)
const obtenerUsuarios = async (req, res, next) => {
    try {
        // No devolvemos el campo password por seguridad
        const [rows] = await db.query('SELECT id, nombre, correo, rol FROM usuarios');
        res.status(200).json(rows);
    } catch (error) {
        next(error);
    }
};

// 0b. REGISTRAR UN NUEVO USUARIO CON CIFRADO DE CONTRASEÑA (POST)
const registrarUsuario = async (req, res, next) => {
    const { nombre, correo, password, rol } = req.body;

    try {
        // Validación básica de campos obligatorios
        if (!nombre || !correo || !password) {
            return res.status(400).json({ error: 'Nombre, correo y password son obligatorios' });
        }

        // Verificar que el correo no esté ya registrado
        const [existente] = await db.query('SELECT id FROM usuarios WHERE correo = ?', [correo]);
        if (existente.length > 0) {
            return res.status(409).json({ error: 'El correo ya se encuentra registrado' });
        }

        // Encriptar la contraseña obligatoriamente con bcrypt
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Insertar el nuevo usuario en MySQL
        const [result] = await db.query(
            'INSERT INTO usuarios (nombre, correo, password, rol) VALUES (?, ?, ?, ?)',
            [nombre, correo, passwordHash, rol || 'cliente']
        );

        res.status(201).json({
            message: 'Usuario registrado con éxito',
            id: result.insertId,
            usuario: { id: result.insertId, nombre, correo, rol: rol || 'cliente' }
        });

    } catch (error) {
        next(error);
    }
};

// 1. INICIO DE SESIÓN CON GENERACIÓN DE TOKEN JWT
const loginUsuario = async (req, res, next) => {
    const { correo, password } = req.body;

    try {
        // Consultar si el usuario existe por su correo electrónico
        const [rows] = await db.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
        
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas: correo no registrado' });
        }

        const usuario = rows[0];

        // Verificar si la contraseña coincide usando bcrypt
        const contraseñaValida = await bcrypt.compare(password, usuario.password);
        if (!contraseñaValida) {
            return res.status(401).json({ error: 'Credenciales inválidas: contraseña incorrecta' });
        }

        // Generar el Token de seguridad incluyendo ID, correo y ROL para la autorización
        const token = jwt.sign(
            { id: usuario.id, correo: usuario.correo, rol: usuario.rol || 'cliente' },
            JWT_SECRET,
            { expiresIn: '8h' } // El token expira automáticamente en 8 horas
        );

        // Retornar la respuesta exitosa al frontend
        res.status(200).json({
            message: 'Autenticación exitosa',
            token: token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                rol: usuario.rol || 'cliente'
            }
        });

    } catch (error) {
        next(error); // Envía el error al middleware centralizado que creamos
    }
};

// 2. ACTUALIZACIÓN DE USUARIO CON CIFRADO DE CONTRASEÑA OBLIGATORIO (PUT)
const actualizarUsuario = async (req, res, next) => {
    const { id } = req.params;
    const { nombre, correo, password, rol } = req.body;

    try {
        // 1. Verificar primero si el usuario existe en la base de datos
        const [userCheck] = await db.query('SELECT * FROM usuarios WHERE id = ?', [id]);
        if (userCheck.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado en el sistema' });
        }

        let passwordFinal = userCheck[0].password; // Si no envía password nuevo, conserva el actual

        // 2. Si el usuario envió una nueva contraseña, la encriptamos obligatoriamente con bcrypt
        if (password && password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            passwordFinal = await bcrypt.hash(password, salt);
        }

        // 3. Ejecutar la actualización segura en MySQL
        await db.query(
            'UPDATE usuarios SET nombre = ?, correo = ?, password = ?, rol = ? WHERE id = ?',
            [nombre || userCheck[0].nombre, correo || userCheck[0].correo, passwordFinal, rol || userCheck[0].rol, id]
        );

        res.status(200).json({ message: 'Usuario actualizado con éxito y seguridad garantizada' });

    } catch (error) {
        next(error);
    }
};

// 3. ELIMINAR USUARIO (DELETE)
const eliminarUsuario = async (req, res, next) => {
    const { id } = req.params;

    try {
        // Verificar que el usuario exista antes de eliminar
        const [userCheck] = await db.query('SELECT id FROM usuarios WHERE id = ?', [id]);
        if (userCheck.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado en el sistema' });
        }

        await db.query('DELETE FROM usuarios WHERE id = ?', [id]);

        res.status(200).json({ message: 'Usuario eliminado con éxito' });

    } catch (error) {
        next(error);
    }
};

// Exportamos las CINCO funciones que esperan las rutas
module.exports = {
    obtenerUsuarios,
    registrarUsuario,
    loginUsuario,
    actualizarUsuario,
    eliminarUsuario
};
