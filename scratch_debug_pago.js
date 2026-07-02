const db = require('./src/config/db');

async function testPago() {
    const client = await db.connect();
    try {
        const cuotaRes = await client.query(`
          SELECT c.*, cr.id_credito, cr.saldo_pendiente_credito 
          FROM cuota c
          JOIN credito cr ON c.id_credito_cuota = cr.id_credito
          WHERE c.estado_cuota = 'pendiente' LIMIT 1
        `);
        
        if (cuotaRes.rows.length === 0) {
            console.log("No pending cuotas found");
            return;
        }
        
        const cuota = cuotaRes.rows[0];
        const id_cuota = cuota.id_cuota;
        const id_socio = cuota.id_socio_credito; // Wait, cr.id_socio_credito is not selected. Let's fix query.
        
        await client.query('BEGIN');
        
        const cuotaRes2 = await client.query(`
          SELECT c.*, cr.id_credito, cr.saldo_pendiente_credito, cr.id_socio_credito 
          FROM cuota c
          JOIN credito cr ON c.id_credito_cuota = cr.id_credito
          WHERE c.id_cuota = $1 AND c.estado_cuota = 'pendiente'
        `, [id_cuota]);
        const cuota2 = cuotaRes2.rows[0];
        const valorCuota = parseFloat(cuota2.valor_cuota);

        console.log("Cuota data:", {
            valor: cuota2.valor_cuota,
            abono_capital: cuota2.abono_capital_cuota,
            saldo_pendiente: cuota2.saldo_pendiente_credito
        });

        const nuevoSaldoPendiente = Math.max(0, parseFloat(cuota2.saldo_pendiente_credito) - parseFloat(cuota2.abono_capital_cuota));
        console.log("Nuevo saldo:", nuevoSaldoPendiente);

        await client.query('ROLLBACK'); // Rollback for safety
        console.log("DONE WITHOUT ERROR!");

    } catch (e) {
        console.error("ERROR CAUGHT:", e);
        await client.query('ROLLBACK');
    } finally {
        client.release();
        process.exit();
    }
}
testPago();
