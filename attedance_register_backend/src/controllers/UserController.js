const userRepository = require('../repositories/UserRepository');
const bcrypt = require('bcryptjs');

class UserController {
    async getAll(req, res) {
        try {
            const users = await userRepository.getAll();
            res.status(200).json({ success: true, data: users });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async create(req, res) {
        try {
            const { username, password, role_id, employee_id } = req.body;
            if (!username || !password || !role_id) {
                return res.status(400).json({ success: false, message: 'Username, password, and role are required' });
            }
            const password_hash = await bcrypt.hash(password, 10);
            const id = await userRepository.create({ username, password_hash, role_id, employee_id });
            const newUser = await userRepository.getById(id);
            res.status(201).json({ success: true, data: newUser });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async delete(req, res) {
        try {
            await userRepository.delete(req.params.id);
            res.status(200).json({ success: true, message: 'User deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new UserController();
