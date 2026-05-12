const express = require('express');
const router = express.Router();
const roleController = require('../controllers/RoleController');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/', roleController.getAll);
router.post('/', roleController.create);
router.put('/:id', roleController.update);
router.delete('/:id', roleController.delete);

module.exports = router;
