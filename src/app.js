const cors = require('cors');
const express = require("express");
const productosRoutes = require('./routes/productosRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
const pedidosRoutes = require('./routes/pedidosRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Inyección modular de rutas (Arquitectura totalmente desacoplada)
app.use('/api', productosRoutes);
app.use('/api', usuariosRoutes);
app.use('/api', pedidosRoutes);

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose de forma modular en http://localhost:${PORT}`);
});
