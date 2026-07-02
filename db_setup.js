const { Client } = require('pg');
require('dotenv').config();

async function setupDB() {
    const c = new Client({ connectionString: process.env.DATABASE_URL });
    try {
        await c.connect();
        console.log("Conectado a la base de datos.");

        // Intentar añadir el valor al ENUM si no existe
        // En Postgres, ALTER TYPE ADD VALUE no puede ejecutarse dentro de un bloque de transacción si no es en versiones recientes con ciertas condiciones.
        try {
            await c.query("ALTER TYPE estado_general ADD VALUE IF NOT EXISTS 'pendiente';");
            console.log("Valor 'pendiente' añadido a estado_general.");
        } catch (e) {
            console.log("El valor 'pendiente' probablemente ya existe o hubo un error: ", e.message);
        }

        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS solicitud_afiliacion (
                id_solicitud SERIAL PRIMARY KEY,
                nit_cooperativa VARCHAR(50) NOT NULL,
                nombre_cooperativa VARCHAR(150) NOT NULL,
                correo_cooperativa VARCHAR(100) NOT NULL,
                telefono_cooperativa VARCHAR(50) NOT NULL,
                direccion_cooperativa VARCHAR(200) NOT NULL,
                sitio_web VARCHAR(200),
                nombre_representante VARCHAR(150) NOT NULL,
                cedula_representante VARCHAR(50) NOT NULL,
                cargo_representante VARCHAR(100) NOT NULL,
                correo_representante VARCHAR(100) NOT NULL,
                telefono_representante VARCHAR(50) NOT NULL,
                lineas_credito TEXT,
                cantidad_socios VARCHAR(50),
                necesita_migracion BOOLEAN,
                contrasena_admin VARCHAR(255) NOT NULL,
                estado_solicitud estado_general DEFAULT 'pendiente',
                fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await c.query(createTableQuery);
        console.log("Tabla solicitud_afiliacion creada correctamente.");

    } catch (err) {
        console.error("Error configurando la BD:", err);
    } finally {
        await c.end();
    }
}

setupDB();
