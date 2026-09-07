import React, { useState, useEffect } from 'react';
import { Award, Users, ShieldCheck, Compass, AlertOctagon, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../../components/common/StatusBadge';
import { SkeletonTable } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';

const DriverPerformancePage = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformance = async () => {
      setLoading(true);
      try {
        const res = await axiosClient.get('/drivers?limit=50');
        setDrivers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, []);

  return (
    <div>
      <div className="mb-3">
        <Link to="/drivers" className="ff-btn ff-btn-outline ff-btn-sm">
          <ArrowLeft size={14} /> Back to Drivers
        </Link>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <div className="d-flex align-items-center gap-2">
            <Award size={22} color="var(--ff-primary)" />
            <h2 style={{ fontSize: '1.45rem', margin: 0, fontWeight: 800 }}>
              Driver Performance & Safety Matrix
            </h2>
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Empirical driver metrics aggregated from trip logs and safety records
          </span>
        </div>
      </div>

      {loading ? (
        <SkeletonTable rows={6} />
      ) : drivers.length === 0 ? (
        <div className="ff-card">
          <EmptyState
            icon={Users}
            title="No Driver Records Found"
            description="Onboard operators and execute trips to calculate real performance ratings."
            actionLabel="Onboard Driver"
            onAction={() => (window.location.href = '/drivers?action=create')}
          />
        </div>
      ) : (
        <div className="ff-table-container">
          <table className="ff-table">
            <thead>
              <tr>
                <th>Driver Name</th>
                <th>License</th>
                <th>Status</th>
                <th>Trips Completed</th>
                <th>Total Distance</th>
                <th>Safety Score</th>
                <th>Rating</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((d) => {
                const score = d.safetyScore || 100;
                let ratingLabel = 'Excellent';
                let ratingBadge = 'ff-badge-success';

                if (score < 75) {
                  ratingLabel = 'Critical Review';
                  ratingBadge = 'ff-badge-danger';
                } else if (score < 90) {
                  ratingLabel = 'Standard';
                  ratingBadge = 'ff-badge-warning';
                }

                return (
                  <tr key={d._id}>
                    <td>
                      <Link to={`/drivers/${d._id}`} style={{ fontWeight: 700, color: 'var(--ff-primary)' }}>
                        {d.firstName} {d.lastName}
                      </Link>
                    </td>
                    <td>{d.licenseNumber}</td>
                    <td>
                      <StatusBadge status={d.status} />
                    </td>
                    <td style={{ fontWeight: 600 }}>{d.totalTripsCompleted || 0}</td>
                    <td>{d.totalDistanceKm?.toLocaleString() || 0} km</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div
                          style={{
                            width: 60,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: 'var(--border-color)',
                            overflow: 'hidden'
                          }}
                        >
                          <div
                            style={{
                              width: `${score}%`,
                              height: '100%',
                              backgroundColor: score >= 90 ? 'var(--ff-success)' : score >= 75 ? 'var(--ff-warning)' : 'var(--ff-danger)'
                            }}
                          />
                        </div>
                        <span style={{ fontWeight: 700 }}>{score}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`ff-badge ${ratingBadge}`}>{ratingLabel}</span>
                    </td>
                    <td>
                      <Link to={`/drivers/${d._id}`} className="ff-btn ff-btn-outline ff-btn-sm">
                        Inspect
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
  );
};

export default DriverPerformancePage;
