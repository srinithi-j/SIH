import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import StatusPill from '../../components/StatusPill';

export default function IndustryDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/industry/projects').then(({ data }) => setProjects(data.projects)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4">
      <h1 className="text-xl font-bold text-gov-900 mb-6">Projects Seeking Support</h1>

      {loading && <p className="text-slate-400 text-sm">Loading…</p>}
      {!loading && projects.length === 0 && (
        <div className="bg-white border border-slate-100 rounded-xl p-8 text-center text-slate-500">
          No projects are currently seeking support.
        </div>
      )}

      <div className="space-y-4">
        {projects.map((p) => (
          <Link to={`/projects/${p.id}`} key={p.id} className="block bg-white border border-slate-100 shadow-sm rounded-xl p-5 hover:border-gov-600 transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-400">{p.domain}</p>
                <h3 className="font-semibold text-gov-900 mt-1">{p.title}</h3>
                <p className="text-sm text-slate-500 mt-1">Challenge: {p.challenge_title}</p>
              </div>
              <StatusPill status={p.status} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
