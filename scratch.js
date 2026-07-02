const { Client } = require('pg');
require('dotenv').config();

async function check() {
    const c = new Client({ connectionString: process.env.DATABASE_URL });
    await c.connect();
    const res = await c.query("SELECT enumlabel FROM pg_enum WHERE enumtypid = 'estado_general'::regtype");
    console.log(res.rows);
    await c.end();
}
check();
