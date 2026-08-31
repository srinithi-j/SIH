import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import Card from '../../components/Card';

export default function GovernmentDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    apiClient.get('/analytics/government').then(({ data }) => setStats(data));
  }, []);

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4">
      <h1 className="text-xl font-bold text-gov-900 mb-6">Government Command Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card title="Total Challenges" value={stats?.totalChallenges ?? '—'} />
        <Card title="Pending Validation" value={stats?.pendingValidation ?? '—'} />
        <Card title="High Priority" value={stats?.highPriority ?? '—'} />
        <Card title="Active Projects" value={stats?.activeProjects ?? '—'} />
        <Card title="Deployed Solutions" value={stats?.deployedSolutions ?? '—'} />
      </div>

      <div className="mt-8 flex gap-4">
        <Link to="/government/review" className="bg-gov-700 hover:bg-gov-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold">
          Review Challenges
        </Link>
        <Link to="/government/analytics" className="border border-gov-700 text-gov-700 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-gov-50">
          Full Analytics
        </Link>
      </div>
    </div>
  );
}
