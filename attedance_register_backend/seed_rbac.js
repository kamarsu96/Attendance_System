require('dotenv').config();
const db = require('./src/config/database');

async function setupRbac() {
    try {
        console.log('Connecting to database...');
        
        await db.query(`
            CREATE TABLE IF NOT EXISTS role_permissions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                role_id INT NOT NULL,
                screen_name VARCHAR(100) NOT NULL,
                can_view BOOLEAN DEFAULT TRUE,
                can_create BOOLEAN DEFAULT TRUE,
                can_update BOOLEAN DEFAULT TRUE,
                can_delete BOOLEAN DEFAULT TRUE,
                UNIQUE KEY idx_role_screen (role_id, screen_name)
            )
        `);
        console.log('✅ role_permissions table created/verified.');

        // Seed default permissions for Super Admin (role_id = 1)
        const screens = ['Dashboard', 'Employees', 'Attendance', 'Leaves', 'Shifts', 'Payroll', 'Reports', 'Settings', 'Profile', 'Support'];
        for (const screen of screens) {
            await db.query(`
                INSERT IGNORE INTO role_permissions (role_id, screen_name, can_view, can_create, can_update, can_delete)
                VALUES (1, ?, true, true, true, true)
            `, [screen]);

            await db.query(`
                INSERT IGNORE INTO role_permissions (role_id, screen_name, can_view, can_create, can_update, can_delete)
                VALUES (2, ?, true, true, true, true)
            `, [screen]);
        }

        console.log('✅ Role permissions seeded successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error.message);
        process.exit(1);
    }
}

setupRbac();
