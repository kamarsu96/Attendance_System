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

        try {
            await connection.query(`ALTER TABLE attendance ADD COLUMN check_out_lat DECIMAL(10, 8) NULL;`);
            console.log("check_out_lat added to attendance.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("check_out_lat already exists.");
            else throw e;
        }

        try {
            await connection.query(`ALTER TABLE attendance ADD COLUMN check_out_lng DECIMAL(11, 8) NULL;`);
            console.log("check_out_lng added to attendance.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("check_out_lng already exists.");
            else throw e;
        }

        await connection.end();
        console.log("Database updated successfully.");
    } catch (err) {
        console.error("Error updating database:", err);
    }
}
alterTable();
