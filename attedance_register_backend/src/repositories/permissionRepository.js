const pool = require('../config/database');

const Permission = {
  create: async (permissionData) => {
    const { employee_id, permission_date, start_time, end_time, reason } = permissionData;
    const [result] = await pool.query(
      'INSERT INTO permissions (employee_id, permission_date, start_time, end_time, reason) VALUES (?, ?, ?, ?, ?)',
      [employee_id, permission_date, start_time, end_time, reason]
    );
    return result.insertId;
  },
  findAll: async () => {
    const [rows] = await pool.query(`
      SELECT p.*, e.first_name, e.last_name 
      FROM permissions p
      JOIN employees e ON p.employee_id = e.id
    `);
    return rows;
  },
  updateStatus: async (id, status) => {
    const [result] = await pool.query(
      'UPDATE permissions SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows;
  }
};

module.exports = Permission;
