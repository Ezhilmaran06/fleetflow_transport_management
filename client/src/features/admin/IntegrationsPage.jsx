import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plug, 
  MapPin, 
  Radio, 
  Mail, 
  Save, 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink,
  Key,
  ShieldCheck 
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import SkeletonLoader from '../../components/common/SkeletonLoader';

export default function IntegrationsPage() {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [integrations, setIntegrations] = useState({
    gpsTelematics: {
      provider: 'GEOTAB',
      apiKey: '',
      enabled: false,
      serverUrl: ''
    },
    mapsProvider: {
      provider: 'MAPBOX',
      apiKey: '',
      enabled: false
    },
    messaging: {
      smsProvider: 'TWILIO',
      twilioSid: '',
      twilioToken: '',
      fromPhone: '',
      smsEnabled: false,
      emailProvider: 'SENDGRID',
      sendgridApiKey: '',
      fromEmail: '',
      emailEnabled: false
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/settings');
      if (res.data.data?.integrations) {
        setIntegrations(prev => ({
          ...prev,
          ...res.data.data.integrations
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
      await axios.put('/api/admin/settings', {
        integrations
      });
      showSuccess('Integration settings updated successfully');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save integrations');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 900, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>External System Integrations</h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
            Configure hardware telematics APIs, mapping raster tokens, and automated dispatch communications.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          <Save size={16} /> {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      {loading ? (
        <div className="card" style={{ padding: '2rem' }}>
          <SkeletonLoader count={4} height={80} />
        </div>
      ) : (
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* 1. GPS Telematics */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 42, height: 42, borderRadius: 8, background: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                  <Radio size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>GPS Telematics &amp; OBD-II Hardware</h3>
                  <p style={{ margin: '0.125rem 0 0', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Connect real OBD-II trackers or fleet telematics gateways (Geotab, Samsara, Verizon Connect).
                  </p>
                </div>
              </div>
              <span 
                className="badge" 
                style={{ 
                  background: integrations.gpsTelematics?.enabled && integrations.gpsTelematics?.apiKey ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                  color: integrations.gpsTelematics?.enabled && integrations.gpsTelematics?.apiKey ? '#10B981' : '#EF4444' 
                }}
              >
                {integrations.gpsTelematics?.enabled && integrations.gpsTelematics?.apiKey ? 'CONNECTED' : 'NOT CONFIGURED'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>Telematics Provider</label>
                <select
                  value={integrations.gpsTelematics?.provider || 'GEOTAB'}
                  onChange={(e) => setIntegrations({
                    ...integrations,
                    gpsTelematics: { ...integrations.gpsTelematics, provider: e.target.value }
                  })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                >
                  <option value="GEOTAB">Geotab MyGeotab API</option>
                  <option value="SAMSARA">Samsara Fleet API</option>
                  <option value="VERIZON_CONNECT">Verizon Connect Reveal</option>
                  <option value="CUSTOM_OBD">Custom MQTT / TCP Hardware Gateway</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>API Secret / Access Token</label>
                <input
                  type="password"
                  placeholder="Enter production API key..."
                  value={integrations.gpsTelematics?.apiKey || ''}
                  onChange={(e) => setIntegrations({
                    ...integrations,
                    gpsTelematics: { ...integrations.gpsTelematics, apiKey: e.target.value }
                  })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(integrations.gpsTelematics?.enabled)}
                    onChange={(e) => setIntegrations({
                      ...integrations,
                      gpsTelematics: { ...integrations.gpsTelematics, enabled: e.target.checked }
                    })}
                    style={{ width: 16, height: 16 }}
                  />
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Enable Real-Time Hardware Telematics Polling</span>
                </label>
              </div>
            </div>
          </div>

          {/* 2. Maps & Spatial Routing */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 42, height: 42, borderRadius: 8, background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
                  <MapPin size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Mapping, Geocoding &amp; Navigation</h3>
                  <p style={{ margin: '0.125rem 0 0', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Map tile layer, address autocomplete, and turn-by-turn routing engine.
                  </p>
                </div>
              </div>
              <span 
                className="badge" 
                style={{ 
                  background: integrations.mapsProvider?.enabled && integrations.mapsProvider?.apiKey ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                  color: integrations.mapsProvider?.enabled && integrations.mapsProvider?.apiKey ? '#10B981' : '#EF4444' 
                }}
              >
                {integrations.mapsProvider?.enabled && integrations.mapsProvider?.apiKey ? 'CONNECTED' : 'NOT CONFIGURED'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>Mapping Engine</label>
                <select
                  value={integrations.mapsProvider?.provider || 'MAPBOX'}
                  onChange={(e) => setIntegrations({
                    ...integrations,
                    mapsProvider: { ...integrations.mapsProvider, provider: e.target.value }
                  })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                >
                  <option value="MAPBOX">Mapbox GL JS</option>
                  <option value="GOOGLE_MAPS">Google Maps Platform</option>
                  <option value="OPENSTREETMAP">OpenStreetMap (Nominatim)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>Public Maps API Token</label>
                <input
                  type="password"
                  placeholder="pk.eyJ1Ijo..."
                  value={integrations.mapsProvider?.apiKey || ''}
                  onChange={(e) => setIntegrations({
                    ...integrations,
                    mapsProvider: { ...integrations.mapsProvider, apiKey: e.target.value }
                  })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(integrations.mapsProvider?.enabled)}
                    onChange={(e) => setIntegrations({
                      ...integrations,
                      mapsProvider: { ...integrations.mapsProvider, enabled: e.target.checked }
                    })}
                    style={{ width: 16, height: 16 }}
                  />
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Enable Live Vector Tile Renders</span>
                </label>
              </div>
            </div>
          </div>

          {/* 3. Dispatch Alerts & Notifications */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 42, height: 42, borderRadius: 8, background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B' }}>
                  <Mail size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>SMS &amp; Email Dispatch Alerts</h3>
                  <p style={{ margin: '0.125rem 0 0', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Customer arrival notifications, Proof of Delivery receipts, and emergency broadcast alerts.
                  </p>
                </div>
              </div>
              <span 
                className="badge" 
                style={{ 
                  background: integrations.messaging?.smsEnabled || integrations.messaging?.emailEnabled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                  color: integrations.messaging?.smsEnabled || integrations.messaging?.emailEnabled ? '#10B981' : '#EF4444' 
                }}
              >
                {integrations.messaging?.smsEnabled || integrations.messaging?.emailEnabled ? 'CONNECTED' : 'NOT CONFIGURED'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>Twilio Account SID</label>
                <input
                  type="text"
                  placeholder="ACxxxxxxxx..."
                  value={integrations.messaging?.twilioSid || ''}
                  onChange={(e) => setIntegrations({
                    ...integrations,
                    messaging: { ...integrations.messaging, twilioSid: e.target.value }
                  })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>SendGrid API Key</label>
                <input
                  type="password"
                  placeholder="SG.xxxxxxxx..."
                  value={integrations.messaging?.sendgridApiKey || ''}
                  onChange={(e) => setIntegrations({
                    ...integrations,
                    messaging: { ...integrations.messaging, sendgridApiKey: e.target.value }
                  })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(integrations.messaging?.smsEnabled)}
                    onChange={(e) => setIntegrations({
                      ...integrations,
                      messaging: { ...integrations.messaging, smsEnabled: e.target.checked }
                    })}
                    style={{ width: 16, height: 16 }}
                  />
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Enable Twilio SMS Dispatches</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(integrations.messaging?.emailEnabled)}
                    onChange={(e) => setIntegrations({
                      ...integrations,
                      messaging: { ...integrations.messaging, emailEnabled: e.target.checked }
                    })}
                    style={{ width: 16, height: 16 }}
                  />
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Enable SendGrid Email Receipts</span>
                </label>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
