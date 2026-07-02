const { Client } = require('pg');
require('dotenv').config();

(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();

  // Check users with role analista
  const analistas = await c.query(`
    SELECT id_usuario, nombre_usuario, documento_usuario, correo_usuario, id_cooperativa_usuario, rol_usuario, estado_usuario
    FROM usuario WHERE rol_usuario = 'analista'
  `);
  console.log("--- Analistas registrados ---");
  console.log(JSON.stringify(analistas.rows, null, 2));

  // Check all users in cooperativa 1
  const users1 = await c.query(`
    SELECT id_usuario, nombre_usuario, documento_usuario, rol_usuario, estado_usuario, id_cooperativa_usuario
    FROM usuario WHERE id_cooperativa_usuario = 1
  `);
  console.log("\n--- Usuarios Cooperativa 1 ---");
  console.log(JSON.stringify(users1.rows, null, 2));

  // Check all users in cooperativa 2
  const users2 = await c.query(`
    SELECT id_usuario, nombre_usuario, documento_usuario, rol_usuario, estado_usuario, id_cooperativa_usuario
    FROM usuario WHERE id_cooperativa_usuario = 2
  `);
  console.log("\n--- Usuarios Cooperativa 2 ---");
  console.log(JSON.stringify(users2.rows, null, 2));

  // Check lineas de credito for cooperativa 2
  const lineas2 = await c.query(`SELECT * FROM linea_credito WHERE id_cooperativa_linea = 2`);
  console.log("\n--- Líneas crédito Cooperativa 2 ---");
  console.log(JSON.stringify(lineas2.rows, null, 2));

  await c.end();
})();
