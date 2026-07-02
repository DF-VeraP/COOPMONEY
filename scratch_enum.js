const { Client } = require('pg');
require('dotenv').config();

async function check() {
    const c = new Client({ connectionString: process.env.DATABASE_URL });
    await c.connect();
    
    const enums = ['estado_socio', 'tipo_contrato_socio', 'estado_credito', 'estado_cuota', 'tipo_movimiento'];
    for (const name of enums) {
        try {
            const res = await c.query("SELECT enumlabel FROM pg_enum WHERE enumtypid = $1::regtype", [name]);
            console.log(`\n--- Enum: ${name} ---`);
            console.log(res.rows.map(r => r.enumlabel));
        } catch(e) {
            console.log(`Error reading ${name}:`, e.message);
        }
    }
    
    await c.end();
}
check();
