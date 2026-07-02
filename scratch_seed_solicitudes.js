const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  console.log("✅ Conectado a la base de datos.");

  try {
    await c.query('BEGIN');

    // ============================================================
    // 1. CREAR LÍNEAS DE CRÉDITO para Cooperativa 2 (ALOHA)
    // ============================================================
    console.log("\n📌 Creando líneas de crédito para Cooperativa ALOHA...");
    
    const linea1 = await c.query(`
      INSERT INTO linea_credito (id_cooperativa_linea, nombre_linea, descripcion_linea)
      VALUES (2, 'Consumo', 'Crédito para libre consumo y necesidades personales')
      RETURNING id_linea_credito
    `);
    const lineaConsumoId = linea1.rows[0].id_linea_credito;
    console.log(`   ✅ Línea 'Consumo' creada (ID: ${lineaConsumoId})`);

    const linea2 = await c.query(`
      INSERT INTO linea_credito (id_cooperativa_linea, nombre_linea, descripcion_linea)
      VALUES (2, 'Vivienda', 'Crédito para adquisición o mejora de vivienda')
      RETURNING id_linea_credito
    `);
    const lineaViviendaId = linea2.rows[0].id_linea_credito;
    console.log(`   ✅ Línea 'Vivienda' creada (ID: ${lineaViviendaId})`);

    const linea3 = await c.query(`
      INSERT INTO linea_credito (id_cooperativa_linea, nombre_linea, descripcion_linea)
      VALUES (2, 'Educativo', 'Crédito para estudios y formación profesional')
      RETURNING id_linea_credito
    `);
    const lineaEducativoId = linea3.rows[0].id_linea_credito;
    console.log(`   ✅ Línea 'Educativo' creada (ID: ${lineaEducativoId})`);

    // ============================================================
    // 2. CONFIGURAR TASAS Y MONTOS PARA CADA LÍNEA
    // ============================================================
    console.log("\n📌 Configurando tasas de interés...");

    // Gestor financiero de cooperativa 2 es el usuario 6 (Ana Castro)
    const gestorId = 6;

    await c.query(`
      INSERT INTO config_linea (id_linea_config, id_gestor_config, tasa_interes_config, tasa_moratoria_config, plazo_min_config, plazo_max_config, monto_min_config, monto_max_config, fecha_actualizacion_config)
      VALUES ($1, $2, 1.5, 2.2, 6, 48, 500000, 30000000, NOW())
    `, [lineaConsumoId, gestorId]);
    console.log(`   ✅ Config Consumo: 1.5% MV, 2.2% Mora, $500K-$30M, 6-48 meses`);

    await c.query(`
      INSERT INTO config_linea (id_linea_config, id_gestor_config, tasa_interes_config, tasa_moratoria_config, plazo_min_config, plazo_max_config, monto_min_config, monto_max_config, fecha_actualizacion_config)
      VALUES ($1, $2, 1.2, 2.0, 12, 120, 5000000, 200000000, NOW())
    `, [lineaViviendaId, gestorId]);
    console.log(`   ✅ Config Vivienda: 1.2% MV, 2.0% Mora, $5M-$200M, 12-120 meses`);

    await c.query(`
      INSERT INTO config_linea (id_linea_config, id_gestor_config, tasa_interes_config, tasa_moratoria_config, plazo_min_config, plazo_max_config, monto_min_config, monto_max_config, fecha_actualizacion_config)
      VALUES ($1, $2, 0.9, 1.8, 6, 60, 500000, 50000000, NOW())
    `, [lineaEducativoId, gestorId]);
    console.log(`   ✅ Config Educativo: 0.9% MV, 1.8% Mora, $500K-$50M, 6-60 meses`);

    // ============================================================
    // 3. ACTUALIZAR DATOS FINANCIEROS DE SOCIOS EXISTENTES
    // ============================================================
    console.log("\n📌 Actualizando datos financieros de socios...");

    // Socio 5: Tatiana Ramos (id_socio=5)
    await c.query(`
      UPDATE socio SET
        saldo_ahorros_socio = 1250000,
        ingresos_mensuales_socio = 3800000,
        egresos_mensuales_socio = 1500000,
        otros_ingresos_socio = 400000,
        patrimonio_socio = 18000000,
        empresa_socio = 'Centro de Estética Glamour',
        cargo_socio = 'Estilista Profesional',
        tipo_contrato_socio = 'indefinido',
        antiguedad_meses_socio = 18
      WHERE id_socio = 5
    `);
    console.log("   ✅ Tatiana Ramos actualizada");

    // Socio 6: Topoyiyo (id_socio=6)
    await c.query(`
      UPDATE socio SET
        saldo_ahorros_socio = 2800000,
        ingresos_mensuales_socio = 5200000,
        egresos_mensuales_socio = 2100000,
        otros_ingresos_socio = 800000,
        patrimonio_socio = 45000000,
        empresa_socio = 'Distribuidora El Buen Gusto S.A.S.',
        cargo_socio = 'Gerente Comercial',
        tipo_contrato_socio = 'indefinido',
        antiguedad_meses_socio = 36
      WHERE id_socio = 6
    `);
    console.log("   ✅ Topoyiyo actualizado");

    // Socio 7: Pepita Florez (id_socio=7)
    await c.query(`
      UPDATE socio SET
        saldo_ahorros_socio = 750000,
        ingresos_mensuales_socio = 2200000,
        egresos_mensuales_socio = 1800000,
        otros_ingresos_socio = 0,
        patrimonio_socio = 8000000,
        empresa_socio = 'Restaurante La Casona',
        cargo_socio = 'Mesera',
        tipo_contrato_socio = 'fijo',
        antiguedad_meses_socio = 4
      WHERE id_socio = 7
    `);
    console.log("   ✅ Pepita Florez actualizada");

    // ============================================================
    // 4. OBTENER CONFIGS RECIÉN CREADAS
    // ============================================================
    const configConsumo = await c.query(`SELECT id_config FROM config_linea WHERE id_linea_config = $1`, [lineaConsumoId]);
    const configVivienda = await c.query(`SELECT id_config FROM config_linea WHERE id_linea_config = $1`, [lineaViviendaId]);
    const configEducativo = await c.query(`SELECT id_config FROM config_linea WHERE id_linea_config = $1`, [lineaEducativoId]);

    const configIdConsumo = configConsumo.rows[0].id_config;
    const configIdVivienda = configVivienda.rows[0].id_config;
    const configIdEducativo = configEducativo.rows[0].id_config;

    // ============================================================
    // 5. CREAR SOLICITUDES DE CRÉDITO PENDIENTES (Datos reales)
    // ============================================================
    console.log("\n📌 Creando solicitudes de crédito pendientes...");

    // Solicitud 1: Tatiana Ramos → Consumo → Compra de vehículo
    await c.query(`
      INSERT INTO solicitud_credito (
        id_socio_solicitud, id_linea_solicitud, id_config_solicitud,
        monto_solicitado_solicitud, plazo_meses_solicitud, proposito_solicitud,
        estado_solicitud, fecha_solicitud
      ) VALUES ($1, $2, $3, 5000000, 12, 'Compra de vehículo para desplazamiento al trabajo', 'pendiente', NOW() - INTERVAL '2 days')
    `, [5, lineaConsumoId, configIdConsumo]);
    console.log("   ✅ Solicitud de Tatiana Ramos: $5,000,000 - Consumo - Compra de vehículo");

    // Solicitud 2: Topoyiyo → Vivienda → Mejora de vivienda
    await c.query(`
      INSERT INTO solicitud_credito (
        id_socio_solicitud, id_linea_solicitud, id_config_solicitud,
        monto_solicitado_solicitud, plazo_meses_solicitud, proposito_solicitud,
        estado_solicitud, fecha_solicitud
      ) VALUES ($1, $2, $3, 15000000, 36, 'Remodelación completa del segundo piso de la casa propia', 'pendiente', NOW() - INTERVAL '1 day')
    `, [6, lineaViviendaId, configIdVivienda]);
    console.log("   ✅ Solicitud de Topoyiyo: $15,000,000 - Vivienda - Remodelación");

    // Solicitud 3: Pepita Florez → Educativo → Estudios universitarios
    await c.query(`
      INSERT INTO solicitud_credito (
        id_socio_solicitud, id_linea_solicitud, id_config_solicitud,
        monto_solicitado_solicitud, plazo_meses_solicitud, proposito_solicitud,
        estado_solicitud, fecha_solicitud
      ) VALUES ($1, $2, $3, 3500000, 24, 'Pago de matrícula semestral en la universidad USCO - Ingeniería de Sistemas', 'pendiente', NOW() - INTERVAL '5 hours')
    `, [7, lineaEducativoId, configIdEducativo]);
    console.log("   ✅ Solicitud de Pepita Florez: $3,500,000 - Educativo - Matrícula");

    // ============================================================
    // 6. AGREGAR ALGUNOS MOVIMIENTOS DE AHORRO PARA HISTORIAL
    // ============================================================
    console.log("\n📌 Agregando movimientos de ahorro para historial...");

    // Movimientos para Tatiana (socio 5)
    const movsTatiana = [
      [5, 250000, 'deposito', 'Cuota de ahorro mensual - Enero 2026', '2026-01-15'],
      [5, 300000, 'deposito', 'Cuota de ahorro mensual - Febrero 2026', '2026-02-15'],
      [5, 200000, 'deposito', 'Cuota de ahorro mensual - Marzo 2026', '2026-03-15'],
      [5, 100000, 'retiro', 'Retiro para emergencia médica', '2026-03-28'],
      [5, 300000, 'deposito', 'Cuota de ahorro mensual - Abril 2026', '2026-04-15'],
      [5, 300000, 'deposito', 'Cuota de ahorro mensual - Mayo 2026', '2026-05-12'],
    ];

    for (const m of movsTatiana) {
      await c.query(`
        INSERT INTO movimiento_ahorro (id_socio_movimiento, monto_movimiento, tipo_movimiento, descripcion_movimiento, fecha_movimiento)
        VALUES ($1, $2, $3, $4, $5)
      `, m);
    }
    console.log("   ✅ 6 movimientos para Tatiana Ramos");

    // Movimientos para Topoyiyo (socio 6)
    const movsTopoyiyo = [
      [6, 500000, 'deposito', 'Aporte inicial de afiliación', '2026-01-05'],
      [6, 400000, 'deposito', 'Cuota de ahorro mensual - Febrero 2026', '2026-02-10'],
      [6, 500000, 'deposito', 'Cuota de ahorro mensual - Marzo 2026', '2026-03-10'],
      [6, 500000, 'deposito', 'Cuota de ahorro mensual - Abril 2026', '2026-04-10'],
      [6, 500000, 'deposito', 'Cuota de ahorro mensual - Mayo 2026', '2026-05-10'],
      [6, 400000, 'deposito', 'Ingreso adicional por bonificación', '2026-05-15'],
    ];

    for (const m of movsTopoyiyo) {
      await c.query(`
        INSERT INTO movimiento_ahorro (id_socio_movimiento, monto_movimiento, tipo_movimiento, descripcion_movimiento, fecha_movimiento)
        VALUES ($1, $2, $3, $4, $5)
      `, m);
    }
    console.log("   ✅ 6 movimientos para Topoyiyo");

    // Movimientos para Pepita Florez (socio 7)
    const movsPepita = [
      [7, 350000, 'deposito', 'Aporte inicial de afiliación', '2026-03-19'],
      [7, 200000, 'deposito', 'Cuota de ahorro mensual - Abril 2026', '2026-04-20'],
      [7, 200000, 'deposito', 'Cuota de ahorro mensual - Mayo 2026', '2026-05-18'],
    ];

    for (const m of movsPepita) {
      await c.query(`
        INSERT INTO movimiento_ahorro (id_socio_movimiento, monto_movimiento, tipo_movimiento, descripcion_movimiento, fecha_movimiento)
        VALUES ($1, $2, $3, $4, $5)
      `, m);
    }
    console.log("   ✅ 3 movimientos para Pepita Florez");

    await c.query('COMMIT');
    console.log("\n🎉 ¡DATOS DE PRUEBA INSERTADOS EXITOSAMENTE!");
    console.log("\n📋 RESUMEN:");
    console.log("   • 3 líneas de crédito creadas (Consumo, Vivienda, Educativo)");
    console.log("   • 3 configuraciones financieras asociadas");
    console.log("   • 3 socios actualizados con datos financieros completos");
    console.log("   • 3 solicitudes de crédito pendientes");
    console.log("   • 15 movimientos de ahorro para historial");
    console.log("\n👤 Login de analista para probar:");
    console.log("   Cooperativa: Cooperativa ALOHA");
    console.log("   Usuario: 1023456789 (Juan Perez)");

  } catch (err) {
    await c.query('ROLLBACK');
    console.error("❌ Error:", err.message);
  } finally {
    await c.end();
  }
})();
