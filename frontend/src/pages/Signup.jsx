import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';

const DOMAIN_CONFIG = {
  citizen: {
    title: 'Citizen Registration',
    description: 'Join as a citizen to report societal challenges in your community',
    icon: '👥',
    color: 'blue'
  },
  government: {
    title: 'Government Registration',
    description: 'Register as a government official to validate and track challenges',
    icon: '🏛️',
    color: 'purple'
  },
  university: {
    title: 'University Registration',
    description: 'Register as a university to discover and work on challenges',
    icon: '🎓',
    color: 'green'
  },
  industry: {
    title: 'Industry Registration',
    description: 'Register as an industry partner to mentor and fund projects',
    icon: '🏭',
    color: 'orange'
  }
};

const COLOR_CLASSES = {
  blue: 'from-blue-500 to-blue-600',
  purple: 'from-purple-500 to-purple-600',
  green: 'from-green-500 to-green-600',
  orange: 'from-orange-500 to-orange-600'
};

export default function Signup() {
  const { domain } = useParams();
  const { login } = useAuth();
  const navigate = useNavigate();
  const config = DOMAIN_CONFIG[domain];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    organization: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Invalid Domain</h1>
          <p className="text-slate-600 mt-2">Please select a valid domain to continue</p>
          <button
            onClick={() => navigate('/select-domain')}
            className="mt-4 bg-gov-700 text-white px-6 py-2 rounded-lg hover:bg-gov-900"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // For demo purposes, we'll use the existing login endpoint with demo accounts
      // In production, this would call a registration endpoint
      const role = domain.toUpperCase();
      
      // Find a demo account for this domain
      const { data } = await apiClient.get('/auth/demo-accounts');
      const demoAccount = data.accounts.find(acc => acc.role === role);
      
      if (demoAccount) {
        const user = await login(demoAccount.email, demoAccount.password);
        const roleHome = {
          CITIZEN: '/citizen',
          GOVERNMENT: '/government',
          UNIVERSITY: '/university',
          INDUSTRY: '/industry'
        };
        navigate(roleHome[user.role] || '/');
      } else {
        setError('No demo account available for this domain');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className={`bg-gradient-to-r ${COLOR_CLASSES[config.color]} p-6 text-white`}>
            <div className="flex items-center gap-3">
              <span className="text-4xl">{config.icon}</span>
              <div>
                <h1 className="text-2xl font-bold">{config.title}</h1>
                <p className="text-white/90 text-sm">{config.description}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gov-600"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gov-600"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gov-600"
                  placeholder="+91 98765 43210"
                />
              </div>

              {(domain === 'university' || domain === 'government' || domain === 'industry') && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gov-600"
                    placeholder="Enter organization name"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gov-600"
                  placeholder="Min. 6 characters"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gov-600"
                  placeholder="Re-enter password"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-gradient-to-r ${COLOR_CLASSES[config.color]} text-white font-semibold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-60`}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-600 text-sm">
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-gov-700 hover:text-gov-900 font-semibold"
                >
                  Sign in
                </button>
              </p>
              <button
                onClick={() => navigate('/select-domain')}
                className="mt-2 text-slate-500 hover:text-slate-700 text-sm"
              >
                ← Back to domain selection
              </button>
            </div>
          </div>
        </div>

        {/* Demo Notice */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
          <p className="font-semibold mb-1">Demo Mode</p>
          <p>
            For this demo, clicking "Create Account" will log you in using a demo account for the {config.title} domain.
            In production, this would create a new account with your provided details.
          </p>
        </div>
      </div>
    </div>
  );
}
