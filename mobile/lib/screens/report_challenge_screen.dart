import 'package:flutter/material.dart';
import '../services/api_service.dart';

/// Citizen "Report Challenge" screen — mirrors the web ReportChallenge form
/// (title, description, domain, people affected, district/block/village,
/// existing interventions, image upload placeholder).
class ReportChallengeScreen extends StatefulWidget {
  final ApiService apiService;
  const ReportChallengeScreen({super.key, required this.apiService});

  @override
  State<ReportChallengeScreen> createState() => _ReportChallengeScreenState();
}

class _ReportChallengeScreenState extends State<ReportChallengeScreen> {
  final _formKey = GlobalKey<FormState>();

  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _peopleAffectedController = TextEditingController();
  final _districtController = TextEditingController();
  final _blockController = TextEditingController();
  final _villageController = TextEditingController();
  final _interventionsController = TextEditingController();

  final List<String> _domains = const [
    'Water Management', 'Healthcare', 'Education', 'Agriculture',
    'Energy', 'Environment', 'Infrastructure', 'Other',
  ];
  String? _selectedDomain;

  bool _submitting = false;
  String? _resultCode;
  String? _error;

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _submitting = true;
      _error = null;
    });

    try {
      final result = await widget.apiService.submitChallenge({
        'title': _titleController.text,
        'description': _descriptionController.text,
        'domain': _selectedDomain,
        'peopleAffected': _peopleAffectedController.text.isNotEmpty
            ? int.tryParse(_peopleAffectedController.text)
            : null,
        'district': _districtController.text,
        'block': _blockController.text,
        'village': _villageController.text,
        'existingInterventions': _interventionsController.text,
        'imageUrl': null, // placeholder — image upload not wired in v1
      });

      setState(() {
        _resultCode = result['challenge']['challenge_code'] as String;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to submit challenge. Please try again.';
      });
    } finally {
      setState(() {
        _submitting = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_resultCode != null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Challenge Submitted')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.check_circle, color: Colors.green, size: 64),
                const SizedBox(height: 16),
                const Text('Your challenge code:'),
                const SizedBox(height: 8),
                Text(
                  _resultCode!,
                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () => setState(() => _resultCode = null),
                  child: const Text('Submit Another Challenge'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Report a Challenge')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              TextFormField(
                controller: _titleController,
                decoration: const InputDecoration(labelText: 'Title'),
                validator: (v) => (v == null || v.isEmpty) ? 'Title is required' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _descriptionController,
                decoration: const InputDecoration(labelText: 'Description'),
                maxLines: 4,
                validator: (v) => (v == null || v.isEmpty) ? 'Description is required' : null,
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                initialValue: _selectedDomain,
                decoration: const InputDecoration(labelText: 'Domain'),
                items: _domains
                    .map((d) => DropdownMenuItem(value: d, child: Text(d)))
                    .toList(),
                onChanged: (v) => setState(() => _selectedDomain = v),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _peopleAffectedController,
                decoration: const InputDecoration(labelText: 'People Affected'),
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _districtController,
                decoration: const InputDecoration(labelText: 'District'),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _blockController,
                decoration: const InputDecoration(labelText: 'Block'),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _villageController,
                decoration: const InputDecoration(labelText: 'Village'),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _interventionsController,
                decoration: const InputDecoration(labelText: 'Existing Interventions'),
                maxLines: 2,
              ),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                onPressed: () {
                  // Placeholder for v1 — real image picker wiring comes later.
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Image upload placeholder — not wired yet')),
                  );
                },
                icon: const Icon(Icons.camera_alt_outlined),
                label: const Text('Add Photo (placeholder)'),
              ),
              const SizedBox(height: 20),
              if (_error != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Text(_error!, style: const TextStyle(color: Colors.red)),
                ),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _submitting ? null : _submit,
                  child: Text(_submitting ? 'Submitting…' : 'Submit Challenge'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
