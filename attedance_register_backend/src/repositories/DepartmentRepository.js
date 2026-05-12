const BaseRepository = require('./BaseRepository');

class DepartmentRepository extends BaseRepository {
    async getAllByCompany(company_id) {
        const sql = 'SELECT * FROM departments WHERE company_id = ? ORDER BY department_name ASC';
        return await this.query(sql, [company_id]);
    }

    async getById(id, company_id) {
        const sql = 'SELECT * FROM departments WHERE id = ? AND company_id = ?';
        const rows = await this.query(sql, [id, company_id]);
        return rows[0];
    }

    async create(data) {
        const sql = 'INSERT INTO departments (company_id, department_name, manager_id) VALUES (?, ?, ?)';
        const result = await this.execute(sql, [data.company_id, data.department_name, data.manager_id || null]);
        return result.insertId;
    }

    async update(id, data, company_id) {
        const sql = 'UPDATE departments SET department_name = ?, manager_id = ? WHERE id = ? AND company_id = ?';
        return await this.execute(sql, [data.department_name, data.manager_id || null, id, company_id]);
    }

    async delete(id, company_id) {
        const sql = 'DELETE FROM departments WHERE id = ? AND company_id = ?';
        return await this.execute(sql, [id, company_id]);
    }
}

module.exports = new DepartmentRepository();
