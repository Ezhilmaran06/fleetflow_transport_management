import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Receipt, Plus, Search, Filter, Check, X, Download, ExternalLink, RefreshCw } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../../components/common/StatusBadge';
import { SkeletonTable } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import ExpenseModal from './ExpenseModal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [metadata, setMetadata] = useState({ total: 0, totalPages: 1 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const { showToast } = useToast();
  const { hasRole } = useAuth();

  const isFinanceOrAdmin = hasRole('ADMIN', 'FINANCE_MANAGER');

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/expenses', {
        params: { status: statusFilter, category: categoryFilter, page, limit: 10 }
      });
      setExpenses(res.data);
      setMetadata(res.metadata || { total: res.data.length, totalPages: 1 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, page]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleApproveReject = async (expenseId, status) => {
    setProcessingId(expenseId);
    try {
      await axiosClient.put(`/expenses/${expenseId}/approve`, { status });
      showToast(`Expense claim ${status.toLowerCase()}`, 'success');
      fetchExpenses();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const totalApproved = expenses
    .filter((e) => e.status === 'APPROVED')
    .reduce((acc, e) => acc + (e.amount || 0), 0);

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2">
            <Receipt size={22} color="var(--ff-primary)" />
            <h2 style={{ fontSize: '1.45rem', margin: 0, fontWeight: 800 }}>Operating Expense Ledger</h2>
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Driver expenses, receipts, and multi-step finance approval workflow
          </span>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Link to="/budgets" className="ff-btn ff-btn-outline ff-btn-sm">
            Department Budgets
          </Link>
          <button className="ff-btn ff-btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Submit Expense
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="ff-card p-3 mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-5">
            <select
              className="ff-form-control"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All Approval Statuses</option>
              <option value="SUBMITTED">Submitted (Pending Review)</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="col-8 col-md-4">
            <select
              className="ff-form-control"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All Expense Categories</option>
              <option value="TOLL">Highway Toll</option>
              <option value="PARKING">Parking</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="TIRES">Tires</option>
              <option value="INSURANCE">Insurance</option>
              <option value="PERMITS">Permits</option>
              <option value="LODGING">Lodging / Meals</option>
              <option value="MISC">Miscellaneous</option>
            </select>
          </div>

          <div className="col-4 col-md-3 d-flex justify-content-end">
            <button className="ff-btn ff-btn-outline ff-btn-sm" onClick={fetchExpenses} title="Refresh">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <SkeletonTable rows={5} />
      ) : expenses.length === 0 ? (
        <div className="ff-card">
          <EmptyState
            icon={Receipt}
            title={statusFilter !== 'ALL' ? 'No expenses match filter' : 'No expenses filed'}
            description="Submit driver claims, toll receipts, and operational expenses for accounting review."
            actionLabel="Submit Expense"
            onAction={() => setIsModalOpen(true)}
          />
        </div>
      ) : (
        <div className="ff-table-container">
          <table className="ff-table">
            <thead>
              <tr>
                <th>Expense #</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Submitted By</th>
                <th>Date</th>
                <th>Receipt</th>
                <th>Status</th>
                {isFinanceOrAdmin && <th style={{ textAlign: 'right' }}>Finance Approval</th>}
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp._id}>
                  <td style={{ fontWeight: 700 }}>#{exp.expenseNumber}</td>
                  <td>
                    <span className="ff-badge ff-badge-secondary">{exp.category}</span>
                  </td>
                  <td>{exp.description}</td>
                  <td style={{ fontWeight: 700, color: 'var(--ff-primary)' }}>
                    ${exp.amount.toLocaleString()}
                  </td>
                  <td>{exp.submittedBy ? `${exp.submittedBy.firstName} ${exp.submittedBy.lastName}` : 'System'}</td>
                  <td>{new Date(exp.date).toLocaleDateString()}</td>
                  <td>
                    {exp.receiptUrl ? (
                      <a href={exp.receiptUrl} target="_blank" rel="noreferrer" className="ff-btn ff-btn-outline ff-btn-sm">
                        <ExternalLink size={12} /> Receipt
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>None</span>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={exp.status} />
                  </td>
                  {isFinanceOrAdmin && (
                    <td style={{ textAlign: 'right' }}>
                      {exp.status === 'SUBMITTED' ? (
                        <div className="d-inline-flex gap-1">
                          <button
                            className="ff-btn ff-btn-primary ff-btn-sm"
                            style={{ backgroundColor: 'var(--ff-success)' }}
                            disabled={processingId === exp._id}
                            onClick={() => handleApproveReject(exp._id, 'APPROVED')}
                            title="Approve Claim"
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button
                            className="ff-btn ff-btn-outline ff-btn-sm text-danger"
                            disabled={processingId === exp._id}
                            onClick={() => handleApproveReject(exp._id, 'REJECTED')}
                            title="Reject Claim"
                          >
                            <X size={14} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {exp.approvedBy ? `Reviewed by ${exp.approvedBy.firstName}` : 'Reviewed'}
                        </span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {metadata.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center p-3" style={{ borderTop: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Page {metadata.page} of {metadata.totalPages}
              </span>
              <div className="d-flex gap-2">
                <button className="ff-btn ff-btn-outline ff-btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  Previous
                </button>
                <button className="ff-btn ff-btn-outline ff-btn-sm" disabled={page >= metadata.totalPages} onClick={() => setPage(page + 1)}>
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchExpenses}
      />
    </div>
  );
};

export default ExpensesPage;
