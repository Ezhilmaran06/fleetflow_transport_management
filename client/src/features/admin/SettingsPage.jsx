import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Settings, 
  Building2, 
  Globe, 
  DollarSign, 
  Clock, 
  Save, 
  Sliders, 
  BellRing,
  ShieldCheck 
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import SkeletonLoader from '../../components/common/SkeletonLoader';

export default function SettingsPage() {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    companyName: 'FleetFlow Logistics Corp',
    timezone: 'America/New_York',
    currency: 'USD',
    distanceUnit: 'MILES', // MILES, KM
    fuelUnit: 'GALLONS', // GALLONS, LITERS
    documentExpiryNoticeDays: 30,
    maintenanceReminderMileage: 500,
    autoDispatchAllowed: false
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/settings');
      if (res.data.data) {
        setSettings(prev => ({
          ...prev,
          ...res.data.data
        }));
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put('/api/admin/settings', settings);
      showSuccess('System settings updated successfully');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save system settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 880, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Organization &amp; System Settings</h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
            Configure operational regional parameters, measurement units, and compliance threshold triggers.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {loading ? (
        <div className="card" style={{ padding: '2rem' }}>
          <SkeletonLoader count={4} height={80} />
        </div>
      ) : (
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* General Company Information */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={18} /> Company Branding &amp; Identity
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                  Company Name
                </label>
                <input
                  type="text"
                  required
                  value={settings.companyName || ''}
                  onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>
          </div>

          {/* Regional & Measurement Standards */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe size={18} /> Regional &amp; Measurement Standards
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                  Operational Currency
                </label>
                <select
                  value={settings.currency || 'USD'}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                >
                  <option value="USD">USD ($ - US Dollar)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                  <option value="GBP">GBP (£ - British Pound)</option>
                  <option value="CAD">CAD ($ - Canadian Dollar)</option>
                  <option value="INR">INR (₹ - Indian Rupee)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                  Distance Units
                </label>
                <select
                  value={settings.distanceUnit || 'MILES'}
                  onChange={(e) => setSettings({ ...settings, distanceUnit: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                >
                  <option value="MILES">Miles (mi)</option>
                  <option value="KM">Kilometers (km)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                  Fuel Volume Units
                </label>
                <select
                  value={settings.fuelUnit || 'GALLONS'}
                  onChange={(e) => setSettings({ ...settings, fuelUnit: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                >
                  <option value="GALLONS">US Gallons (gal)</option>
                  <option value="LITERS">Liters (L)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                  Default Timezone
                </label>
                <select
                  value={settings.timezone || 'America/New_York'}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                >
                  <option value="America/New_York">Eastern Time (US &amp; Canada)</option>
                  <option value="America/Chicago">Central Time (US &amp; Canada)</option>
                  <option value="America/Denver">Mountain Time (US &amp; Canada)</option>
                  <option value="America/Los_Angeles">Pacific Time (US &amp; Canada)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Paris">Central European Time</option>
                  <option value="Asia/Kolkata">India Standard Time (IST)</option>
                  <option value="UTC">Coordinated Universal Time (UTC)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Compliance & Operational Thresholds */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BellRing size={18} /> Compliance &amp; Notification Thresholds
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                  Document Expiry Advance Alert (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={settings.documentExpiryNoticeDays ?? 30}
                  onChange={(e) => setSettings({ ...settings, documentExpiryNoticeDays: parseInt(e.target.value, 10) || 30 })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Documents expiring within this window will transition to EXPIRING_SOON warning status.
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                  Maintenance Advance Notice (Mileage / Km)
                </label>
                <input
                  type="number"
                  min="50"
                  max="5000"
                  value={settings.maintenanceReminderMileage ?? 500}
                  onChange={(e) => setSettings({ ...settings, maintenanceReminderMileage: parseInt(e.target.value, 10) || 500 })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Triggers service advisory notifications before odometer limit is reached.
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
