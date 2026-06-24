const employeeRepository = require('../repositories/EmployeeRepository');
const userRepository = require('../repositories/UserRepository');
const { uploadToCloudinary } = require('./CloudinaryService');
const bcrypt = require('bcryptjs');

class EmployeeService {
    async registerEmployee(employeeData, files) {
        console.log('Registering Employee - Files received:', Object.keys(files));
        // 1. Handle Profile Picture
        if (files.profile_pic && files.profile_pic[0]) {
            console.log('Uploading profile picture to Cloudinary...');
            const result = await uploadToCloudinary(files.profile_pic[0].buffer, 'profiles');
            console.log('Cloudinary Upload Result:', result.secure_url);
            employeeData.profile_picture_url = result.secure_url;
        }

        // Clean up data
        delete employeeData.profile_pic;
        delete employeeData.profile_pic_file;
        delete employeeData.documents;

        const employeeId = await employeeRepository.create(employeeData);

        // 2. Handle Documents
        if (files.documents && files.documents.length > 0) {
            for (const doc of files.documents) {
                const result = await uploadToCloudinary(doc.buffer, 'documents');
                await employeeRepository.addDocument(employeeId, {
                    document_type: doc.originalname.split('.')[0].substring(0, 50),
                    file_path: result.secure_url
                });
            }
        }

        // 3. Automatically Create User Account
        if (employeeData.email) {
            const firstName = (employeeData.first_name || 'user').toLowerCase();
            const phone = employeeData.phone || '0000';
            const last4Phone = phone.slice(-4).padStart(4, '0');
            const defaultPassword = `${firstName}${last4Phone}`;
            
            console.log(`Creating user account for ${employeeData.email} with default password: ${defaultPassword}`);
            
            const password_hash = await bcrypt.hash(defaultPassword, 10);
            await userRepository.create({
                employee_id: employeeId,
                username: employeeData.email,
                password_hash,
                role_id: 5 // Default 'employee' role ID from roles table
            });
        }

        return employeeId;
    }

    async getEmployeesByCompany(companyId) {
        return await employeeRepository.findAll(companyId);
    }

    async getEmployeeById(id) {
        return await employeeRepository.findById(id);
    }

    async deleteEmployee(id) {
        return await employeeRepository.delete(id);
    }

    async updateEmployee(id, data, files) {
        console.log('Updating Employee Media - Files received:', Object.keys(files));
        // Handle Profile Picture update
        if (files.profile_pic && files.profile_pic[0]) {
            console.log('Uploading new profile picture for ID:', id);
            const result = await uploadToCloudinary(files.profile_pic[0].buffer, 'profiles');
            console.log('Cloudinary Update Result:', result.secure_url);
            data.profile_picture_url = result.secure_url;
        }

        // Remove file fields from data object to prevent DB issues
        delete data.profile_pic;
        delete data.profile_pic_file;
        delete data.documents;

        // Handle Documents update
        if (files.documents && files.documents.length > 0) {
            for (const doc of files.documents) {
                const result = await uploadToCloudinary(doc.buffer, 'documents');
                await employeeRepository.addDocument(id, {
                    document_type: doc.originalname.split('.')[0].substring(0, 50),
                    file_path: result.secure_url
                });
            }
        }

        return await employeeRepository.update(id, data);
    }
}

module.exports = new EmployeeService();
