const BaseRepository = require('./BaseRepository');

class AuditLogRepository extends BaseRepository {
    async log(data) {
        const { user_id, action, module, details, ip_address } = data;
        const sql = 'INSERT INTO audit_logs (user_id, action, entity_name, new_values, ip_address) VALUES (?, ?, ?, ?, ?)';
        return await this.execute(sql, [user_id, action, module, details, ip_address]);
    }

    async getByModule(module) {
        const sql = 'SELECT * FROM audit_logs WHERE entity_name = ? ORDER BY created_at DESC LIMIT 100';
        return await this.query(sql, [module]);
    }
}

module.exports = new AuditLogRepository();
