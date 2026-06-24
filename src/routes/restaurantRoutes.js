const router = require('express').Router();
const ctrl = require('../controllers/brandController');
const auth = require('../middlewares/authMiddleware');

router.use(auth);
router.get('/', ctrl.getAllRestaurants);
router.get('/pending', ctrl.getPendingRestaurants);
router.post('/', ctrl.createRestaurant);
router.put('/:id/approve', ctrl.approveRestaurant);
router.put('/:id/reject', ctrl.rejectRestaurant);
router.put('/:id/suspend', ctrl.suspendRestaurant);
module.exports = router;
