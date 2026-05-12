const BaseRepository = require('./BaseRepository');

class ShiftAssignmentRepository extends BaseRepository {
    async assignShift(employeeId, shiftId, startDate, endDate = null) {
        const sql = `INSERT INTO shift_assignments (employee_id, shift_id, start_date, end_date) VALUES (?, ?, ?, ?)`;
        const result = await this.execute(sql, [employeeId, shiftId, startDate, endDate]);
        return result.insertId;
    }

    async getAllEmployeeShifts(companyId) {
        const sql = `
            SELECT 
                e.id as employee_id, e.first_name, e.last_name, e.employee_code,
                d.department_name, ep.profile_picture_url,
                sa.id as assignment_id, s.shift_name, s.start_time, s.end_time, s.grace_minutes
            FROM employees e
            LEFT JOIN shift_assignments sa ON e.id = sa.employee_id AND (sa.end_date IS NULL OR sa.end_date >= CURRENT_DATE)
            LEFT JOIN shifts s ON sa.shift_id = s.id
            LEFT JOIN departments d ON e.department_id = d.id
            LEFT JOIN employee_profiles ep ON e.id = ep.employee_id
            WHERE e.company_id = ? AND e.status = 'active'
        `;
        return await this.query(sql, [companyId]);
    }

    async getStatsByCompany(companyId) {
        const sql = `
            SELECT 
                COUNT(*) as total_shifts,
                COALESCE(SUM(CASE WHEN s.start_time >= '06:00:00' AND s.start_time < '14:00:00' THEN 1 ELSE 0 END), 0) as morning_shifts,
                COALESCE(SUM(CASE WHEN s.start_time >= '14:00:00' AND s.start_time < '22:00:00' THEN 1 ELSE 0 END), 0) as evening_shifts,
                COALESCE(SUM(CASE WHEN s.start_time >= '22:00:00' OR s.start_time < '06:00:00' THEN 1 ELSE 0 END), 0) as night_shifts
            FROM shift_assignments sa
            JOIN shifts s ON sa.shift_id = s.id
            WHERE s.company_id = ? 
            AND (sa.end_date IS NULL OR sa.end_date >= CURRENT_DATE)
        `;
        const res = await this.query(sql, [companyId]);
        return res[0] || { total_shifts: 0, morning_shifts: 0, evening_shifts: 0, night_shifts: 0 };
    }
    async getActiveShiftForEmployee(employeeId) {
        const sql = `
            SELECT s.* 
            FROM shift_assignments sa
            JOIN shifts s ON sa.shift_id = s.id
            WHERE sa.employee_id = ? 
            AND (sa.end_date IS NULL OR sa.end_date >= CURRENT_DATE)
            LIMIT 1
        `;
        const res = await this.query(sql, [employeeId]);
        return res[0] || null;
    }

    async deleteAssignment(id) {
        const sql = `DELETE FROM shift_assignments WHERE id = ?`;
        return await this.execute(sql, [id]);
    }
}

module.exports = new ShiftAssignmentRepository();
