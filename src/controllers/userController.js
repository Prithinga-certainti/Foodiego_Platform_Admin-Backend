const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { createUser } = require('../validators/userValidator');

function generatePassword() {
  return crypto.randomBytes(8).toString('hex');
}

async function getAllUsers(req, res, next) {
  try {
    const result = await User.getAll(req.query);
    res.json({ success: true, message: 'Users fetched', data: result });
  } catch (err) { next(err); }
}

async function getUserById(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User fetched', data: user });
  } catch (err) { next(err); }
}

async function createUserHandler(req, res, next) {
  try {
    const { error } = createUser.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const existing = await User.findByEmail(req.body.email);
    if (existing) return res.status(409).json({ success: false, message: 'Email already exists' });

    const plainPassword = req.body.password || generatePassword();
    const hashed = await bcrypt.hash(plainPassword, 10);

    const user = await User.create({
      ...req.body,
      password: hashed,
      created_by: req.user?.id || null,
    });

    const { password, ...safeUser } = user;
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { ...safeUser, generatedPassword: plainPassword },
    });
  } catch (err) { next(err); }
}

async function blockUser(req, res, next) {
  try {
    const user = await User.block(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User blocked', data: user });
  } catch (err) { next(err); }
}

async function unblockUser(req, res, next) {
  try {
    const user = await User.unblock(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User unblocked', data: user });
  } catch (err) { next(err); }
}

async function resetPassword(req, res, next) {
  try {
    const newPassword = generatePassword();
    const hashed = await bcrypt.hash(newPassword, 10);
    const user = await User.resetPassword(req.params.id, hashed);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'Password reset', data: { newPassword } });
  } catch (err) { next(err); }
}

async function deleteUser(req, res, next) {
  try {
    await User.softDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) { next(err); }
}

module.exports = { getAllUsers, getUserById, createUserHandler, blockUser, unblockUser, resetPassword, deleteUser };
