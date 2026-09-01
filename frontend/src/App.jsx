import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './routes/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import DomainSelection from './pages/DomainSelection';
import Signup from './pages/Signup';
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

const PUBLIC_ROUTES = ['/', '/login', '/select-domain', '/signup'];

export default function App() {
  const { user } = useAuth();
  const location = useLocation();
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    location.pathname === route || location.pathname.startsWith('/signup/')
  );

  return (
    <div className="min-h-screen flex flex-col">
      {!isPublicRoute && <Navbar />}
      <main className="flex-1 pb-16">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/select-domain" element={<DomainSelection />} />
          <Route path="/signup/:domain" element={<Signup />} />

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
