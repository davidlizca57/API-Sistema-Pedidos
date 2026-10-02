// Validador de campos requeridos para la integridad de datos
const validarRegistroUsuario = (req, res, next) => {
    const { nombre, correo, password } = req.body;
    
    if (!nombre || !correo || !password) {
        return res.status(400).json({ error: 'Campos requeridos incompletos: nombre, correo y password son obligatorios' });
    }
    
    if (password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe contener al menos 6 caracteres por seguridad' });
    }
    
    next(); // Permite el avance al controlador si cumple los requisitos
};

module.exports = { validarRegistroUsuario };
