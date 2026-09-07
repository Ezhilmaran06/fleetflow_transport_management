import React, { useState, useEffect } from 'react';
import { ShieldCheck, FileText, AlertTriangle, XCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { SkeletonCard } from '../../components/common/SkeletonLoader';

const CompliancePage = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompliance = async () => {
      setLoading(true);
      try {
        const res = await axiosClient.get('/safety/compliance');
        setOverview(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompliance();
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <div className="d-flex align-items-center gap-2">
            <ShieldCheck size={22} color="var(--ff-primary)" />
            <h2 style={{ fontSize: '1.45rem', margin: 0, fontWeight: 800 }}>
              Regulatory & Fleet Compliance Center
            </h2>
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Empirical compliance audit scores calculated across all registered licenses, registrations, and insurance policies
          </span>
        </div>

        <Link to="/documents" className="ff-btn ff-btn-primary">
          Open Document Vault <ArrowRight size={16} />
        </Link>
      </div>

      {loading ? (
        <div className="row g-3">
          {[1, 2, 3, 4].map((i) => (
            <div className="col-12 col-md-3" key={i}>
              <SkeletonCard />
            </div>
          ))}
        </div>
      ) : (
        <div>
          {/* KPI Cards */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="ff-kpi-card">
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>OVERALL COMPLIANCE</span>
                <div className="ff-kpi-val" style={{ color: (overview?.complianceRate || 100) >= 90 ? 'var(--ff-success)' : 'var(--ff-warning)' }}>
                  {overview?.complianceRate || 100}%
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Audit readiness score</span>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-xl-3">
              <div className="ff-kpi-card">
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>VALID DOCUMENTS</span>
                <div className="ff-kpi-val" style={{ color: 'var(--ff-success)' }}>{overview?.valid || 0}</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Certified active</span>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-xl-3">
              <div className="ff-kpi-card">
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>EXPIRING WITHIN 30 DAYS</span>
                <div className="ff-kpi-val" style={{ color: 'var(--ff-warning)' }}>{overview?.expiringSoon || 0}</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Renewal required</span>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-xl-3">
              <div className="ff-kpi-card">
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>EXPIRED CERTIFICATIONS</span>
                <div className="ff-kpi-val" style={{ color: 'var(--ff-danger)' }}>{overview?.expired || 0}</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Grounding hazard</span>
              </div>
            </div>
          </div>

          <div className="ff-card">
            <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 12 }}>Compliance Monitoring Scope</h5>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              FleetFlow continuously tracks 6 mandatory statutory compliance dimensions:
            </p>
            <div className="row g-3 mt-1" style={{ fontSize: '0.85rem' }}>
              <div className="col-12 col-md-4">
                <div className="p-3 ff-card h-100" style={{ backgroundColor: 'var(--bg-surface-elevated)' }}>
                  <strong>Commercial Driver Licenses (CDL)</strong>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 4 }}>
                    Monitors operator qualification classes and state renewal deadlines.
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="p-3 ff-card h-100" style={{ backgroundColor: 'var(--bg-surface-elevated)' }}>
                  <strong>Commercial Fleet Insurance</strong>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 4 }}>
                    Automated alerts 30 days prior to policy term lapse.
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="p-3 ff-card h-100" style={{ backgroundColor: 'var(--bg-surface-elevated)' }}>
                  <strong>State Road Permits & Fitness Certs</strong>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 4 }}>
                    Verification of DOT roadworthiness and annual emissions test results.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompliancePage;
