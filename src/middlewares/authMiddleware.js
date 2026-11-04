const jwt = require('jsonwebtoken');

// El secreto del token debe venir del archivo .env (ya no hay valor por defecto en el código)
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('Falta la variable JWT_SECRET en el archivo .env');
}

// Middleware de verificación de Token JWT
const verificarToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ error: 'Acceso denegado: No se suministró token de autenticación obligatorio' });
    }

    try {
        const verificado = jwt.verify(token, JWT_SECRET);
        req.usuario = verificado; // Adjunta los metadatos del usuario logueado al request
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido, expirado o alterado sin autorización' });
    }
};

// Middleware para autorización por roles específicos
const autorizarRol = (rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({ error: 'Privilegios insuficientes: Su rol de usuario no está autorizado para esta acción' });
        }
        next();
    };
};

module.exports = { verificarToken, autorizarRol };