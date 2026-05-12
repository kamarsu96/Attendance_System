const BaseRepository = require('./BaseRepository');

class DesignationRepository extends BaseRepository {
    async getAllByCompany(company_id) {
        const sql = 'SELECT * FROM designations WHERE company_id = ? ORDER BY designation_name ASC';
        return await this.query(sql, [company_id]);
    }

    async getById(id, company_id) {
        const sql = 'SELECT * FROM designations WHERE id = ? AND company_id = ?';
        const rows = await this.query(sql, [id, company_id]);
        return rows[0];
    }

    async create(data) {
        const sql = 'INSERT INTO designations (company_id, designation_name) VALUES (?, ?)';
        const result = await this.execute(sql, [data.company_id, data.designation_name]);
        return result.insertId;
    }

    async update(id, data, company_id) {
        const sql = 'UPDATE designations SET designation_name = ? WHERE id = ? AND company_id = ?';
        return await this.execute(sql, [data.designation_name, id, company_id]);
    }

    async delete(id, company_id) {
        const sql = 'DELETE FROM designations WHERE id = ? AND company_id = ?';
        return await this.execute(sql, [id, company_id]);
    }
}

module.exports = new DesignationRepository();
