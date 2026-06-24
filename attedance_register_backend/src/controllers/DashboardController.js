const db = require('../config/database');
const userRepository = require('../repositories/UserRepository');

class DashboardController {
    async getStats(req, res) {
        try {
            const companyId = req.user.company_id || 1;
            console.log('Fetching dashboard stats for user ID:', req.user.id);
            
            // 1. Ensure user has an employee profile (Crucial for interaction)
            let userProfile = null;
            try {
                userProfile = await userRepository.getProfile(req.user.id);
            } catch (err) {
                console.error('Error getting/creating user profile:', err);
            }
            
            // 2. Base Stats (Safe Defaults)
            let totalEmployees = 0;
            try {
                const [empRows] = await db.query('SELECT COUNT(*) as total FROM employees WHERE company_id = ?', [companyId]);
                totalEmployees = empRows[0]?.total || 0;
            } catch (err) { console.error('Error emp count:', err); }

            let departmentCounts = [];
            try {
                const [deptRows] = await db.query(`
                    SELECT d.department_name as name, COUNT(e.id) as count 
                    FROM departments d 
                    LEFT JOIN employees e ON d.id = e.department_id 
                    WHERE d.company_id = ?
                    GROUP BY d.id
                `, [companyId]);
                departmentCounts = deptRows.map(row => ({ name: row.name, count: row.count }));
            } catch (err) { console.error('Error dept count:', err); }

            const stats = [
                { label: 'Total Workforce', value: String(totalEmployees), trend: '+0%', icon: 'groups', color: 'blue' },
                { label: 'Departments', value: String(departmentCounts.length), trend: '+0', icon: 'domain', color: 'purple' },
                { label: 'Active Status', value: 'Live', trend: 'OK', icon: 'sensors', color: 'green' }
            ];

            // 3. Recent Activity (Joined with Employees)
            let recentActivity = [];
            try {
                const [activityRows] = await db.query(`
                    SELECT 
                        e.first_name, e.last_name, e.email, d.department_name as dept,
                        a.check_in, a.check_out, a.status as attendance_status
                    FROM attendance a
                    JOIN employees e ON a.employee_id = e.id
                    LEFT JOIN departments d ON e.department_id = d.id
                    WHERE e.company_id = ?
                    ORDER BY a.check_in DESC 
                    LIMIT 5
                `, [companyId]);
                
                recentActivity = activityRows.map(row => ({
                    name: `${row.first_name} ${row.last_name}`,
                    email: row.email,
                    dept: row.dept || 'General',
                    status: row.attendance_status ? (row.attendance_status.charAt(0).toUpperCase() + row.attendance_status.slice(1)) : 'Present',
                    checkIn: row.check_in ? new Date(row.check_in).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '---',
                    checkOut: row.check_out ? new Date(row.check_out).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '---'
                }));
            } catch (err) { console.error('Error recent activity:', err); }

            // 4. Newly Joined
            let newlyJoined = [];
            try {
                const [newlyJoinedRows] = await db.query(`
                    SELECT e.first_name, e.last_name, e.email, d.department_name as dept
                    FROM employees e
                    LEFT JOIN departments d ON e.department_id = d.id
                    WHERE e.company_id = ?
                    ORDER BY e.created_at DESC
                    LIMIT 5
                `, [companyId]);
                newlyJoined = newlyJoinedRows.map(row => ({
                    name: `${row.first_name} ${row.last_name}`,
                    email: row.email,
                    dept: row.dept || 'General',
                    initials: (row.first_name[0] + (row.last_name ? row.last_name[0] : '')).toUpperCase()
                }));
            } catch (err) { console.error('Error newly joined:', err); }

            // 5. Weekly Attendance Trend
            let attendanceTrend = [];
            try {
                const [trendRows] = await db.query(`
                    SELECT 
                        DATE_FORMAT(a.attendance_date, '%a') as day,
                        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present,
                        COUNT(CASE WHEN a.status IN ('absent', 'leave') THEN 1 END) as absent
                    FROM attendance a
                    JOIN employees e ON a.employee_id = e.id
                    WHERE a.attendance_date >= DATE_SUB(CURRENT_DATE, INTERVAL 6 DAY)
                      AND e.company_id = ?
                    GROUP BY a.attendance_date
                    ORDER BY a.attendance_date ASC
                `, [companyId]);
                attendanceTrend = trendRows;
            } catch (err) { console.error('Error trend:', err); }

            // 6. User Attendance State
            let userAttendance = null;
            try {
                if (userProfile && userProfile.employee_id) {
                    const [userStatusRows] = await db.query(`
                        SELECT employee_id, check_in, check_out
                        FROM attendance
                        WHERE employee_id = ? AND attendance_date = CURRENT_DATE
                        LIMIT 1
                    `, [userProfile.employee_id]);
                    userAttendance = userStatusRows[0] || { employee_id: userProfile.employee_id };
                    userAttendance.branch_id = userProfile.branch_id || 1;
                }
            } catch (err) { console.error('Error user status:', err); }

            res.status(200).json({ 
                success: true, 
                data: { 
                    stats, 
                    recentActivity, 
                    departmentCounts,
                    newlyJoined,
                    birthdays: [], // Safe empty for now
                    attendanceTrend,
                    userAttendance
                } 
            });
        } catch (error) {
            console.error('Fatal Dashboard Error:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
}

module.exports = new DashboardController();
