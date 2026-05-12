/**
 * Seed script - run once to create a default admin user
 * Usage: node seed_admin.js
 */
const bcrypt = require('bcryptjs');
require('dotenv').config();
const db = require('./src/config/database');

async function seedAdmin() {
    try {
        console.log('Connecting to database...');
        
        // Check if admin user already exists
        const [existing] = await db.query('SELECT id FROM users WHERE username = ?', ['admin']);
        if (existing.length > 0) {
            console.log('✅ Admin user already exists. Skipping seed.');
            process.exit(0);
        }

        // Hash password
        const password_hash = await bcrypt.hash('admin123', 10);

        // Ensure a role exists (role_id = 1 = Super Admin)
        await db.query(`INSERT IGNORE INTO roles (id, role_name) VALUES (1, 'Super Admin')`);

        // Insert admin user (employee_id is NULL for super admin)
        await db.query(
            'INSERT INTO users (employee_id, username, password_hash, role_id) VALUES (?, ?, ?, ?)',
            [null, 'admin', password_hash, 1]
        );

        console.log('✅ Default admin user created!');
        console.log('   Username: admin');
        console.log('   Password: admin123');
        console.log('   Role: Super Admin');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error.message);
        process.exit(1);
    }
}

seedAdmin();
