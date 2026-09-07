import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Fuel, Wrench, Receipt, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { SkeletonChart } from '../../components/common/SkeletonLoader';
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

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

const CostAnalysisPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinanceAnalytics = async () => {
      setLoading(true);
      try {
        const res = await axiosClient.get('/analytics/finance');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFinanceAnalytics();
  }, []);

  return (
    <div>
      <div className="mb-3">
        <Link to="/expenses" className="ff-btn ff-btn-outline ff-btn-sm">
          <ArrowLeft size={14} /> Back to Expenses
        </Link>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <div className="d-flex align-items-center gap-2">
            <TrendingUp size={22} color="var(--ff-primary)" />
            <h2 style={{ fontSize: '1.45rem', margin: 0, fontWeight: 800 }}>
              Operational Cost & Expenditure Analysis
            </h2>
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Empirical financial aggregates derived from fuel records, maintenance bills, and approved claims
          </span>
        </div>
      </div>

      {loading ? (
        <div className="row g-3">
          <div className="col-12 col-md-6"><SkeletonChart /></div>
          <div className="col-12 col-md-6"><SkeletonChart /></div>
        </div>
      ) : (
        <div className="row g-4">
          {/* Expenses by Category */}
          <div className="col-12 col-lg-6">
            <div className="ff-card h-100">
              <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>Approved Expenses by Category</h5>
              {!data?.expensesByCategory || data.expensesByCategory.length === 0 ? (
                <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No approved expenses to analyze.
                </div>
              ) : (
                <div style={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.expensesByCategory}
                        dataKey="amount"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label={({ category, amount }) => `${category}: $${amount}`}
                      >
                        {data.expensesByCategory.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Monthly Fuel Trends */}
          <div className="col-12 col-lg-6">
            <div className="ff-card h-100">
              <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>Fuel Expenditure by Month</h5>
              {!data?.fuelTrends || data.fuelTrends.length === 0 ? (
                <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No historical fuel records available.
                </div>
              ) : (
                <div style={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.fuelTrends}>
                      <XAxis dataKey="period" stroke="var(--text-muted)" fontSize={12} />
                      <YAxis stroke="var(--text-muted)" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }} />
                      <Bar dataKey="totalCost" name="Fuel Cost ($)" fill="var(--ff-primary)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostAnalysisPage;
