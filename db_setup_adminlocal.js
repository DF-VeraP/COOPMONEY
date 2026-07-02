const { Client } = require('pg');
require('dotenv').config();

async function addPhoneColumn() {
    const c = new Client({ connectionString: process.env.DATABASE_URL });
    try {
        await c.connect();
        await c.query("ALTER TABLE usuario ADD COLUMN IF NOT EXISTS telefono_usuario VARCHAR(50);");
        console.log("Columna telefono_usuario agregada exitosamente a la tabla usuario.");
    } catch (e) {
        console.error("Error alterando la tabla:", e.message);
    } finally {
        await c.end();
    }
}

addPhoneColumn();
