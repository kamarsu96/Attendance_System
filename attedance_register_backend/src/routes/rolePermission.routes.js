const express = require('express');
const router = express.Router();
const rolePermissionController = require('../controllers/RolePermissionController');
const authMiddleware = require('../middlewares/auth.middleware');

// Protect all permissions routes with authMiddleware
router.use(authMiddleware);

router.get('/menus', rolePermissionController.getMenus);
router.get('/:roleId', rolePermissionController.getRolePermissions);
router.post('/:roleId', rolePermissionController.saveRolePermissions);

module.exports = router;
