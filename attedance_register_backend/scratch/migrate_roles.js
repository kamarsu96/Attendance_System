const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'attendance_registration'
    });

    try {
        console.log('Adding parent_role_id to roles table...');
        await connection.execute('ALTER TABLE roles ADD COLUMN parent_role_id INT NULL');
        console.log('Success!');
    } catch (err) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
            console.log('Column already exists.');
        } else {
            console.error('Migration failed:', err.message);
        }
    } finally {
        await connection.end();
    }
}

migrate();
