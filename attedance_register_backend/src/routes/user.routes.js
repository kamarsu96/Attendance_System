const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/', userController.getAll);
router.post('/', userController.create);
router.delete('/:id', userController.delete);

module.exports = router;
