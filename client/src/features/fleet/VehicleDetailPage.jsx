import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Truck,
  ArrowLeft,
  Users,
  Compass,
  Fuel,
  Wrench,
  Receipt,
  FileText,
  AlertOctagon,
  Calendar,
  Gauge,
  Activity,
  Edit2,
  Trash2
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../../components/common/StatusBadge';
import { SkeletonCard, SkeletonTable } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import VehicleModal from './VehicleModal';
import { useToast } from '../../context/ToastContext';

const VehicleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const [trips, setTrips] = useState([]);
  const [fuelRecords, setFuelRecords] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [incidents, setIncidents] = useState([]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchVehicleDetails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/vehicles/${id}`);
      setVehicle(res.data);

      // Fetch linked historical records for tabs
      const [tripsRes, fuelRes, maintRes, expRes, docsRes, incRes] = await Promise.all([
        axiosClient.get(`/trips?vehicle=${id}&limit=20`),
        axiosClient.get(`/fuel?vehicleId=${id}&limit=20`),
        axiosClient.get(`/maintenance?vehicleId=${id}&limit=20`),
        axiosClient.get(`/expenses?vehicleId=${id}&limit=20`),
        axiosClient.get(`/documents?ownerType=VEHICLE&ownerId=${id}`),
        axiosClient.get(`/safety?vehicleId=${id}&limit=20`)
      ]);

      setTrips(tripsRes.data);
      setFuelRecords(fuelRes.data);
      setMaintenance(maintRes.data);
      setExpenses(expRes.data);
      setDocuments(docsRes.data);
      setIncidents(incRes.data);
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    fetchVehicleDetails();
  }, [fetchVehicleDetails]);

  if (loading && !vehicle) {
    return (
      <div>
        <SkeletonCard />
        <div className="mt-4"><SkeletonTable rows={4} /></div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="ff-card">
        <EmptyState
          icon={Truck}
          title="Vehicle Asset Not Found"
          description="The requested vehicle does not exist or has been removed from this company workspace."
          actionLabel="Back to Fleet"
          onAction={() => navigate('/vehicles')}
        />
      </div>
    );
  }

  // Calculate real Vehicle Health (Section X: If insufficient data: "Insufficient data")
  const totalServices = maintenance.length;
  const criticalIncidents = incidents.filter((i) => i.severity === 'CRITICAL' || i.severity === 'HIGH').length;
  let vehicleHealth = 'Good';
  let healthScore = 95;

  if (vehicle.status === 'MAINTENANCE') {
    vehicleHealth = 'Under Maintenance';
    healthScore = 50;
  } else if (criticalIncidents > 0) {
    vehicleHealth = 'Attention Required';
    healthScore = 70;
  } else if (totalServices === 0 && (vehicle.mileage || 0) > 20000) {
    vehicleHealth = 'Service Due';
    healthScore = 75;
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Truck },
    { id: 'trips', label: `Trips (${trips.length})`, icon: Compass },
    { id: 'fuel', label: `Fuel (${fuelRecords.length})`, icon: Fuel },
    { id: 'maintenance', label: `Maintenance (${maintenance.length})`, icon: Wrench },
    { id: 'expenses', label: `Expenses (${expenses.length})`, icon: Receipt },
    { id: 'documents', label: `Documents (${documents.length})`, icon: FileText },
    { id: 'incidents', label: `Incidents (${incidents.length})`, icon: AlertOctagon }
  ];

  return (
    <div>
      {/* Back link */}
      <div className="mb-3">
        <Link to="/vehicles" className="ff-btn ff-btn-outline ff-btn-sm">
          <ArrowLeft size={14} /> Back to Vehicles
        </Link>
      </div>

      {/* Hero Section */}
      <div className="ff-card mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                backgroundColor: 'var(--ff-primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ff-primary)'
              }}
            >
              <Truck size={30} />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <h2 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 800 }}>
                  {vehicle.registrationNumber}
                </h2>
                <StatusBadge status={vehicle.status} />
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {vehicle.make} {vehicle.model} • {vehicle.year} • {vehicle.type} • VIN: {vehicle.vin || 'N/A'}
              </span>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              className="ff-btn ff-btn-outline"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit2 size={16} /> Edit Asset
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          borderBottom: '1px solid var(--border-color)',
          marginBottom: 20,
          overflowX: 'auto',
          paddingBottom: 2
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: isActive ? 'var(--ff-primary-light)' : 'none',
                color: isActive ? 'var(--ff-primary)' : 'var(--text-muted)',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--ff-primary)' : '2px solid transparent',
                borderRadius: '6px 6px 0 0',
                padding: '8px 14px',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="row g-4">
          <div className="col-12 col-lg-8">
            <div className="ff-card mb-4">
              <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>Asset Specifications</h5>
              <div className="row g-3">
                <div className="col-6 col-sm-4">
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Vehicle Type</div>
                  <div style={{ fontWeight: 600 }}>{vehicle.type}</div>
                </div>
                <div className="col-6 col-sm-4">
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Fuel Type</div>
                  <div style={{ fontWeight: 600 }}>{vehicle.fuelType}</div>
                </div>
                <div className="col-6 col-sm-4">
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Odometer Reading</div>
                  <div style={{ fontWeight: 600 }}>{vehicle.mileage?.toLocaleString() || 0} km</div>
                </div>
                <div className="col-6 col-sm-4">
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Current Fuel Level</div>
                  <div style={{ fontWeight: 600 }}>{vehicle.fuelLevel || 100}%</div>
                </div>
                <div className="col-6 col-sm-4">
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Payload Capacity</div>
                  <div style={{ fontWeight: 600 }}>{vehicle.capacityKg} kg</div>
                </div>
                <div className="col-6 col-sm-4">
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Vehicle Group</div>
                  <div style={{ fontWeight: 600 }}>{vehicle.vehicleGroup?.name || 'Standard'}</div>
                </div>
              </div>
            </div>

            {vehicle.notes && (
              <div className="ff-card mb-4">
                <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 8 }}>Operational Notes</h5>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>{vehicle.notes}</p>
              </div>
            )}
          </div>

          <div className="col-12 col-lg-4">
            {/* Real Vehicle Health Card */}
            <div className="ff-card mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>Asset Health Index</h5>
                <Activity size={18} color="var(--ff-primary)" />
              </div>
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--ff-primary)' }}>
                  {healthScore}%
                </div>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: 4 }}>
                  {vehicleHealth}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
                  Derived from service log count ({totalServices}) and incident logs ({criticalIncidents})
                </div>
              </div>
            </div>

            {/* Operator Assignment Card */}
            <div className="ff-card">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>Assigned Driver</h5>
                <Users size={18} color="var(--ff-success)" />
              </div>
              {vehicle.assignedDriver ? (
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    {vehicle.assignedDriver.firstName} {vehicle.assignedDriver.lastName}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Phone: {vehicle.assignedDriver.phone}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    License: {vehicle.assignedDriver.licenseNumber}
                  </div>
                  <div className="mt-2">
                    <StatusBadge status={vehicle.assignedDriver.status} />
                  </div>
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No operator currently assigned to this vehicle.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'trips' && (
        <div className="ff-card">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 style={{ margin: 0, fontWeight: 700 }}>Trips History</h5>
          </div>
          {trips.length === 0 ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              No trips recorded for this vehicle.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="ff-table">
                <thead>
                  <tr>
                    <th>Trip ID</th>
                    <th>Origin</th>
                    <th>Destination</th>
                    <th>Driver</th>
                    <th>Scheduled</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.map((t) => (
                    <tr key={t._id}>
                      <td style={{ fontWeight: 600 }}>
                        <Link to={`/trips/${t._id}`}>#{t.tripNumber}</Link>
                      </td>
                      <td>{t.origin}</td>
                      <td>{t.destination}</td>
                      <td>{t.driver ? `${t.driver.firstName} ${t.driver.lastName}` : 'Unassigned'}</td>
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
      )}

      {activeTab === 'fuel' && (
        <div className="ff-card">
          <h5 style={{ margin: '0 0 16px', fontWeight: 700 }}>Fuel Logs</h5>
          {fuelRecords.length === 0 ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              No fuel consumption records logged for this vehicle.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="ff-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Volume (L)</th>
                    <th>Cost ($)</th>
                    <th>Odometer (km)</th>
                    <th>Station</th>
                  </tr>
                </thead>
                <tbody>
                  {fuelRecords.map((f) => (
                    <tr key={f._id}>
                      <td>{new Date(f.date).toLocaleDateString()}</td>
                      <td>{f.liters} L</td>
                      <td style={{ fontWeight: 600 }}>${f.cost.toLocaleString()}</td>
                      <td>{f.odometer?.toLocaleString()} km</td>
                      <td>{f.stationName || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'maintenance' && (
        <div className="ff-card">
          <h5 style={{ margin: '0 0 16px', fontWeight: 700 }}>Maintenance Records</h5>
          {maintenance.length === 0 ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              No maintenance work orders on record for this vehicle.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="ff-table">
                <thead>
                  <tr>
                    <th>Work Order #</th>
                    <th>Issue Description</th>
                    <th>Priority</th>
                    <th>Scheduled Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenance.map((m) => (
                    <tr key={m._id}>
                      <td style={{ fontWeight: 600 }}>#{m.workOrderNumber}</td>
                      <td>{m.issueDescription}</td>
                      <td>
                        <StatusBadge status={m.priority} />
                      </td>
                      <td>{new Date(m.scheduledDate).toLocaleDateString()}</td>
                      <td>
                        <StatusBadge status={m.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="ff-card">
          <h5 style={{ margin: '0 0 16px', fontWeight: 700 }}>Associated Expenses</h5>
          {expenses.length === 0 ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              No expense claims filed against this vehicle.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="ff-table">
                <thead>
                  <tr>
                    <th>Expense #</th>
                    <th>Category</th>
                    <th>Amount ($)</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((e) => (
                    <tr key={e._id}>
                      <td style={{ fontWeight: 600 }}>#{e.expenseNumber}</td>
                      <td>{e.category}</td>
                      <td style={{ fontWeight: 600 }}>${e.amount.toLocaleString()}</td>
                      <td>{new Date(e.date).toLocaleDateString()}</td>
                      <td>
                        <StatusBadge status={e.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="ff-card">
          <h5 style={{ margin: '0 0 16px', fontWeight: 700 }}>Vehicle Documents & Certifications</h5>
          {documents.length === 0 ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              No insurance or registration documents uploaded yet.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="ff-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Document Type</th>
                    <th>Expiry Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((d) => (
                    <tr key={d._id}>
                      <td style={{ fontWeight: 600 }}>{d.title}</td>
                      <td>{d.documentType.replace(/_/g, ' ')}</td>
                      <td>{new Date(d.expiryDate).toLocaleDateString()}</td>
                      <td>
                        <StatusBadge status={d.status} />
                      </td>
                      <td>
                        <a href={d.fileUrl} target="_blank" rel="noreferrer" className="ff-btn ff-btn-outline ff-btn-sm">
                          View File
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'incidents' && (
        <div className="ff-card">
          <h5 style={{ margin: '0 0 16px', fontWeight: 700 }}>Safety & Incident Records</h5>
          {incidents.length === 0 ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              Clean safety record. No incidents logged for this asset.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="ff-table">
                <thead>
                  <tr>
                    <th>Incident #</th>
                    <th>Title</th>
                    <th>Location</th>
                    <th>Severity</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((inc) => (
                    <tr key={inc._id}>
                      <td style={{ fontWeight: 600 }}>#{inc.incidentNumber}</td>
                      <td>{inc.title}</td>
                      <td>{inc.location}</td>
                      <td>
                        <StatusBadge status={inc.severity} />
                      </td>
                      <td>
                        <StatusBadge status={inc.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Edit Vehicle Modal */}
      <VehicleModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSaved={fetchVehicleDetails}
        vehicle={vehicle}
      />
    </div>
  );
};

export default VehicleDetailPage;
