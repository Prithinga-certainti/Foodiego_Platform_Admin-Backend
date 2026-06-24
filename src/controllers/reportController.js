const service = require('../services/reportService');

async function kpi(req, res, next) {
  try {
    const data = await service.getKPI();
    res.json({ success: true, message: 'KPI data', data });
  } catch (err) { next(err); }
}

async function dailyRevenue(req, res, next) {
  try {
    const data = await service.getDailyRevenue();
    res.json({ success: true, message: 'Daily revenue', data });
  } catch (err) { next(err); }
}

async function orderSummary(req, res, next) {
  try {
    const data = await service.getOrderSummary();
    res.json({ success: true, message: 'Order summary', data });
  } catch (err) { next(err); }
}

async function topItems(req, res, next) {
  try {
    const data = await service.getTopItems();
    res.json({ success: true, message: 'Top items', data });
  } catch (err) { next(err); }
}

async function recentOrders(req, res, next) {
  try {
    const data = await service.getRecentOrders();
    res.json({ success: true, message: 'Recent orders', data });
  } catch (err) { next(err); }
}

async function overviewStats(req, res, next) {
  try {
    const data = await service.getOverviewStats();
    res.json({ success: true, message: 'Overview stats', data });
  } catch (err) { next(err); }
}

async function brandPerformance(req, res, next) {
  try {
    const data = await service.getBrandPerformance();
    res.json({ success: true, message: 'Brand performance', data });
  } catch (err) { next(err); }
}

async function cityStats(req, res, next) {
  try {
    const data = await service.getCityStats();
    res.json({ success: true, message: 'City stats', data });
  } catch (err) { next(err); }
}

async function monthlyRevenue(req, res, next) {
  try {
    const data = await service.getMonthlyRevenue();
    res.json({ success: true, message: 'Monthly revenue', data });
  } catch (err) { next(err); }
}

async function pendingApprovals(req, res, next) {
  try {
    const data = await service.getPendingApprovals();
    res.json({ success: true, message: 'Pending approvals', data });
  } catch (err) { next(err); }
}

module.exports = { kpi, dailyRevenue, orderSummary, topItems, recentOrders, overviewStats, brandPerformance, cityStats, monthlyRevenue, pendingApprovals };
