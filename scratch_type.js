const { Client } = require('pg');
require('dotenv').config();

async function check() {
    const c = new Client({ connectionString: process.env.DATABASE_URL });
    await c.connect();
    
    const res = await c.query(`
        SELECT udt_name 
        FROM information_schema.columns 
        WHERE table_name = 'socio' AND column_name IN ('estado_socio', 'tipo_contrato_socio')
    `);
    console.log("--- Column Types in 'socio' ---");
    console.log(res.rows);
    
    // List all enums
    const enums = await c.query(`
        SELECT t.typname, e.enumlabel
        FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid
        GROUP BY t.typname, e.enumlabel
    `);
    console.log("\n--- All Enums ---");
    console.log(enums.rows);
    
    await c.end();
}
check();
