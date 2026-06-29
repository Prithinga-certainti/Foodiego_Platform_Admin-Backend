const pool = require('../config/database');

const getAllRequests = async ({ status, brand_id, page = 1, limit = 10 }) => {
  const offset = (page - 1) * limit;
  const params = [];
  const where = [];
  let idx = 1;
  if (status && status !== 'all') { where.push(`mr.status = $${idx++}`); params.push(status); }
  if (brand_id) { where.push(`mr.brand_id = $${idx++}`); params.push(brand_id); }
  const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const { rows } = await pool.query(`
    SELECT mr.*, b.name AS brand_name, r.name AS restaurant_name,
           u.name AS submitted_by_name, u.role AS submitted_by_role,
           COUNT(*) OVER() AS total_count
    FROM menu_requests mr
    LEFT JOIN brands b ON mr.brand_id = b.id
    LEFT JOIN restaurants r ON mr.restaurant_id = r.id
    LEFT JOIN users u ON mr.submitted_by = u.id
    ${whereStr}
    ORDER BY mr.created_at DESC
    LIMIT $${idx} OFFSET $${idx + 1}
  `, [...params, limit, offset]);
  return rows;
};

const getRequestItems = async (request_id) => {
  const { rows } = await pool.query(
    'SELECT * FROM menu_items WHERE request_id = $1 ORDER BY display_order NULLS LAST, id',
    [request_id]
  );
  return rows;
};

const createRequest = async ({ brand_id, restaurant_id, submitted_by, upload_type, notes }) => {
  const { rows } = await pool.query(
    `INSERT INTO menu_requests (brand_id, restaurant_id, submitted_by, upload_type, notes)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [brand_id, restaurant_id, submitted_by, upload_type, notes || null]
  );
  return rows[0];
};

const createItems = async (request_id, brand_id, restaurant_id, items) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const item of items) {
      await client.query(`
        INSERT INTO menu_items
          (request_id, brand_id, restaurant_id, item_name, category, sub_category, description,
           price, discount_price, tax_percentage, image_url, food_type, spice_level,
           calories, allergens, available_from, available_to, packaging_charge,
           display_order, is_featured, is_bestseller, is_customizable)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)`,
        [
          request_id, brand_id, restaurant_id,
          item.item_name, item.category || null, item.sub_category || null, item.description || null,
          item.price || null, item.discount_price || null, item.tax_percentage || 5,
          item.image_url || null, item.food_type || null, item.spice_level || null,
          item.calories || null, item.allergens || null,
          item.available_from || null, item.available_to || null,
          item.packaging_charge || 0, item.display_order || null,
          toBoolean(item.is_featured), toBoolean(item.is_bestseller), toBoolean(item.is_customizable)
        ]
      );
    }
    await client.query(
      'UPDATE menu_requests SET total_items = $1, updated_at = NOW() WHERE id = $2',
      [items.length, request_id]
    );
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

const approveItem = async (id, reviewed_by) => {
  const { rows } = await pool.query(
    `UPDATE menu_items SET approval_status='approved', reviewed_by=$1, reviewed_at=NOW(), updated_at=NOW()
     WHERE id=$2 RETURNING *`,
    [reviewed_by, id]
  );
  if (rows[0]) await syncRequestStatus(rows[0].request_id);
  return rows[0];
};

const rejectItem = async (id, reviewed_by, reason) => {
  const { rows } = await pool.query(
    `UPDATE menu_items SET approval_status='rejected', rejection_reason=$1, reviewed_by=$2, reviewed_at=NOW(), updated_at=NOW()
     WHERE id=$3 RETURNING *`,
    [reason || null, reviewed_by, id]
  );
  if (rows[0]) await syncRequestStatus(rows[0].request_id);
  return rows[0];
};

const bulkApprove = async (request_id, reviewed_by) => {
  await pool.query(
    `UPDATE menu_items SET approval_status='approved', reviewed_by=$1, reviewed_at=NOW(), updated_at=NOW()
     WHERE request_id=$2 AND approval_status='pending'`,
    [reviewed_by, request_id]
  );
  await syncRequestStatus(request_id);
};

const bulkReject = async (request_id, reviewed_by, reason) => {
  await pool.query(
    `UPDATE menu_items SET approval_status='rejected', rejection_reason=$1, reviewed_by=$2, reviewed_at=NOW(), updated_at=NOW()
     WHERE request_id=$3 AND approval_status='pending'`,
    [reason || null, reviewed_by, request_id]
  );
  await syncRequestStatus(request_id);
};

const getStats = async () => {
  const { rows } = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE mr.status = 'pending') AS pending_requests,
      COALESCE(SUM(mi_pending.cnt), 0) AS pending_items,
      COUNT(*) FILTER (WHERE DATE(mr.updated_at) = CURRENT_DATE AND mr.status = 'approved') AS approved_today,
      COUNT(*) AS total_requests
    FROM menu_requests mr
    LEFT JOIN LATERAL (
      SELECT COUNT(*) AS cnt FROM menu_items WHERE request_id = mr.id AND approval_status = 'pending'
    ) mi_pending ON TRUE
  `);
  return rows[0];
};

async function syncRequestStatus(request_id) {
  const { rows } = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE approval_status='pending')  AS pending,
       COUNT(*) FILTER (WHERE approval_status='approved') AS approved,
       COUNT(*) FILTER (WHERE approval_status='rejected') AS rejected
     FROM menu_items WHERE request_id=$1`,
    [request_id]
  );
  const p = parseInt(rows[0].pending);
  const a = parseInt(rows[0].approved);
  const r = parseInt(rows[0].rejected);
  let status = 'pending';
  if (p === 0) {
    if (r === 0) status = 'approved';
    else if (a === 0) status = 'rejected';
    else status = 'partial';
  }
  await pool.query(
    'UPDATE menu_requests SET status=$1, updated_at=NOW() WHERE id=$2',
    [status, request_id]
  );
}

function toBoolean(val) {
  if (val === true || val === 'true' || val === '1' || val === 1) return true;
  return false;
}

module.exports = { getAllRequests, getRequestItems, createRequest, createItems, approveItem, rejectItem, bulkApprove, bulkReject, getStats };
