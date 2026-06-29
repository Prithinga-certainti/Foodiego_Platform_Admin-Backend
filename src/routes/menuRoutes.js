const router = require('express').Router();
const ctrl = require('../controllers/menuController');
const auth = require('../middlewares/authMiddleware');

router.use(auth);
router.get('/stats', ctrl.getStats);
router.get('/', ctrl.getRequests);
router.get('/:id/items', ctrl.getItems);
router.post('/', ctrl.submitRequest);
router.put('/:id/bulk-approve', ctrl.bulkApprove);
router.put('/:id/bulk-reject', ctrl.bulkReject);
router.put('/items/:itemId/approve', ctrl.approveItem);
router.put('/items/:itemId/reject', ctrl.rejectItem);

module.exports = router;
