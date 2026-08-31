import React, { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import Card from '../../components/Card';

export default function Analytics() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    apiClient.get('/analytics/government').then(({ data }) => setStats(data));
  }, []);

  if (!stats) return <p className="text-center mt-10 text-slate-400">Loading…</p>;

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4">
      <h1 className="text-xl font-bold text-gov-900 mb-6">National Innovation Analytics</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Total Challenges" value={stats.totalChallenges} />
        <Card title="Validated Challenges" value={stats.validatedChallenges} />
        <Card title="Active Projects" value={stats.activeProjects} />
        <Card title="Completed Projects" value={stats.completedProjects} />
        <Card title="Prototypes" value={stats.prototypes} />
        <Card title="Deployed Solutions" value={stats.deployedSolutions} />
        <Card title="Participating HEIs" value={stats.participatingHEIs} />
        <Card title="Students Engaged" value={stats.students} />
        <Card title="Faculty Mentors" value={stats.faculty} />
        <Card title="Industry Partners" value={stats.industryPartners} />
        <Card title="Total Beneficiaries" value={stats.beneficiaries?.toLocaleString?.() ?? stats.beneficiaries} />
      </div>
    </div>
  );
}
