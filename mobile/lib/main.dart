import 'package:flutter/material.dart';
import 'services/api_service.dart';
import 'screens/login_screen.dart';

void main() {
  runApp(const SihPortalApp());
}

class SihPortalApp extends StatelessWidget {
  const SihPortalApp({super.key});

  @override
  Widget build(BuildContext context) {
    final apiService = ApiService();

    return MaterialApp(
      title: 'SIH Portal — Citizen',
      theme: ThemeData(
        colorSchemeSeed: const Color(0xFF123863),
        useMaterial3: true,
      ),
      home: LoginScreen(apiService: apiService),
    );
  }
}
