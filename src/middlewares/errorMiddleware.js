// Middleware centralizado para el manejo de excepciones del sistema
const manejarErrores = (err, req, res, next) => {
    console.error('Error capturado en la capa centralizada:', err.stack);
    
    const statusCode = err.statusCode || 500;
    const mensaje = err.message || 'Error interno del servidor, servicio interrumpido temporalmente';
    
    res.status(statusCode).json({
        error: true,
        status: statusCode,
        message: mensaje
    });
};

module.exports = manejarErrores;
