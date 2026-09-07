import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  TrendingUp, 
  DollarSign, 
  Truck, 
  Package, 
  ShieldAlert, 
  RefreshCw 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

export default function AnalyticsHubPage() {
  const [activeTab, setActiveTab] = useState('fleet'); // fleet, deliveries, finance, safety
  const [loading, setLoading] = useState(true);
  const [fleetData, setFleetData] = useState(null);
  const [deliveryData, setDeliveryData] = useState(null);
  const [financeData, setFinanceData] = useState(null);
  const [safetyData, setSafetyData] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, [activeTab]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      if (activeTab === 'fleet' && !fleetData) {
        const res = await axios.get('/api/analytics/fleet');
        setFleetData(res.data.data);
      } else if (activeTab === 'deliveries' && !deliveryData) {
        const res = await axios.get('/api/analytics/deliveries');
        setDeliveryData(res.data.data);
      } else if (activeTab === 'finance' && !financeData) {
        const res = await axios.get('/api/analytics/finance');
        setFinanceData(res.data.data);
      } else if (activeTab === 'safety' && !safetyData) {
        const res = await axios.get('/api/analytics/safety');
        setSafetyData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshCurrent = async () => {
    setLoading(true);
    try {
      if (activeTab === 'fleet') {
        const res = await axios.get('/api/analytics/fleet');
        setFleetData(res.data.data);
      } else if (activeTab === 'deliveries') {
        const res = await axios.get('/api/analytics/deliveries');
        setDeliveryData(res.data.data);
      } else if (activeTab === 'finance') {
        const res = await axios.get('/api/analytics/finance');
        setFinanceData(res.data.data);
      } else if (activeTab === 'safety') {
        const res = await axios.get('/api/analytics/safety');
        setSafetyData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to refresh analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Operational Analytics & Insights</h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
            Real-time business intelligence calculated directly from operational records.
          </p>
        </div>
        <button className="btn btn-outline" onClick={refreshCurrent} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh Data
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', gap: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('fleet')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'fleet' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'fleet' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'fleet' ? 600 : 500,
            cursor: 'pointer'
          }}
        >
          <Truck size={18} /> Fleet Composition
        </button>

        <button
          onClick={() => setActiveTab('deliveries')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'deliveries' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'deliveries' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'deliveries' ? 600 : 500,
            cursor: 'pointer'
          }}
        >
          <Package size={18} /> Delivery Fulfillment
        </button>

        <button
          onClick={() => setActiveTab('finance')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'finance' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'finance' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'finance' ? 600 : 500,
            cursor: 'pointer'
          }}
        >
          <DollarSign size={18} /> Financial & Fuel Trends
        </button>

        <button
          onClick={() => setActiveTab('safety')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'safety' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'safety' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'safety' ? 600 : 500,
            cursor: 'pointer'
          }}
        >
          <ShieldAlert size={18} /> Safety & Incidents
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="card" style={{ padding: '2rem' }}>
          <SkeletonLoader count={4} height={120} />
        </div>
      ) : (
        <>
          {/* 1. Fleet Analytics */}
          {activeTab === 'fleet' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
              <div className="card">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem' }}>Vehicle Operational Status</h3>
                {!fleetData?.statusDistribution || fleetData.statusDistribution.length === 0 ? (
                  <EmptyState icon={Truck} title="No Fleet Data" message="No active vehicles registered to render status distribution." />
                ) : (
                  <div style={{ height: 320, width: '100%' }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={fleetData.statusDistribution}
                          dataKey="count"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {fleetData.statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="card">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem' }}>Vehicle Types Breakdown</h3>
                {!fleetData?.typeDistribution || fleetData.typeDistribution.length === 0 ? (
                  <EmptyState icon={Truck} title="No Fleet Types" message="Add vehicles to view classification counts." />
                ) : (
                  <div style={{ height: 320, width: '100%' }}>
                    <ResponsiveContainer>
                      <BarChart data={fleetData.typeDistribution}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis dataKey="type" stroke="var(--text-muted)" fontSize={12} />
                        <YAxis stroke="var(--text-muted)" fontSize={12} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" name="Vehicles" fill="#2563EB" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. Delivery Analytics */}
          {activeTab === 'deliveries' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
              <div className="card" style={{ gridColumn: '1 / -1' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem' }}>Delivery Fulfillment Pipeline</h3>
                {!deliveryData?.statusCounts || deliveryData.statusCounts.length === 0 ? (
                  <EmptyState icon={Package} title="No Deliveries Yet" message="Create dispatches and delivery orders to track fulfillment metrics." />
                ) : (
                  <div style={{ height: 360, width: '100%' }}>
                    <ResponsiveContainer>
                      <BarChart data={deliveryData.statusCounts} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis type="number" stroke="var(--text-muted)" fontSize={12} allowDecimals={false} />
                        <YAxis type="category" dataKey="status" stroke="var(--text-muted)" fontSize={12} width={100} />
                        <Tooltip />
                        <Bar dataKey="count" name="Packages / Stops" fill="#10B981" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. Financial Analytics */}
          {activeTab === 'finance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                <div className="card">
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem' }}>Fuel Cost Evolution ($)</h3>
                  {!financeData?.fuelTrends || financeData.fuelTrends.length === 0 ? (
                    <EmptyState icon={DollarSign} title="No Fuel Records" message="Log fuel refills to chart monthly fuel expenditure." />
                  ) : (
                    <div style={{ height: 300, width: '100%' }}>
                      <ResponsiveContainer>
                        <AreaChart data={financeData.fuelTrends}>
                          <defs>
                            <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                          <XAxis dataKey="period" stroke="var(--text-muted)" fontSize={12} />
                          <YAxis stroke="var(--text-muted)" fontSize={12} />
                          <Tooltip formatter={(val) => `$${val.toLocaleString()}`} />
                          <Area type="monotone" dataKey="totalCost" name="Total Fuel Cost" stroke="#2563EB" fillOpacity={1} fill="url(#colorCost)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                <div className="card">
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem' }}>Expenses by Category</h3>
                  {!financeData?.expensesByCategory || financeData.expensesByCategory.length === 0 ? (
                    <EmptyState icon={DollarSign} title="No Expenses Logged" message="Approved expenses will be categorized here." />
                  ) : (
                    <div style={{ height: 300, width: '100%' }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={financeData.expensesByCategory}
                            dataKey="amount"
                            nameKey="category"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={95}
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {financeData.expensesByCategory.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(val) => `$${val.toLocaleString()}`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>

              <div className="card">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem' }}>Maintenance Expenditure Trends</h3>
                {!financeData?.maintenanceTrends || financeData.maintenanceTrends.length === 0 ? (
                  <EmptyState icon={DollarSign} title="No Maintenance History" message="Complete maintenance work orders to record expenditure trends." />
                ) : (
                  <div style={{ height: 280, width: '100%' }}>
                    <ResponsiveContainer>
                      <BarChart data={financeData.maintenanceTrends}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis dataKey="period" stroke="var(--text-muted)" fontSize={12} />
                        <YAxis stroke="var(--text-muted)" fontSize={12} />
                        <Tooltip formatter={(val) => `$${val.toLocaleString()}`} />
                        <Bar dataKey="totalCost" name="Maintenance Costs ($)" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. Safety Analytics */}
          {activeTab === 'safety' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
              <div className="card">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem' }}>Incident Severity Breakdown</h3>
                {!safetyData?.severityDistribution || safetyData.severityDistribution.length === 0 ? (
                  <EmptyState icon={ShieldAlert} title="Zero Safety Incidents" message="No incidents on record for this fleet." />
                ) : (
                  <div style={{ height: 320, width: '100%' }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={safetyData.severityDistribution}
                          dataKey="count"
                          nameKey="severity"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {safetyData.severityDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="card">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem' }}>Incident Resolution Status</h3>
                {!safetyData?.statusDistribution || safetyData.statusDistribution.length === 0 ? (
                  <EmptyState icon={ShieldAlert} title="No Incident Statuses" message="All fleet activities are safe and unhindered." />
                ) : (
                  <div style={{ height: 320, width: '100%' }}>
                    <ResponsiveContainer>
                      <BarChart data={safetyData.statusDistribution}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis dataKey="status" stroke="var(--text-muted)" fontSize={12} />
                        <YAxis stroke="var(--text-muted)" fontSize={12} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" name="Incidents" fill="#EF4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
