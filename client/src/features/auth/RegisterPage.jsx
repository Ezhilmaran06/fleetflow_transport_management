import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Truck, Building2, User, Mail, Lock, Phone, ArrowRight } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    companyCode: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      showToast('Workspace initialized! Welcome to FleetFlow.', 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your information.');
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
        padding: '30px 20px'
      }}
    >
      <div
        className="ff-card"
        style={{
          width: '100%',
          maxWidth: 520,
          padding: '36px 30px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
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
              margin: '0 auto 12px'
            }}
          >
            <Truck size={24} />
          </div>
          <h3 style={{ margin: '0 0 6px', fontSize: '1.45rem', fontWeight: 800 }}>Create FleetFlow Workspace</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
            Register your company and setup administrator credentials
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
          <div className="row g-2 mb-3">
            <div className="col-8">
              <label className="ff-form-label">Company Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  name="companyName"
                  className="ff-form-control"
                  placeholder="Apex Freight Logistics"
                  value={formData.companyName}
                  onChange={handleChange}
                  style={{ paddingLeft: 34 }}
                />
                <Building2 size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: 11 }} />
              </div>
            </div>
            <div className="col-4">
              <label className="ff-form-label">Tenant Code</label>
              <input
                type="text"
                name="companyCode"
                className="ff-form-control"
                placeholder="APEX"
                value={formData.companyCode}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="row g-2 mb-3">
            <div className="col-6">
              <label className="ff-form-label">First Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  name="firstName"
                  className="ff-form-control"
                  placeholder="Alex"
                  value={formData.firstName}
                  onChange={handleChange}
                  style={{ paddingLeft: 34 }}
                />
                <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: 11 }} />
              </div>
            </div>
            <div className="col-6">
              <label className="ff-form-label">Last Name</label>
              <input
                type="text"
                required
                name="lastName"
                className="ff-form-control"
                placeholder="Morgan"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="ff-form-label">Work Email</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                name="email"
                className="ff-form-control"
                placeholder="admin@apexlogistics.com"
                value={formData.email}
                onChange={handleChange}
                style={{ paddingLeft: 34 }}
              />
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: 11 }} />
            </div>
          </div>

          <div className="row g-2 mb-4">
            <div className="col-7">
              <label className="ff-form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  name="password"
                  className="ff-form-control"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  style={{ paddingLeft: 34 }}
                />
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: 11 }} />
              </div>
            </div>
            <div className="col-5">
              <label className="ff-form-label">Phone</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  name="phone"
                  className="ff-form-control"
                  placeholder="+1 555-0199"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{ paddingLeft: 32 }}
                />
                <Phone size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: 12 }} />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="ff-btn ff-btn-primary"
            style={{ width: '100%', padding: '10px', fontSize: '0.95rem' }}
            disabled={loading}
          >
            {loading ? 'Setting up Workspace...' : 'Initialize Workspace'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 22, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
