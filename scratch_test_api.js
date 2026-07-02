async function test() {
    try {
        // Obtenemos un id de socio y cuota validos
        const db = require('./src/config/db');
        const cuotaRes = await db.query(`SELECT c.id_cuota, cr.id_socio_credito FROM cuota c JOIN credito cr ON c.id_credito_cuota = cr.id_credito WHERE c.estado_cuota = 'pendiente' LIMIT 1`);
        if (cuotaRes.rows.length === 0) {
            console.log("No pending cuotas to test.");
            process.exit(0);
        }
        const { id_cuota, id_socio_credito } = cuotaRes.rows[0];

        console.log(`Testing with id_cuota=${id_cuota}, id_socio=${id_socio_credito}`);

        const res = await fetch('http://localhost:3000/api/socio/pagar-cuota', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_cuota: id_cuota,
                id_socio: id_socio_credito,
                metodo: 'virtual'
            })
        });
        const text = await res.text();
        console.log("Status:", res.status);
        console.log("Response:", text);
    } catch(e) {
        console.error("Fetch error:", e);
    } finally {
        process.exit();
    }
}
test();
