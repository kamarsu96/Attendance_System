const BaseRepository = require('./BaseRepository');

class LeaveRepository extends BaseRepository {
    async createRequest(data) {
        const { employee_id, leave_type_id, start_date, end_date, reason } = data;
        const sql = 'INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, reason) VALUES (?, ?, ?, ?, ?)';
        const result = await this.execute(sql, [employee_id, leave_type_id, start_date, end_date, reason]);
        return result.insertId;
    }

    async findByEmployee(employeeId) {
        const sql = 'SELECT lr.*, lt.leave_name FROM leave_requests lr JOIN leave_types lt ON lr.leave_type_id = lt.id WHERE lr.employee_id = ?';
        return await this.query(sql, [employeeId]);
    }

    async updateStatus(id, status, approverId) {
        const sql = 'UPDATE leave_requests SET status = ? WHERE id = ?';
        return await this.execute(sql, [status, id]);
    }
}

module.exports = new LeaveRepository();
