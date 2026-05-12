require('dotenv').config();
const db = require('./src/config/database');

async function seedCompany() {
    try {
        console.log('Connecting to database...');
        
        const [existing] = await db.query('SELECT id FROM companies WHERE id = 1');
        if (existing.length > 0) {
            console.log('✅ Company already exists. Skipping seed.');
            process.exit(0);
        }

        await db.query(
            "INSERT INTO companies (id, name, contact_email) VALUES (1, 'PulseHR Solutions Inc.', 'admin@pulsehr.example.com')"
        );

        console.log('✅ Default company created with ID 1!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error.message);
        process.exit(1);
    }
}

seedCompany();
