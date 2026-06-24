const Brand = require('../models/Brand');
const Restaurant = require('../models/Restaurant');
const { createBrand, rejectSchema, suspendSchema } = require('../validators/brandValidator');

function validate(schema, data, res) {
  const { error } = schema.validate(data);
  if (error) { res.status(400).json({ success: false, message: error.details[0].message }); return false; }
  return true;
}

async function getAllBrands(req, res, next) {
  try {
    const result = await Brand.getAll(req.query);
    res.json({ success: true, message: 'Brands fetched', data: result });
  } catch (err) { next(err); }
}

async function getPendingBrands(req, res, next) {
  try {
    const data = await Brand.getPending();
    res.json({ success: true, message: 'Pending brands', data });
  } catch (err) { next(err); }
}

async function createBrandHandler(req, res, next) {
  try {
    if (!validate(createBrand, req.body, res)) return;
    const brand = await Brand.create(req.body);
    res.status(201).json({ success: true, message: 'Brand created', data: brand });
  } catch (err) { next(err); }
}

async function approveBrand(req, res, next) {
  try {
    const brand = await Brand.approve(req.params.id);
    if (!brand) return res.status(404).json({ success: false, message: 'Brand not found' });
    res.json({ success: true, message: 'Brand approved', data: brand });
  } catch (err) { next(err); }
}

async function rejectBrand(req, res, next) {
  try {
    if (!validate(rejectSchema, req.body, res)) return;
    const brand = await Brand.reject(req.params.id, req.body.reason);
    if (!brand) return res.status(404).json({ success: false, message: 'Brand not found' });
    res.json({ success: true, message: 'Brand rejected', data: brand });
  } catch (err) { next(err); }
}

async function suspendBrand(req, res, next) {
  try {
    if (!validate(suspendSchema, req.body, res)) return;
    const brand = await Brand.suspend(req.params.id, req.body.reason);
    if (!brand) return res.status(404).json({ success: false, message: 'Brand not found' });
    res.json({ success: true, message: 'Brand suspended', data: brand });
  } catch (err) { next(err); }
}

async function reactivateBrand(req, res, next) {
  try {
    const brand = await Brand.reactivate(req.params.id);
    if (!brand) return res.status(404).json({ success: false, message: 'Brand not found' });
    res.json({ success: true, message: 'Brand reactivated', data: brand });
  } catch (err) { next(err); }
}

async function getAllRestaurants(req, res, next) {
  try {
    const result = await Restaurant.getAll(req.query);
    res.json({ success: true, message: 'Restaurants fetched', data: result });
  } catch (err) { next(err); }
}

async function getPendingRestaurants(req, res, next) {
  try {
    const data = await Restaurant.getPending();
    res.json({ success: true, message: 'Pending restaurants', data });
  } catch (err) { next(err); }
}

async function createRestaurant(req, res, next) {
  try {
    const restaurant = await Restaurant.create(req.body);
    res.status(201).json({ success: true, message: 'Restaurant created', data: restaurant });
  } catch (err) { next(err); }
}

async function approveRestaurant(req, res, next) {
  try {
    const r = await Restaurant.approve(req.params.id);
    res.json({ success: true, message: 'Restaurant approved', data: r });
  } catch (err) { next(err); }
}

async function rejectRestaurant(req, res, next) {
  try {
    if (!validate(rejectSchema, req.body, res)) return;
    const r = await Restaurant.reject(req.params.id, req.body.reason);
    res.json({ success: true, message: 'Restaurant rejected', data: r });
  } catch (err) { next(err); }
}

async function suspendRestaurant(req, res, next) {
  try {
    if (!validate(suspendSchema, req.body, res)) return;
    const r = await Restaurant.suspend(req.params.id, req.body.reason);
    res.json({ success: true, message: 'Restaurant suspended', data: r });
  } catch (err) { next(err); }
}

module.exports = {
  getAllBrands, getPendingBrands, createBrandHandler, approveBrand,
  rejectBrand, suspendBrand, reactivateBrand,
  getAllRestaurants, getPendingRestaurants, createRestaurant,
  approveRestaurant, rejectRestaurant, suspendRestaurant,
};
