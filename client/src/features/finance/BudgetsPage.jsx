import React, { useState, useEffect } from 'react';
import { PiggyBank, Plus, X, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';

const BudgetsPage = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [department, setDepartment] = useState('OPERATIONS');
  const [period, setPeriod] = useState('ANNUAL');
  const [year, setYear] = useState(new Date().getFullYear());
  const [allocatedAmount, setAllocatedAmount] = useState(50000);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/budgets?year=${year}`);
      setBudgets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [year]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axiosClient.post('/budgets', { department, period, year, allocatedAmount });
      showToast('Department budget allocated', 'success');
      setShowModal(false);
      fetchBudgets();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2">
            <PiggyBank size={22} color="var(--ff-primary)" />
            <h2 style={{ fontSize: '1.45rem', margin: 0, fontWeight: 800 }}>Department Operational Budgets</h2>
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Year {year} spending allowances compared against real-time approved expenses
          </span>
        </div>

        <button className="ff-btn ff-btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Allocate Budget
        </button>
      </div>

      {loading ? (
        <div className="row g-3">
          {[1, 2, 3].map((i) => (
            <div className="col-12 col-md-4" key={i}>
              <SkeletonCard />
            </div>
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <div className="ff-card">
          <EmptyState
            icon={PiggyBank}
            title="No Department Budgets Configured"
            description="Establish department budget caps (Operations, Fleet, Maintenance, Fuel, Safety) to track burn rates."
            actionLabel="Allocate Budget"
            onAction={() => setShowModal(true)}
          />
        </div>
      ) : (
        <div className="row g-3">
          {budgets.map((b) => (
            <div className="col-12 col-md-6 col-xl-4" key={b._id}>
              <div className="ff-card h-100 p-4">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>{b.department}</span>
                  <span className="ff-badge ff-badge-secondary">{b.period}</span>
                </div>

                <div className="d-flex justify-content-between align-items-baseline mt-3 mb-2">
                  <span style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--ff-primary)' }}>
                    ${b.actualSpent?.toLocaleString() || 0}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    of ${b.allocatedAmount?.toLocaleString()}
                  </span>
                </div>

                {/* Progress bar */}
                <div
                  style={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'var(--border-color)',
                    overflow: 'hidden',
                    marginBottom: 12
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(100, b.utilization || 0)}%`,
                      height: '100%',
                      backgroundColor: (b.utilization || 0) > 90 ? 'var(--ff-danger)' : (b.utilization || 0) > 75 ? 'var(--ff-warning)' : 'var(--ff-success)'
                    }}
                  />
                </div>

                <div className="d-flex justify-content-between" style={{ fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Remaining:</span>
                  <span style={{ fontWeight: 700, color: b.remaining <= 0 ? 'var(--ff-danger)' : 'var(--text-main)' }}>
                    ${b.remaining?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="ff-modal-overlay">
          <div className="ff-modal" style={{ maxWidth: 460 }}>
            <div className="ff-modal-header">
              <h5 style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem' }}>Allocate Department Budget</h5>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="ff-modal-body">
                <div className="mb-3">
                  <label className="ff-form-label">Department *</label>
                  <select className="ff-form-control" value={department} onChange={(e) => setDepartment(e.target.value)}>
                    <option value="OPERATIONS">Operations & Logistics</option>
                    <option value="FLEET">Fleet Assets</option>
                    <option value="MAINTENANCE">Maintenance & Repairs</option>
                    <option value="FUEL">Fuel Purchasing</option>
                    <option value="SAFETY">Safety & Compliance</option>
                    <option value="GENERAL">General Administration</option>
                  </select>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="ff-form-label">Period</label>
                    <select className="ff-form-control" value={period} onChange={(e) => setPeriod(e.target.value)}>
                      <option value="ANNUAL">Annual</option>
                      <option value="QUARTERLY">Quarterly</option>
                      <option value="MONTHLY">Monthly</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="ff-form-label">Fiscal Year</label>
                    <input
                      type="number"
                      required
                      className="ff-form-control"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-2">
                  <label className="ff-form-label">Allocated Amount ($) *</label>
                  <input
                    type="number"
                    required
                    className="ff-form-control"
                    value={allocatedAmount}
                    onChange={(e) => setAllocatedAmount(e.target.value)}
                  />
                </div>
              </div>
              <div className="ff-modal-footer">
                <button type="button" className="ff-btn ff-btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="ff-btn ff-btn-primary" disabled={submitting}>
                  {submitting ? 'Allocating...' : 'Save Allocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetsPage;
