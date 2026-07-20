'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if already authenticated, if so skip login
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth');
        if (res.ok) {
          router.push('/admin/dashboard');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setChecking(false);
      }
    }
    checkAuth();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/admin/dashboard');
        router.refresh();
      } else {
        setError(data.message || 'Invalid username or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  if (checking) {
    return (
      <div className="admin-login-layout">
        <p>Checking authentication status...</p>
      </div>
    );
  }

  return (
    <div className="admin-login-layout">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-brand">Vasthra Katha</h1>
          <span className="login-tag">Atelier Catalog System</span>
          <h2 className="login-title-h2">Admin Authorization</h2>
        </div>

        <form onSubmit={handleLogin}>
          <div className="login-form-group">
            <label className="form-label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
            />
          </div>

          <div className="login-form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>

          <button type="submit" className="login-submit-btn">
            Authenticate
          </button>
        </form>

        {error && <div className="login-error">{error}</div>}
      </div>
    </div>
  );
}
