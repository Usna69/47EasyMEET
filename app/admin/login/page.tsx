'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth';

export default function LoginPage() {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const router = useRouter();
  const auth = useAuth();

  // If already logged in, redirect to admin dashboard
  React.useEffect(() => {
    if (auth.isLoggedIn) {
      router.push('/admin');
    }
  }, [auth.isLoggedIn, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Username and password are required');
      return;
    }

    const loginSuccess = auth.login(username, password);
    if (loginSuccess) {
      router.push('/admin');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg border border-gray-100">
        <h1 className="text-3xl font-semibold mb-6 text-center">
          <span className="text-yellow-500">Easy</span>
          <span className="text-[#014a2f]">MEET</span>
          <span className="block text-sm text-gray-600 mt-1">NCCG Admin Access</span>
        </h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014a2f]/30"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014a2f]/30"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-[#014a2f] hover:bg-[#014a2f]/90 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Login
          </button>
        </form>
        
        {/* Login form footer removed */}
      </div>
    </div>
  );
}
