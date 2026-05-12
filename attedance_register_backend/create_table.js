const mysql = require('mysql2/promise');
require('dotenv').config();

async function createTable() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'attendance_registration'
    });

    try {
        console.log('Creating salary_components table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS salary_components (
                id INT AUTO_INCREMENT PRIMARY KEY,
                employee_id INT NOT NULL,
                name VARCHAR(100) NOT NULL,
                type ENUM('earning', 'deduction') NOT NULL,
                amount DECIMAL(15, 2) NOT NULL,
                is_fixed BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
            );
        `);
        console.log('Table created successfully!');
    } catch (error) {
        console.error('Error creating table:', error.message);
    } finally {
        await connection.end();
    }
}

createTable();
