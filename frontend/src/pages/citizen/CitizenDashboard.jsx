import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import StatusPill from '../../components/StatusPill';

export default function CitizenDashboard() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/challenges').then(({ data }) => setChallenges(data.challenges)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gov-900">My Submitted Challenges</h1>
        <Link to="/citizen/report" className="bg-gov-700 hover:bg-gov-900 text-white px-4 py-2 rounded-lg text-sm font-semibold">
          + Report New Challenge
        </Link>
      </div>

      {loading && <p className="text-slate-400 text-sm">Loading…</p>}

      {!loading && challenges.length === 0 && (
        <div className="bg-white border border-slate-100 rounded-xl p-8 text-center text-slate-500">
          You haven't reported any challenges yet.
        </div>
      )}

      <div className="space-y-4">
        {challenges.map((c) => (
          <Link to={`/challenges/${c.id}`} key={c.id} className="block bg-white border border-slate-100 shadow-sm rounded-xl p-5 hover:border-gov-600 transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-400 font-mono">{c.challenge_code}</p>
                <h3 className="font-semibold text-gov-900 mt-1">{c.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{c.district}{c.block ? `, ${c.block}` : ''}</p>
              </div>
              <StatusPill status={c.status} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
