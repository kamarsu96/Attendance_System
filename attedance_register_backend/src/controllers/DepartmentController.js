const departmentRepository = require('../repositories/DepartmentRepository');

class DepartmentController {
    async getAll(req, res) {
        try {
            // For now, assuming company_id = 1 for the first company created by seed script
            // In a real app, you might get this from the user's token or session
            const company_id = 1; 
            const departments = await departmentRepository.getAllByCompany(company_id);
            res.status(200).json({ success: true, data: departments });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getById(req, res) {
        try {
            const company_id = 1;
            const department = await departmentRepository.getById(req.params.id, company_id);
            if (!department) return res.status(404).json({ success: false, message: 'Department not found' });
            res.status(200).json({ success: true, data: department });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async create(req, res) {
        try {
            const company_id = 1;
            const { department_name, manager_id } = req.body;
            
            if (!department_name) {
                return res.status(400).json({ success: false, message: 'Department name is required' });
            }

            const id = await departmentRepository.create({ company_id, department_name, manager_id });
            const newDepartment = await departmentRepository.getById(id, company_id);
            
            res.status(201).json({ success: true, data: newDepartment });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async update(req, res) {
        try {
            const company_id = 1;
            const { department_name, manager_id } = req.body;
            
            await departmentRepository.update(req.params.id, { department_name, manager_id }, company_id);
            const updatedDepartment = await departmentRepository.getById(req.params.id, company_id);
            
            res.status(200).json({ success: true, data: updatedDepartment });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async delete(req, res) {
        try {
            const company_id = 1;
            await departmentRepository.delete(req.params.id, company_id);
            res.status(200).json({ success: true, message: 'Department deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new DepartmentController();
