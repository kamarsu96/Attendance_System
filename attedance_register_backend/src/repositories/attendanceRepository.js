const BaseRepository = require('./BaseRepository');

class AttendanceRepository extends BaseRepository {
    async findTodayRecord(employeeId) {
        const sql = 'SELECT * FROM attendance WHERE employee_id = ? AND attendance_date = CURDATE()';
        const results = await this.query(sql, [employeeId]);
        return results[0];
    }

    async createCheckIn(data) {
        const { employee_id, check_in, lat, lng, location, status } = data;
        const sql = 'INSERT INTO attendance (employee_id, attendance_date, check_in, check_in_lat, check_in_lng, check_in_location, status) VALUES (?, CURDATE(), ?, ?, ?, ?, ?)';
        const result = await this.execute(sql, [employee_id, check_in, lat, lng, location, status]);
        return result.insertId;
    }

    async updateCheckOut(id, data) {
        const { check_out, lat, lng, location, work_hours, overtime_hours } = data;
        const sql = 'UPDATE attendance SET check_out = ?, check_out_lat = ?, check_out_lng = ?, check_out_location = ?, work_hours = ?, overtime_hours = ? WHERE id = ?';
        return await this.execute(sql, [check_out, lat, lng, location, work_hours, overtime_hours || 0, id]);
    }
    async getMetricsByMonth(employeeId, month, year) {
        const sql = `
            SELECT 
                COUNT(id) as present_days, 
                COALESCE(SUM(work_hours), 0) as total_work_hours, 
                COALESCE(SUM(overtime_hours), 0) as total_overtime_hours
            FROM attendance 
            WHERE employee_id = ? 
              AND MONTH(attendance_date) = ? 
              AND YEAR(attendance_date) = ? 
              AND status IN ('present', 'late', 'half-day')
        `;
        const results = await this.query(sql, [employeeId, month, year]);
        return results[0] || { present_days: 0, total_work_hours: 0, total_overtime_hours: 0 };
    }

    async getReport(companyId, filters = {}) {
        let dateVal = 'CURDATE()';
        if (filters.date_range === 'Yesterday') {
            dateVal = 'SUBDATE(CURDATE(), 1)';
        } else if (filters.date_range === 'Last 7 Days') {
            // Special case for range, but for "Daily" screen usually we want a single date
            // Defaulting to CURDATE() for now as it's the "Daily" screen
            dateVal = 'CURDATE()';
        }

        const params = [companyId];
        let sql = `
            SELECT e.id, e.first_name, e.last_name, e.email, d.department_name, ds.designation_name, ep.profile_picture_url, b.branch_name,
                   a.attendance_date, a.check_in, a.check_out, a.status
            FROM employees e
            LEFT JOIN departments d ON e.department_id = d.id
            LEFT JOIN designations ds ON e.designation_id = ds.id
            LEFT JOIN employee_profiles ep ON e.id = ep.employee_id
            LEFT JOIN branches b ON e.branch_id = b.id
            LEFT JOIN attendance a ON e.id = a.employee_id AND a.attendance_date = ${dateVal}
            WHERE e.company_id = ? AND e.status = 'active'
        `;

        if (filters.department && filters.department !== 'All Departments') {
            sql += ` AND d.department_name = ? `;
            params.push(filters.department);
        }

        if (filters.branch && filters.branch !== 'All Branches') {
            sql += ` AND b.branch_name = ? `;
            params.push(filters.branch);
        }

        return await this.query(sql, params);
    }
}

module.exports = new AttendanceRepository();
