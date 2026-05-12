const express = require('express');
const router = express.Router();
const reportController = require('../controllers/ReportController');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', authMiddleware, reportController.getReportsData);

module.exports = router;
