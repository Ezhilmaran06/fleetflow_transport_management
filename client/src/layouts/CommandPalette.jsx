import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Truck,
  Users,
  Compass,
  Building2,
  MapPin,
  Wrench,
  FileText,
  User,
  Plus,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced MongoDB search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await axiosClient.get(`/search?q=${encodeURIComponent(query.trim())}`);
        setResults(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const quickActions = [
    { label: 'Create Vehicle', icon: Truck, action: () => navigate('/vehicles?action=create') },
    { label: 'Create Driver', icon: Users, action: () => navigate('/drivers?action=create') },
    { label: 'Create Trip', icon: Compass, action: () => navigate('/trips?action=create') },
    { label: 'Create Delivery', icon: Truck, action: () => navigate('/deliveries?action=create') },
    { label: 'Log Expense', icon: Plus, action: () => navigate('/expenses?action=create') },
    { label: 'Report Incident', icon: Plus, action: () => navigate('/incidents?action=create') },
    { label: 'Open Analytics', icon: BarChart3, action: () => navigate('/analytics') },
    { label: 'System Settings', icon: Settings, action: () => navigate('/admin/settings') },
    { label: 'Sign Out', icon: LogOut, action: () => logout() }
  ];

  const handleSelect = (callback) => {
    onClose();
    callback();
  };

  const hasAnyResults =
    results &&
    (results.vehicles?.length > 0 ||
      results.drivers?.length > 0 ||
      results.trips?.length > 0 ||
      results.deliveries?.length > 0 ||
      results.customers?.length > 0 ||
      results.maintenance?.length > 0 ||
      results.documents?.length > 0 ||
      results.users?.length > 0);

  return (
    <div className="ff-modal-overlay" onClick={onClose}>
      <div
        className="ff-modal"
        style={{ maxWidth: 640 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}
        >
          <Search size={20} color="var(--text-muted)" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search fleet records..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              fontSize: '0.95rem',
              color: 'var(--text-main)'
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Results / Commands Body */}
        <div style={{ maxHeight: 420, overflowY: 'auto', padding: 12 }}>
          {loading && (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Searching MongoDB across fleet database...
            </div>
          )}

          {!loading && results && !hasAnyResults && (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No fleet records matched "{query}".
            </div>
          )}

          {/* Grouped MongoDB Results */}
          {!loading && results && hasAnyResults && (
            <div>
              {results.vehicles?.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '4px 8px' }}>
                    Vehicles
                  </div>
                  {results.vehicles.map((v) => (
                    <div
                      key={v._id}
                      onClick={() => handleSelect(() => navigate(`/vehicles/${v._id}`))}
                      style={{ padding: '8px 12px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Truck size={16} color="var(--ff-primary)" />
                      <span style={{ fontWeight: 600 }}>{v.registrationNumber}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{v.make} {v.model} ({v.status})</span>
                    </div>
                  ))}
                </div>
              )}

              {results.drivers?.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '4px 8px' }}>
                    Drivers
                  </div>
                  {results.drivers.map((d) => (
                    <div
                      key={d._id}
                      onClick={() => handleSelect(() => navigate(`/drivers/${d._id}`))}
                      style={{ padding: '8px 12px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Users size={16} color="var(--ff-primary)" />
                      <span style={{ fontWeight: 600 }}>{d.firstName} {d.lastName}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Lic: {d.licenseNumber} ({d.status})</span>
                    </div>
                  ))}
                </div>
              )}

              {results.trips?.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '4px 8px' }}>
                    Trips
                  </div>
                  {results.trips.map((t) => (
                    <div
                      key={t._id}
                      onClick={() => handleSelect(() => navigate(`/trips/${t._id}`))}
                      style={{ padding: '8px 12px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Compass size={16} color="var(--ff-primary)" />
                      <span style={{ fontWeight: 600 }}>#{t.tripNumber}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{t.origin} → {t.destination} ({t.status})</span>
                    </div>
                  ))}
                </div>
              )}

              {results.deliveries?.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '4px 8px' }}>
                    Deliveries
                  </div>
                  {results.deliveries.map((del) => (
                    <div
                      key={del._id}
                      onClick={() => handleSelect(() => navigate(`/deliveries/${del._id}`))}
                      style={{ padding: '8px 12px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Truck size={16} color="var(--ff-primary)" />
                      <span style={{ fontWeight: 600 }}>#{del.trackingNumber}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{del.status}</span>
                    </div>
                  ))}
                </div>
              )}

              {results.maintenance?.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '4px 8px' }}>
                    Maintenance Work Orders
                  </div>
                  {results.maintenance.map((m) => (
                    <div
                      key={m._id}
                      onClick={() => handleSelect(() => navigate(`/maintenance`))}
                      style={{ padding: '8px 12px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Wrench size={16} color="var(--ff-warning)" />
                      <span style={{ fontWeight: 600 }}>#{m.workOrderNumber}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{m.issueDescription} ({m.status})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Actions (when no search active) */}
          {(!results || !query) && (
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '4px 8px', marginBottom: 4 }}>
                Navigation & Quick Actions
              </div>
              {quickActions.map((qa, idx) => {
                const Icon = qa.icon;
                return (
                  <div
                    key={idx}
                    onClick={() => handleSelect(qa.action)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Icon size={16} color="var(--ff-primary)" />
                    <span style={{ fontSize: '0.875rem' }}>{qa.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Palette Footer */}
        <div
          style={{
            padding: '10px 18px',
            borderTop: '1px solid var(--border-color)',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <span>Use Esc to exit</span>
          <span>FleetFlow Multi-Model Search Engine</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
