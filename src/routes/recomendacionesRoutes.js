const express = require('express');
const router = express.Router();
const { recomendar } = require('../controllers/recomendacionesController');

// POST /api/recomendaciones  (se monta con app.use('/api', ...) igual que las demás rutas)
router.post('/recomendaciones', recomendar);

module.exports = router;
