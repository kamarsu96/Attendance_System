const db = require('../src/config/database');

async function fixExistingUsers() {
    try {
        console.log('Clearing password change flag for existing users...');
        await db.execute("UPDATE users SET must_change_password = 0;");
        console.log('Success.');
    } catch (error) {
        console.error('Failed:', error);
    } finally {
        process.exit();
    }
}

fixExistingUsers();
