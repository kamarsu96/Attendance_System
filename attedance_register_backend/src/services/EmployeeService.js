const employeeRepository = require('../repositories/EmployeeRepository');
const { uploadToCloudinary } = require('./CloudinaryService');

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

        // 2. Handle Documents (Optional - if we want to store multiple documents)
        if (files.documents && files.documents.length > 0) {
            for (const doc of files.documents) {
                const result = await uploadToCloudinary(doc.buffer, 'documents');
                // Store in employee_documents table
                await employeeRepository.addDocument(employeeId, {
                    document_type: doc.originalname.split('.')[0],
                    file_path: result.secure_url
                });
            }
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
                    document_type: doc.originalname.split('.')[0],
                    file_path: result.secure_url
                });
            }
        }

        return await employeeRepository.update(id, data);
    }
}

module.exports = new EmployeeService();
