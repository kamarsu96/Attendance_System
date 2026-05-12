const mysql = require('mysql2/promise');
require('dotenv').config();

async function alterTable() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || '',
            database: 'attendance_registration',
            multipleStatements: true
        });

        console.log("Connected to DB.");

        await connection.query(`
        CREATE TABLE IF NOT EXISTS notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            company_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            message TEXT,
            target_type VARCHAR(50) DEFAULT 'all',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`);

        console.log("notifications table created.");

        await connection.end();
    } catch (err) {
        console.error("Error:", err);
    }
}
alterTable();
