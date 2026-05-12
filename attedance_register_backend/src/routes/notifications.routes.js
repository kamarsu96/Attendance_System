const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/NotificationsController');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', authMiddleware, notificationsController.getNotifications);

module.exports = router;
