const { Client } = require('pg');
require('dotenv').config();

async function check() {
    const c = new Client({ connectionString: process.env.DATABASE_URL });
    await c.connect();
    
    const lines = await c.query("SELECT * FROM linea_credito");
    console.log("--- LINEAS DE CREDITO ---");
    console.log(lines.rows);
    
    const configs = await c.query("SELECT * FROM config_linea");
    console.log("\n--- CONFIG LINEAS ---");
    console.log(configs.rows);
    
    await c.end();
}
check();
