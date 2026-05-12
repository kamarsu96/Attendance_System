import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  String? _token;
  Map<String, dynamic>? _user;

  bool get isAuthenticated => _token != null;
  Map<String, dynamic>? get user => _user;

  Future<bool> login(String username, String password) async {
    try {
      final response = await _apiService.post('/auth/login', {
        'username': username,
        'password': password,
      });

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _token = data['token'];
        _user = data['user'];

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', _token!);
        await prefs.setString('user_data', jsonEncode(_user));

        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  Future<void> logout() async {
    _token = null;
    _user = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('user_data');
    notifyListeners();
  }

  Future<void> tryAutoLogin() async {
    final prefs = await SharedPreferences.getInstance();
    if (!prefs.containsKey('auth_token')) return;

    _token = prefs.getString('auth_token');
    _user = jsonDecode(prefs.getString('user_data')!);
    notifyListeners();
  }
}
