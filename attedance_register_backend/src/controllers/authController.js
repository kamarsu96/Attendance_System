const authService = require('../services/AuthService');
const auditLogRepository = require('../repositories/AuditLogRepository');

class AuthController {
    async register(req, res) {
        try {
            const userId = await authService.register(req.body);
            res.status(201).json({ success: true, message: 'User registered successfully', userId });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async login(req, res) {
        try {
            const { username, password } = req.body;
            const result = await authService.login(username, password);
            
            // Log successful login
            await auditLogRepository.log({
                user_id: result.user.id,
                action: 'LOGIN_SUCCESS',
                module: 'AUTH',
                details: `User ${username} logged in`,
                ip_address: req.ip
            });

            res.status(200).json({ success: true, ...result });
        } catch (error) {
            res.status(401).json({ success: false, message: error.message });
        }
    }

    async me(req, res) {
        try {
            const userRepository = require('../repositories/UserRepository');
            const profile = await userRepository.getProfile(req.user.id);
            res.status(200).json({ success: true, data: profile });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async updateProfile(req, res) {
        try {
            const userRepository = require('../repositories/UserRepository');
            await userRepository.updateProfile(req.user.id, req.body);
            res.status(200).json({ success: true, message: 'Profile updated successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async resetPassword(req, res) {
        try {
            const userRepository = require('../repositories/UserRepository');
            const bcrypt = require('bcryptjs');
            const { new_password } = req.body;
            if (!new_password) {
                return res.status(400).json({ success: false, message: 'New password is required' });
            }
            const password_hash = await bcrypt.hash(new_password, 10);
            await userRepository.updatePassword(req.user.id, password_hash);
            res.status(200).json({ success: true, message: 'Password updated successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new AuthController();
