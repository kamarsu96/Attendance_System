const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/DepartmentController');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/', departmentController.getAll);
router.get('/:id', departmentController.getById);
router.post('/', departmentController.create);
router.put('/:id', departmentController.update);
router.delete('/:id', departmentController.delete);

module.exports = router;
