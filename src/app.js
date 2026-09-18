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
    db.query('SELECT * FROM usuarios', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 2. CREAR NUEVO USUARIO / REGISTRO (POST)
app.post("/api/usuarios", (req, res) => {
    const { nombre, correo, password, rol } = req.body;
    const query = 'INSERT INTO usuarios (nombre, correo, password, rol) VALUES (?, ?, ?, ?)';
    db.query(query, [nombre, correo, password, rol || 'cliente'], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ mensaje: 'Usuario registrado con éxito', id: result.insertId });
    });
});

// 3. ACTUALIZAR USUARIO (PUT)
app.put("/api/usuarios/:id", (req, res) => {
    const { id } = req.params;
    const { nombre, correo, password, rol } = req.body;
    const query = 'UPDATE usuarios SET nombre = ?, correo = ?, password = ?, rol = ? WHERE id = ?';
    db.query(query, [nombre, correo, password, rol, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: 'Usuario actualizado correctamente' });
    });
});

// 4. ELIMINAR USUARIO (DELETE)
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
