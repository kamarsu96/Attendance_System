const BaseRepository = require('./BaseRepository');

class BranchRepository extends BaseRepository {
    async create(branchData) {
        const { company_id, branch_name, address, latitude, longitude, radius_meters } = branchData;
        const sql = 'INSERT INTO branches (company_id, branch_name, address, latitude, longitude, radius_meters) VALUES (?, ?, ?, ?, ?, ?)';
        const result = await this.execute(sql, [company_id, branch_name, address, latitude, longitude, radius_meters]);
        return result.insertId;
    }

    async findById(id) {
        const sql = 'SELECT * FROM branches WHERE id = ?';
        const results = await this.query(sql, [id]);
        return results[0];
    }
}

module.exports = new BranchRepository();
