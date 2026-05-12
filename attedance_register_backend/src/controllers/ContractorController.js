const contractorRepository = require('../repositories/ContractorRepository');

class ContractorController {
    async getAllContractors(req, res) {
        try {
            const companyId = req.user?.company_id || 1;
            const contractors = await contractorRepository.findAll(companyId);
            res.status(200).json({ success: true, data: contractors });
        } catch (error) {
            console.error('getAllContractors Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getContractor(req, res) {
        try {
            const contractor = await contractorRepository.findById(req.params.id);
            if (!contractor) return res.status(404).json({ success: false, message: 'Contractor not found' });
            res.status(200).json({ success: true, data: contractor });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async createContractor(req, res) {
        try {
            const companyId = req.user?.company_id || 1;
            const data = { ...req.body, company_id: companyId };
            const id = await contractorRepository.create(data);
            res.status(201).json({ success: true, message: 'Contractor created successfully', id });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async updateContractor(req, res) {
        try {
            const updated = await contractorRepository.update(req.params.id, req.body);
            if (!updated) return res.status(404).json({ success: false, message: 'Contractor not found or no changes' });
            res.status(200).json({ success: true, message: 'Contractor updated successfully' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async deleteContractor(req, res) {
        try {
            const deleted = await contractorRepository.delete(req.params.id);
            if (!deleted) return res.status(404).json({ success: false, message: 'Contractor not found' });
            res.status(200).json({ success: true, message: 'Contractor deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getAttendanceReport(req, res) {
        try {
            const { id } = req.params;
            const { month, year } = req.query;
            
            if (!month || !year) return res.status(400).json({ success: false, message: 'Month and year are required' });

            const report = await contractorRepository.getAttendanceReport(id, month, year);
            res.status(200).json({ success: true, data: report });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new ContractorController();
