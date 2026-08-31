import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './routes/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import ChallengeDetail from './pages/ChallengeDetail';
import ProjectDetail from './pages/ProjectDetail';

import CitizenDashboard from './pages/citizen/CitizenDashboard';
import ReportChallenge from './pages/citizen/ReportChallenge';

import GovernmentDashboard from './pages/government/GovernmentDashboard';
import ChallengeReview from './pages/government/ChallengeReview';
import Analytics from './pages/government/Analytics';

import UniversityDashboard from './pages/university/UniversityDashboard';
import RecommendedChallenges from './pages/university/RecommendedChallenges';

import IndustryDashboard from './pages/industry/IndustryDashboard';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-16">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          <Route path="/citizen" element={<ProtectedRoute role="CITIZEN"><CitizenDashboard /></ProtectedRoute>} />
          <Route path="/citizen/report" element={<ProtectedRoute role="CITIZEN"><ReportChallenge /></ProtectedRoute>} />

          <Route path="/government" element={<ProtectedRoute role="GOVERNMENT"><GovernmentDashboard /></ProtectedRoute>} />
          <Route path="/government/review" element={<ProtectedRoute role="GOVERNMENT"><ChallengeReview /></ProtectedRoute>} />
          <Route path="/government/analytics" element={<ProtectedRoute role="GOVERNMENT"><Analytics /></ProtectedRoute>} />

          <Route path="/university" element={<ProtectedRoute role="UNIVERSITY"><UniversityDashboard /></ProtectedRoute>} />
          <Route path="/university/recommended" element={<ProtectedRoute role="UNIVERSITY"><RecommendedChallenges /></ProtectedRoute>} />

          <Route path="/industry" element={<ProtectedRoute role="INDUSTRY"><IndustryDashboard /></ProtectedRoute>} />

          {/* Shared detail pages, reachable by any authenticated role */}
          <Route path="/challenges/:id" element={<ProtectedRoute><ChallengeDetail /></ProtectedRoute>} />
          <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}
