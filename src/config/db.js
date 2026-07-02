const { Pool } = require('pg');
require('dotenv').config();

// Crear un pool de conexiones a la base de datos
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Probar la conexión inicial
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Error adquiriendo conexión a PostgreSQL', err.stack);
    } else {
        console.log('✅ Conexión a PostgreSQL establecida con éxito');
        release();
    }
});

module.exports = {
    // Exponer función query para hacer consultas desde los controladores
    query: (text, params) => pool.query(text, params),
    connect: () => pool.connect(),
};
