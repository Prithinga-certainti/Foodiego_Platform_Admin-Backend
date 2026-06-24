const { pool } = require('../config/database');

const User = {
  async getAll({ role, is_active, search, page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;
    let where = 'WHERE deleted_at IS NULL';
    const params = [];
    let i = 1;
    if (role) { where += ` AND u.role = $${i++}`; params.push(role); }
    if (is_active !== undefined) { where += ` AND u.is_active = $${i++}`; params.push(is_active); }
    if (search) { where += ` AND (u.name ILIKE $${i} OR u.email ILIKE $${i++})`; params.push(`%${search}%`); }
    const countRes = await pool.query(`SELECT COUNT(*) FROM users u ${where}`, params);
    const rows = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.restaurant_id, u.branch_id, u.is_active, u.created_at,
              r.name as restaurant_name
       FROM users u LEFT JOIN restaurants r ON u.restaurant_id = r.id
       ${where} ORDER BY u.created_at DESC LIMIT $${i} OFFSET $${i+1}`,
      [...params, limit, offset]
    );
    return { data: rows.rows, total: parseInt(countRes.rows[0].count), page: parseInt(page), limit: parseInt(limit) };
  },
  async findById(id) {
    const res = await pool.query(`SELECT u.*, r.name as restaurant_name FROM users u LEFT JOIN restaurants r ON u.restaurant_id = r.id WHERE u.id=$1 AND deleted_at IS NULL`, [id]);
    return res.rows[0];
  },
  async findByEmail(email) {
    const res = await pool.query('SELECT * FROM users WHERE email=$1 AND deleted_at IS NULL', [email]);
    return res.rows[0];
  },
  async create({ name, email, password, role, restaurant_id, branch_id, created_by }) {
    const res = await pool.query(
      `INSERT INTO users (name,email,password,role,restaurant_id,branch_id,is_active,created_by) VALUES ($1,$2,$3,$4,$5,$6,true,$7) RETURNING *`,
      [name, email, password, role, restaurant_id || null, branch_id || null, created_by || null]
    );
    return res.rows[0];
  },
  async block(id) {
    const res = await pool.query(`UPDATE users SET is_active=false, updated_at=NOW() WHERE id=$1 RETURNING *`, [id]);
    return res.rows[0];
  },
  async unblock(id) {
    const res = await pool.query(`UPDATE users SET is_active=true, updated_at=NOW() WHERE id=$1 RETURNING *`, [id]);
    return res.rows[0];
  },
  async resetPassword(id, hashedPassword) {
    const res = await pool.query(`UPDATE users SET password=$1, updated_at=NOW() WHERE id=$2 RETURNING *`, [hashedPassword, id]);
    return res.rows[0];
  },
  async softDelete(id) {
    await pool.query(`UPDATE users SET deleted_at=NOW() WHERE id=$1`, [id]);
  },
};
module.exports = User;
