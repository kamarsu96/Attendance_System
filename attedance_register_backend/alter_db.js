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
        CREATE TABLE IF NOT EXISTS contractors (
            id INT AUTO_INCREMENT PRIMARY KEY,
            company_id INT NOT NULL,
            agency_name VARCHAR(255) NOT NULL,
            contact_person VARCHAR(100),
            contact_email VARCHAR(100),
            contact_phone VARCHAR(20),
            address TEXT,
            status ENUM('active', 'inactive') DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
        );`);

        console.log("contractors table created.");

        try {
            await connection.query(`ALTER TABLE employees ADD COLUMN contractor_id INT NULL;`);
            await connection.query(`ALTER TABLE employees ADD FOREIGN KEY (contractor_id) REFERENCES contractors(id) ON DELETE SET NULL;`);
            console.log("contractor_id added to employees.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("contractor_id already exists.");
            } else {
                throw e;
            }
        }

        await connection.end();
    } catch (err) {
        console.error("Error:", err);
    }
}
alterTable();
