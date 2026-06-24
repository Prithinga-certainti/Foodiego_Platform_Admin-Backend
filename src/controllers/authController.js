const jwt = require('jsonwebtoken');

async function login(req, res) {
  const { email, password } = req.body;
  if (
    email !== process.env.ADMIN_EMAIL ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({ success: false, message: 'Invalid credentials', data: null });
  }
  const token = jwt.sign({ email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '24h' });
  return res.json({ success: true, message: 'Login successful', data: { token } });
}

module.exports = { login };
