const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');

const authMiddleware = require('../middlewares/auth.middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.me);
router.put('/profile/update', authMiddleware, authController.updateProfile);
router.post('/reset-password', authMiddleware, authController.resetPassword);

module.exports = router;
