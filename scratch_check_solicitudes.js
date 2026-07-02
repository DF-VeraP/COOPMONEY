const { Client } = require('pg');
require('dotenv').config();

(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();

  // Check solicitud_credito columns
  const cols = await c.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns 
    WHERE table_name = 'solicitud_credito'
  `);
  console.log("--- Columns of solicitud_credito ---");
  console.log(cols.rows);

  // Check existing solicitudes
  const sols = await c.query(`SELECT * FROM solicitud_credito ORDER BY id_solicitud DESC LIMIT 5`);
  console.log("\n--- Solicitudes de crédito ---");
  console.log(JSON.stringify(sols.rows, null, 2));

  // Check socios
  const socios = await c.query(`
    SELECT s.id_socio, u.nombre_usuario, u.documento_usuario, s.saldo_ahorros_socio, s.id_cooperativa_socio, s.fecha_ingreso_socio
    FROM socio s JOIN usuario u ON s.id_usuario_socio = u.id_usuario
    LIMIT 10
  `);
  console.log("\n--- Socios registrados ---");
  console.log(JSON.stringify(socios.rows, null, 2));

  // Check lineas de credito
  const lineas = await c.query(`SELECT * FROM linea_credito LIMIT 10`);
  console.log("\n--- Líneas de crédito ---");
  console.log(JSON.stringify(lineas.rows, null, 2));

  // Check config_linea
  const configs = await c.query(`SELECT * FROM config_linea LIMIT 10`);
  console.log("\n--- Config de líneas ---");
  console.log(JSON.stringify(configs.rows, null, 2));

  // Check creditos activos
  const creditos = await c.query(`SELECT * FROM credito LIMIT 5`);
  console.log("\n--- Créditos existentes ---");
  console.log(JSON.stringify(creditos.rows, null, 2));

  // Check cooperativas
  const coops = await c.query(`SELECT id_cooperativa, nombre_cooperativa, estado_cooperativa FROM cooperativa`);
  console.log("\n--- Cooperativas ---");
  console.log(JSON.stringify(coops.rows, null, 2));

  await c.end();
})();
