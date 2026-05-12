import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import '../services/api_service.dart';

class AttendanceProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  bool _isLoading = false;
  Map<String, dynamic>? _todayRecord;

  bool get isLoading => _isLoading;
  Map<String, dynamic>? get todayRecord => _todayRecord;

  Future<Position> _determinePosition() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) return Future.error('Location services are disabled.');

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) return Future.error('Location permissions are denied');
    }
    
    return await Geolocator.getCurrentPosition();
  }

  Future<String?> checkIn(int employeeId, int branchId) async {
    _isLoading = true;
    notifyListeners();

    try {
      final pos = await _determinePosition();
      final response = await _apiService.post('/attendance/checkin', {
        'employee_id': employeeId,
        'branch_id': branchId,
        'lat': pos.latitude,
        'lng': pos.longitude,
        'location': 'Captured via GPS',
      });

      _isLoading = false;
      notifyListeners();

      if (response.statusCode == 201) return null; // Success
      return 'Check-in failed';
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return e.toString();
    }
  }

  Future<String?> checkOut(int employeeId) async {
    _isLoading = true;
    notifyListeners();

    try {
      final pos = await _determinePosition();
      final response = await _apiService.post('/attendance/checkout', {
        'employee_id': employeeId,
        'lat': pos.latitude,
        'lng': pos.longitude,
        'location': 'Captured via GPS',
      });

      _isLoading = false;
      notifyListeners();

      if (response.statusCode == 200) return null;
      return 'Check-out failed';
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return e.toString();
    }
  }
}
