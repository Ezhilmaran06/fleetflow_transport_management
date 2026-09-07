import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Truck,
  Users,
  Compass,
  CheckCircle2,
  AlertOctagon,
  DollarSign,
  Fuel,
  Wrench,
  RefreshCw,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Radio
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../../components/common/StatusBadge';
import { SkeletonCard, SkeletonTable } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#06b6d4'];

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const navigate = useNavigate();

  const fetchKPIs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/dashboard/kpis');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKPIs();
  }, [fetchKPIs, timeRange]);

  if (loading && !data) {
    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 style={{ margin: 0 }}>Fleet Operational Overview</h3>
            <span style={{ color: 'var(--text-muted)' }}>Loading real-time command metrics...</span>
          </div>
        </div>
        <div className="row g-3 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div className="col-12 col-sm-6 col-xl-3" key={i}>
              <SkeletonCard />
            </div>
          ))}
        </div>
        <SkeletonTable rows={4} />
      </div>
    );
  }

  const { vehicles, drivers, trips, deliveries, finance, safety, liveOperations } = data || {
    vehicles: { total: 0, active: 0, available: 0, inMaintenance: 0, utilizationPercentage: 0 },
    drivers: { total: 0, active: 0, onTrip: 0, available: 0 },
    trips: { active: 0 },
    deliveries: { total: 0, today: 0, completed: 0, delayed: 0, completionRate: 0 },
    finance: { fuelCost: 0, maintenanceCost: 0, otherExpenses: 0, totalOperatingCost: 0 },
    safety: { activeIncidents: 0 },
    liveOperations: []
  };

  const isDatabaseEmpty = vehicles.total === 0 && drivers.total === 0 && trips.active === 0;

  // Chart data
  const vehicleStatusChart = [
    { name: 'Available', value: vehicles.available },
    { name: 'Active / On Trip', value: vehicles.active },
    { name: 'Maintenance', value: vehicles.inMaintenance }
  ].filter((d) => d.value > 0);

  const deliveryData = [
    { name: 'Completed', count: deliveries.completed },
    { name: 'Delayed', count: deliveries.delayed },
    { name: 'Pending / Active', count: Math.max(0, deliveries.total - deliveries.completed - deliveries.delayed) }
  ].filter((d) => d.count > 0);

  return (
    <div>
      {/* Header Bar */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h2 style={{ fontSize: '1.5rem', margin: '0 0 4px', fontWeight: 800 }}>
            Fleet Operational Command Center
          </h2>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Real-time multi-tenant telemetry and operations ledger
          </span>
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* Time range selector */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: 2
            }}
          >
            {['today', '7d', '30d', '90d'].map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                style={{
                  background: timeRange === r ? 'var(--ff-primary)' : 'none',
                  color: timeRange === r ? '#ffffff' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: 4,
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                {r}
              </button>
            ))}
          </div>

          <button className="ff-btn ff-btn-outline ff-btn-sm" onClick={fetchKPIs} title="Refresh Live Data">
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {/* Empty Database Workspace Prompt */}
      {isDatabaseEmpty ? (
        <div className="ff-card mb-4">
          <EmptyState
            icon={Truck}
            title="Your FleetFlow workspace is ready"
            description="No fleet assets have been registered yet. Start dispatching by onboarding your first vehicle, adding drivers, or planning routes."
            actionLabel="Add First Vehicle"
            onAction={() => navigate('/vehicles?action=create')}
          />
          <div
            className="d-flex flex-wrap justify-content-center gap-3 pb-4"
            style={{ borderTop: '1px solid var(--border-color)', paddingTop: 20 }}
          >
            <button className="ff-btn ff-btn-outline" onClick={() => navigate('/drivers?action=create')}>
              <Users size={16} /> Add Driver
            </button>
            <button className="ff-btn ff-btn-outline" onClick={() => navigate('/trips?action=create')}>
              <Compass size={16} /> Create Trip
            </button>
            <button className="ff-btn ff-btn-outline" onClick={() => navigate('/deliveries?action=create')}>
              <CheckCircle2 size={16} /> Create Delivery
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Main KPI Row */}
          <div className="row g-3 mb-4">
            {/* Total Vehicles */}
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="ff-kpi-card">
                <div className="d-flex justify-content-between align-items-start">
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    Fleet Vehicles
                  </span>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      backgroundColor: 'var(--ff-primary-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--ff-primary)'
                    }}
                  >
                    <Truck size={18} />
                  </div>
                </div>
                <div className="ff-kpi-val">{vehicles.total}</div>
                <div className="d-flex justify-content-between align-items-center" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>{vehicles.available} Available</span>
                  <span>{vehicles.active} Active ({vehicles.utilizationPercentage}% Util.)</span>
                </div>
              </div>
            </div>

            {/* Drivers */}
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="ff-kpi-card">
                <div className="d-flex justify-content-between align-items-start">
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    Active Drivers
                  </span>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      backgroundColor: 'var(--ff-success-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--ff-success)'
                    }}
                  >
                    <Users size={18} />
                  </div>
                </div>
                <div className="ff-kpi-val">{drivers.total}</div>
                <div className="d-flex justify-content-between align-items-center" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>{drivers.onTrip} On Trip</span>
                  <span>{drivers.available} Available</span>
                </div>
              </div>
            </div>

            {/* Deliveries */}
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="ff-kpi-card">
                <div className="d-flex justify-content-between align-items-start">
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    Deliveries
                  </span>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      backgroundColor: 'var(--ff-info-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--ff-info)'
                    }}
                  >
                    <CheckCircle2 size={18} />
                  </div>
                </div>
                <div className="ff-kpi-val">{deliveries.total}</div>
                <div className="d-flex justify-content-between align-items-center" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>{deliveries.completed} Completed</span>
                  <span>{deliveries.completionRate}% Success</span>
                </div>
              </div>
            </div>

            {/* Total Operating Cost */}
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="ff-kpi-card">
                <div className="d-flex justify-content-between align-items-start">
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    Total Operating Cost
                  </span>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      backgroundColor: 'var(--ff-warning-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--ff-warning)'
                    }}
                  >
                    <DollarSign size={18} />
                  </div>
                </div>
                <div className="ff-kpi-val">${finance.totalOperatingCost.toLocaleString()}</div>
                <div className="d-flex justify-content-between align-items-center" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>Fuel: ${finance.fuelCost.toLocaleString()}</span>
                  <span>Maint: ${finance.maintenanceCost.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Operational Charts & Breakdown */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-lg-6">
              <div className="ff-card h-100">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Fleet Asset Distribution</h5>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real MongoDB status breakdown</span>
                </div>
                {vehicleStatusChart.length === 0 ? (
                  <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Insufficient fleet records to plot chart
                  </div>
                ) : (
                  <div style={{ height: 240 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={vehicleStatusChart}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {vehicleStatusChart.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="ff-card h-100">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Delivery Performance Metrics</h5>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Actual packages in transit</span>
                </div>
                {deliveryData.length === 0 ? (
                  <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Insufficient delivery records to plot chart
                  </div>
                ) : (
                  <div style={{ height: 240 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={deliveryData}>
                        <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                        <YAxis stroke="var(--text-muted)" fontSize={12} />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }} />
                        <Bar dataKey="count" fill="var(--ff-primary)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Live Operations Snapshot Table */}
          <div className="ff-card">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-2">
                <Radio size={18} color="var(--ff-primary)" />
                <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Active Operational Trips</h5>
              </div>
              <Link to="/live-operations" className="ff-btn ff-btn-outline ff-btn-sm">
                View Live Command Center
                <ArrowUpRight size={14} />
              </Link>
            </div>

            {liveOperations.length === 0 ? (
              <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No trips currently in active transit.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="ff-table">
                  <thead>
                    <tr>
                      <th>Trip Number</th>
                      <th>Origin</th>
                      <th>Destination</th>
                      <th>Scheduled Start</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveOperations.map((t) => (
                      <tr key={t._id}>
                        <td style={{ fontWeight: 600 }}>#{t.tripNumber}</td>
                        <td>{t.origin}</td>
                        <td>{t.destination}</td>
                        <td>{new Date(t.scheduledStart).toLocaleDateString()}</td>
                        <td>
                          <span
                            className={`ff-badge ${
                              t.priority === 'URGENT' ? 'ff-badge-danger' : t.priority === 'HIGH' ? 'ff-badge-warning' : 'ff-badge-secondary'
                            }`}
                          >
                            {t.priority}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={t.status} />
                        </td>
                        <td>
                          <Link to={`/trips/${t._id}`} className="ff-btn ff-btn-outline ff-btn-sm">
                            Inspect
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
