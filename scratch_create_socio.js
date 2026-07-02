const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function run() {
    const c = new Client({ connectionString: process.env.DATABASE_URL });
    await c.connect();
    
    try {
        console.log("Limpiando datos viejos...");
        await c.query("DELETE FROM cuota WHERE id_credito_cuota IN (SELECT id_credito FROM credito WHERE id_socio_credito IN (SELECT id_socio FROM socio WHERE id_usuario_socio IN (SELECT id_usuario FROM usuario WHERE correo_usuario = 'socio@coop.com')))");
        await c.query("DELETE FROM credito WHERE id_socio_credito IN (SELECT id_socio FROM socio WHERE id_usuario_socio IN (SELECT id_usuario FROM usuario WHERE correo_usuario = 'socio@coop.com'))");
        await c.query("DELETE FROM solicitud_credito WHERE id_socio_solicitud IN (SELECT id_socio FROM socio WHERE id_usuario_socio IN (SELECT id_usuario FROM usuario WHERE correo_usuario = 'socio@coop.com'))");
        await c.query("DELETE FROM socio WHERE id_usuario_socio IN (SELECT id_usuario FROM usuario WHERE correo_usuario = 'socio@coop.com')");
        await c.query("DELETE FROM config_linea WHERE id_gestor_config = 6");
        await c.query("DELETE FROM linea_credito WHERE id_cooperativa_linea = 1");
        await c.query("DELETE FROM usuario WHERE correo_usuario = 'socio@coop.com'");
        
        console.log("Creando usuario socio...");
        const salt = await bcrypt.genSalt(12);
        const hash = await bcrypt.hash('123456', salt);
        
        const userRes = await c.query(`
            INSERT INTO usuario (
                id_cooperativa_usuario, nombre_usuario, documento_usuario, 
                correo_usuario, contrasena_usuario, rol_usuario, estado_usuario, telefono_usuario
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id_usuario
        `, [1, 'Juan Pérez Socio', '1098765432', 'socio@coop.com', hash, 'socio', 'activo', '3159876543']);
        
        const userId = userRes.rows[0].id_usuario;
        console.log(`Usuario socio creado con ID: ${userId}`);
        
        console.log("Creando registro de socio...");
        const socioRes = await c.query(`
            INSERT INTO socio (
                id_usuario_socio, id_cooperativa_socio, saldo_ahorros_socio, 
                estado_socio, empresa_socio, cargo_socio, tipo_contrato_socio, 
                antiguedad_meses_socio, ingresos_mensuales_socio, egresos_mensuales_socio, 
                otros_ingresos_socio, patrimonio_socio
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id_socio
        `, [
            userId, 1, 2850000.00, 'activo', 'Innovatech Ltda', 
            'Ingeniero de Sistemas', 'indefinido', 36, 4200000.00, 
            1600000.00, 400000.00, 25000000.00
        ]);
        
        const socioId = socioRes.rows[0].id_socio;
        console.log(`Socio registrado con ID: ${socioId}`);
        
        console.log("Creando línea de crédito...");
        const lineaRes = await c.query(`
            INSERT INTO linea_credito (
                id_cooperativa_linea, nombre_linea, descripcion_linea
            ) VALUES ($1, $2, $3) RETURNING id_linea_credito
        `, [1, 'Libre Inversión', 'Crédito multipropósito de libre asignación']);
        const lineaId = lineaRes.rows[0].id_linea_credito;
        console.log(`Línea de crédito creada con ID: ${lineaId}`);
        
        console.log("Creando configuración de línea...");
        const configRes = await c.query(`
            INSERT INTO config_linea (
                id_linea_config, id_gestor_config, tasa_interes_config, 
                tasa_moratoria_config, plazo_min_config, plazo_max_config, 
                monto_min_config, monto_max_config, fecha_actualizacion_config
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING id_config
        `, [lineaId, 6, 1.8, 2.5, 6, 36, 1000000.00, 50000000.00]);
        const configId = configRes.rows[0].id_config;
        console.log(`Configuración de línea creada con ID: ${configId}`);
        
        console.log("Creando solicitud de crédito...");
        const solicitudRes = await c.query(`
            INSERT INTO solicitud_credito (
                id_socio_solicitud, id_linea_solicitud, id_config_solicitud,
                monto_solicitado_solicitud, plazo_meses_solicitud, proposito_solicitud,
                estado_solicitud, fecha_solicitud
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING id_solicitud
        `, [socioId, lineaId, configId, 12000000.00, 12, 'Compra de equipo tecnológico', 'desembolsada']);
        const solicitudId = solicitudRes.rows[0].id_solicitud;
        console.log(`Solicitud de crédito creada con ID: ${solicitudId}`);
        
        console.log("Creando crédito de prueba...");
        const creditoRes = await c.query(`
            INSERT INTO credito (
                id_socio_credito, id_solicitud_credito, id_linea_credito,
                monto_aprobado_credito, tasa_interes_credito, 
                tasa_moratoria_credito, plazo_meses_credito, saldo_pendiente_credito, 
                estado_credito, fecha_desembolso_credito, fecha_creacion_credito
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW() - INTERVAL '1 month', NOW() - INTERVAL '1 month') RETURNING id_credito
        `, [socioId, solicitudId, lineaId, 12000000.00, 1.8, 2.5, 12, 11000000.00, 'activo']);
        
        const creditoId = creditoRes.rows[0].id_credito;
        console.log(`Crédito creado con ID: ${creditoId}`);
        
        console.log("Creando cuotas de amortización...");
        for (let i = 1; i <= 12; i++) {
            const estado = i === 1 ? 'pagada' : 'pendiente';
            const vto = new Date();
            vto.setMonth(vto.getMonth() + (i - 1));
            
            await c.query(`
                INSERT INTO cuota (
                    id_credito_cuota, numero_cuota, fecha_vencimiento_cuota, 
                    valor_cuota, abono_capital_cuota, interes_corriente_cuota, 
                    saldo_restante_cuota, estado_cuota
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [
                creditoId, i, vto, 1120000.00, 1000000.00, 120000.00, 
                (12 - i) * 1000000.00, estado
            ]);
        }
        console.log("12 cuotas de amortización registradas con éxito.");
        console.log("--- PROCESO COMPLETADO ---");
        
    } catch(err) {
        console.error("Error ejecutando inserción:", err);
    } finally {
        await c.end();
    }
}
run();
