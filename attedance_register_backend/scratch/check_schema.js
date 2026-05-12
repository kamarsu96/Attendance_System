const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSchema() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '123456',
        database: process.env.DB_NAME || 'attendance_registration'
    });

    console.log('--- companies Table ---');
    const [companies] = await connection.query('DESCRIBE companies');
    console.table(companies);

    console.log('--- Checking for target_type column ---');
    const [tables] = await connection.query('SHOW TABLES');
    for (const row of tables) {
        const tableName = Object.values(row)[0];
        const [columns] = await connection.query(`DESCRIBE ${tableName}`);
        const targetTypeCol = columns.find(c => c.Field === 'target_type');
        if (targetTypeCol) {
            console.log(`Table: ${tableName}`);
            console.table(columns.filter(c => c.Field === 'target_type'));
        }
    }

    await connection.end();
}

checkSchema().catch(console.error);
