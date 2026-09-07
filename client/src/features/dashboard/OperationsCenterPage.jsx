import React, { useState, useEffect } from 'react';
import { Workflow, Radio, AlertOctagon, Compass, CheckCircle2, Truck, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../../components/common/StatusBadge';
import { SkeletonTable } from '../../components/common/SkeletonLoader';

const OperationsCenterPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOperationsData = async () => {
    setLoading(true);
    try {
      const [tripsRes, maintenanceRes, incidentsRes] = await Promise.all([
        axiosClient.get('/trips?limit=10'),
        axiosClient.get('/maintenance?limit=5'),
        axiosClient.get('/safety?limit=5')
      ]);
      setData({
        trips: tripsRes.data,
        maintenance: maintenanceRes.data,
        incidents: incidentsRes.data
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperationsData();
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <div className="d-flex align-items-center gap-2">
            <Workflow size={22} color="var(--ff-primary)" />
            <h2 style={{ fontSize: '1.45rem', margin: 0, fontWeight: 800 }}>
              Operations Command Center
            </h2>
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Unified coordination across dispatch, active maintenance, and critical alerts
          </span>
        </div>

        <button className="ff-btn ff-btn-outline ff-btn-sm" onClick={fetchOperationsData}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <SkeletonTable rows={6} />
      ) : (
        <div className="row g-4">
          {/* Active Dispatches */}
          <div className="col-12 col-xl-8">
            <div className="ff-card h-100">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Active Fleet Dispatches</h5>
                <Link to="/dispatch-board" className="ff-btn ff-btn-outline ff-btn-sm">
                  Dispatch Board
                </Link>
              </div>

              {data?.trips?.length === 0 ? (
                <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No trips currently dispatched.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="ff-table">
                    <thead>
                      <tr>
                        <th>Trip Number</th>
                        <th>Origin / Destination</th>
                        <th>Vehicle</th>
                        <th>Driver</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.trips?.map((t) => (
                        <tr key={t._id}>
                          <td style={{ fontWeight: 600 }}>
                            <Link to={`/trips/${t._id}`}>#{t.tripNumber}</Link>
                          </td>
                          <td>{t.origin} → {t.destination}</td>
                          <td>{t.vehicle?.registrationNumber || 'None'}</td>
                          <td>{t.driver ? `${t.driver.firstName} ${t.driver.lastName}` : 'None'}</td>
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
          </div>

          {/* Side Alerts & Active Maintenance */}
          <div className="col-12 col-xl-4">
            <div className="d-flex flex-column gap-3">
              {/* Urgent Incidents */}
              <div className="ff-card">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Recent Incident Alerts</span>
                  <Link to="/incidents" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    View All
                  </Link>
                </div>
                {data?.incidents?.length === 0 ? (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No open safety incidents.</span>
                ) : (
                  data?.incidents?.map((inc) => (
                    <div
                      key={inc._id}
                      style={{
                        padding: '8px 0',
                        borderBottom: '1px solid var(--border-color)',
                        fontSize: '0.8rem'
                      }}
                    >
                      <div className="d-flex justify-content-between">
                        <span style={{ fontWeight: 600 }}>{inc.title}</span>
                        <StatusBadge status={inc.severity} />
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{inc.location}</div>
                    </div>
                  ))
                )}
              </div>

              {/* Work Orders */}
              <div className="ff-card">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Active Work Orders</span>
                  <Link to="/maintenance" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    View All
                  </Link>
                </div>
                {data?.maintenance?.length === 0 ? (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No vehicles in maintenance.</span>
                ) : (
                  data?.maintenance?.map((m) => (
                    <div
                      key={m._id}
                      style={{
                        padding: '8px 0',
                        borderBottom: '1px solid var(--border-color)',
                        fontSize: '0.8rem'
                      }}
                    >
                      <div className="d-flex justify-content-between">
                        <span style={{ fontWeight: 600 }}>{m.vehicle?.registrationNumber || 'Vehicle'}</span>
                        <StatusBadge status={m.status} />
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{m.issueDescription}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperationsCenterPage;
