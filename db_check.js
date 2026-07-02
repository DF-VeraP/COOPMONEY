const { Client } = require('pg');
require('dotenv').config();

async function analyzeDB() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();
        console.log("Conectado a la base de datos.");
        
        // Obtener todas las tablas
        const resTables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        
        const tables = resTables.rows.map(r => r.table_name);
        console.log("Tablas encontradas:", tables);
        
        // Para cada tabla, obtener sus columnas
        for (const table of tables) {
            const resCols = await client.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = $1
            `, [table]);
            
            console.log(`\n--- Tabla: ${table} ---`);
            resCols.rows.forEach(col => {
                console.log(`- ${col.column_name} (${col.data_type})`);
            });
        }
        
    } catch (err) {
        console.error("Error analizando la base de datos:", err);
    } finally {
        await client.end();
    }
}

analyzeDB();
