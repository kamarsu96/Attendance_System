const roleRepository = require('../repositories/RoleRepository');

class RoleController {
    async getAll(req, res) {
        try {
            const roles = await roleRepository.getAll();
            res.status(200).json({ success: true, data: roles });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async create(req, res) {
        try {
            const { role_name, parent_role_id } = req.body;
            if (!role_name) {
                return res.status(400).json({ success: false, message: 'Role name is required' });
            }
            const id = await roleRepository.create({ role_name, parent_role_id });
            const newRole = await roleRepository.getById(id);
            res.status(201).json({ success: true, data: newRole });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async update(req, res) {
        try {
            const { role_name, parent_role_id } = req.body;
            await roleRepository.update(req.params.id, { role_name, parent_role_id });
            res.status(200).json({ success: true, message: 'Role updated successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async delete(req, res) {
        try {
            await roleRepository.delete(req.params.id);
            res.status(200).json({ success: true, message: 'Role deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new RoleController();
