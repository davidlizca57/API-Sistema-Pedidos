const express = require("express");
const productosRoutes = require('./routes/productosRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes'); 

const app = express();
const PORT = 3000;

app.use(express.json());

// 🚀 Inyección modular de rutas (Arquitectura totalmente desacoplada)
app.use('/api', productosRoutes);
app.use('/api', usuariosRoutes);

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose de forma modular en http://localhost:${PORT}`);
});
