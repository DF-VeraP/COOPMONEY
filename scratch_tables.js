const { Client } = require('pg');
require('dotenv').config();

async function check() {
    const c = new Client({ connectionString: process.env.DATABASE_URL });
    await c.connect();
    
    const tables = await c.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    `);
    console.log("--- TABLES IN DATABASE ---");
    console.log(tables.rows.map(t => t.table_name));
    
    // Check columns of key tables
    const cols = ['socio', 'movimiento_ahorro', 'notificacion', 'cuota', 'credito'];
    for (const table of cols) {
        try {
            const res = await c.query(`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns 
                WHERE table_name = $1
            `, [table]);
            console.log(`\n--- Columns of ${table} ---`);
            console.log(res.rows);
        } catch(e) {
            console.log(`Error checking columns of ${table}:`, e.message);
        }
    }
    
    await c.end();
}
check();
