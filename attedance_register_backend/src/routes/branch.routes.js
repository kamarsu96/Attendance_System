const express = require('express');
const router = express.Router();
const branchController = require('../controllers/BranchController');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', authMiddleware, branchController.getAll);
router.post('/', authMiddleware, branchController.create);
router.delete('/:id', authMiddleware, branchController.delete);

module.exports = router;
