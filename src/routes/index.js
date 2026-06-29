const router = require('express').Router();
router.use('/auth', require('./authRoutes'));
router.use('/reports', require('./reportRoutes'));
router.use('/brands', require('./brandRoutes'));
router.use('/restaurants', require('./restaurantRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/menu', require('./menuRoutes'));
module.exports = router;
