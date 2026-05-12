const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function init() {
    console.log('Connecting to database...');
    // Create connection without database first to ensure it creates the DB
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        multipleStatements: true
    });

    console.log('Reading setup_db.sql...');
    const sql = fs.readFileSync(path.join(__dirname, 'setup_db.sql'), 'utf8');

    console.log('Executing schema...');
    await connection.query(sql);

    console.log('Schema created successfully!');
    await connection.end();
    process.exit(0);
}

init().catch(err => {
    console.error('Error creating database tables:', err);
    process.exit(1);
});
