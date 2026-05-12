const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/', authMiddleware, leaveController.apply);
router.get('/:employeeId', authMiddleware, leaveController.listByEmployee);
router.put('/:id/approve', authMiddleware, leaveController.approve);

module.exports = router;
