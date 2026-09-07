import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Truck, Lock, Mail, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      showToast('Welcome back to FleetFlow!', 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-app)',
        padding: 20
      }}
    >
      <div
        className="ff-card"
        style={{
          width: '100%',
          maxWidth: 440,
          padding: '36px 30px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #2563eb, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              margin: '0 auto 14px'
            }}
          >
            <Truck size={24} />
          </div>
          <h3 style={{ margin: '0 0 6px', fontSize: '1.45rem', fontWeight: 800 }}>Sign in to FleetFlow</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
            Enterprise Fleet & Dispatch Operations OS
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: 'var(--ff-danger-light)',
              color: 'var(--ff-danger)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              marginBottom: 20,
              fontSize: '0.85rem'
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label className="ff-form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                className="ff-form-control"
                placeholder="dispatcher@fleetflow.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: 36 }}
              />
              <Mail
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: 12, top: 11 }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 22 }}>
            <label className="ff-form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                className="ff-form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: 36 }}
              />
              <Lock
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: 12, top: 11 }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="ff-btn ff-btn-primary"
            style={{ width: '100%', padding: '10px', fontSize: '0.95rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Don't have a workspace yet?{' '}
          <Link to="/register" style={{ fontWeight: 600 }}>
            Register Company
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
