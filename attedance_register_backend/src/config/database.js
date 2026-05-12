const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'attendance_registration',
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0
});

const db = pool.promise();

module.exports = db;
