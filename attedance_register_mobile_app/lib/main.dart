import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'providers/auth_provider.dart';
import 'providers/attendance_provider.dart';
import 'screens/login_screen.dart';
import 'screens/dashboard_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await Firebase.initializeApp();
    debugPrint('Firebase initialized successfully.');
  } catch (e) {
    debugPrint('Firebase Initialization Warning: likely missing google-services.json or GoogleService-Info.plist. Ensure you add them!');
  }

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => AttendanceProvider()),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Smart Attendance',
      theme: ThemeData(
        primarySwatch: Colors.indigo,
        useMaterial3: true,
      ),
      home: Consumer<AuthProvider>(
        builder: (ctx, auth, _) {
          return FutureBuilder(
            future: auth.tryAutoLogin(),
            builder: (ctx, snapshot) => auth.isAuthenticated 
              ? const DashboardScreen() 
              : const LoginScreen(),
          );
        },
      ),
    );
  }
}
