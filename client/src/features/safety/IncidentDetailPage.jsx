import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AlertOctagon, ArrowLeft, Truck, Users, MapPin, Calendar, CheckCircle2, Shield } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../../components/common/StatusBadge';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';

const IncidentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchIncident = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/safety/${id}`);
      setIncident(res.data);
      setResolutionNotes(res.data.resolutionNotes || '');
      setActionTaken(res.data.actionTaken || '');
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    fetchIncident();
  }, [fetchIncident]);

  const handleUpdateInvestigation = async (status) => {
    setUpdating(true);
    try {
      await axiosClient.put(`/safety/${incident._id}/status`, {
        status,
        actionTaken,
        resolutionNotes
      });
      showToast(`Incident status updated to ${status}`, 'success');
      fetchIncident();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading && !incident) return <SkeletonCard />;

  if (!incident) {
    return (
      <div className="ff-card">
        <EmptyState
          icon={AlertOctagon}
          title="Incident Record Not Found"
          description="The requested investigation could not be retrieved."
          actionLabel="Back to Incidents"
          onAction={() => navigate('/incidents')}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3">
        <Link to="/incidents" className="ff-btn ff-btn-outline ff-btn-sm">
          <ArrowLeft size={14} /> Back to Incidents
        </Link>
      </div>

      {/* Hero Header */}
      <div className="ff-card mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <h2 style={{ fontSize: '1.45rem', margin: 0, fontWeight: 800 }}>
                Incident #{incident.incidentNumber}
              </h2>
              <StatusBadge status={incident.severity} />
              <StatusBadge status={incident.status} />
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {incident.title} • Date: {new Date(incident.incidentDate).toLocaleDateString()}
            </div>
          </div>

          <div className="d-flex gap-2">
            {incident.status === 'REPORTED' && (
              <button
                className="ff-btn ff-btn-primary ff-btn-sm"
                disabled={updating}
                onClick={() => handleUpdateInvestigation('UNDER_INVESTIGATION')}
              >
                Commence Investigation
              </button>
            )}
            {incident.status === 'UNDER_INVESTIGATION' && (
              <button
                className="ff-btn ff-btn-primary ff-btn-sm"
                style={{ backgroundColor: 'var(--ff-success)' }}
                disabled={updating}
                onClick={() => handleUpdateInvestigation('RESOLVED')}
              >
                <CheckCircle2 size={14} /> Mark Resolved
              </button>
            )}
            {incident.status === 'RESOLVED' && (
              <button
                className="ff-btn ff-btn-outline ff-btn-sm"
                disabled={updating}
                onClick={() => handleUpdateInvestigation('CLOSED')}
              >
                Close Case File
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Details */}
        <div className="col-12 col-lg-7">
          <div className="ff-card mb-4">
            <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 14 }}>Incident Narrative & Context</h5>
            <div style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-main)' }}>
              {incident.description}
            </div>
            <div
              style={{
                marginTop: 16,
                padding: 12,
                backgroundColor: 'var(--bg-surface-elevated)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem'
              }}
            >
              <div className="d-flex justify-content-between">
                <span style={{ color: 'var(--text-muted)' }}>Location:</span>
                <strong>{incident.location}</strong>
              </div>
              <div className="d-flex justify-content-between mt-1">
                <span style={{ color: 'var(--text-muted)' }}>Reported By:</span>
                <strong>{incident.reportedBy ? `${incident.reportedBy.firstName} ${incident.reportedBy.lastName}` : 'System'}</strong>
              </div>
            </div>
          </div>

          {/* Involved Resources */}
          <div className="row g-3 mb-4">
            <div className="col-6">
              <div className="ff-card h-100">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Vehicle Asset</span>
                  <Truck size={16} color="var(--ff-primary)" />
                </div>
                {incident.vehicle ? (
                  <div>
                    <Link to={`/vehicles/${incident.vehicle._id}`} style={{ fontWeight: 700 }}>
                      {incident.vehicle.registrationNumber}
                    </Link>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {incident.vehicle.make} {incident.vehicle.model}
                    </div>
                  </div>
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No asset involved</span>
                )}
              </div>
            </div>

            <div className="col-6">
              <div className="ff-card h-100">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Operator</span>
                  <Users size={16} color="var(--ff-success)" />
                </div>
                {incident.driver ? (
                  <div>
                    <Link to={`/drivers/${incident.driver._id}`} style={{ fontWeight: 700 }}>
                      {incident.driver.firstName} {incident.driver.lastName}
                    </Link>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Lic: {incident.driver.licenseNumber}
                    </div>
                  </div>
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No driver involved</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Investigation Log & Resolution */}
        <div className="col-12 col-lg-5">
          <div className="ff-card">
            <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>Safety Officer Resolution</h5>

            <div className="mb-3">
              <label className="ff-form-label">Action Taken / Mitigations</label>
              <input
                type="text"
                className="ff-form-control"
                placeholder="Disciplinary action, mechanic dispatched, insurance claim #..."
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="ff-form-label">Investigation & Resolution Notes</label>
              <textarea
                rows="4"
                className="ff-form-control"
                placeholder="Enter findings, root cause analysis, and preventative remedies..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
              />
            </div>

            <button
              className="ff-btn ff-btn-primary w-100"
              disabled={updating}
              onClick={() => handleUpdateInvestigation(incident.status)}
            >
              {updating ? 'Saving Notes...' : 'Save Investigation Findings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentDetailPage;
