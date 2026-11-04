// Script de uso único: convierte a bcrypt las contraseñas que aún no lo usan.
// Cada usuario conserva la misma contraseña que ya tenía; solo cambia la forma de guardarla.
// Ejecutar desde la raíz del proyecto:  node src/scripts/migrarPasswords.js
require('dotenv').config();
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const db = require('../config/db');

(async () => {
    const [rows] = await db.query("SELECT id, correo, password FROM usuarios WHERE password NOT LIKE '$2%'");

    if (rows.length === 0) {
        console.log('No hay contraseñas pendientes: todas usan bcrypt.');
        process.exit(0);
    }

    for (const u of rows) {
        // La cuenta ficticia de pruebas del módulo de recomendaciones recibe una clave aleatoria
        // desconocida, para que nadie pueda iniciar sesión con ella.
        const original = u.correo === 'prueba.poc@example.com'
            ? crypto.randomBytes(24).toString('hex')
            : u.password;
        const hash = await bcrypt.hash(original, 10);
        await db.query('UPDATE usuarios SET password = ? WHERE id = ?', [hash, u.id]);
        console.log(`Usuario ${u.id} (${u.correo}): migrado a bcrypt`);
    }

    console.log(`Total migrados: ${rows.length}`);
    process.exit(0);
})().catch((err) => {
    console.error('Error en la migración:', err.message);
    process.exit(1);
});