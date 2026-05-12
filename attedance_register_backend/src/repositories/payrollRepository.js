const BaseRepository = require('./BaseRepository');
const db = require('../config/database');

class PayrollRepository extends BaseRepository {
    async createPayrollRun(data) {
        const { company_id, month, year, processed_by } = data;
        const sql = 'INSERT INTO payroll_runs (company_id, month, year, processed_by, status) VALUES (?, ?, ?, ?, "completed")';
        const result = await this.execute(sql, [company_id, month, year, processed_by]);
        return result.insertId;
    }

    async savePayrollDetail(detailData) {
        const { 
            payroll_run_id, employee_id, working_days, present_days, 
            absent_days, overtime_hours, gross_earnings, total_deductions, net_salary 
        } = detailData;

        const sql = `
            INSERT INTO payroll_details 
            (payroll_run_id, employee_id, working_days, present_days, absent_days, overtime_hours, gross_earnings, total_deductions, net_salary) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        return await this.execute(sql, [
            payroll_run_id, employee_id, working_days, present_days, 
            absent_days, overtime_hours, gross_earnings, total_deductions, net_salary
        ]);
    }
}

module.exports = new PayrollRepository();
