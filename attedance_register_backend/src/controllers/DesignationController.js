const designationRepository = require('../repositories/DesignationRepository');

class DesignationController {
    async getAll(req, res) {
        try {
            const company_id = 1; 
            const designations = await designationRepository.getAllByCompany(company_id);
            res.status(200).json({ success: true, data: designations });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getById(req, res) {
        try {
            const company_id = 1;
            const designation = await designationRepository.getById(req.params.id, company_id);
            if (!designation) return res.status(404).json({ success: false, message: 'Designation not found' });
            res.status(200).json({ success: true, data: designation });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async create(req, res) {
        try {
            const company_id = 1;
            const { designation_name } = req.body;
            
            if (!designation_name) {
                return res.status(400).json({ success: false, message: 'Designation name is required' });
            }

            const id = await designationRepository.create({ company_id, designation_name });
            const newDesignation = await designationRepository.getById(id, company_id);
            
            res.status(201).json({ success: true, data: newDesignation });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async update(req, res) {
        try {
            const company_id = 1;
            const { designation_name } = req.body;
            
            await designationRepository.update(req.params.id, { designation_name }, company_id);
            const updatedDesignation = await designationRepository.getById(req.params.id, company_id);
            
            res.status(200).json({ success: true, data: updatedDesignation });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async delete(req, res) {
        try {
            const company_id = 1;
            await designationRepository.delete(req.params.id, company_id);
            res.status(200).json({ success: true, message: 'Designation deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new DesignationController();
