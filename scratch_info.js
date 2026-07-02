const { Client } = require('pg');
require('dotenv').config();

async function check() {
    const c = new Client({ connectionString: process.env.DATABASE_URL });
    await c.connect();
    
    const coops = await c.query("SELECT id_cooperativa, nombre_cooperativa FROM cooperativa");
    console.log("--- COOPERATIVAS ---");
    console.log(coops.rows);
    
    const socios = await c.query("SELECT * FROM socio");
    console.log("\n--- SOCIOS ---");
    console.log(socios.rows);
    
    await c.end();
}
check();
