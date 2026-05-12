const leaveTypeRepository = require('../repositories/LeaveTypeRepository');

class LeaveTypeController {
    async getAll(req, res) {
        try {
            const company_id = 1; 
            const leaveTypes = await leaveTypeRepository.getAllByCompany(company_id);
            res.status(200).json({ success: true, data: leaveTypes });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getById(req, res) {
        try {
            const company_id = 1;
            const leaveType = await leaveTypeRepository.getById(req.params.id, company_id);
            if (!leaveType) return res.status(404).json({ success: false, message: 'Leave type not found' });
            res.status(200).json({ success: true, data: leaveType });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async create(req, res) {
        try {
            const company_id = 1;
            const { leave_name, total_allowed, is_paid } = req.body;
            
            if (!leave_name || total_allowed === undefined) {
                return res.status(400).json({ success: false, message: 'Leave name and total_allowed are required' });
            }

            const id = await leaveTypeRepository.create({ company_id, leave_name, total_allowed, is_paid: is_paid ?? true });
            const newLeaveType = await leaveTypeRepository.getById(id, company_id);
            
            res.status(201).json({ success: true, data: newLeaveType });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async update(req, res) {
        try {
            const company_id = 1;
            const { leave_name, total_allowed, is_paid } = req.body;
            
            await leaveTypeRepository.update(req.params.id, { leave_name, total_allowed, is_paid }, company_id);
            const updatedLeaveType = await leaveTypeRepository.getById(req.params.id, company_id);
            
            res.status(200).json({ success: true, data: updatedLeaveType });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async delete(req, res) {
        try {
            const company_id = 1;
            await leaveTypeRepository.delete(req.params.id, company_id);
            res.status(200).json({ success: true, message: 'Leave type deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new LeaveTypeController();
