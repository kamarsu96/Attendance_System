const rolePermissionRepository = require('../repositories/RolePermissionRepository');

class RolePermissionController {
    async getRolePermissions(req, res) {
        try {
            const role_id = req.params.roleId;
            const permissions = await rolePermissionRepository.getByRole(role_id);
            res.status(200).json({ success: true, data: permissions });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async saveRolePermissions(req, res) {
        try {
            const role_id = req.params.roleId;
            const { screen_name, can_view, can_create, can_update, can_delete } = req.body;
            
            if (!screen_name) {
                return res.status(400).json({ success: false, message: 'Screen name is required' });
            }

            await rolePermissionRepository.savePermission(
                role_id,
                screen_name,
                can_view ?? true,
                can_create ?? true,
                can_update ?? true,
                can_delete ?? true
            );

            res.status(200).json({ success: true, message: 'Permissions saved successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getMenus(req, res) {
        try {
            const role_id = req.user?.role_id || 1;
            const perms = await rolePermissionRepository.getByRole(role_id);
            const canView = (screen) => {
                const p = perms.find(x => x.screen_name === screen);
                // If role is Admin (1), always allow. Otherwise, check DB or default to true if not setup
                if (role_id == 1) return true;
                return p ? !!p.can_view : true; 
            };

            const allMenus = [
                { path: '/', title: 'Employee Dashboard', icon: 'dashboard', screen: 'Dashboard' },
                { path: '/employees', title: 'Employee Database', icon: 'badge', screen: 'Employees' },
                { path: '/attendance', title: 'Attendance Tracker', icon: 'calendar_today', screen: 'Attendance' },
                { path: '/leaves', title: 'Leave Tracker', icon: 'event_busy', screen: 'Leaves' },
                { path: '/shifts', title: 'Shift Scheduling', icon: 'schedule', screen: 'Shifts' },
                { path: '/payroll', title: 'Monthly Payroll', icon: 'payments', screen: 'Payroll' },
                { path: '/timesheets', title: 'Timesheets', icon: 'alarm', screen: 'Timesheets' },
                { path: '/performance', title: 'Performance Management', icon: 'trending_up', screen: 'Performance' },
                { path: '/learning', title: 'Learning Management', icon: 'school', screen: 'Learning' },
                { path: '/cases', title: 'Case Management', icon: 'assignment_turned_in', screen: 'Cases' },
                { path: '/reports', title: 'Reports & Analytics', icon: 'analytics', screen: 'Reports' },
                { path: '/settings', title: 'Settings', icon: 'settings', screen: 'Settings' },
                { path: '/profile', title: 'Profile', icon: 'account_circle', screen: 'Profile' }
            ];

            let allowedMenus = allMenus.filter(m => canView(m.screen));
            res.status(200).json({ success: true, data: allowedMenus });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new RolePermissionController();
