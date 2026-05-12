const BaseRepository = require('./BaseRepository');

class NotificationRepository extends BaseRepository {
    async create(companyId, title, message, targetType = 'all') {
        const sql = `INSERT INTO notifications (company_id, title, message, target_type) VALUES (?, ?, ?, ?)`;
        const result = await this.execute(sql, [companyId, title, message, targetType]);
        return result.insertId;
    }

    async getRecentByCompany(companyId, limit = 20) {
        const sql = `
            SELECT id, title, message as description, target_type as type, 
                   created_at, 'notifications_active' as icon, 'primary' as color
            FROM notifications
            WHERE company_id = ?
            ORDER BY created_at DESC
            LIMIT ?
        `;
        return await this.query(sql, [companyId, limit]);
    }
}

module.exports = new NotificationRepository();
