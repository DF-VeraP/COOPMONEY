const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function getSchema() {
    const query = `
        SELECT table_name, column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        ORDER BY table_name, ordinal_position;
    `;
    try {
        const res = await pool.query(query);
        let currentTable = '';
        for (let row of res.rows) {
            if (row.table_name !== currentTable) {
                currentTable = row.table_name;
                console.log(`\nTable: ${currentTable}`);
            }
            console.log(`  - ${row.column_name}: ${row.data_type}`);
        }
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

getSchema();
