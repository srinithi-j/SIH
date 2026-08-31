import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';

const ROLE_HOME = {
  CITIZEN: '/citizen',
  GOVERNMENT: '/government',
  UNIVERSITY: '/university',
  INDUSTRY: '/industry',
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('demo1234');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoAccounts, setDemoAccounts] = useState([]);

  useEffect(() => {
    apiClient.get('/auth/demo-accounts').then(({ data }) => setDemoAccounts(data.accounts)).catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(ROLE_HOME[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 bg-white border border-slate-100 shadow-sm rounded-xl p-8">
      <h1 className="text-xl font-bold text-gov-900">Sign in to your account</h1>
      <p className="text-sm text-slate-500 mt-1">Use a demo account below, or your own credentials.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gov-600"
            placeholder="citizen@demo.in"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gov-600"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gov-700 hover:bg-gov-900 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      {demoAccounts.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Demo Accounts</p>
          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => setEmail(acc.email)}
                className="text-left text-xs bg-slate-50 hover:bg-slate-100 rounded-md px-3 py-2 border border-slate-100"
              >
                <span className="block font-semibold text-gov-900">{acc.role}</span>
                <span className="text-slate-500">{acc.email}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-2">Password for all demo accounts: demo1234</p>
        </div>
      )}
    </div>
  );
}
