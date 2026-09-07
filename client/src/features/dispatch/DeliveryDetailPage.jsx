import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Truck,
  ArrowLeft,
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  Upload,
  User,
  ExternalLink,
  FileCheck
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../../components/common/StatusBadge';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';

const DeliveryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);

  // POD Form State
  const [signedBy, setSignedBy] = useState('');
  const [podNotes, setPodNotes] = useState('');
  const [podFile, setPodFile] = useState(null);
  const [uploadingPod, setUploadingPod] = useState(false);

  const fetchDelivery = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/deliveries/${id}`);
      setDelivery(res.data);
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    fetchDelivery();
  }, [fetchDelivery]);

  const handleUploadPod = async (e) => {
    e.preventDefault();
    if (!podFile) {
      showToast('Please attach a proof photo or document', 'warning');
      return;
    }

    setUploadingPod(true);
    const formData = new FormData();
    formData.append('proofFile', podFile);
    formData.append('signedBy', signedBy);
    formData.append('notes', podNotes);

    try {
      await axiosClient.post(`/deliveries/${delivery._id}/proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast('Proof of Delivery submitted & shipment completed!', 'success');
      setPodFile(null);
      fetchDelivery();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUploadingPod(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await axiosClient.put(`/deliveries/${delivery._id}/status`, { status: newStatus });
      showToast(`Status updated to ${newStatus}`, 'success');
      fetchDelivery();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading && !delivery) return <SkeletonCard />;

  if (!delivery) {
    return (
      <div className="ff-card">
        <EmptyState
          icon={Package}
          title="Delivery Order Not Found"
          description="The requested consignment could not be found in your company database."
          actionLabel="Back to Deliveries"
          onAction={() => navigate('/deliveries')}
        />
      </div>
    );
  }

  const hasPOD = delivery.proofOfDelivery && delivery.proofOfDelivery.fileUrl;

  return (
    <div>
      <div className="mb-3">
        <Link to="/deliveries" className="ff-btn ff-btn-outline ff-btn-sm">
          <ArrowLeft size={14} /> Back to Deliveries
        </Link>
      </div>

      {/* Hero Header */}
      <div className="ff-card mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <h2 style={{ fontSize: '1.45rem', margin: 0, fontWeight: 800 }}>
                Delivery #{delivery.trackingNumber}
              </h2>
              <StatusBadge status={delivery.status} />
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Customer: <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{delivery.customer?.name}</span> • Created {new Date(delivery.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div className="d-flex gap-2">
            {delivery.status === 'PENDING' && (
              <button
                className="ff-btn ff-btn-primary ff-btn-sm"
                onClick={() => handleUpdateStatus('PICKED_UP')}
              >
                Mark Picked Up
              </button>
            )}
            {delivery.status === 'PICKED_UP' && (
              <button
                className="ff-btn ff-btn-primary ff-btn-sm"
                onClick={() => handleUpdateStatus('IN_TRANSIT')}
              >
                Depart Hub (In Transit)
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Shipment Details */}
        <div className="col-12 col-lg-7">
          <div className="ff-card mb-4">
            <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>Route & Addresses</h5>
            <div className="d-flex flex-column gap-3">
              <div style={{ padding: 12, backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Pickup Address
                </span>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: 2 }}>{delivery.pickupAddress}</div>
              </div>

              <div style={{ padding: 12, backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ff-primary)', textTransform: 'uppercase' }}>
                  Dropoff / Consignee Destination
                </span>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: 2 }}>{delivery.dropoffAddress}</div>
              </div>
            </div>
          </div>

          <div className="ff-card mb-4">
            <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>Cargo Specifications</h5>
            <div className="row g-3" style={{ fontSize: '0.85rem' }}>
              <div className="col-6">
                <span style={{ color: 'var(--text-muted)' }}>Description:</span>
                <div style={{ fontWeight: 600 }}>{delivery.packageDetails?.description || 'Freight Cargo'}</div>
              </div>
              <div className="col-3">
                <span style={{ color: 'var(--text-muted)' }}>Total Weight:</span>
                <div style={{ fontWeight: 600 }}>{delivery.packageDetails?.weightKg} kg</div>
              </div>
              <div className="col-3">
                <span style={{ color: 'var(--text-muted)' }}>Pieces:</span>
                <div style={{ fontWeight: 600 }}>{delivery.packageDetails?.pieces} pcs</div>
              </div>
            </div>
          </div>

          {delivery.trip && (
            <div className="ff-card">
              <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 12 }}>Associated Transit Journey</h5>
              <div style={{ fontSize: '0.85rem' }}>
                <div>
                  Trip Number: <Link to={`/trips/${delivery.trip._id}`} style={{ fontWeight: 700 }}>#{delivery.trip.tripNumber}</Link>
                </div>
                <div style={{ color: 'var(--text-muted)', marginTop: 4 }}>
                  {delivery.trip.origin} → {delivery.trip.destination} ({delivery.trip.status})
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Proof of Delivery Upload & Verified Status */}
        <div className="col-12 col-lg-5">
          <div className="ff-card">
            <div className="d-flex align-items-center gap-2 mb-3">
              <FileCheck size={20} color={hasPOD ? 'var(--ff-success)' : 'var(--text-muted)'} />
              <h5 style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>Proof of Delivery (POD)</h5>
            </div>

            {hasPOD ? (
              <div>
                <div
                  style={{
                    backgroundColor: 'var(--ff-success-light)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: 'var(--radius-sm)',
                    padding: 14,
                    marginBottom: 16
                  }}
                >
                  <div className="d-flex align-items-center gap-2" style={{ color: 'var(--ff-success)', fontWeight: 700 }}>
                    <CheckCircle2 size={16} /> Verified Delivered
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    Delivered on: {new Date(delivery.actualDeliveryTime || delivery.proofOfDelivery.timestamp).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Signed by: <strong>{delivery.proofOfDelivery.signedBy}</strong>
                  </div>
                  {delivery.proofOfDelivery.notes && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      Notes: {delivery.proofOfDelivery.notes}
                    </div>
                  )}
                </div>

                <a
                  href={delivery.proofOfDelivery.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ff-btn ff-btn-outline w-100"
                >
                  <ExternalLink size={16} /> View Proof Document / Photo
                </a>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                  Upload delivery bill of lading, signed receipt, or dropoff photo to confirm package delivery.
                </p>

                <form onSubmit={handleUploadPod}>
                  <div className="mb-3">
                    <label className="ff-form-label">Recipient Signature / Received By *</label>
                    <input
                      type="text"
                      required
                      className="ff-form-control"
                      placeholder="e.g. John Miller (Receiving Manager)"
                      value={signedBy}
                      onChange={(e) => setSignedBy(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="ff-form-label">Proof Photo / Scan Document *</label>
                    <input
                      type="file"
                      required
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="ff-form-control"
                      onChange={(e) => setPodFile(e.target.files[0])}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="ff-form-label">Delivery Notes</label>
                    <textarea
                      rows="2"
                      className="ff-form-control"
                      placeholder="Left at loading dock 4, verified intact..."
                      value={podNotes}
                      onChange={(e) => setPodNotes(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="ff-btn ff-btn-primary w-100"
                    disabled={uploadingPod}
                  >
                    <Upload size={16} />
                    {uploadingPod ? 'Uploading Verification...' : 'Submit Proof & Complete Delivery'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDetailPage;
