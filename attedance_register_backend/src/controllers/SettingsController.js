class SettingsController {
    async getSettings(req, res) {
        try {
            // Mock data fallback if DB is not ready or empty
            const companyInfo = {
                name: 'PulseHR Solutions Inc.',
                website: 'pulsehr.example.com',
                email: 'admin@pulsehr.example.com'
            };

            const departments = [
                'Engineering',
                'Marketing & Sales',
                'Product Design'
            ];

            const designations = [
                'Software Architect',
                'Senior Product Designer',
                'Marketing Specialist',
                'HR Manager'
            ];

            const regional = {
                timezone: '(GMT-05:00) Eastern Time (US & Canada)',
                dateFormat: 'DD/MM/YYYY',
                currency: 'USD ($)'
            };

            const security = {
                sso: true,
                tfa: false
            };
            
            res.status(200).json({ success: true, data: { companyInfo, departments, designations, regional, security } });
        } catch (error) {
            console.error('getSettings Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
    async updateSettings(req, res) {
        console.log('Update Settings Hit:', req.body);
        try {
            const companyId = req.user?.company_id || 1;
            const { name, website, email, logo_url } = req.body;
            
            const db = require('../config/database');
            await db.query(
                'UPDATE companies SET name = ?, website = ?, contact_email = ?, logo_url = ? WHERE id = ?',
                [name, website, email, logo_url, companyId]
            );
            
            res.status(200).json({ success: true, message: 'Settings updated successfully' });
        } catch (error) {
            console.error('updateSettings Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new SettingsController();
