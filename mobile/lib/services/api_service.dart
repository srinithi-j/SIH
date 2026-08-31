import 'dart:convert';
import 'package:http/http.dart' as http;

/// Thin client for the SIH Portal backend REST API.
///
/// Base URL notes for local development:
/// - Android emulator: use http://10.0.2.2:5000/api (maps to host machine)
/// - iOS simulator / desktop: use http://localhost:5000/api
/// - Physical device: use your machine's LAN IP, e.g. http://192.168.x.x:5000/api
class ApiService {
  static const String baseUrl = 'http://10.0.2.2:5000/api';

  String? _token;

  void setToken(String token) => _token = token;

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (_token != null) 'Authorization': 'Bearer $_token',
      };

  Future<Map<String, dynamic>> login(String email, String password) async {
    final res = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    if (res.statusCode != 200) {
      throw Exception('Login failed: ${res.body}');
    }
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    _token = data['token'] as String;
    return data;
  }

  Future<Map<String, dynamic>> submitChallenge(Map<String, dynamic> payload) async {
    final res = await http.post(
      Uri.parse('$baseUrl/challenges'),
      headers: _headers,
      body: jsonEncode(payload),
    );
    if (res.statusCode != 201) {
      throw Exception('Submit failed: ${res.body}');
    }
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  Future<List<dynamic>> myChallenges() async {
    final res = await http.get(Uri.parse('$baseUrl/challenges'), headers: _headers);
    if (res.statusCode != 200) {
      throw Exception('Failed to load challenges: ${res.body}');
    }
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    return data['challenges'] as List<dynamic>;
  }
}
