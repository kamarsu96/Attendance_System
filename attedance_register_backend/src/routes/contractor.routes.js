const express = require('express');
const router = express.Router();
const contractorController = require('../controllers/ContractorController');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', authMiddleware, contractorController.getAllContractors);
router.get('/:id', authMiddleware, contractorController.getContractor);
router.post('/', authMiddleware, contractorController.createContractor);
router.put('/:id', authMiddleware, contractorController.updateContractor);
router.delete('/:id', authMiddleware, contractorController.deleteContractor);
router.get('/:id/attendance', authMiddleware, contractorController.getAttendanceReport);

module.exports = router;
