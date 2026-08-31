import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import StatusPill from '../../components/StatusPill';
import Card from '../../components/Card';

export default function UniversityDashboard() {
  const [dash, setDash] = useState(null);

  useEffect(() => {
    apiClient.get('/university/dashboard').then(({ data }) => setDash(data));
  }, []);

  return (
    <div className="max-w-5xl mx-auto mt-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gov-900">{dash?.university?.name || 'University Dashboard'}</h1>
        <Link to="/university/recommended" className="bg-gov-700 hover:bg-gov-900 text-white px-4 py-2 rounded-lg text-sm font-semibold">
          View Recommended Challenges
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card title="Active Projects" value={dash?.activeProjects?.length ?? '—'} />
        <Card title="Students" value={dash?.university?.students_count ?? '—'} />
        <Card title="Faculty Mentors" value={dash?.university?.faculty_count ?? '—'} />
      </div>

      <h2 className="font-semibold text-gov-900 mb-3">Active Projects</h2>
      <div className="space-y-3">
        {dash?.activeProjects?.map((p) => (
          <Link to={`/projects/${p.id}`} key={p.id} className="block bg-white border border-slate-100 shadow-sm rounded-xl p-5 hover:border-gov-600 transition">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gov-900">{p.title}</h3>
                <p className="text-sm text-slate-500 mt-1">Mentor: {p.faculty_mentor || '—'}</p>
              </div>
              <StatusPill status={p.status} />
            </div>
          </Link>
        ))}
        {dash && dash.activeProjects?.length === 0 && (
          <p className="text-slate-400 text-sm">No active projects yet. Adopt a recommended challenge to start one.</p>
        )}
      </div>
    </div>
  );
}
