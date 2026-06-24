const { pool } = require('../config/database');

const Restaurant = {
  async getAll({ brand_id, status, city, search, page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;
    let where = 'WHERE 1=1';
    const params = [];
    let i = 1;
    if (brand_id) { where += ` AND r.brand_id = $${i++}`; params.push(brand_id); }
    if (status) { where += ` AND r.status = $${i++}`; params.push(status); }
    if (city) { where += ` AND r.city ILIKE $${i++}`; params.push(`%${city}%`); }
    if (search) { where += ` AND r.name ILIKE $${i++}`; params.push(`%${search}%`); }
    const countRes = await pool.query(`SELECT COUNT(*) FROM restaurants r ${where}`, params);
    const rows = await pool.query(
      `SELECT r.*, b.name as brand_name FROM restaurants r LEFT JOIN brands b ON r.brand_id = b.id
       ${where} ORDER BY r.created_at DESC LIMIT $${i} OFFSET $${i+1}`,
      [...params, limit, offset]
    );
    return { data: rows.rows, total: parseInt(countRes.rows[0].count), page: parseInt(page), limit: parseInt(limit) };
  },
  async getPending() {
    const res = await pool.query(`SELECT r.*, b.name as brand_name FROM restaurants r LEFT JOIN brands b ON r.brand_id = b.id WHERE r.status='pending' ORDER BY r.created_at DESC`);
    return res.rows;
  },
  async create({ brand_id, name, address, city, phone, email }) {
    const res = await pool.query(
      `INSERT INTO restaurants (brand_id,name,address,city,phone,email,status,is_active) VALUES ($1,$2,$3,$4,$5,$6,'approved',true) RETURNING *`,
      [brand_id, name, address, city, phone, email]
    );
    return res.rows[0];
  },
  async findById(id) {
    const res = await pool.query('SELECT * FROM restaurants WHERE id=$1', [id]);
    return res.rows[0];
  },
  async approve(id) {
    const res = await pool.query(`UPDATE restaurants SET status='approved', is_active=true, updated_at=NOW() WHERE id=$1 RETURNING *`, [id]);
    return res.rows[0];
  },
  async reject(id, reason) {
    const res = await pool.query(`UPDATE restaurants SET status='rejected', updated_at=NOW() WHERE id=$1 RETURNING *`, [id]);
    return res.rows[0];
  },
  async suspend(id, reason) {
    const res = await pool.query(`UPDATE restaurants SET is_active=false, updated_at=NOW() WHERE id=$1 RETURNING *`, [id]);
    return res.rows[0];
  },
};
module.exports = Restaurant;
