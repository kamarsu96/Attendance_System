const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/AttendanceController');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/checkin', authMiddleware, attendanceController.checkIn);
router.post('/checkout', authMiddleware, attendanceController.checkOut);
router.post('/bulk-checkin', authMiddleware, attendanceController.bulkCheckIn);
router.post('/manual', authMiddleware, attendanceController.manualMarkAttendance);
router.post('/sync-offline', authMiddleware, attendanceController.syncOfflineLogs);
router.get('/', authMiddleware, attendanceController.getDailyReport);

module.exports = router;
