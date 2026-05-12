const BaseRepository = require('./BaseRepository');

class ShiftRepository extends BaseRepository {
    async create(shiftData) {
        const { company_id, shift_name, start_time, end_time, grace_minutes } = shiftData;
        const sql = 'INSERT INTO shifts (company_id, shift_name, start_time, end_time, grace_minutes) VALUES (?, ?, ?, ?, ?)';
        const result = await this.execute(sql, [company_id, shift_name, start_time, end_time, grace_minutes]);
        return result.insertId;
    }

    async findByCompany(companyId) {
        const sql = 'SELECT * FROM shifts WHERE company_id = ?';
        return await this.query(sql, [companyId]);
    }
}

module.exports = new ShiftRepository();
