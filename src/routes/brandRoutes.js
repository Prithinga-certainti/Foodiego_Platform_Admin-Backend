const router = require('express').Router();
const ctrl = require('../controllers/brandController');
const auth = require('../middlewares/authMiddleware');

router.use(auth);
router.get('/', ctrl.getAllBrands);
router.get('/pending', ctrl.getPendingBrands);
router.post('/', ctrl.createBrandHandler);
router.put('/:id/approve', ctrl.approveBrand);
router.put('/:id/reject', ctrl.rejectBrand);
router.put('/:id/suspend', ctrl.suspendBrand);
router.put('/:id/reactivate', ctrl.reactivateBrand);
module.exports = router;
