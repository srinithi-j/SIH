import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';

const DOMAINS = ['Water Management', 'Healthcare', 'Education', 'Agriculture', 'Energy', 'Environment', 'Infrastructure', 'Public Safety', 'Sanitation', 'Digital Access', 'Transport', 'Other'];

export default function ReportChallenge() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', peopleAffected: '',
    district: '', block: '', village: '', existingInterventions: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('peopleAffected', form.peopleAffected || '');
      formData.append('district', form.district || '');
      formData.append('block', form.block || '');
      formData.append('village', form.village || '');
      formData.append('existingInterventions', form.existingInterventions || '');
      if (imageFile) {
        formData.append('file', imageFile);
      }
      
      const { data } = await apiClient.post('/challenges', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit challenge');
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="max-w-2xl mx-auto mt-10 bg-white border border-slate-100 shadow-sm rounded-xl p-8 text-center">
        <div className="text-emerald-600 text-4xl mb-3">✓</div>
        <h1 className="text-xl font-bold text-gov-900">Challenge Submitted</h1>
        <p className="text-slate-500 mt-2">Your challenge code:</p>
        <p className="text-2xl font-mono font-bold text-gov-700 mt-1">{result.challenge.challenge_code}</p>
        <div className="mt-4 text-left bg-slate-50 rounded-lg p-4 text-sm">
          <p className="font-semibold text-slate-700 mb-2">AI Analysis (preliminary)</p>
          <p>Domain: <span className="font-medium">{result.aiAnalysis.domain}</span></p>
          <p>Priority: <span className="font-medium">{result.aiAnalysis.priority}</span></p>
          <p>Severity Score: <span className="font-medium">{result.aiAnalysis.severity_score}</span></p>
          <p>Impact Score: <span className="font-medium">{result.aiAnalysis.impact_score}</span></p>
        </div>
        <div className="flex gap-3 justify-center mt-6">
          <button onClick={() => navigate('/citizen')} className="bg-gov-700 hover:bg-gov-900 text-white px-5 py-2 rounded-lg">
            View My Challenges
          </button>
          <button onClick={() => { setResult(null); setForm({ title: '', description: '', peopleAffected: '', district: '', block: '', village: '', existingInterventions: '' }); }} className="border border-slate-200 px-5 py-2 rounded-lg">
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-white border border-slate-100 shadow-sm rounded-xl p-8">
      <h1 className="text-xl font-bold text-gov-900">Report a Challenge</h1>
      <p className="text-sm text-slate-500 mt-1">Describe the problem in your community — AI will analyze it and government will review.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Title</label>
          <input required value={form.title} onChange={(e) => update('title', e.target.value)}
            placeholder="e.g. Unsafe drinking water in rural schools"
            className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gov-600" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Description</label>
          <textarea required rows={4} value={form.description} onChange={(e) => update('description', e.target.value)}
            className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gov-600" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">People Affected</label>
          <input type="number" min="0" value={form.peopleAffected} onChange={(e) => update('peopleAffected', e.target.value)}
            className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700">District</label>
            <input value={form.district} onChange={(e) => update('district', e.target.value)}
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Block</label>
            <input value={form.block} onChange={(e) => update('block', e.target.value)}
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Village</label>
            <input value={form.village} onChange={(e) => update('village', e.target.value)}
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Existing Interventions</label>
          <textarea rows={2} value={form.existingInterventions} onChange={(e) => update('existingInterventions', e.target.value)}
            className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Supporting Document/Image</label>
          <input 
            type="file" 
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
            className="mt-1 w-full text-sm"
          />
          <p className="text-xs text-slate-400 mt-1">Accepted formats: JPG, PNG, PDF, DOC, DOCX (Max 5MB)</p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={submitting}
          className="w-full bg-gov-700 hover:bg-gov-900 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-60">
          {submitting ? 'Submitting…' : 'Submit Challenge'}
        </button>
      </form>
    </div>
  );
}
