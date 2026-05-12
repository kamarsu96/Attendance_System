class ReportController {
    async getReportsData(req, res) {
        try {
            // Mock data fallback if DB is not ready or empty
            const kpis = [
                { label: 'Average Attendance', value: '94.2%', trend: '+12%', color: 'green', icon: 'group' },
                { label: 'Monthly Payroll', value: '$428,240', trend: '+4.5%', color: 'blue', icon: 'payments' },
                { label: 'Overtime Hours', value: '1,240 hrs', trend: '-2.1%', color: 'orange', icon: 'timer' },
                { label: 'Leaves Pending', value: '18', trend: 'Steady', color: 'purple', icon: 'event_busy' }
            ];

            const categories = [
                { title: 'Attendance & Time Tracking', description: 'Daily logs, late arrivals, and absence trends across departments.', icon: 'calendar_month' },
                { title: 'Payroll & Compensation', description: 'Salary breakdown, tax deductions, and historical payment logs.', icon: 'account_balance_wallet' },
                { title: 'Overtime Analysis', description: 'Identify departments with high OT usage and labor cost impact.', icon: 'more_time' },
                { title: 'Leave & PTO Management', description: 'Yearly leave balances, upcoming vacations, and approval flows.', icon: 'holiday_village' }
            ];

            const recentExports = [
                { name: 'Q3_Payroll_Final_Draft', format: 'PDF', date: 'Oct 12, 2023 10:45 AM', size: '2.4 MB' },
                { name: 'Monthly_Attendance_Sheet_Sept', format: 'Excel', date: 'Oct 05, 2023 09:12 AM', size: '1.1 MB' },
                { name: 'Overtime_Alerts_Log', format: 'Excel', date: 'Sept 28, 2023 04:30 PM', size: '450 KB' }
            ];
            
            res.status(200).json({ success: true, data: { kpis, categories, recentExports } });
        } catch (error) {
            console.error('getReportsData Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new ReportController();
