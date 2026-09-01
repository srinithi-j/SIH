import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_HOME = {
  CITIZEN: '/citizen',
  GOVERNMENT: '/government',
  UNIVERSITY: '/university',
  INDUSTRY: '/industry',
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav className="bg-gov-900 text-white px-6 py-4 flex items-center justify-between shadow-md">
      <Link to="/" className="font-bold text-lg tracking-tight">
        Societal Innovation Collaboration Portal
      </Link>
      <div className="flex items-center gap-4 text-sm">
        {user ? (
          <>
            <Link to={ROLE_HOME[user.role] || '/'} className="hover:text-gov-100">
              Dashboard
            </Link>
            <span className="text-gov-100 font-medium">
              {user.name}
            </span>
            <button
              onClick={handleLogout}
              className="bg-gov-600 hover:bg-gov-700 px-3 py-1.5 rounded-md transition"
            >
              Logout
            </button>
          </>
        ) : null}
      </div>
    </nav>
  );
}
