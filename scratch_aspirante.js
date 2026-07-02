const { Client } = require('pg');
require('dotenv').config();

async function check() {
    const c = new Client({ connectionString: process.env.DATABASE_URL });
    await c.connect();
    
    const res = await c.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'aspirante'
    `);
    console.log("--- Columns of aspirante ---");
    console.log(res.rows);
    
    await c.end();
}
check();
