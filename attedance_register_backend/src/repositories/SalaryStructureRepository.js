const BaseRepository = require('./BaseRepository');

class SalaryStructureRepository extends BaseRepository {
    async findByEmployee(employeeId) {
        const sql = 'SELECT * FROM salary_structures WHERE employee_id = ?';
        const results = await this.query(sql, [employeeId]);
        return results[0];
    }

    async upsert(data) {
        const { employee_id, basic_salary, overtime_rate_per_hour, salary_type, currency } = data;
        const sql = `
            INSERT INTO salary_structures (employee_id, basic_salary, overtime_rate_per_hour, salary_type, currency) 
            VALUES (?, ?, ?, ?, ?) 
            ON DUPLICATE KEY UPDATE 
            basic_salary = VALUES(basic_salary), 
            overtime_rate_per_hour = VALUES(overtime_rate_per_hour),
            salary_type = VALUES(salary_type),
            currency = VALUES(currency)
        `;
        return await this.execute(sql, [employee_id, basic_salary, overtime_rate_per_hour, salary_type || 'monthly', currency || 'INR']);
    }
}

module.exports = new SalaryStructureRepository();
