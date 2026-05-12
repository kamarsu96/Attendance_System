const BaseRepository = require('./BaseRepository');

class CompanyRepository extends BaseRepository {
    async create(companyData) {
        const { name, registration_number, address, contact_email, contact_phone } = companyData;
        const sql = 'INSERT INTO companies (name, registration_number, address, contact_email, contact_phone) VALUES (?, ?, ?, ?, ?)';
        const result = await this.execute(sql, [name, registration_number, address, contact_email, contact_phone]);
        return result.insertId;
    }

    async findById(id) {
        const sql = 'SELECT * FROM companies WHERE id = ?';
        const results = await this.query(sql, [id]);
        return results[0];
    }
}

module.exports = new CompanyRepository();
