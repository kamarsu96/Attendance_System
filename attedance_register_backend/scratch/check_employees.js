const mysql = require('mysql2/promise');
require('dotenv').config();

async function check() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'attendance_registration'
    });

    try {
        const [rows] = await connection.execute('DESCRIBE employees');
        const statusRow = rows.find(r => r.Field === 'status');
        console.log(JSON.stringify(statusRow, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

check();
