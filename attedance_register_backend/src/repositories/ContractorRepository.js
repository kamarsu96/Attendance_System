const BaseRepository = require('./BaseRepository');

class ContractorRepository extends BaseRepository {
    async findAll(companyId) {
        const sql = `
            SELECT c.*, COUNT(e.id) as total_workers 
            FROM contractors c
            LEFT JOIN employees e ON c.id = e.contractor_id AND e.status = 'active'
            WHERE c.company_id = ? 
            GROUP BY c.id
        `;
        return await this.query(sql, [companyId]);
    }

    async findById(id) {
        const sql = 'SELECT * FROM contractors WHERE id = ?';
        const results = await this.query(sql, [id]);
        return results[0];
    }

    async create(data) {
        const { company_id, agency_name, contact_person, contact_email, contact_phone, address, status } = data;
        const sql = `
            INSERT INTO contractors (company_id, agency_name, contact_person, contact_email, contact_phone, address, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const result = await this.execute(sql, [company_id, agency_name, contact_person, contact_email, contact_phone, address, status || 'active']);
        return result.insertId;
    }

    async update(id, data) {
        const fields = [];
        const values = [];
        
        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined && key !== 'id' && key !== 'company_id') {
                fields.push(`${key} = ?`);
                values.push(value === 'undefined' ? null : value);
            }
        }
        
        if (fields.length === 0) return 0;
        
        const sql = `UPDATE contractors SET ${fields.join(', ')} WHERE id = ?`;
        values.push(id);
        
        const result = await this.execute(sql, values);
        return result.affectedRows;
    }

    async delete(id) {
        const sql = 'DELETE FROM contractors WHERE id = ?';
        const result = await this.execute(sql, [id]);
        return result.affectedRows;
    }

    async getAttendanceReport(contractorId, month, year) {
        const sql = `
            SELECT a.*, e.first_name, e.last_name, e.employee_code
            FROM attendance a
            JOIN employees e ON a.employee_id = e.id
            WHERE e.contractor_id = ? AND MONTH(a.attendance_date) = ? AND YEAR(a.attendance_date) = ?
        `;
        return await this.query(sql, [contractorId, month, year]);
    }
}

module.exports = new ContractorRepository();
