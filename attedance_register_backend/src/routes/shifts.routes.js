const express = require('express');
const router = express.Router();
const shiftsController = require('../controllers/ShiftsController');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', authMiddleware, shiftsController.getShifts);
router.get('/list', authMiddleware, shiftsController.getShiftList);
router.post('/', authMiddleware, shiftsController.createShift);
router.post('/assign', authMiddleware, shiftsController.assignShift);
router.delete('/assign/:id', authMiddleware, shiftsController.deleteAssignment);

module.exports = router;
