import React from 'react';
import { Link } from 'react-router-dom';

const DOMAINS = [
  {
    id: 'citizen',
    title: 'Citizen',
    description: 'Report real, on-ground societal challenges from your community',
    icon: '👥',
    color: 'from-blue-500 to-blue-600',
    hoverColor: 'hover:from-blue-600 hover:to-blue-700'
  },
  {
    id: 'government',
    title: 'Government',
    description: 'Validate challenges, track priorities and measure impact at scale',
    icon: '🏛️',
    color: 'from-purple-500 to-purple-600',
    hoverColor: 'hover:from-purple-600 hover:to-purple-700'
  },
  {
    id: 'university',
    title: 'University',
    description: 'Discover matched challenges and turn them into research projects',
    icon: '🎓',
    color: 'from-green-500 to-green-600',
    hoverColor: 'hover:from-green-600 hover:to-green-700'
  },
  {
    id: 'industry',
    title: 'Industry',
    description: 'Offer mentorship, resources and funding to promising projects',
    icon: '🏭',
    color: 'from-orange-500 to-orange-600',
    hoverColor: 'hover:from-orange-600 hover:to-orange-700'
  }
];

export default function DomainSelection() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Choose Your Domain</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Select your role to get started with the platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {DOMAINS.map((domain) => (
            <Link
              key={domain.id}
              to={`/signup/${domain.id}`}
              className={`group relative bg-gradient-to-br ${domain.color} ${domain.hoverColor} rounded-2xl p-8 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
            >
              <div className="flex items-start gap-4">
                <div className="text-5xl">{domain.icon}</div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{domain.title}</h2>
                  <p className="text-white/90">{domain.description}</p>
                </div>
              </div>
              <div className="mt-6 flex items-center text-white/80 group-hover:text-white transition-colors">
                <span className="font-medium">Get Started</span>
                <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="text-gov-700 hover:text-gov-900 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
