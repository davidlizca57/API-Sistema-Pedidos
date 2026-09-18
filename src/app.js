const express = require("express");
const mysql = require("mysql2");

const app = express();
const PORT = 3000;

app.use(express.json());

// Conexión a MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root1234',
    database: 'sistema_pedidos',
    port: 3306
});

db.connect((err) => {
    if (err) {
        console.error('Error conectando a MySQL:', err);
        return;
    }
    console.log('¡Conectado con éxito a la base de datos MySQL!');
});

// 1. LEER TODOS (GET)
app.get("/api/usuarios", (req, res) => {
    db.query('SELECT id, nombre, correo, rol FROM usuarios', (err, results) => {
        if (err) return res.status(500).json({ error: 'Error interno del servidor' });
        res.json(results);
    });
});

// 2. REGISTRO DE USUARIOS (POST) - Con Validación Básica
app.post("/api/usuarios", (req, res) => {
    const { nombre, correo, password, rol } = req.body;

    // Validación de entrada
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
});

// 3. INICIO DE SESIÓN / LOGIN (POST) - Requisito EV03
app.post("/api/usuarios/login", (req, res) => {
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
});

// 4. ACTUALIZAR USUARIO (PUT)
app.put("/api/usuarios/:id", (req, res) => {
    const { id } = req.params;
    const { nombre, correo, password, rol } = req.body;
    const query = 'UPDATE usuarios SET nombre = ?, correo = ?, password = ?, rol = ? WHERE id = ?';
    db.query(query, [nombre, correo, password, rol, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: 'Usuario actualizado correctamente' });
    });
});

// 5. ELIMINAR USUARIO (DELETE)
app.delete("/api/usuarios/:id", (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM usuarios WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: 'Usuario eliminado correctamente' });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
