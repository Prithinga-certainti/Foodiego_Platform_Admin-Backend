require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/database');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3005;

connectDB()
  .then(() => app.listen(PORT, () => logger.info(`Server running on port ${PORT}`)))
  .catch((err) => { logger.error('Startup failed', { err }); process.exit(1); });
