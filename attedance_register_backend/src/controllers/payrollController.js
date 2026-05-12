const payrollService = require('../services/PayrollService');
const employeeRepository = require('../repositories/EmployeeRepository');
const salaryStructureRepository = require('../repositories/SalaryStructureRepository');
const salaryComponentRepository = require('../repositories/SalaryComponentRepository');
const pdfService = require('../services/PdfService');

class PayrollController {
    async updateSalaryStructure(req, res) {
        try {
            const { employee_id, basic_salary, overtime_rate_per_hour, salary_type, currency, components } = req.body;
            await salaryStructureRepository.upsert({ employee_id, basic_salary, overtime_rate_per_hour, salary_type, currency });
            
            if (components) {
                await salaryComponentRepository.replaceForEmployee(employee_id, components);
            }
            
            res.status(200).json({ success: true, message: 'Salary structure updated' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async runPayroll(req, res) {
        try {
            const { employee_id, month, year, working_days } = req.body;
            const result = await payrollService.calculateMonthlySalary(employee_id, month, year, working_days);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    
    async getPayrollRecords(req, res) {
        try {
            const companyId = req.user?.company_id || 1;
            const month = parseInt(req.query.month) || new Date().getMonth() + 1;
            const year = parseInt(req.query.year) || new Date().getFullYear();
            const workingDays = parseInt(req.query.workingDays) || 22;

            const employees = await employeeRepository.findAll(companyId);
            
            let totalGross = 0;
            let countPaid = 0;
            const payrollRecords = [];

            for (const emp of employees) {
                let payrollData = null;
                try {
                    payrollData = await payrollService.calculateMonthlySalary(emp.id, month, year, workingDays);
                    totalGross += payrollData.grossEarnings;
                    countPaid++;
                } catch (err) {
                    // Salary structure not defined yet, we'll show with zero values
                }
                
                payrollRecords.push({
                    id: emp.id,
                    name: `${emp.first_name} ${emp.last_name}`,
                    role: emp.designation_name || 'Employee',
                    initials: `${emp.first_name?.[0] || ''}${emp.last_name?.[0] || ''}`.toUpperCase() || 'EE',
                    status: emp.status ? (emp.status.charAt(0).toUpperCase() + emp.status.slice(1).toLowerCase()) : 'Active',
                    salaryType: payrollData?.salaryType || 'Not Set',
                    attendance: payrollData ? `${payrollData.presentDays} / ${workingDays}` : `0 / ${workingDays}`,
                    absent: payrollData && payrollData.absentDays > 0 ? `${payrollData.absentDays} Abs` : null,
                    overtime: payrollData ? `${payrollData.overtimeHours}h` : '0h',
                    gross: payrollData ? payrollData.grossEarnings.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) : '₹0.00',
                    net: payrollData ? payrollData.netSalary.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) : '₹0.00',
                    rawGross: payrollData ? payrollData.grossEarnings : 0,
                    rawNet: payrollData ? payrollData.netSalary : 0,
                    needsSetup: !payrollData // Flag for UI to show a warning if needed
                });
            }

            const summaryStats = [
                { label: 'Total Gross Salary', value: totalGross.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }), trend: 'Live', icon: 'payments', color: 'blue' },
                { label: 'Employees Computed', value: countPaid.toString(), total: employees.length.toString(), progress: Math.round((countPaid/employees.length)*100) || 0, icon: 'badge', color: 'purple' },
                { label: 'Avg. Net Pay', value: (countPaid > 0 ? (totalGross / countPaid) : 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }), subtext: 'Per Employee', icon: 'trending_up', color: 'amber' },
                { label: 'Tax Projection', value: (totalGross * 0.12).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }), icon: 'account_balance_wallet', color: 'emerald' }
            ];

            // Drive Disbursement & Activity from "Real" state
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            const today = new Date();
            const nextDisbursementDate = new Date(today.getFullYear(), today.getMonth() + 1, 1); // 1st of next month
            const daysLeft = Math.ceil((nextDisbursementDate - today) / (1000 * 60 * 60 * 24));

            const disbursement = {
                date: nextDisbursementDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                daysLeft: daysLeft,
                status: 'Approval', // preparation, validation, approval, payment
                progress: 75
            };

            const activity = [
                { title: `Payroll computed for ${months[month-1]} ${year}`, time: 'Just now', type: 'success' },
                { title: `${countPaid} employees processed successfully`, time: '2 mins ago', type: 'info' },
                { title: 'Tax projection updated for Q4', time: '1 hour ago', type: 'warning' }
            ];
            
            res.status(200).json({ success: true, data: { payrollRecords, summaryStats, disbursement, activity } });
        } catch (error) {
            console.error('getPayrollRecords Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getPayslip(req, res) {
        try {
            const id = parseInt(req.params.id);
            const month = parseInt(req.query.month) || new Date().getMonth() + 1;
            const year = parseInt(req.query.year) || new Date().getFullYear();
            const workingDays = 22;

            const emp = await employeeRepository.findById(id);
            if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });
            
            const companyRepository = require('../repositories/CompanyRepository');
            const company = await companyRepository.findById(req.user?.company_id || 1);
            const companyInfo = company ? {
                name: company.name,
                address: company.address || 'Global Business Park, Tower A, Gurugram, India',
                logo: company.logo_url
            } : {
                name: 'SWAMS SOLUTIONS',
                address: 'Global Business Park, Tower A, Gurugram, India',
                logo: null
            };

            const result = await payrollService.calculateMonthlySalary(id, month, year, workingDays);
            
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            
            let finalEarnings = [];
            let finalDeductions = [];

            if (result.components && result.components.length > 0) {
                // Use Custom Structure
                const basic = Number(emp.basic_salary) || result.grossEarnings - result.components.filter(c => c.type === 'earning').reduce((a, b) => a + Number(b.amount), 0);
                finalEarnings.push({ label: 'Basic Salary', amount: basic });
                
                result.components.forEach(c => {
                    if (c.type === 'earning') finalEarnings.push({ label: c.name, amount: Number(c.amount) });
                    else finalDeductions.push({ label: c.name, amount: Number(c.amount) });
                });
            } else {
                // Use Default HR Formula
                const basic = result.grossEarnings * 0.50;
                const hra = result.grossEarnings * 0.20;
                const conveyance = 1600;
                const medical = 1250;
                const special = result.grossEarnings - (basic + hra + conveyance + medical);
                
                finalEarnings = [
                    { label: 'Basic Salary', amount: basic },
                    { label: 'House Rent Allowance (HRA)', amount: hra },
                    { label: 'Conveyance Allowance', amount: conveyance },
                    { label: 'Medical Allowance', amount: medical },
                    { label: 'Special Allowance', amount: Math.max(0, special) }
                ];
                
                finalDeductions = [
                    { label: 'Provident Fund (PF)', amount: basic * 0.12 },
                    { label: 'ESI', amount: result.grossEarnings < 21000 ? (result.grossEarnings * 0.0075) : 0 },
                    { label: 'Professional Tax', amount: 200 }
                ];
            }

            if (result.overtimeHours > 0) {
                finalEarnings.push({ label: 'Overtime Earnings', amount: result.overtimeHours * 250 });
            }

            const totalEarnings = finalEarnings.reduce((a, b) => a + b.amount, 0);
            const totalDeductions = finalDeductions.reduce((a, b) => a + b.amount, 0);

            const payslip = {
                company: companyInfo,
                employee: {
                    name: `${emp.first_name} ${emp.last_name}`,
                    code: emp.employee_code || `#EMP-${emp.id}`,
                    designation: emp.designation_name || 'Staff',
                    department: emp.department_name || 'General',
                    pan: emp.pan_number || 'N/A',
                    bank: emp.bank_name || 'N/A',
                    account: emp.account_number || 'N/A',
                    uan: '100987654321', // Mock UAN
                    doj: emp.joining_date ? new Date(emp.joining_date).toLocaleDateString() : 'N/A',
                    dob: emp.dob || '',
                    mobile: emp.phone_number || ''
                },
                period: `${months[month-1]} ${year}`,
                attendance: {
                    totalDays: 30,
                    workingDays: result.workingDays,
                    present: result.presentDays,
                    absent: result.absentDays,
                    overtime: result.overtimeHours
                },
                earnings: finalEarnings,
                deductions: finalDeductions,
                summary: {
                    totalEarnings: totalEarnings,
                    totalDeductions: totalDeductions,
                    netPay: totalEarnings - totalDeductions
                }
            };

            res.status(200).json({ success: true, data: payslip });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async downloadPayslip(req, res) {
        try {
            const id = req.params.id;
            const month = parseInt(req.query.month) || new Date().getMonth() + 1;
            const year = parseInt(req.query.year) || new Date().getFullYear();
            const password = req.query.password; // Optional password
            const workingDays = 22;

            const emp = await employeeRepository.findById(id);
            if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });

            const companyRepository = require('../repositories/CompanyRepository');
            const company = await companyRepository.findById(req.user?.company_id || 1);
            const companyInfo = company ? {
                name: company.name,
                address: company.address || 'Global Business Park, Tower A, Gurugram, India',
                logo: company.logo_url
            } : {
                name: 'SWAMS SOLUTIONS',
                address: 'Global Business Park, Tower A, Gurugram, India',
                logo: null
            };

            const result = await payrollService.calculateMonthlySalary(id, month, year, workingDays);
            
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            
            let finalEarnings = [];
            let finalDeductions = [];

            if (result.components && result.components.length > 0) {
                // Use Custom Structure
                const basic = Number(emp.basic_salary) || result.grossEarnings - result.components.filter(c => c.type === 'earning').reduce((a, b) => a + Number(b.amount), 0);
                finalEarnings.push({ label: 'Basic Salary', amount: basic });
                
                result.components.forEach(c => {
                    if (c.type === 'earning') finalEarnings.push({ label: c.name, amount: Number(c.amount) });
                    else finalDeductions.push({ label: c.name, amount: Number(c.amount) });
                });
            } else {
                const basic = result.grossEarnings * 0.50;
                finalEarnings = [
                    { label: 'Basic Salary', amount: basic },
                    { label: 'House Rent Allowance (HRA)', amount: result.grossEarnings * 0.20 },
                    { label: 'Conveyance Allowance', amount: 1600 },
                    { label: 'Medical Allowance', amount: 1250 },
                    { label: 'Special Allowance', amount: Math.max(0, result.grossEarnings - (basic + (result.grossEarnings * 0.20) + 1600 + 1250)) }
                ];
                finalDeductions = [
                    { label: 'Provident Fund (PF)', amount: basic * 0.12 },
                    { label: 'ESI', amount: result.grossEarnings < 21000 ? (result.grossEarnings * 0.0075) : 0 },
                    { label: 'Professional Tax', amount: 200 }
                ];
            }

            if (result.overtimeHours > 0) {
                finalEarnings.push({ label: 'Overtime Earnings', amount: result.overtimeHours * 250 });
            }

            const totalEarnings = finalEarnings.reduce((a, b) => a + b.amount, 0);
            const totalDeductions = finalDeductions.reduce((a, b) => a + b.amount, 0);

            const payslipData = {
                company: companyInfo,
                employee: {
                    name: `${emp.first_name} ${emp.last_name}`,
                    code: emp.employee_code || `#EMP-${emp.id}`,
                    designation: emp.designation_name || 'Staff',
                    department: emp.department_name || 'General',
                    pan: emp.pan_number || 'N/A',
                    bank: emp.bank_name || 'N/A',
                    account: emp.account_number || 'N/A',
                    uan: '100987654321',
                    doj: emp.joining_date ? new Date(emp.joining_date).toLocaleDateString() : 'N/A'
                },
                period: `${months[month-1]} ${year}`,
                attendance: {
                    totalDays: 30,
                    workingDays: result.workingDays,
                    present: result.presentDays,
                    absent: result.absentDays,
                    overtime: result.overtimeHours
                },
                earnings: finalEarnings,
                deductions: finalDeductions,
                summary: {
                    totalEarnings: totalEarnings,
                    totalDeductions: totalDeductions,
                    netPay: totalEarnings - totalDeductions
                }
            };

            const pdfBuffer = await pdfService.generatePayslip(payslipData, password);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=Payslip_${emp.first_name}_${months[month-1]}.pdf`);
            res.send(pdfBuffer);
        } catch (error) {
            console.error('Download PDF Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
}
module.exports = new PayrollController();
