import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Truck,
  Users,
  Compass,
  CheckCircle2,
  DollarSign,
  RefreshCw,
  ArrowUpRight,
  Radio,
  Clock,
  AlertTriangle,
  Wrench,
  ShieldAlert,
  PackageCheck,
  Plus
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

const STATUS_CHART_COLORS = ['#2563EB', '#16A34A', '#D97706', '#DC2626', '#4F46E5', '#0284C7'];

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30D');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchKPIs = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await axiosClient.get('/dashboard/kpis');
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch dashboard KPIs:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
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
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--ff-primary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              OPERATIONS OVERVIEW
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '2px 0 0' }}>
              Fleet Operational Command Center
            </h2>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>
              Synchronizing real-time telemetry from database...
            </span>
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

  // Real MongoDB asset distribution breakdown
  const vehicleStatusChart = [
    { name: 'Available', value: vehicles.available },
    { name: 'Active / In Trip', value: vehicles.active },
    { name: 'In Maintenance', value: vehicles.inMaintenance }
  ].filter((d) => d.value > 0);

  // Real MongoDB delivery metrics
  const deliveryData = [
    { name: 'Delivered', count: deliveries.completed },
    { name: 'Delayed', count: deliveries.delayed },
    { name: 'In Transit', count: Math.max(0, deliveries.total - deliveries.completed - deliveries.delayed) }
  ].filter((d) => d.count > 0);

  return (
    <div>
      {/* 1. Header Bar with Eyebrow, Title & Segmented Control */}
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
        <div>
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: 'var(--ff-primary)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 3
            }}
          >
            OPERATIONS OVERVIEW
          </div>
          <h2 style={{ fontSize: '1.65rem', margin: 0, fontWeight: 800, letterSpacing: '-0.03em' }}>
            Fleet Operational Command Center
          </h2>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>
            Real-time multi-tenant telemetry and operations ledger
          </span>
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* Segmented Time Range Control */}
          <div className="ff-segmented-control" role="group" aria-label="Time Range Filter">
            {['TODAY', '7D', '30D', '90D', 'CUSTOM'].map((r) => (
              <button
                key={r}
                type="button"
                className={`ff-segmented-item ${timeRange === r ? 'active' : ''}`}
                onClick={() => setTimeRange(r)}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="ff-btn ff-btn-outline ff-btn-sm"
            onClick={fetchKPIs}
            disabled={isRefreshing}
            title="Refresh Live Telemetry"
            style={{ padding: '6px 12px' }}
          >
            <RefreshCw size={13} className={isRefreshing ? 'spin' : ''} />
            <span className="d-none d-sm-inline">{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* 2. Empty Workspace Setup Banner if no assets registered */}
      {isDatabaseEmpty ? (
        <div className="ff-card mb-4" style={{ padding: '32px 24px' }}>
          <EmptyState
            icon={Truck}
            title="Workspace Ready for Fleet Deployment"
            description="Your organization workspace is initialized on MongoDB. Get started by registering your first fleet vehicle, assigning drivers, or scheduling routes."
            actionLabel="Add First Vehicle"
            onAction={() => navigate('/vehicles?action=create')}
          />
          <div
            className="d-flex flex-wrap justify-content-center gap-2 pt-3"
            style={{ borderTop: '1px solid var(--border-color)' }}
          >
            <button type="button" className="ff-btn ff-btn-secondary ff-btn-sm" onClick={() => navigate('/drivers?action=create')}>
              <Users size={14} /> Add Driver
            </button>
            <button type="button" className="ff-btn ff-btn-secondary ff-btn-sm" onClick={() => navigate('/trips?action=create')}>
              <Compass size={14} /> Create Trip
            </button>
            <button type="button" className="ff-btn ff-btn-secondary ff-btn-sm" onClick={() => navigate('/deliveries?action=create')}>
              <PackageCheck size={14} /> Create Delivery
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* 3. Compact Enterprise KPI Row (4 cards across desktop) */}
          <div className="row g-3 mb-4">
            {/* KPI 1: Fleet Vehicles */}
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="ff-kpi-card">
                <div className="ff-kpi-accent ff-kpi-accent-blue" />
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.735rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Fleet Vehicles
                    </span>
                    <div className="ff-kpi-val">{vehicles.total}</div>
                  </div>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--ff-primary-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--ff-primary)',
                      flexShrink: 0
                    }}
                  >
                    <Truck size={17} />
                  </div>
                </div>
                <div
                  className="d-flex justify-content-between align-items-center pt-2 mt-1"
                  style={{ fontSize: '0.735rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color-subtle)' }}
                >
                  <span style={{ color: vehicles.available > 0 ? 'var(--ff-success)' : 'inherit', fontWeight: 500 }}>
                    {vehicles.available} Available
                  </span>
                  <span>{vehicles.active} Active ({vehicles.utilizationPercentage}%)</span>
                </div>
              </div>
            </div>

            {/* KPI 2: Active Drivers */}
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="ff-kpi-card">
                <div className="ff-kpi-accent ff-kpi-accent-green" />
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.735rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Active Drivers
                    </span>
                    <div className="ff-kpi-val">{drivers.total}</div>
                  </div>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--ff-success-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--ff-success)',
                      flexShrink: 0
                    }}
                  >
                    <Users size={17} />
                  </div>
                </div>
                <div
                  className="d-flex justify-content-between align-items-center pt-2 mt-1"
                  style={{ fontSize: '0.735rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color-subtle)' }}
                >
                  <span>{drivers.onTrip} On Trip</span>
                  <span style={{ color: drivers.available > 0 ? 'var(--ff-success)' : 'inherit', fontWeight: 500 }}>
                    {drivers.available} Available
                  </span>
                </div>
              </div>
            </div>

            {/* KPI 3: Deliveries */}
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="ff-kpi-card">
                <div className="ff-kpi-accent ff-kpi-accent-cyan" />
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.735rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Deliveries
                    </span>
                    <div className="ff-kpi-val">{deliveries.total}</div>
                  </div>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--ff-info-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--ff-info)',
                      flexShrink: 0
                    }}
                  >
                    <CheckCircle2 size={17} />
                  </div>
                </div>
                <div
                  className="d-flex justify-content-between align-items-center pt-2 mt-1"
                  style={{ fontSize: '0.735rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color-subtle)' }}
                >
                  <span>{deliveries.completed} Completed</span>
                  <span style={{ fontWeight: 600, color: deliveries.completionRate > 0 ? 'var(--ff-success)' : 'inherit' }}>
                    {deliveries.total > 0 ? `${deliveries.completionRate}% Success` : '0% Success'}
                  </span>
                </div>
              </div>
            </div>

            {/* KPI 4: Operating Cost */}
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="ff-kpi-card">
                <div className="ff-kpi-accent ff-kpi-accent-orange" />
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.735rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Total Operating Cost
                    </span>
                    <div className="ff-kpi-val">
                      ${finance.totalOperatingCost.toLocaleString()}
                    </div>
                  </div>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--ff-warning-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--ff-warning)',
                      flexShrink: 0
                    }}
                  >
                    <DollarSign size={17} />
                  </div>
                </div>
                <div
                  className="d-flex justify-content-between align-items-center pt-2 mt-1"
                  style={{ fontSize: '0.735rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color-subtle)' }}
                >
                  <span>Fuel: ${finance.fuelCost.toLocaleString()}</span>
                  <span>Maint: ${finance.maintenanceCost.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Operational Insights Quick Pods */}
          <div className="row g-3 mb-4">
            <div className="col-6 col-md-3">
              <div className="ff-insight-pod">
                <div className="ff-insight-icon" style={{ backgroundColor: 'var(--ff-primary-light)', color: 'var(--ff-primary)' }}>
                  <Compass size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, lineHeight: 1.1 }}>{trips.active}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>Active Trips</div>
                </div>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="ff-insight-pod">
                <div className="ff-insight-icon" style={{ backgroundColor: 'var(--ff-danger-light)', color: 'var(--ff-danger)' }}>
                  <Clock size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, lineHeight: 1.1 }}>{deliveries.delayed}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>Delayed Deliveries</div>
                </div>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="ff-insight-pod">
                <div className="ff-insight-icon" style={{ backgroundColor: 'var(--ff-warning-light)', color: 'var(--ff-warning)' }}>
                  <Wrench size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, lineHeight: 1.1 }}>{vehicles.inMaintenance}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>In Maintenance</div>
                </div>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="ff-insight-pod">
                <div className="ff-insight-icon" style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', color: 'var(--ff-danger)' }}>
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, lineHeight: 1.1 }}>{safety.activeIncidents}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>Active Incidents</div>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Analytics & Chart Area (2 Columns) */}
          <div className="row g-3 mb-4">
            {/* Chart 1: Fleet Asset Distribution */}
            <div className="col-12 col-lg-6">
              <div className="ff-card h-100 d-flex flex-column justify-content-between">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Fleet Asset Distribution</h5>
                    <span style={{ fontSize: '0.735rem', color: 'var(--text-muted)' }}>Real MongoDB vehicle status allocation</span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-color)',
                      padding: '2px 8px',
                      borderRadius: 4,
                      color: 'var(--text-muted)'
                    }}
                  >
                    {vehicles.total} {vehicles.total === 1 ? 'Asset' : 'Assets'}
                  </span>
                </div>

                {vehicleStatusChart.length === 0 ? (
                  <div style={{ padding: '36px 16px', textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginBottom: 12 }}>
                      No vehicle status records available.
                    </div>
                    <button
                      type="button"
                      className="ff-btn ff-btn-outline ff-btn-sm"
                      onClick={() => navigate('/vehicles?action=create')}
                    >
                      <Plus size={13} /> Add Vehicle
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ height: 210 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={vehicleStatusChart}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={3}
                          >
                            {vehicleStatusChart.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={STATUS_CHART_COLORS[index % STATUS_CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'var(--bg-surface)',
                              borderColor: 'var(--border-color)',
                              borderRadius: 'var(--radius-md)',
                              color: 'var(--text-main)',
                              fontSize: '0.785rem',
                              boxShadow: 'var(--card-shadow)'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div
                      className="d-flex flex-wrap justify-content-center gap-3 pt-2"
                      style={{ borderTop: '1px solid var(--border-color-subtle)', fontSize: '0.735rem' }}
                    >
                      {vehicleStatusChart.map((item, idx) => (
                        <div key={idx} className="d-flex align-items-center gap-1">
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: STATUS_CHART_COLORS[idx % STATUS_CHART_COLORS.length]
                            }}
                          />
                          <span style={{ color: 'var(--text-muted)' }}>{item.name}:</span>
                          <span style={{ fontWeight: 600 }}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Chart 2: Delivery Performance Metrics */}
            <div className="col-12 col-lg-6">
              <div className="ff-card h-100 d-flex flex-column justify-content-between">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Delivery Performance Metrics</h5>
                    <span style={{ fontSize: '0.735rem', color: 'var(--text-muted)' }}>Recorded delivery orders in transit</span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-color)',
                      padding: '2px 8px',
                      borderRadius: 4,
                      color: 'var(--text-muted)'
                    }}
                  >
                    {deliveries.total} Recorded
                  </span>
                </div>

                {deliveryData.length === 0 ? (
                  <div style={{ padding: '36px 16px', textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginBottom: 12 }}>
                      No delivery performance records yet. Deliveries will appear here once booked.
                    </div>
                    <button
                      type="button"
                      className="ff-btn ff-btn-outline ff-btn-sm"
                      onClick={() => navigate('/deliveries?action=create')}
                    >
                      <Plus size={13} /> Create Delivery
                    </button>
                  </div>
                ) : (
                  <div style={{ height: 230 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={deliveryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis
                          dataKey="name"
                          stroke="var(--text-muted)"
                          fontSize={11}
                          tickLine={false}
                          axisLine={{ stroke: 'var(--border-color)' }}
                        />
                        <YAxis
                          stroke="var(--text-muted)"
                          fontSize={11}
                          allowDecimals={false}
                          tickLine={false}
                          axisLine={{ stroke: 'var(--border-color)' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--bg-surface)',
                            borderColor: 'var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--text-main)',
                            fontSize: '0.785rem',
                            boxShadow: 'var(--card-shadow)'
                          }}
                        />
                        <Bar dataKey="count" fill="var(--ff-primary)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 6. Active Operational Trips Ledger Table */}
          <div className="ff-card">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-2">
                <Radio size={16} color="var(--ff-primary)" />
                <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Active Operational Trips</h5>
              </div>
              <Link to="/live-operations" className="ff-btn ff-btn-outline ff-btn-sm" style={{ gap: 5 }}>
                View Live Operations Center
                <ArrowUpRight size={13} />
              </Link>
            </div>

            {liveOperations.length === 0 ? (
              <div style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                No trips currently in active transit. Dispatch a new trip from the Dispatch Board.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="ff-table">
                  <thead>
                    <tr>
                      <th>Trip ID</th>
                      <th>Origin</th>
                      <th>Destination</th>
                      <th>Scheduled Start</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveOperations.map((t) => (
                      <tr key={t._id}>
                        <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                          #{t.tripNumber}
                        </td>
                        <td>{t.origin}</td>
                        <td>{t.destination}</td>
                        <td style={{ color: 'var(--text-muted)' }}>
                          {new Date(t.scheduledStart).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </td>
                        <td>
                          <span
                            className={`ff-badge ${
                              t.priority === 'URGENT'
                                ? 'ff-badge-danger'
                                : t.priority === 'HIGH'
                                ? 'ff-badge-warning'
                                : 'ff-badge-secondary'
                            }`}
                          >
                            {t.priority}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={t.status} />
                        </td>
                        <td style={{ textAlign: 'right' }}>
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
