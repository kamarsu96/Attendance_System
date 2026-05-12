const mysql = require('mysql2/promise');
require('dotenv').config();

async function update() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'attendance_registration'
    });

    try {
        console.log('Updating status ENUM...');
        await connection.execute("ALTER TABLE employees MODIFY COLUMN status ENUM('active','resigned','terminated','on-leave','inactive') DEFAULT 'active'");
        console.log('Success!');
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

update();
