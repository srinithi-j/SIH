import React from 'react';

const COLOR_MAP = {
  SUBMITTED: 'bg-slate-200 text-slate-700',
  AI_ANALYSIS: 'bg-indigo-100 text-indigo-700',
  PENDING_VALIDATION: 'bg-amber-100 text-amber-700',
  VALIDATED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
  INFO_REQUESTED: 'bg-orange-100 text-orange-700',
  HEI_MATCHED: 'bg-sky-100 text-sky-700',
  ADOPTED: 'bg-teal-100 text-teal-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  DEPLOYED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-200 text-gray-700',
  TEAM_FORMATION: 'bg-slate-200 text-slate-700',
  PROTOTYPE: 'bg-indigo-100 text-indigo-700',
  TESTING: 'bg-amber-100 text-amber-700',
  PILOT: 'bg-sky-100 text-sky-700',
  DEPLOYMENT: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
};

export default function StatusPill({ status }) {
  const classes = COLOR_MAP[status] || 'bg-slate-200 text-slate-700';
  return (
    <span className={`status-pill ${classes}`}>
      {status?.replaceAll('_', ' ')}
    </span>
  );
}
