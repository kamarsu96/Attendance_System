const payrollRepository = require('../repositories/PayrollRepository');
const salaryStructureRepository = require('../repositories/SalaryStructureRepository');
const attendanceRepository = require('../repositories/AttendanceRepository');
const salaryComponentRepository = require('../repositories/SalaryComponentRepository');

class PayrollService {
    async calculateMonthlySalary(employeeId, month, year, workingDays) {
        // 1. Fetch Salary Structure
        const structure = await salaryStructureRepository.findByEmployee(employeeId);
        if (!structure) throw new Error('Salary structure not defined for employee');

        // 2. Fetch Attendance Summary from Database
        const attendanceSummary = await attendanceRepository.getMetricsByMonth(employeeId, month, year);
        const presentDays = Number(attendanceSummary.present_days) || 0;
        const overtimeHours = Number(attendanceSummary.total_overtime_hours) || 0;
        const totalWorkHours = Number(attendanceSummary.total_work_hours) || 0;
        
        const absentDays = Math.max(0, workingDays - presentDays);

        let salaryEarned = 0;
        let perDaySalary = 0;

        // 3. Formula specific to BRD Wage Calculation
        if (structure.salary_type === 'hourly') {
            // Hourly Wage = Working Hours × Hourly Rate (stored in basic_salary)
            salaryEarned = totalWorkHours * structure.basic_salary;
        } else if (structure.salary_type === 'daily') {
            // Daily Wage = Full Day Presence * Daily Wage (stored in basic_salary)
            salaryEarned = presentDays * structure.basic_salary;
            perDaySalary = structure.basic_salary;
        } else {
            // Monthly: Per Day Salary = Monthly Salary / Working Days
            perDaySalary = structure.basic_salary / workingDays;
            salaryEarned = perDaySalary * presentDays;
        }

        // 4. Fetch Custom Components
        const components = await salaryComponentRepository.findByEmployee(employeeId);
        let customEarnings = 0;
        let customDeductions = 0;
        
        components.forEach(c => {
            if (c.type === 'earning') customEarnings += Number(c.amount);
            else customDeductions += Number(c.amount);
        });

        // 5. Formula: Overtime Pay = Overtime Hours * Overtime Rate
        const overtimePay = overtimeHours * structure.overtime_rate_per_hour;

        // 6. Net Salary = Salary Earned + Overtime Pay + Custom Earnings - Custom Deductions
        const totalEarnings = salaryEarned + overtimePay + customEarnings;
        const netSalary = totalEarnings - customDeductions;

        return {
            workingDays,
            presentDays,
            absentDays,
            overtimeHours,
            totalWorkHours,
            grossEarnings: totalEarnings,
            totalDeductions: customDeductions,
            netSalary: netSalary,
            salaryType: structure.salary_type,
            components: components // Return for UI breakdown
        };
    }
}

module.exports = new PayrollService();
