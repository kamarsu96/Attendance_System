const BaseRepository = require('./BaseRepository');
const db = require('../config/database');

class EmployeeRepository extends BaseRepository {
    async create(employeeData) {
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            const { 
                company_id, employee_code, first_name, last_name, email, phone, 
                department_id, designation_id, branch_id, joining_date, employment_type,
                qualification, reporting_manager_id, work_location
            } = employeeData;

            // 1. Insert into employees
            const [empResult] = await conn.execute(
                `INSERT INTO employees (
                    company_id, employee_code, first_name, last_name, email, phone, 
                    department_id, designation_id, branch_id, joining_date, employment_type, 
                    qualification, reporting_manager_id, work_location
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    company_id || 1, 
                    employee_code || null, 
                    first_name || null, 
                    last_name || null, 
                    email || null, 
                    phone || null, 
                    department_id || null, 
                    designation_id || null, 
                    branch_id || null, 
                    joining_date || null, 
                    employment_type || 'full-time', 
                    qualification || null,
                    reporting_manager_id || null,
                    work_location || 'Remote'
                ]
            );
            const employeeId = empResult.insertId;

            // 2. Insert into employee_profiles
            await conn.execute(
                `INSERT INTO employee_profiles (
                    employee_id, dob, gender, marital_status, blood_group, nationality,
                    city, state, zip_code, country, current_address, profile_picture_url,
                    emergency_contact_name, emergency_contact_relation, emergency_contact_phone, emergency_contact_email,
                    secondary_contact_name, secondary_contact_relation, secondary_contact_phone, secondary_contact_email
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    employeeId, 
                    employeeData.dob || null, 
                    employeeData.gender || null, 
                    employeeData.marital_status || null, 
                    employeeData.blood_group || null, 
                    employeeData.nationality || null, 
                    employeeData.city || null, 
                    employeeData.state || null, 
                    employeeData.zip_code || null, 
                    employeeData.country || null,
                    employeeData.address || null,
                    employeeData.profile_picture_url || null,
                    employeeData.emergency_contact_name || null, 
                    employeeData.emergency_contact_relation || null, 
                    employeeData.emergency_contact_phone || null, 
                    employeeData.emergency_contact_email || null,
                    employeeData.secondary_contact_name || null,
                    employeeData.secondary_contact_relation || null,
                    employeeData.secondary_contact_phone || null,
                    employeeData.secondary_contact_email || null
                ]
            );

            // 3. Insert into employee_bank_details
            await conn.execute(
                `INSERT INTO employee_bank_details (
                    employee_id, bank_name, account_number, routing_number, pan_number, payment_method, tax_status
                ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    employeeId, employeeData.bank_name || null, employeeData.account_number || null, 
                    employeeData.routing_number || null, employeeData.pan_number || null, 
                    employeeData.payment_method || 'Direct Deposit', 
                    employeeData.tax_status || 'Single'
                ]
            );

            await conn.commit();
            return employeeId;
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    }

    async addDocument(employeeId, docData) {
        return await this.execute(
            'INSERT INTO employee_documents (employee_id, document_type, file_path) VALUES (?, ?, ?)',
            [employeeId, docData.document_type, docData.file_path]
        );
    }

    async findAll(companyId) {
        const sql = `
            SELECT e.*, d.department_name, ds.designation_name, b.branch_name, ep.profile_picture_url
            FROM employees e
            LEFT JOIN departments d ON e.department_id = d.id
            LEFT JOIN designations ds ON e.designation_id = ds.id
            LEFT JOIN branches b ON e.branch_id = b.id
            LEFT JOIN employee_profiles ep ON e.id = ep.employee_id
            WHERE e.company_id = ?
        `;
        return await this.query(sql, [companyId]);
    }

    async findById(id) {
        const sql = `
            SELECT e.*, 
                   ep.dob, ep.gender, ep.marital_status, ep.blood_group, ep.nationality,
                   ep.city, ep.state, ep.zip_code, ep.country, ep.current_address as address, ep.profile_picture_url,
                   ep.emergency_contact_name, ep.emergency_contact_relation, ep.emergency_contact_phone, ep.emergency_contact_email,
                   ep.secondary_contact_name, ep.secondary_contact_relation, ep.secondary_contact_phone, ep.secondary_contact_email,
                   ebd.bank_name, ebd.account_number, ebd.routing_number, ebd.pan_number, ebd.payment_method, ebd.tax_status
            FROM employees e
            LEFT JOIN employee_profiles ep ON e.id = ep.employee_id
            LEFT JOIN employee_bank_details ebd ON e.id = ebd.employee_id
            WHERE e.id = ?
        `;
        const res = await this.query(sql, [id]);
        
        if (res[0]) {
            const docs = await this.query('SELECT * FROM employee_documents WHERE employee_id = ?', [id]);
            res[0].documents = docs;
        }
        
        return res[0];
    }

    async delete(id) {
        await this.execute('DELETE FROM employee_profiles WHERE employee_id = ?', [id]);
        await this.execute('DELETE FROM employee_bank_details WHERE employee_id = ?', [id]);
        await this.execute('DELETE FROM employee_documents WHERE employee_id = ?', [id]);
        return await this.execute('DELETE FROM employees WHERE id = ?', [id]);
    }

    async update(id, data) {
        console.log('--- REPOSITORY UPDATE START ---');
        console.log('ID:', id);
        
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            // 1. Update Employees Table
            const empFields = [];
            const empParams = [];
            const allowedEmpFields = [
                'first_name', 'last_name', 'email', 'phone', 'status', 
                'department_id', 'designation_id', 'branch_id', 
                'joining_date', 'employment_type', 'qualification',
                'reporting_manager_id', 'work_location'
            ];

            Object.keys(data).forEach(key => {
                if (allowedEmpFields.includes(key)) {
                    let value = data[key];
                    if (value === '' && key.includes('_id')) value = null;
                    empFields.push(`${key} = ?`);
                    empParams.push(value);
                }
            });

            if (empFields.length > 0) {
                empParams.push(id);
                await conn.execute(`UPDATE employees SET ${empFields.join(', ')} WHERE id = ?`, empParams);
            }

            // 2. Update Profiles Table (DYNAMIC UPDATE)
            const profileFields = [];
            const profileParams = [];
            const allowedProfileFields = {
                'dob': 'dob', 'gender': 'gender', 'marital_status': 'marital_status', 
                'blood_group': 'blood_group', 'nationality': 'nationality', 'city': 'city', 
                'state': 'state', 'zip_code': 'zip_code', 'country': 'country',
                'address': 'current_address', 'profile_picture_url': 'profile_picture_url',
                'emergency_contact_name': 'emergency_contact_name', 
                'emergency_contact_relation': 'emergency_contact_relation', 
                'emergency_contact_phone': 'emergency_contact_phone', 
                'emergency_contact_email': 'emergency_contact_email',
                'secondary_contact_name': 'secondary_contact_name', 
                'secondary_contact_relation': 'secondary_contact_relation', 
                'secondary_contact_phone': 'secondary_contact_phone', 
                'secondary_contact_email': 'secondary_contact_email'
            };

            Object.keys(data).forEach(key => {
                if (allowedProfileFields[key]) {
                    profileFields.push(`${allowedProfileFields[key]} = ?`);
                    profileParams.push(data[key]);
                }
            });

            if (profileFields.length > 0) {
                const [existingProfile] = await conn.execute('SELECT id FROM employee_profiles WHERE employee_id = ?', [id]);
                if (existingProfile.length > 0) {
                    profileParams.push(id);
                    await conn.execute(`UPDATE employee_profiles SET ${profileFields.join(', ')} WHERE employee_id = ?`, profileParams);
                } else {
                    // If no profile, we still need employee_id for INSERT
                    const insertCols = [...Object.keys(data).filter(k => allowedProfileFields[k]).map(k => allowedProfileFields[k]), 'employee_id'];
                    const insertVals = [...Object.keys(data).filter(k => allowedProfileFields[k]).map(k => data[k]), id];
                    const placeholders = insertVals.map(() => '?').join(', ');
                    await conn.execute(`INSERT INTO employee_profiles (${insertCols.join(', ')}) VALUES (${placeholders})`, insertVals);
                }
            }

            // 3. Update Bank Details Table (DYNAMIC UPDATE)
            const bankFields = [];
            const bankParams = [];
            const allowedBankFields = [
                'bank_name', 'account_number', 'routing_number', 'pan_number', 'payment_method', 'tax_status'
            ];

            Object.keys(data).forEach(key => {
                if (allowedBankFields.includes(key)) {
                    bankFields.push(`${key} = ?`);
                    bankParams.push(data[key]);
                }
            });

            if (bankFields.length > 0) {
                const [existingBank] = await conn.execute('SELECT id FROM employee_bank_details WHERE employee_id = ?', [id]);
                if (existingBank.length > 0) {
                    bankParams.push(id);
                    await conn.execute(`UPDATE employee_bank_details SET ${bankFields.join(', ')} WHERE employee_id = ?`, bankParams);
                } else {
                    const insertCols = [...Object.keys(data).filter(k => allowedBankFields.includes(k)), 'employee_id'];
                    const insertVals = [...Object.keys(data).filter(k => allowedBankFields.includes(k)).map(k => data[k]), id];
                    const placeholders = insertVals.map(() => '?').join(', ');
                    await conn.execute(`INSERT INTO employee_bank_details (${insertCols.join(', ')}) VALUES (${placeholders})`, insertVals);
                }
            }

            await conn.commit();
            console.log('--- REPOSITORY UPDATE SUCCESS ---');
        } catch (error) {
            await conn.rollback();
            console.error('--- REPOSITORY UPDATE FAILURE ---', error);
            throw error;
        } finally {
            conn.release();
        }
    }
}

module.exports = new EmployeeRepository();
