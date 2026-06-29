const Menu = require('../models/Menu');

exports.getRequests = async (req, res, next) => {
  try {
    const { status = 'all', brand_id, page = 1, limit = 10 } = req.query;
    const rows = await Menu.getAllRequests({ status, brand_id, page: parseInt(page), limit: parseInt(limit) });
    const total = rows[0]?.total_count || 0;
    res.json({ data: rows, total: parseInt(total), page: parseInt(page), limit: parseInt(limit) });
  } catch (e) { next(e); }
};

exports.getItems = async (req, res, next) => {
  try {
    const items = await Menu.getRequestItems(req.params.id);
    res.json({ data: items });
  } catch (e) { next(e); }
};

exports.submitRequest = async (req, res, next) => {
  try {
    const { brand_id, restaurant_id, submitted_by, upload_type, notes, items } = req.body;
    if (!brand_id || !items?.length) return res.status(400).json({ error: 'brand_id and items are required' });
    const request = await Menu.createRequest({ brand_id, restaurant_id, submitted_by, upload_type: upload_type || 'manual', notes });
    await Menu.createItems(request.id, brand_id, restaurant_id, items);
    res.status(201).json({ data: request, message: `Menu request submitted with ${items.length} items` });
  } catch (e) { next(e); }
};

exports.approveItem = async (req, res, next) => {
  try {
    const item = await Menu.approveItem(req.params.itemId, req.user.id);
    res.json({ data: item, message: 'Item approved' });
  } catch (e) { next(e); }
};

exports.rejectItem = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const item = await Menu.rejectItem(req.params.itemId, req.user.id, reason);
    res.json({ data: item, message: 'Item rejected' });
  } catch (e) { next(e); }
};

exports.bulkApprove = async (req, res, next) => {
  try {
    await Menu.bulkApprove(req.params.id, req.user.id);
    res.json({ message: 'All pending items approved' });
  } catch (e) { next(e); }
};

exports.bulkReject = async (req, res, next) => {
  try {
    const { reason } = req.body;
    await Menu.bulkReject(req.params.id, req.user.id, reason);
    res.json({ message: 'All pending items rejected' });
  } catch (e) { next(e); }
};

exports.getStats = async (req, res, next) => {
  try {
    const stats = await Menu.getStats();
    res.json({ data: stats });
  } catch (e) { next(e); }
};
