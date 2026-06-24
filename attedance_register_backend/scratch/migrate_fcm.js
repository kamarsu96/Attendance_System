const db = require('../src/config/database');

async function migrateFcmToken() {
    try {
        console.log('Checking database table for fcm_token column...');
        const [columns] = await db.query("SHOW COLUMNS FROM users LIKE 'fcm_token'");
        if (columns.length === 0) {
            console.log('Adding fcm_token column to users table...');
            await db.execute("ALTER TABLE users ADD COLUMN fcm_token VARCHAR(255) NULL;");
            console.log('fcm_token column successfully added!');
        } else {
            console.log('fcm_token column already exists in users table.');
        }
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        process.exit();
    }
}

migrateFcmToken();
