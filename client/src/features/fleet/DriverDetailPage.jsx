import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, Award, Compass, AlertOctagon, Phone, Mail, FileText, Edit2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../../components/common/StatusBadge';
import { SkeletonCard, SkeletonTable } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import DriverModal from './DriverModal';
import { useToast } from '../../context/ToastContext';

const DriverDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchDriver = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/drivers/${id}`);
      setDriver(res.data);
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    fetchDriver();
  }, [fetchDriver]);

  if (loading && !driver) {
    return (
      <div>
        <SkeletonCard />
        <div className="mt-4"><SkeletonTable rows={4} /></div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="ff-card">
        <EmptyState
          icon={Users}
          title="Driver Profile Not Found"
          description="The requested driver profile does not exist or has been removed."
          actionLabel="Back to Drivers"
          onAction={() => navigate('/drivers')}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3">
        <Link to="/drivers" className="ff-btn ff-btn-outline ff-btn-sm">
          <ArrowLeft size={14} /> Back to Drivers
        </Link>
      </div>

      {/* Hero Header */}
      <div className="ff-card mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: 'var(--ff-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '1.4rem',
                fontWeight: 700
              }}
            >
              {driver.firstName[0]}{driver.lastName[0]}
            </div>
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <h2 style={{ fontSize: '1.45rem', margin: 0, fontWeight: 800 }}>
                  {driver.firstName} {driver.lastName}
                </h2>
                <StatusBadge status={driver.status} />
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Commercial License: <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{driver.licenseNumber}</span> ({driver.licenseCategory})
              </div>
            </div>
          </div>

          <button className="ff-btn ff-btn-outline" onClick={() => setIsEditModalOpen(true)}>
            <Edit2 size={16} /> Edit Profile
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="ff-kpi-card">
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>SAFETY RATING</span>
            <div className="ff-kpi-val" style={{ color: 'var(--ff-success)' }}>{driver.safetyScore || 100}%</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Compliance certified</span>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="ff-kpi-card">
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>TRIPS COMPLETED</span>
            <div className="ff-kpi-val">{driver.totalTripsCompleted || 0}</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dispatched journeys</span>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="ff-kpi-card">
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>TOTAL DISTANCE</span>
            <div className="ff-kpi-val">{driver.totalDistanceKm?.toLocaleString() || 0} km</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Logged distance</span>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="ff-kpi-card">
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>ASSIGNED VEHICLE</span>
            <div className="ff-kpi-val" style={{ fontSize: '1.25rem' }}>
              {driver.assignedVehicle ? driver.assignedVehicle.registrationNumber : 'None'}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {driver.assignedVehicle ? `${driver.assignedVehicle.make} ${driver.assignedVehicle.model}` : 'Unassigned'}
            </span>
          </div>
        </div>
      </div>

      {/* Details & History */}
      <div className="row g-4">
        <div className="col-12 col-lg-4">
          <div className="ff-card mb-4">
            <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>Contact & Verification</h5>
            <div className="d-flex flex-column gap-3" style={{ fontSize: '0.85rem' }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Email Address</div>
                <div style={{ fontWeight: 600 }}>{driver.email}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Phone Number</div>
                <div style={{ fontWeight: 600 }}>{driver.phone}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>License Expiry Date</div>
                <div style={{ fontWeight: 600 }}>{new Date(driver.licenseExpiry).toLocaleDateString()}</div>
              </div>
              {driver.emergencyContact?.name && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Emergency Contact</div>
                  <div style={{ fontWeight: 600 }}>{driver.emergencyContact.name} ({driver.emergencyContact.phone})</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-8">
          {/* Recent Trips */}
          <div className="ff-card mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>Assigned Trip History</h5>
            </div>
            {driver.recentTrips?.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No trips logged for this driver yet.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="ff-table">
                  <thead>
                    <tr>
                      <th>Trip ID</th>
                      <th>Origin</th>
                      <th>Destination</th>
                      <th>Scheduled</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {driver.recentTrips?.map((t) => (
                      <tr key={t._id}>
                        <td style={{ fontWeight: 600 }}>
                          <Link to={`/trips/${t._id}`}>#{t.tripNumber}</Link>
                        </td>
                        <td>{t.origin}</td>
                        <td>{t.destination}</td>
                        <td>{new Date(t.scheduledStart).toLocaleDateString()}</td>
                        <td>
                          <StatusBadge status={t.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Incidents */}
          <div className="ff-card">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>Safety & Incident Records</h5>
            </div>
            {driver.incidents?.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Clean safety record. No incidents logged.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="ff-table">
                  <thead>
                    <tr>
                      <th>Incident #</th>
                      <th>Title</th>
                      <th>Date</th>
                      <th>Severity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {driver.incidents?.map((inc) => (
                      <tr key={inc._id}>
                        <td style={{ fontWeight: 600 }}>#{inc.incidentNumber}</td>
                        <td>{inc.title}</td>
                        <td>{new Date(inc.incidentDate).toLocaleDateString()}</td>
                        <td>
                          <StatusBadge status={inc.severity} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <DriverModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSaved={fetchDriver}
        driver={driver}
      />
    </div>
  );
};

export default DriverDetailPage;
