import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Award, 
  Search, 
  ChevronRight, 
  CheckCircle, 
  Clock, 
  FileText,
  User
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import SkeletonLoader from '../../components/common/SkeletonLoader';

export default function DriverSafetyPage() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [scoreFilter, setScoreFilter] = useState('ALL');

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/drivers?limit=100');
      setDrivers(res.data.data?.drivers || []);
    } catch (err) {
      console.error('Error fetching driver safety list:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDrivers = drivers.filter(d => {
    const fullName = `${d.firstName || ''} ${d.lastName || ''}`.toLowerCase();
    const lic = (d.licenseNumber || '').toLowerCase();
    const matchesSearch = fullName.includes(search.toLowerCase()) || lic.includes(search.toLowerCase());

    const score = d.safetyScore ?? 100;
    if (scoreFilter === 'EXCELLENT') return matchesSearch && score >= 90;
    if (scoreFilter === 'MODERATE') return matchesSearch && score >= 75 && score < 90;
    if (scoreFilter === 'AT_RISK') return matchesSearch && score < 75;

    return matchesSearch;
  });

  const avgSafetyScore = drivers.length > 0 
    ? Math.round(drivers.reduce((acc, d) => acc + (d.safetyScore ?? 100), 0) / drivers.length)
    : 100;

  const highRiskCount = drivers.filter(d => (d.safetyScore ?? 100) < 75).length;
  const compliantCount = drivers.filter(d => (d.safetyScore ?? 100) >= 90).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Driver Safety & Compliance Scores</h1>
        <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
          Monitor driver risk metrics, safety scorecards, and license certification health.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: 'rgba(37, 99, 235, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>Fleet Avg Safety Score</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.125rem' }}>
              {loading ? '-' : `${avgSafetyScore} / 100`}
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
            <Award size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>High-Performance Drivers</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.125rem' }}>
              {loading ? '-' : compliantCount}
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: 'rgba(239, 68, 68, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>At-Risk Drivers (Score &lt; 75)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.125rem' }}>
              {loading ? '-' : highRiskCount}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1.25rem' }}>
        <div style={{ position: 'relative', minWidth: '280px', flex: '1 1 auto' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search driver by name or license number..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.25rem', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => setScoreFilter('ALL')}
            className={`btn ${scoreFilter === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem' }}
          >
            All Drivers ({drivers.length})
          </button>
          <button 
            onClick={() => setScoreFilter('EXCELLENT')}
            className={`btn ${scoreFilter === 'EXCELLENT' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem' }}
          >
            &gt;= 90
          </button>
          <button 
            onClick={() => setScoreFilter('MODERATE')}
            className={`btn ${scoreFilter === 'MODERATE' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem' }}
          >
            75 - 89
          </button>
          <button 
            onClick={() => setScoreFilter('AT_RISK')}
            className={`btn ${scoreFilter === 'AT_RISK' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem', color: scoreFilter === 'AT_RISK' ? '#fff' : '#EF4444' }}
          >
            &lt; 75 At Risk
          </button>
        </div>
      </div>

      {/* Driver Safety Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '1.5rem' }}>
            <SkeletonLoader count={5} height={48} />
          </div>
        ) : filteredDrivers.length === 0 ? (
          <EmptyState 
            icon={ShieldCheck} 
            title="No Drivers Found" 
            message={drivers.length === 0 ? "You have not registered any drivers in the fleet yet." : "No drivers matched your active search or score criteria."}
            actionText={drivers.length === 0 ? "Register Driver" : null}
            actionLink={drivers.length === 0 ? "/fleet/drivers" : null}
          />
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Driver Name</th>
                  <th>License Number</th>
                  <th>Status</th>
                  <th>Safety Score</th>
                  <th>Risk Tier</th>
                  <th>Compliance Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrivers.map(driver => {
                  const score = driver.safetyScore ?? 100;
                  const isHighRisk = score < 75;
                  const isModerate = score >= 75 && score < 90;
                  
                  return (
                    <tr key={driver._id}>
                      <td style={{ fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={16} />
                          </div>
                          <div>
                            <div>{driver.firstName} {driver.lastName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{driver.phone || 'No phone'}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{driver.licenseNumber || 'N/A'}</span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Class {driver.licenseClass || 'Standard'}</div>
                      </td>
                      <td>
                        <StatusBadge status={driver.status || 'ACTIVE'} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: 60, height: 6, borderRadius: 3, background: 'var(--border-color)', overflow: 'hidden' }}>
                            <div 
                              style={{ 
                                width: `${score}%`, 
                                height: '100%', 
                                background: isHighRisk ? '#EF4444' : isModerate ? '#F59E0B' : '#10B981' 
                              }} 
                            />
                          </div>
                          <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{score}</span>
                        </div>
                      </td>
                      <td>
                        {isHighRisk ? (
                          <span style={{ color: '#EF4444', fontWeight: 600, fontSize: '0.8125rem' }}>High Risk</span>
                        ) : isModerate ? (
                          <span style={{ color: '#F59E0B', fontWeight: 600, fontSize: '0.8125rem' }}>Moderate</span>
                        ) : (
                          <span style={{ color: '#10B981', fontWeight: 600, fontSize: '0.8125rem' }}>Exemplary</span>
                        )}
                      </td>
                      <td>
                        {driver.licenseExpiry && new Date(driver.licenseExpiry) < new Date() ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#EF4444', fontSize: '0.8125rem' }}>
                            <AlertTriangle size={14} /> Expired License
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#10B981', fontSize: '0.8125rem' }}>
                            <CheckCircle size={14} /> Certified
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link to={`/fleet/drivers/${driver._id}`} className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                          View Scorecard <ChevronRight size={12} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
