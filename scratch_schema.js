const db = require('./src/config/db');

async function test() {
    try {
        const typeInfo = await db.query(`
            SELECT t.typname, e.enumlabel
            FROM pg_type t 
            JOIN pg_enum e ON t.oid = e.enumtypid  
            WHERE t.typname = 'canal_pago';
        `);
        console.log("Enum values for canal_pago:", typeInfo.rows);
    } catch(e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
test();
