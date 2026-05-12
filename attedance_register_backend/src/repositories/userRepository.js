const BaseRepository = require('./BaseRepository');

class UserRepository extends BaseRepository {
    async getAll() {
        const sql = 'SELECT u.id, u.employee_id, u.username, u.role_id, r.role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id ORDER BY u.username ASC';
        return await this.query(sql);
    }

    async getById(id) {
        const sql = 'SELECT u.id, u.employee_id, u.username, u.role_id, r.role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.id = ?';
        const rows = await this.query(sql, [id]);
        return rows[0];
    }

    async findByUsername(username) {
        const sql = 'SELECT u.*, r.role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.username = ?';
        const results = await this.query(sql, [username]);
        return results[0];
    }

    async create(userData) {
        const { employee_id, username, password_hash, role_id } = userData;
        const sql = 'INSERT INTO users (employee_id, username, password_hash, role_id) VALUES (?, ?, ?, ?)';
        const result = await this.execute(sql, [employee_id, username, password_hash, role_id]);
        return result.insertId;
    }

    async delete(id) {
        const sql = 'DELETE FROM users WHERE id = ?';
        return await this.execute(sql, [id]);
    }

    async getProfile(userId) {
        const userRows = await this.query('SELECT * FROM users WHERE id = ?', [userId]);
        const uRec = userRows[0];
        if (!uRec) return null;

        if (!uRec.employee_id) {
            const depts = await this.query('SELECT id FROM departments LIMIT 1');
            const desigs = await this.query('SELECT id FROM designations LIMIT 1');
            const deptId = depts[0] ? depts[0].id : null;
            const desigId = desigs[0] ? desigs[0].id : null;

            const insertEmpSql = `
                INSERT INTO employees (company_id, first_name, last_name, employee_code, email, phone, department_id, designation_id, employment_type, joining_date, qualification)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const empRes = await this.execute(insertEmpSql, [
                uRec.company_id || 1,
                uRec.username,
                'Admin',
                'EMP-ADMIN',
                uRec.username + '@company.com',
                '+1234567890',
                deptId,
                desigId,
                'full-time',
                new Date().toISOString().split('T')[0],
                'Administrator'
            ]);
            const newEmpId = empRes.insertId;

            await this.execute('UPDATE users SET employee_id = ? WHERE id = ?', [newEmpId, userId]);

            await this.execute(
                'INSERT INTO employee_profiles (employee_id, dob, gender, marital_status, blood_group) VALUES (?, ?, ?, ?, ?)',
                [newEmpId, '1990-01-01', 'other', 'single', 'O+']
            );
            
            await this.execute(
                'INSERT INTO employee_bank_details (employee_id) VALUES (?)',
                [newEmpId]
            );
        }

        const sql = `
            SELECT u.id as user_id, u.username, u.employee_id, r.role_name,
                   e.first_name, e.last_name, e.email, e.phone, e.joining_date, e.qualification, e.employment_type,
                   ep.dob, ep.gender, ep.marital_status, ep.blood_group, ep.profile_picture_url, 
                   ep.current_address, ep.permanent_address, ep.nationality, ep.city, ep.state, ep.zip_code, ep.country,
                   ep.emergency_contact_name, ep.emergency_contact_relation, ep.emergency_contact_phone, ep.emergency_contact_email,
                   ebd.bank_name, ebd.account_number, ebd.routing_number, ebd.pan_number, ebd.payment_method, ebd.tax_status,
                   d.department_name, ds.designation_name
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            LEFT JOIN employees e ON u.employee_id = e.id
            LEFT JOIN employee_profiles ep ON e.id = ep.employee_id
            LEFT JOIN employee_bank_details ebd ON e.id = ebd.employee_id
            LEFT JOIN departments d ON e.department_id = d.id
            LEFT JOIN designations ds ON e.designation_id = ds.id
            WHERE u.id = ?
        `;
        const results = await this.query(sql, [userId]);
        return results[0];
    }

    async updatePassword(userId, passwordHash) {
        const sql = 'UPDATE users SET password_hash = ? WHERE id = ?';
        return await this.execute(sql, [passwordHash, userId]);
    }

    async updateProfile(userId, data) {
        const user = await this.getById(userId);
        if (!user || !user.employee_id) return;
        
        await this.execute(
            'UPDATE employees SET first_name = ?, last_name = ?, email = ?, phone = ?, qualification = ? WHERE id = ?',
            [data.first_name, data.last_name, data.email, data.phone, data.qualification, user.employee_id]
        );

        const profileSql = `
            INSERT INTO employee_profiles (
                employee_id, dob, gender, marital_status, blood_group, profile_picture_url,
                nationality, city, state, zip_code, country,
                emergency_contact_name, emergency_contact_relation, emergency_contact_phone, emergency_contact_email
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                dob = VALUES(dob), gender = VALUES(gender), marital_status = VALUES(marital_status), 
                blood_group = VALUES(blood_group), profile_picture_url = VALUES(profile_picture_url),
                nationality = VALUES(nationality), city = VALUES(city), state = VALUES(state),
                zip_code = VALUES(zip_code), country = VALUES(country),
                emergency_contact_name = VALUES(emergency_contact_name), emergency_contact_relation = VALUES(emergency_contact_relation),
                emergency_contact_phone = VALUES(emergency_contact_phone), emergency_contact_email = VALUES(emergency_contact_email)
        `;
        await this.execute(profileSql, [
            user.employee_id, data.dob, data.gender, data.marital_status, data.blood_group, data.profile_picture_url,
            data.nationality, data.city, data.state, data.zip_code, data.country,
            data.emergency_contact_name, data.emergency_contact_relation, data.emergency_contact_phone, data.emergency_contact_email
        ]);

        const bankSql = `
            INSERT INTO employee_bank_details (
                employee_id, bank_name, account_number, routing_number, pan_number, payment_method, tax_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                bank_name = VALUES(bank_name), account_number = VALUES(account_number), 
                routing_number = VALUES(routing_number), pan_number = VALUES(pan_number),
                payment_method = VALUES(payment_method), tax_status = VALUES(tax_status)
        `;
        await this.execute(bankSql, [
            user.employee_id, data.bank_name, data.account_number, data.routing_number, data.pan_number, data.payment_method, data.tax_status
        ]);
    }
}

module.exports = new UserRepository();
