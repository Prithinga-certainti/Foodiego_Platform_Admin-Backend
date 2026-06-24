const Joi = require('joi');

const createUser = Joi.object({
  name: Joi.string().max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).optional().allow('', null),
  role: Joi.string().valid('brand_owner','branch_manager','menu_manager','restaurant_operator','support_staff').required(),
  restaurant_id: Joi.number().integer().optional().allow(null, ''),
  branch_id: Joi.number().integer().optional().allow(null, ''),
});

module.exports = { createUser };
