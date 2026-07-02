const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();

  // Check analyst user password
  const res = await c.query(`
    SELECT id_usuario, nombre_usuario, documento_usuario, contrasena_usuario 
    FROM usuario WHERE id_usuario = 3
  `);
  const user = res.rows[0];
  console.log("Analista:", user.nombre_usuario, "Doc:", user.documento_usuario);
  console.log("Hash almacenado:", user.contrasena_usuario);
  
  // Test various passwords
  const passwords = ['1023456789', 'admin', '123456', 'Juan123'];
  for (const p of passwords) {
    const match = await bcrypt.compare(p, user.contrasena_usuario);
    console.log(`  Password "${p}" => ${match ? '✅ MATCH' : '❌ no'}`);
  }

  await c.end();
})();
