const notificationRepository = require('../repositories/NotificationRepository');

class NotificationsController {
    async getNotifications(req, res) {
        try {
            const companyId = req.user?.company_id || 1;
            const dbNotifications = await notificationRepository.getRecentByCompany(companyId);

            let notifications = dbNotifications.map(n => ({
                id: n.id,
                type: n.type || 'system',
                title: n.title,
                description: n.description,
                time: n.created_at,
                unread: true,
                icon: n.title.toLowerCase().includes('late') ? 'schedule' : n.icon,
                color: n.title.toLowerCase().includes('late') ? 'rose' : n.color
            }));

            // Mock data fallback if DB is completely empty for demo purposes
            if (notifications.length === 0) {
                notifications = [
                    { id: 1, type: 'leave', title: 'New Leave Request: John Doe', description: 'John has submitted a request for medical leave.', time: '2 hours ago', unread: true, icon: 'calendar_today', color: 'primary' },
                    { id: 2, type: 'payroll', title: 'Monthly Payroll Processed', description: 'The payroll for September 2023 has been finalized.', time: '5 hours ago', unread: false, icon: 'payments', color: 'emerald' }
                ];
            }

            res.status(200).json({ success: true, data: notifications });
        } catch (error) {
            console.error('getNotifications Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new NotificationsController();
