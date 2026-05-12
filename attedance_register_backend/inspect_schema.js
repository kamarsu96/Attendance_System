const db = require('./src/config/database');

async function inspect() {
    try {
        const [profiles] = await db.query('DESCRIBE employee_profiles');
        console.log('--- employee_profiles ---');
        profiles.forEach(p => console.log(p.Field));

        const [bank] = await db.query('DESCRIBE employee_bank_details');
        console.log('--- employee_bank_details ---');
        bank.forEach(b => console.log(b.Field));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

inspect();
