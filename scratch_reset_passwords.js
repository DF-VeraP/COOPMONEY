const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function run() {
    const c = new Client({ connectionString: process.env.DATABASE_URL });
    await c.connect();
    
    try {
        console.log("Generando hash para la contraseña '123456'...");
        const salt = await bcrypt.genSalt(12);
        const hash = await bcrypt.hash('123456', salt);
        
        console.log("Actualizando contraseñas de todos los usuarios de prueba...");
        const res = await c.query(`
            UPDATE usuario 
            SET contrasena_usuario = $1 
            WHERE correo_usuario IN (
                'superadmin@coopmoney.com',
                'pvfduni@gmail.com',
                'juan.perez@coop.com',
                'maria.gomez@coop.com',
                'carlos.lopez@coop.com',
                'ana.castro@coop.com',
                'carlos@coop.com',
                'ana@coop.com',
                'luis@coop.com',
                'sofia@coop.com',
                'pedro@coop.com',
                'laura@coop.com'
            )
        `, [hash]);
        
        console.log(`¡Contraseñas actualizadas con éxito! Filas afectadas: ${res.rowCount}`);
        console.log("--- PROCESO COMPLETADO ---");
        
    } catch(err) {
        console.error("Error reseteando contraseñas:", err);
    } finally {
        await c.end();
    }
}
run();
