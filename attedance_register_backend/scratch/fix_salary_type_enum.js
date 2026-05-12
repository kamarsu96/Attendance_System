const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || '',
            database: process.env.DB_NAME || 'attendance_registration'
        });

        await conn.execute("ALTER TABLE salary_structures MODIFY COLUMN salary_type ENUM('monthly', 'weekly', 'daily', 'hourly') DEFAULT 'monthly'");
        console.log('Successfully added "hourly" to salary_type ENUM');
        
        await conn.end();
    } catch (err) {
        console.error('Error altering table:', err.message);
        process.exit(1);
    }
})();
