const db = require('../src/config/database');

async function migrate() {
    try {
        console.log('Starting migration...');
        await db.execute("ALTER TABLE users ADD COLUMN must_change_password BOOLEAN DEFAULT TRUE;");
        console.log('Column must_change_password added successfully.');
    } catch (error) {
        if (error.code === 'ER_DUP_COLUMN_NAME') {
            console.log('Column already exists.');
        } else {
            console.error('Migration failed:', error);
        }
    } finally {
        process.exit();
    }
}

migrate();
