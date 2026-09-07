import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Search, AlertTriangle, ShieldCheck, BatteryCharging, Gauge } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../../components/common/StatusBadge';
import IntegrationNotice from '../../components/common/IntegrationNotice';
import EmptyState from '../../components/common/EmptyState';

const LiveTrackingPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        const res = await axiosClient.get('/vehicles?limit=100');
        setVehicles(res.data);
        if (res.data.length > 0) {
          setSelectedVehicle(res.data[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.registrationNumber.toLowerCase().includes(search.toLowerCase()) ||
      v.make.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 style={{ fontSize: '1.45rem', margin: 0, fontWeight: 800 }}>Fleet Telematics & Live Tracking</h2>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Hardware GPS telematics feeds and vehicle location monitoring
          </span>
        </div>
      </div>

      {vehicles.length === 0 && !loading ? (
        <div className="ff-card">
          <EmptyState
            icon={Truck}
            title="No Fleet Vehicles Available"
            description="Register vehicles in your fleet workspace to track telematics and hardware status."
            actionLabel="Add Vehicle"
            onAction={() => (window.location.href = '/vehicles?action=create')}
          />
        </div>
      ) : (
        <div className="row g-3">
          {/* Left Column: Vehicle List */}
          <div className="col-12 col-md-4 col-xl-3">
            <div className="ff-card p-2" style={{ height: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '8px 6px 12px' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="ff-form-control"
                    placeholder="Search vehicle..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ paddingLeft: 32 }}
                  />
                  <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: 11 }} />
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto' }}>
                {filteredVehicles.map((v) => (
                  <div
                    key={v._id}
                    onClick={() => setSelectedVehicle(v)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor:
                        selectedVehicle?._id === v._id ? 'var(--bg-surface-elevated)' : 'transparent',
                      border:
                        selectedVehicle?._id === v._id
                          ? '1px solid var(--ff-primary)'
                          : '1px solid transparent',
                      marginBottom: 6,
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{v.registrationNumber}</span>
                      <StatusBadge status={v.status} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {v.make} {v.model} • {v.type}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center Column: Map Workspace */}
          <div className="col-12 col-md-8 col-xl-6">
            <div
              className="ff-card p-0"
              style={{
                height: 'calc(100vh - 180px)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {/* Background map mockup pattern */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0.12,
                  backgroundImage:
                    'radial-gradient(var(--ff-primary) 1px, transparent 1px), radial-gradient(var(--ff-primary) 1px, var(--bg-surface) 1px)',
                  backgroundSize: '24px 24px'
                }}
              />
              <div style={{ position: 'relative', zIndex: 1, padding: 20, maxWidth: 540, textAlign: 'center' }}>
                <IntegrationNotice
                  feature="Hardware GPS Telematics"
                  message="No external GPS hardware unit (Geotab / Samsara / Teltonika) is linked to this workspace. FleetFlow adheres to strict data integrity and never fabricates synthetic GPS coordinates or artificial map markers."
                />
              </div>
            </div>
          </div>

          {/* Right Column: Selected Vehicle Telematics Details */}
          <div className="col-12 col-xl-3">
            <div className="ff-card" style={{ height: 'calc(100vh - 180px)', overflowY: 'auto' }}>
              {selectedVehicle ? (
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
                        {selectedVehicle.registrationNumber}
                      </h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.year})
                      </span>
                    </div>
                    <StatusBadge status={selectedVehicle.status} />
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 14, marginBottom: 14 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>
                      Telematics & Diagnostics
                    </div>
                    <div className="d-flex justify-content-between py-1" style={{ fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Odometer:</span>
                      <span style={{ fontWeight: 600 }}>{selectedVehicle.mileage?.toLocaleString() || 0} km</span>
                    </div>
                    <div className="d-flex justify-content-between py-1" style={{ fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Fuel Level:</span>
                      <span style={{ fontWeight: 600 }}>{selectedVehicle.fuelLevel || 100}%</span>
                    </div>
                    <div className="d-flex justify-content-between py-1" style={{ fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Fuel Type:</span>
                      <span style={{ fontWeight: 600 }}>{selectedVehicle.fuelType}</span>
                    </div>
                    <div className="d-flex justify-content-between py-1" style={{ fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Payload Capacity:</span>
                      <span style={{ fontWeight: 600 }}>{selectedVehicle.capacityKg} kg</span>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 14 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>
                      Assigned Operator
                    </div>
                    {selectedVehicle.assignedDriver ? (
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                          {selectedVehicle.assignedDriver.firstName} {selectedVehicle.assignedDriver.lastName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Phone: {selectedVehicle.assignedDriver.phone}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        No driver assigned to this vehicle
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: 40 }}>
                  Select a vehicle to inspect telematics
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveTrackingPage;
