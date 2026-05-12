const mysql = require('mysql2/promise');
require('dotenv').config();

async function alterTable() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '123456',
        database: process.env.DB_NAME || 'attendance_registration'
    });

    console.log('Altering companies table to support Base64 logos...');
    await connection.query('ALTER TABLE companies MODIFY COLUMN logo_url LONGTEXT');
    console.log('Success: logo_url modified to LONGTEXT');

    await connection.end();
}

alterTable().catch(console.error);
