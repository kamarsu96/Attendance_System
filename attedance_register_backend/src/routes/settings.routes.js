const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/SettingsController');
const authMiddleware = require('../middlewares/auth.middleware');

router.route('/')
    .get(authMiddleware, settingsController.getSettings)
    .post(authMiddleware, settingsController.updateSettings);

router.route('')
    .get(authMiddleware, settingsController.getSettings)
    .post(authMiddleware, settingsController.updateSettings);

module.exports = router;
