require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
app.use(helmet());
app.use(cors({ origin: /^http:\/\/localhost:\d+$/ }));
app.use(express.json());
app.use(morgan('dev'));
app.use('/api/v1', routes);
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use(errorHandler);

module.exports = app;
