import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';

export default function RecommendedChallenges() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    apiClient.get('/university/recommended').then(({ data }) => setChallenges(data.challenges)).finally(() => setLoading(false));
  }, []);

  async function handleAdoptAndCreate(challenge) {
    await apiClient.post(`/university/challenges/${challenge.id}/adopt`);
    const { data } = await apiClient.post('/university/projects', {
      challengeId: challenge.id,
      title: `Solution for: ${challenge.title}`,
      facultyMentor: '',
      objectives: '',
      teamMembers: [],
    });
    navigate(`/projects/${data.project.id}`);
  }

  if (loading) return <p className="text-center mt-10 text-slate-400">Loading…</p>;

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4">
      <h1 className="text-xl font-bold text-gov-900 mb-6">Recommended Challenges</h1>

      {challenges.length === 0 && (
        <div className="bg-white border border-slate-100 rounded-xl p-8 text-center text-slate-500">
          No matched challenges yet. Government-validated challenges are matched to universities automatically.
        </div>
      )}

      <div className="space-y-4">
        {challenges.map((c) => (
          <div key={c.id} className="bg-white border border-slate-100 shadow-sm rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-400 font-mono">{c.challenge_code}</p>
                <h3 className="font-semibold text-gov-900 mt-1">{c.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{c.description?.slice(0, 140)}…</p>
              </div>
              <span className="text-sm font-bold text-emerald-600 whitespace-nowrap ml-4">{c.match_score}% Match</span>
            </div>
            <ul className="text-sm text-slate-500 mt-2 list-disc list-inside">
              {(c.reasons || []).map((r, i) => <li key={i}>{r}</li>)}
            </ul>
            {c.status !== 'ADOPTED' && c.status !== 'IN_PROGRESS' ? (
              <button onClick={() => handleAdoptAndCreate(c)}
                className="mt-4 bg-gov-700 hover:bg-gov-900 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                Adopt &amp; Create Project
              </button>
            ) : (
              <p className="mt-4 text-sm text-emerald-600 font-semibold">Already adopted</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
