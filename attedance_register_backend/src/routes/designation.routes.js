const express = require('express');
const router = express.Router();
const designationController = require('../controllers/DesignationController');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/', designationController.getAll);
router.get('/:id', designationController.getById);
router.post('/', designationController.create);
router.put('/:id', designationController.update);
router.delete('/:id', designationController.delete);

module.exports = router;
