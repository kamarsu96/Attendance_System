const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/PayrollController');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/salary-structure', authMiddleware, payrollController.updateSalaryStructure);
router.post('/run', authMiddleware, payrollController.runPayroll);
router.get('/payslip/:id', authMiddleware, payrollController.getPayslip);
router.get('/download-pdf/:id', authMiddleware, payrollController.downloadPayslip);
router.get('/', authMiddleware, payrollController.getPayrollRecords);

module.exports = router;
