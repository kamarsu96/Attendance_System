const BaseRepository = require('./BaseRepository');

class RoleRepository extends BaseRepository {
    async getAll() {
        const sql = 'SELECT * FROM roles ORDER BY role_name ASC';
        return await this.query(sql);
    }

    async getById(id) {
        const sql = 'SELECT * FROM roles WHERE id = ?';
        const rows = await this.query(sql, [id]);
        return rows[0];
    }

    async create(data) {
        const sql = 'INSERT INTO roles (role_name, parent_role_id) VALUES (?, ?)';
        const result = await this.execute(sql, [data.role_name, data.parent_role_id || null]);
        return result.insertId;
    }

    async update(id, data) {
        const sql = 'UPDATE roles SET role_name = ?, parent_role_id = ? WHERE id = ?';
        return await this.execute(sql, [data.role_name, data.parent_role_id || null, id]);
    }

    async delete(id) {
        const sql = 'DELETE FROM roles WHERE id = ?';
        return await this.execute(sql, [id]);
    }
}

module.exports = new RoleRepository();
