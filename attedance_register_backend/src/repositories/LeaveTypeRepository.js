const BaseRepository = require('./BaseRepository');

class LeaveTypeRepository extends BaseRepository {
    async getAllByCompany(company_id) {
        const sql = 'SELECT * FROM leave_types WHERE company_id = ? ORDER BY leave_name ASC';
        return await this.query(sql, [company_id]);
    }

    async getById(id, company_id) {
        const sql = 'SELECT * FROM leave_types WHERE id = ? AND company_id = ?';
        const rows = await this.query(sql, [id, company_id]);
        return rows[0];
    }

    async create(data) {
        const sql = 'INSERT INTO leave_types (company_id, leave_name, total_allowed, is_paid) VALUES (?, ?, ?, ?)';
        const result = await this.execute(sql, [data.company_id, data.leave_name, data.total_allowed, data.is_paid]);
        return result.insertId;
    }

    async update(id, data, company_id) {
        const sql = 'UPDATE leave_types SET leave_name = ?, total_allowed = ?, is_paid = ? WHERE id = ? AND company_id = ?';
        return await this.execute(sql, [data.leave_name, data.total_allowed, data.is_paid, id, company_id]);
    }

    async delete(id, company_id) {
        const sql = 'DELETE FROM leave_types WHERE id = ? AND company_id = ?';
        return await this.execute(sql, [id, company_id]);
    }
}

module.exports = new LeaveTypeRepository();
