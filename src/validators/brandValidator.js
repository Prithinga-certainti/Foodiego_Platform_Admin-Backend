const Joi = require('joi');

const createBrand = Joi.object({
  name: Joi.string().max(100).required(),
  gst_number: Joi.string().max(15).optional().allow('', null),
  owner_id: Joi.number().integer().optional().allow(null),
});

const rejectSchema = Joi.object({
  reason: Joi.string().min(5).required(),
});

const suspendSchema = Joi.object({
  reason: Joi.string().min(5).required(),
  duration: Joi.string().valid('7days','30days','90days','permanent').required(),
});

module.exports = { createBrand, rejectSchema, suspendSchema };
