const BaseRepository = require('./BaseRepository');

class SalaryComponentRepository extends BaseRepository {
    constructor() {
        super('salary_components');
    }

    async findByEmployee(employeeId) {
        const sql = 'SELECT * FROM salary_components WHERE employee_id = ?';
        return await this.query(sql, [employeeId]);
    }

    async replaceForEmployee(employeeId, components) {
        // Use a transaction or manual delete/insert
        await this.query('DELETE FROM salary_components WHERE employee_id = ?', [employeeId]);
        if (components && components.length > 0) {
            const sql = 'INSERT INTO salary_components (employee_id, name, type, amount) VALUES ?';
            const values = components.map(c => [employeeId, c.name, c.type, c.amount]);
            return await this.query(sql, [values]);
        }
        return true;
    }
}

module.exports = new SalaryComponentRepository();
