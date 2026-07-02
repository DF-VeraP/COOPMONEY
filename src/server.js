const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET no está configurado en el entorno');
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del Frontend (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '../public')));

// Manejo de la ruta principal para entregar el index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Rutas API
const apiRoutes = require('./routes/api.routes');
app.use('/api', apiRoutes);

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
    console.log(`📁 Sirviendo el frontend en http://localhost:${PORT}/`);
});
