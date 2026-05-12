const employeeService = require('../services/EmployeeService');

class EmployeeController {
    async register(req, res) {
        try {
            const company_id = req.user?.company_id || 1;
            const employeeData = { ...req.body, company_id }; 
            const files = req.files || {};
            const employeeId = await employeeService.registerEmployee(employeeData, files);
            res.status(201).json({ success: true, message: 'Employee registered', employeeId });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async list(req, res) {
        try {
            const companyId = req.user?.company_id || 1;
            console.log('Fetching employees for companyId:', companyId);
            const employees = await employeeService.getEmployeesByCompany(companyId);
            console.log('Found employees:', employees.length);
            
            if (employees.length === 0) {
                return res.status(200).json({ success: true, data: [], _info: 'No employees found in DB' });
            }

            // Map DB format to frontend format safely
            const mapped = employees.map(emp => {
                try {
                    return {
                        id: `#EMP-${emp.id}`,
                        name: `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
                        email: emp.email || 'N/A',
                        dept: emp.department_name || 'Unassigned',
                        role: emp.designation_name || 'Associate',
                        status: emp.status ? (emp.status.charAt(0).toUpperCase() + emp.status.slice(1)) : 'Active',
                        initials: `${(emp.first_name || 'E').charAt(0)}${(emp.last_name || 'E').charAt(0)}`.toUpperCase()
                    };
                } catch (e) {
                    console.error('Error mapping employee:', emp.id, e);
                    return null;
                }
            }).filter(Boolean);

            res.status(200).json({ success: true, data: mapped });
        } catch (error) {
            console.error('List Employees Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async listByCompany(req, res) {
        try {
            const companyId = req.params.companyId;
            const employees = await employeeService.getEmployeesByCompany(companyId);
            res.status(200).json({ success: true, data: employees });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async update(req, res) {
        try {
            const id = typeof req.params.id === 'string' 
                ? parseInt(req.params.id.replace('#EMP-', '').replace('#', ''), 10) 
                : req.params.id;
            
            // Format files from upload.any() array to object structure
            const files = {};
            if (Array.isArray(req.files)) {
                req.files.forEach(file => {
                    if (!files[file.fieldname]) {
                        files[file.fieldname] = [];
                    }
                    files[file.fieldname].push(file);
                });
            }
            
            console.log('--- CONTROLLER UPDATE ---');
            console.log('Req Body Keys:', Object.keys(req.body));
            console.log('Sample Body Field (gender):', req.body.gender);
            
            await employeeService.updateEmployee(id, req.body, files);
            res.status(200).json({ success: true, message: 'Employee updated successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async delete(req, res) {
        try {
            const id = typeof req.params.id === 'string' 
                ? parseInt(req.params.id.replace('#EMP-', '').replace('#', ''), 10) 
                : req.params.id;
            await employeeService.deleteEmployee(id);
            res.status(200).json({ success: true, message: 'Employee deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async get(req, res) {
        try {
            const id = typeof req.params.id === 'string' 
                ? parseInt(req.params.id.replace('#EMP-', '').replace('#', ''), 10) 
                : req.params.id;
            const emp = await employeeService.getEmployeeById(id);
            if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });
            res.status(200).json({ success: true, data: emp });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getSalary(req, res) {
        try {
            const id = typeof req.params.id === 'string' 
                ? parseInt(req.params.id.replace('#EMP-', '').replace('#', ''), 10) 
                : req.params.id;
            const salaryStructureRepository = require('../repositories/SalaryStructureRepository');
            const salaryComponentRepository = require('../repositories/SalaryComponentRepository');
            
            const structure = await salaryStructureRepository.findByEmployee(id);
            const components = await salaryComponentRepository.findByEmployee(id);
            
            res.status(200).json({ success: true, data: { ...structure, components } });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new EmployeeController();
