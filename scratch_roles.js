const { Client } = require('pg');
require('dotenv').config();

async function check() {
    const c = new Client({ connectionString: process.env.DATABASE_URL });
    await c.connect();
    const res = await c.query("SELECT id_usuario, correo_usuario, rol_usuario FROM usuario");
    console.log(res.rows);
    await c.end();
}
check();
