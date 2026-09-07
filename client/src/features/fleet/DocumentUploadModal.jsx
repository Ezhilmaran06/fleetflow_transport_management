import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';

const DocumentUploadModal = ({ isOpen, onClose, onUploaded, initialOwnerType = 'VEHICLE', initialOwnerId = '' }) => {
  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState('VEHICLE_INSURANCE');
  const [ownerType, setOwnerType] = useState(initialOwnerType);
  const [ownerId, setOwnerId] = useState(initialOwnerId);
  const [documentNumber, setDocumentNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      axiosClient.get('/vehicles?limit=100').then((res) => setVehicles(res.data)).catch(() => {});
      axiosClient.get('/drivers?limit=100').then((res) => setDrivers(res.data)).catch(() => {});
      setOwnerType(initialOwnerType);
      setOwnerId(initialOwnerId);
    }
  }, [isOpen, initialOwnerType, initialOwnerId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      showToast('Please select a file to upload', 'warning');
      return;
    }
    if (!ownerId) {
      showToast('Please select the associated vehicle or driver', 'warning');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('documentFile', file);
    formData.append('title', title);
    formData.append('documentType', documentType);
    formData.append('ownerType', ownerType);
    formData.append('ownerId', ownerId);
    formData.append('documentNumber', documentNumber);
    formData.append('expiryDate', expiryDate);
    formData.append('notes', notes);

    try {
      await axiosClient.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast('Document uploaded and compliance logged', 'success');
      onUploaded();
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ff-modal-overlay">
      <div className="ff-modal" style={{ maxWidth: 540 }}>
        <div className="ff-modal-header">
          <h5 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>Upload Compliance Document</h5>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="ff-modal-body">
            <div className="mb-3">
              <label className="ff-form-label">Document Title *</label>
              <input
                type="text"
                required
                className="ff-form-control"
                placeholder="e.g. Commercial Fleet Insurance Policy 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="ff-form-label">Owner Category *</label>
                <select
                  className="ff-form-control"
                  value={ownerType}
                  onChange={(e) => {
                    setOwnerType(e.target.value);
                    setOwnerId('');
                  }}
                >
                  <option value="VEHICLE">Vehicle Asset</option>
                  <option value="DRIVER">Driver Operator</option>
                  <option value="COMPANY">Company / Enterprise</option>
                </select>
              </div>

              <div className="col-6">
                <label className="ff-form-label">Associated Entity *</label>
                {ownerType === 'VEHICLE' ? (
                  <select
                    required
                    className="ff-form-control"
                    value={ownerId}
                    onChange={(e) => setOwnerId(e.target.value)}
                  >
                    <option value="">Select Vehicle...</option>
                    {vehicles.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.registrationNumber} ({v.make} {v.model})
                      </option>
                    ))}
                  </select>
                ) : ownerType === 'DRIVER' ? (
                  <select
                    required
                    className="ff-form-control"
                    value={ownerId}
                    onChange={(e) => setOwnerId(e.target.value)}
                  >
                    <option value="">Select Driver...</option>
                    {drivers.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.firstName} {d.lastName} ({d.licenseNumber})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input type="text" className="ff-form-control" disabled value="Current Tenant" />
                )}
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="ff-form-label">Document Type *</label>
                <select
                  className="ff-form-control"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                >
                  <option value="VEHICLE_INSURANCE">Vehicle Insurance</option>
                  <option value="VEHICLE_REGISTRATION">Vehicle Registration</option>
                  <option value="ROAD_PERMIT">Road Transport Permit</option>
                  <option value="FITNESS_CERT">Roadworthiness / Fitness Cert</option>
                  <option value="POLLUTION_CERT">Pollution / Emissions Cert</option>
                  <option value="DRIVER_LICENSE">Driver Commercial License</option>
                  <option value="CONTRACT">Contract / Agreement</option>
                  <option value="INSPECTION_REPORT">Inspection Report</option>
                  <option value="OTHER">Other Compliance Document</option>
                </select>
              </div>

              <div className="col-6">
                <label className="ff-form-label">Policy / Document #</label>
                <input
                  type="text"
                  className="ff-form-control"
                  placeholder="POL-88219"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="ff-form-label">Expiration Date *</label>
              <input
                type="date"
                required
                className="ff-form-control"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="ff-form-label">Upload File (PDF, PNG, JPG) *</label>
              <input
                type="file"
                required
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                className="ff-form-control"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>

            <div className="mb-2">
              <label className="ff-form-label">Compliance Notes</label>
              <textarea
                rows="2"
                className="ff-form-control"
                placeholder="Insurer name, policy limitations, coverage amounts..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="ff-modal-footer">
            <button type="button" className="ff-btn ff-btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="ff-btn ff-btn-primary" disabled={loading}>
              <Upload size={15} />
              {loading ? 'Uploading File...' : 'Upload & Verify'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentUploadModal;
