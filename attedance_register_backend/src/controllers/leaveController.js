const leaveRepository = require('../repositories/LeaveRepository');

class LeaveController {
    async apply(req, res) {
        try {
            const leaveId = await leaveRepository.createRequest(req.body);
            res.status(201).json({ success: true, message: 'Leave applied successfully', leaveId });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async listByEmployee(req, res) {
        try {
            const leaves = await leaveRepository.findByEmployee(req.params.employeeId);
            res.status(200).json({ success: true, data: leaves });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async approve(req, res) {
        try {
            const { id } = req.params;
            const { status, approverId } = req.body;
            await leaveRepository.updateStatus(id, status, approverId);
            res.status(200).json({ success: true, message: `Leave ${status}` });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}

module.exports = new LeaveController();
