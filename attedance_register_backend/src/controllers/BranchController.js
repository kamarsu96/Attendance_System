const db = require('../config/database');
const branchRepository = require('../repositories/BranchRepository');

class BranchController {
    async getAll(req, res) {
        try {
            const companyId = req.user.company_id || 1;
            const [rows] = await db.query('SELECT * FROM branches WHERE company_id = ? ORDER BY branch_name ASC', [companyId]);
            res.status(200).json({ success: true, data: rows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async create(req, res) {
        try {
            const companyId = req.user.company_id || 1;
            const { branch_name, address, latitude, longitude, radius_meters } = req.body;
            const id = await branchRepository.create({
                company_id: companyId,
                branch_name,
                address,
                latitude,
                longitude,
                radius_meters
            });
            res.status(201).json({ success: true, id, message: 'Branch created successfully' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            await db.query('DELETE FROM branches WHERE id = ?', [id]);
            res.status(200).json({ success: true, message: 'Branch deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new BranchController();
