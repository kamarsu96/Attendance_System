const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/EmployeeController');
const authMiddleware = require('../middlewares/auth.middleware');

const { uploadEmployeeMedia } = require('../middlewares/uploadMiddleware');

router.post('/', authMiddleware, uploadEmployeeMedia, employeeController.register);
router.get('/', authMiddleware, employeeController.list);
router.get('/company/:companyId', authMiddleware, employeeController.listByCompany);
router.put('/:id', authMiddleware, uploadEmployeeMedia, employeeController.update);
router.get('/salary/:id', authMiddleware, employeeController.getSalary);
router.get('/:id', authMiddleware, employeeController.get);
router.delete('/:id', authMiddleware, employeeController.delete);

module.exports = router;
