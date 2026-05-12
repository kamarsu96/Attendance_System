const db = require('../config/database');
const userRepository = require('../repositories/UserRepository');

class DashboardController {
    async getStats(req, res) {
        try {
            const companyId = req.user.company_id || 1;
            
            // Ensure user has an employee profile linked (auto-creates for admin if missing)
            const userProfile = await userRepository.getProfile(req.user.id);
            
            const [empRows] = await db.query('SELECT COUNT(*) as total FROM employees WHERE company_id = ?', [companyId]);
            const totalEmployees = empRows[0].total;

            const [deptRows] = await db.query('SELECT d.department_name as name, COUNT(e.id) as count FROM departments d LEFT JOIN employees e ON d.id = e.department_id GROUP BY d.id');
            const departmentCounts = deptRows.map(row => ({ name: row.name, count: row.count }));

            const stats = [
                { label: 'Total Workforce', value: String(totalEmployees), trend: '+10%', icon: 'groups', color: 'blue' },
                { label: 'Departments Created', value: String(departmentCounts.length || 0), trend: '+2', icon: 'domain', color: 'purple' },
                { label: 'Active Tasks', value: '18', trend: '+4', icon: 'assignment', color: 'green' }
            ];

            const [activityRows] = await db.query(`
                SELECT 
                    e.first_name, 
                    e.last_name, 
                    e.email, 
                    d.department_name as dept,
                    a.check_in,
                    a.check_out,
                    a.status as attendance_status
                FROM attendance a
                JOIN employees e ON a.employee_id = e.id
                LEFT JOIN departments d ON e.department_id = d.id
                WHERE e.company_id = ?
                ORDER BY a.check_in DESC 
                LIMIT 5
            `, [companyId]);

            const recentActivity = activityRows.map(row => ({
                name: `${row.first_name} ${row.last_name}`,
                email: row.email,
                dept: row.dept || 'General',
                status: row.attendance_status ? (row.attendance_status.charAt(0).toUpperCase() + row.attendance_status.slice(1)) : 'Present',
                checkIn: row.check_in ? new Date(row.check_in).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '---',
                checkOut: row.check_out ? new Date(row.check_out).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '---',
                timeStatus: row.attendance_status === 'late' ? 'Late' : 'On time',
                avatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(row.first_name + ' ' + row.last_name)
            }));

            // 3. Newly Joined
            const [newlyJoinedRows] = await db.query(`
                SELECT e.first_name, e.last_name, e.email, d.department_name as dept
                FROM employees e
                LEFT JOIN departments d ON e.department_id = d.id
                WHERE e.company_id = ?
                ORDER BY e.created_at DESC
                LIMIT 5
            `, [companyId]);
            const newlyJoined = newlyJoinedRows.map(row => ({
                name: `${row.first_name} ${row.last_name}`,
                email: row.email,
                dept: row.dept || 'General',
                initials: (row.first_name[0] + (row.last_name ? row.last_name[0] : '')).toUpperCase()
            }));

            // 4. Upcoming Birthdays
            const [birthdayRows] = await db.query(`
                SELECT e.first_name, e.last_name, e.email
                FROM employees e
                JOIN employee_profiles ep ON e.id = ep.employee_id
                WHERE e.company_id = ? AND MONTH(ep.dob) = MONTH(CURRENT_DATE)
                ORDER BY DAY(ep.dob) ASC
                LIMIT 5
            `, [companyId]);
            const birthdays = birthdayRows.map(row => ({
                name: `${row.first_name} ${row.last_name}`,
                email: row.email,
                initials: (row.first_name[0] + (row.last_name ? row.last_name[0] : '')).toUpperCase()
            }));

            // 5. Weekly Attendance Trend (Dynamic)
            const [trendRows] = await db.query(`
                SELECT 
                    DATE_FORMAT(attendance_date, '%a') as day,
                    COUNT(CASE WHEN status = 'present' THEN 1 END) as present,
                    COUNT(CASE WHEN status IN ('absent', 'leave') THEN 1 END) as absent
                FROM attendance
                WHERE attendance_date >= DATE_SUB(CURRENT_DATE, INTERVAL 6 DAY)
                  AND company_id = ?
                GROUP BY attendance_date
                ORDER BY attendance_date ASC
            `, [companyId]);

            // Fill missing days with 0s if necessary
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const attendanceTrend = trendRows.length > 0 ? trendRows : days.map(d => ({ day: d, present: 0, absent: 0 }));

            // 6. Current User Status for Clock In/Out
            const [userStatusRows] = await db.query(`
                SELECT e.id as employee_id, e.branch_id, a.id as attendance_id, a.check_in, a.check_out
                FROM employees e
                LEFT JOIN attendance a ON e.id = a.employee_id AND a.attendance_date = CURRENT_DATE
                WHERE e.id = ?
            `, [userProfile ? userProfile.employee_id : null]);
            
            const userAttendance = userStatusRows[0] || null;

            res.status(200).json({ 
                success: true, 
                data: { 
                    stats, 
                    recentActivity, 
                    departmentCounts,
                    newlyJoined,
                    birthdays,
                    attendanceTrend,
                    userAttendance
                } 
            });
        } catch (error) {
            console.error('Dashboard Stats Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new DashboardController();
