const BaseRepository = require('./BaseRepository');

class RolePermissionRepository extends BaseRepository {
    async getByRole(role_id) {
        const sql = 'SELECT * FROM role_permissions WHERE role_id = ?';
        return await this.query(sql, [role_id]);
    }

    async getByRoleAndScreen(role_id, screen_name) {
        const sql = 'SELECT * FROM role_permissions WHERE role_id = ? AND screen_name = ?';
        const rows = await this.query(sql, [role_id, screen_name]);
        return rows[0];
    }

    async savePermission(role_id, screen_name, can_view, can_create, can_update, can_delete) {
        const sql = `
            INSERT INTO role_permissions (role_id, screen_name, can_view, can_create, can_update, can_delete)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                can_view = VALUES(can_view), 
                can_create = VALUES(can_create), 
                can_update = VALUES(can_update), 
                can_delete = VALUES(can_delete)
        `;
        return await this.execute(sql, [role_id, screen_name, can_view, can_create, can_update, can_delete]);
    }
}

module.exports = new RolePermissionRepository();
