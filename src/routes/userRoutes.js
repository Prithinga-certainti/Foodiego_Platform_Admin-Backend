const router = require('express').Router();
const ctrl = require('../controllers/userController');
const auth = require('../middlewares/authMiddleware');

router.use(auth);
router.get('/', ctrl.getAllUsers);
router.get('/:id', ctrl.getUserById);
router.post('/', ctrl.createUserHandler);
router.put('/:id/block', ctrl.blockUser);
router.put('/:id/unblock', ctrl.unblockUser);
router.put('/:id/reset-password', ctrl.resetPassword);
router.delete('/:id', ctrl.deleteUser);
module.exports = router;
