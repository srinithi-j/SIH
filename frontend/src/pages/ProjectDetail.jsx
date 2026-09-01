import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../api/client';
import StatusPill from '../components/StatusPill';
import { useAuth } from '../context/AuthContext';

const STAGE_ORDER = ['TEAM_FORMATION', 'PROTOTYPE', 'TESTING', 'PILOT', 'DEPLOYMENT', 'COMPLETED'];

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    const { data } = await apiClient.get(`/projects/${id}`);
    setData(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function advanceStatus() {
    const currentIndex = STAGE_ORDER.indexOf(data.project.status);
    const next = STAGE_ORDER[currentIndex + 1];
    if (!next) return;

    // Validation: Check if faculty mentor and team members are assigned
    if (!data.project.faculty_mentor) {
      setError('Please assign a faculty mentor before advancing to the next stage.');
      return;
    }
    if (!data.members || data.members.length === 0) {
      setError('Please add team members before advancing to the next stage.');
      return;
    }

    setError('');
    setUpdating(true);
    try {
      await apiClient.patch(`/projects/${id}/status`, { status: next });
      await load();
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <p className="text-center mt-10 text-slate-400">Loading…</p>;
  if (!data) return <p className="text-center mt-10 text-slate-400">Project not found.</p>;

  const { project, members, milestones, impact, lifecycleStages } = data;
  const currentIndex = STAGE_ORDER.indexOf(project.status);

  return (
    <div className="max-w-3xl mx-auto mt-8 px-4 space-y-6">
      <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-400">{project.challenge_code} · {project.university_name}</p>
            <h1 className="text-xl font-bold text-gov-900 mt-1">{project.title}</h1>
          </div>
          <StatusPill status={project.status} />
        </div>
        <p className="text-slate-600 mt-4">{project.objectives || 'No objectives set yet.'}</p>
        <p className="text-sm text-slate-500 mt-2">Faculty Mentor: {project.faculty_mentor || '—'}</p>

        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

        {(user?.role === 'UNIVERSITY' || user?.role === 'GOVERNMENT') && currentIndex < STAGE_ORDER.length - 1 && (
          <button onClick={advanceStatus} disabled={updating}
            className="mt-4 bg-gov-700 hover:bg-gov-900 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60">
            {updating ? 'Updating…' : `Advance to ${STAGE_ORDER[currentIndex + 1]?.replaceAll('_', ' ')}`}
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-6">
        <h2 className="font-semibold text-gov-900 mb-4">Project Lifecycle</h2>
        <div className="flex flex-wrap gap-2">
          {lifecycleStages.map((stage, i) => (
            <span key={stage} className={`status-pill ${i <= currentIndex + 6 ? 'bg-gov-100 text-gov-700' : 'bg-slate-100 text-slate-400'}`}>
              {stage}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-6">
        <h2 className="font-semibold text-gov-900 mb-3">Team</h2>
        <div className="grid grid-cols-2 gap-3">
          {members.map((m) => (
            <div key={m.id} className="border border-slate-100 rounded-lg p-3">
              <p className="font-medium text-gov-900">{m.name}</p>
              <p className="text-xs text-slate-500">{m.role}</p>
            </div>
          ))}
          {members.length === 0 && <p className="text-slate-400 text-sm">No team members added yet.</p>}
        </div>
      </div>

      <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-6">
        <h2 className="font-semibold text-gov-900 mb-3">Milestones</h2>
        <div className="space-y-2">
          {milestones.map((m) => (
            <div key={m.id} className="flex items-center justify-between border border-slate-100 rounded-lg p-3">
              <div>
                <p className="font-medium text-gov-900">{m.title}</p>
                <p className="text-xs text-slate-500">{m.stage} · Due {m.due_date}</p>
              </div>
              <StatusPill status={m.status} />
            </div>
          ))}
          {milestones.length === 0 && <p className="text-slate-400 text-sm">No milestones yet.</p>}
        </div>
      </div>

      {impact && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6">
          <h2 className="font-semibold text-emerald-900 mb-4">Measurable Social Impact</h2>
          <p className="text-xs text-emerald-700 mb-3">Distinct from "Project Completed" — this reflects real-world outcomes after deployment.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            <div><p className="text-2xl font-bold text-emerald-800">{impact.beneficiaries?.toLocaleString?.() ?? impact.beneficiaries}+</p><p className="text-xs text-emerald-700">Beneficiaries</p></div>
            <div><p className="text-2xl font-bold text-emerald-800">{impact.schools_reached}</p><p className="text-xs text-emerald-700">Schools Reached</p></div>
            <div><p className="text-2xl font-bold text-emerald-800">{impact.unsafe_usage_reduction_pct}%</p><p className="text-xs text-emerald-700">Reduction in Unsafe Usage</p></div>
            <div><p className="text-2xl font-bold text-emerald-800">₹{impact.estimated_annual_savings}</p><p className="text-xs text-emerald-700">Est. Annual Savings</p></div>
            <div><p className="text-2xl font-bold text-emerald-800">{impact.community_satisfaction_pct}%</p><p className="text-xs text-emerald-700">Community Satisfaction</p></div>
          </div>
        </div>
      )}

      {user?.role === 'INDUSTRY' && (
        <IndustryActions projectId={id} onDone={load} />
      )}
    </div>
  );
}

function IndustryActions({ projectId, onDone }) {
  const [loading, setLoading] = useState(false);

  async function act(interestType) {
    setLoading(true);
    try {
      await apiClient.post(`/industry/projects/${projectId}/interest`, { interestType });
      await onDone();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-6">
      <h2 className="font-semibold text-gov-900 mb-3">Support This Project</h2>
      <div className="flex flex-wrap gap-3">
        <button disabled={loading} onClick={() => act('EXPRESS_INTEREST')} className="bg-gov-700 hover:bg-gov-900 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60">Express Interest</button>
        <button disabled={loading} onClick={() => act('MENTORSHIP')} className="border border-gov-700 text-gov-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gov-50 disabled:opacity-60">Offer Mentorship</button>
        <button disabled={loading} onClick={() => act('RESOURCES')} className="border border-gov-700 text-gov-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gov-50 disabled:opacity-60">Provide Resources</button>
      </div>
    </div>
  );
}
