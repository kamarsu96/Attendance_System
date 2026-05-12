import 'package:flutter/material.dart';

class PayslipsScreen extends StatelessWidget {
  const PayslipsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Payslips'),
        backgroundColor: Colors.indigo,
        foregroundColor: Colors.white,
      ),
      body: const Center(
        child: Text('Payslips functionality coming soon.'),
      ),
    );
  }
}
