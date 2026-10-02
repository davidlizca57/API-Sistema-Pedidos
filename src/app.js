const cors = require('cors');
const express = require("express");
const productosRoutes = require('./routes/productosRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
const pedidosRoutes = require('./routes/pedidosRoutes');
const reportesRoutes = require('./routes/reportesRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

console.log('Tipo de productosRoutes:', typeof productosRoutes);
console.log('Tipo de usuariosRoutes:', typeof usuariosRoutes);
console.log('Tipo de pedidosRoutes:', typeof pedidosRoutes);

// Inyección modular de rutas (Arquitectura totalmente desacoplada)
app.use('/api', productosRoutes);
app.use('/api', usuariosRoutes);
app.use('/api', pedidosRoutes);
app.use('/api/reportes', reportesRoutes);

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose de forma modular en http://localhost:${PORT}`);
});
