const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/UserRepository');

class AuthService {
    async register(userData) {
        const password_hash = await bcrypt.hash(userData.password, 10);
        return await userRepository.create({
            employee_id: userData.employee_id,
            username: userData.username,
            password_hash,
            role_id: userData.role_id
        });
    }

    async login(username, password) {
        const user = await userRepository.findByUsername(username);
        if (!user) throw new Error('User not found');

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) throw new Error('Invalid credentials');

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role_name, role_id: user.role_id, company_id: user.company_id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        return { token, user: { id: user.id, username: user.username, role: user.role_name, role_id: user.role_id, company_id: user.company_id, employee_id: user.employee_id } };
    }
}

module.exports = new AuthService();
