import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Fuel, Plus, Search, Download, RefreshCw, DollarSign, Gauge } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { SkeletonTable } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import FuelModal from './FuelModal';
import { useToast } from '../../context/ToastContext';

const FuelPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [metadata, setMetadata] = useState({ total: 0, totalPages: 1 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  const fetchFuel = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/fuel', { params: { page, limit: 10 } });
      setRecords(res.data);
      setMetadata(res.metadata || { total: res.data.length, totalPages: 1 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchFuel();
  }, [fetchFuel]);

  const totalVolume = records.reduce((acc, r) => acc + (r.liters || 0), 0);
  const totalCost = records.reduce((acc, r) => acc + (r.cost || 0), 0);
  const avgPrice = totalVolume > 0 ? (totalCost / totalVolume).toFixed(2) : 0;

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2">
            <Fuel size={22} color="var(--ff-primary)" />
            <h2 style={{ fontSize: '1.45rem', margin: 0, fontWeight: 800 }}>Fuel Management & Telemetry</h2>
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Volume metrics, refill costs, and station audit logs
          </span>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button className="ff-btn ff-btn-outline ff-btn-sm" onClick={fetchFuel}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="ff-btn ff-btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Log Refill
          </button>
        </div>
      </div>

      {/* Fuel Quick Metrics */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-4">
          <div className="ff-kpi-card">
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>TOTAL VOLUME LOGGED</span>
            <div className="ff-kpi-val">{totalVolume.toFixed(1)} L</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Across fleet</span>
          </div>
        </div>
        <div className="col-12 col-sm-4">
          <div className="ff-kpi-card">
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>TOTAL EXPENDITURE</span>
            <div className="ff-kpi-val">${totalCost.toLocaleString()}</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fuel purchases</span>
          </div>
        </div>
        <div className="col-12 col-sm-4">
          <div className="ff-kpi-card">
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>AVERAGE PRICE / LITER</span>
            <div className="ff-kpi-val">${avgPrice}</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Calculated average</span>
          </div>
        </div>
      </div>

      {loading ? (
        <SkeletonTable rows={5} />
      ) : records.length === 0 ? (
        <div className="ff-card">
          <EmptyState
            icon={Fuel}
            title="No Fuel Records Logged"
            description="Log fuel purchases and meter readings to track consumption and efficiency."
            actionLabel="Log Fuel Refill"
            onAction={() => setIsModalOpen(true)}
          />
        </div>
      ) : (
        <div className="ff-table-container">
          <table className="ff-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Vehicle</th>
                <th>Driver</th>
                <th>Volume (L)</th>
                <th>Total Cost</th>
                <th>Price / Liter</th>
                <th>Odometer Reading</th>
                <th>Station / Terminal</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r._id}>
                  <td>{new Date(r.date).toLocaleDateString()}</td>
                  <td>
                    {r.vehicle ? (
                      <Link to={`/vehicles/${r.vehicle._id}`} style={{ fontWeight: 600 }}>
                        {r.vehicle.registrationNumber}
                      </Link>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>{r.driver ? `${r.driver.firstName} ${r.driver.lastName}` : 'Direct'}</td>
                  <td style={{ fontWeight: 600 }}>{r.liters} L</td>
                  <td style={{ fontWeight: 700, color: 'var(--ff-primary)' }}>${r.cost.toLocaleString()}</td>
                  <td>${r.pricePerLiter || (r.cost / r.liters).toFixed(2)}</td>
                  <td>{r.odometer?.toLocaleString()} km</td>
                  <td>{r.stationName || 'N/A'}</td>
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

      <FuelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchFuel}
      />
    </div>
  );
};

export default FuelPage;
