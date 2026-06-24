const { pool } = require('../config/database');

const Brand = {
  async getAll({ status, search, page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;
    let where = 'WHERE 1=1';
    const params = [];
    let i = 1;
    if (status) { where += ` AND b.status = $${i++}`; params.push(status); }
    if (search) { where += ` AND b.name ILIKE $${i++}`; params.push(`%${search}%`); }
    const countRes = await pool.query(`SELECT COUNT(*) FROM brands b ${where}`, params);
    const rows = await pool.query(
      `SELECT b.*, u.name as owner_name, u.email as owner_email
       FROM brands b LEFT JOIN users u ON b.owner_id = u.id
       ${where} ORDER BY b.created_at DESC LIMIT $${i} OFFSET $${i+1}`,
      [...params, limit, offset]
    );
    return { data: rows.rows, total: parseInt(countRes.rows[0].count), page: parseInt(page), limit: parseInt(limit) };
  },
  async getPending() {
    const res = await pool.query(`SELECT b.*, u.name as owner_name FROM brands b LEFT JOIN users u ON b.owner_id = u.id WHERE b.status = 'pending' ORDER BY b.created_at DESC`);
    return res.rows;
  },
  async create({ name, gst_number, owner_id }) {
    const res = await pool.query(
      `INSERT INTO brands (name, gst_number, owner_id, status, is_active) VALUES ($1,$2,$3,'approved',true) RETURNING *`,
      [name, gst_number, owner_id]
    );
    return res.rows[0];
  },
  async findById(id) {
    const res = await pool.query('SELECT * FROM brands WHERE id=$1', [id]);
    return res.rows[0];
  },
  async approve(id) {
    const res = await pool.query(`UPDATE brands SET status='approved', is_active=true, updated_at=NOW() WHERE id=$1 RETURNING *`, [id]);
    return res.rows[0];
  },
  async reject(id, reason) {
    const res = await pool.query(`UPDATE brands SET status='rejected', updated_at=NOW() WHERE id=$1 RETURNING *`, [id]);
    return res.rows[0];
  },
  async suspend(id, reason) {
    const res = await pool.query(`UPDATE brands SET is_active=false, updated_at=NOW() WHERE id=$1 RETURNING *`, [id]);
    return res.rows[0];
  },
  async reactivate(id) {
    const res = await pool.query(`UPDATE brands SET is_active=true, updated_at=NOW() WHERE id=$1 RETURNING *`, [id]);
    return res.rows[0];
  },
};
module.exports = Brand;
