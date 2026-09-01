import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import StatusPill from '../../components/StatusPill';

export default function ChallengeReview() {
  const [challenges, setChallenges] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = statusFilter ? { status: statusFilter } : {};
    apiClient.get('/challenges', { params }).then(({ data }) => setChallenges(data.challenges)).finally(() => setLoading(false));
  }, [statusFilter]);

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gov-900">Challenge Review</h1>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm">
          <option value="PENDING_VALIDATION">Pending Validation</option>
          <option value="VALIDATED">Validated</option>
          <option value="HEI_MATCHED">HEI Matched</option>
          <option value="REJECTED">Rejected</option>
          <option value="">All</option>
        </select>
      </div>

      {loading && <p className="text-slate-400 text-sm">Loading…</p>}
      {!loading && challenges.length === 0 && (
        <div className="bg-white border border-slate-100 rounded-xl p-8 text-center text-slate-500">
          No challenges in this status.
        </div>
      )}

      <div className="space-y-4">
        {challenges.map((c) => (
          <Link to={`/challenges/${c.id}`} key={c.id} className="block bg-white border border-slate-100 shadow-sm rounded-xl p-5 hover:border-gov-600 transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-400 font-mono">{c.challenge_code}</p>
                <h3 className="font-semibold text-gov-900 mt-1">{c.title}</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {c.domain} {c.priority ? `· Priority: ${c.priority}` : ''}
                </p>
              </div>
              <StatusPill status={c.status} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
