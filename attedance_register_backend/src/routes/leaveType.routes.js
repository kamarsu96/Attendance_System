const express = require('express');
const router = express.Router();
const leaveTypeController = require('../controllers/LeaveTypeController');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/', leaveTypeController.getAll);
router.get('/:id', leaveTypeController.getById);
router.post('/', leaveTypeController.create);
router.put('/:id', leaveTypeController.update);
router.delete('/:id', leaveTypeController.delete);

module.exports = router;
