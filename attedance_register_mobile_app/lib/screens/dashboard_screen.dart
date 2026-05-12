import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/attendance_provider.dart';
import 'leaves_screen.dart';
import 'payslips_screen.dart';
import 'history_screen.dart';
import 'profile_screen.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final user = auth.user;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        backgroundColor: Colors.indigo,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => auth.logout(),
          )
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // User Profile Card
            Card(
              elevation: 4,
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: Colors.indigo,
                  child: Text(user?['username']?[0].toUpperCase() ?? 'U', style: const TextStyle(color: Colors.white)),
                ),
                title: Text('Welcome, ${user?['username'] ?? 'User'}', style: const TextStyle(fontWeight: FontWeight.bold)),
                subtitle: Text('Role: ${user?['role'] ?? 'Employee'}'),
              ),
            ),
            const SizedBox(height: 24),
            
            // Attendance Section
            const Text('Daily Attendance', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _AttendanceCard(
                    title: 'Check-In',
                    icon: Icons.login,
                    color: Colors.green,
                    onTap: () async {
                      final error = await Provider.of<AttendanceProvider>(context, listen: false).checkIn(user?['id'], 1); // Mock branch 1
                      if (error != null && context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error)));
                      }
                    },
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _AttendanceCard(
                    title: 'Check-Out',
                    icon: Icons.logout,
                    color: Colors.red,
                    onTap: () async {
                      final error = await Provider.of<AttendanceProvider>(context, listen: false).checkOut(user?['id']);
                      if (error != null && context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error)));
                      }
                    },
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 24),
            // Quick Links
            const Align(
              alignment: Alignment.centerLeft,
              child: Text('Quick Actions', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            ),
            const SizedBox(height: 12),
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              mainAxisSpacing: 10,
              crossAxisSpacing: 10,
              children: [
                _ActionTile(
                  title: 'Leave Request',
                  icon: Icons.calendar_today,
                  color: Colors.blue,
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const LeavesScreen())),
                ),
                _ActionTile(
                  title: 'Payslips',
                  icon: Icons.payments,
                  color: Colors.orange,
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PayslipsScreen())),
                ),
                _ActionTile(
                  title: 'History',
                  icon: Icons.history,
                  color: Colors.purple,
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const HistoryScreen())),
                ),
                _ActionTile(
                  title: 'Profile',
                  icon: Icons.person,
                  color: Colors.teal,
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ProfileScreen())),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _AttendanceCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  const _AttendanceCard({required this.title, required this.icon, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Card(
        color: color.withOpacity(0.1),
        shape: RoundedRectangleBorder(side: BorderSide(color: color), borderRadius: BorderRadius.circular(12)),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 24),
          child: Column(
            children: [
              Icon(icon, color: color, size: 32),
              const SizedBox(height: 8),
              Text(title, style: TextStyle(color: color, fontWeight: FontWeight.bold)),
            ],
          ),
        ),
      ),
    );
  }
}

class _ActionTile extends StatelessWidget {
  final String title;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  const _ActionTile({required this.title, required this.icon, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Card(
        elevation: 2,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 30),
            const SizedBox(height: 8),
            Text(title, style: const TextStyle(fontWeight: FontWeight.w500)),
          ],
        ),
      ),
    );
  }
}
