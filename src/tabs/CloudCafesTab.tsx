import React, { useState } from 'react';
import { useAppContext, type CloudCafe } from '../context/AppContext';
import { Plus, X, MapPin, Navigation } from 'lucide-react';
import { RowActions } from '../components/RowActions';
import { ImagePreviewModal } from '../components/ImagePreviewModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

export const CloudCafesTab: React.FC = () => {
  const { cloudCafes, addCloudCafe, updateCloudCafe, deleteCloudCafe, toggleCafeStatus } = useAppContext();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<CloudCafe | null>(null);

  // Image preview state
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Wizard state
  const [step, setStep] = useState(1);
  const [location, setLocation] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pin_code, setPinCode] = useState('');
  const [name, setName] = useState('');
  const [uniqueCode, setUniqueCode] = useState('');

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLat(latitude);
        setLng(longitude);
        setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          if (res.ok) {
            const data = await res.json();
            const addr = data.address;
            if (addr) {
              setArea(addr.suburb || addr.neighbourhood || addr.village || '');
              setCity(addr.city || addr.town || addr.county || '');
              setState(addr.state || '');
              setPinCode(addr.postcode || '');
            }
          }
        } catch (err) {
          console.error('Geocoding error', err);
        }
        
        setLocationLoading(false);
      },
      (error) => {
        alert('Unable to retrieve your location. Please allow location access and try again.');
        setLocationLoading(false);
        console.error(error);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleNext = () => setStep((s) => s + 1);
  const resetForm = () => {
    setStep(1);
    setLocation('');
    setLat(null);
    setLng(null);
    setName('');
    setUniqueCode('');
    setArea('');
    setCity('');
    setState('');
    setPinCode('');
    setIsWizardOpen(false);
    setEditingId(null);
  };

  const openAdd = () => {
    resetForm();
    setIsWizardOpen(true);
  };

  const openEdit = (cafe: CloudCafe) => {
    setEditingId(cafe.id);
    setName(cafe.cafe_name);
    setUniqueCode(cafe.cafe_unique_id);
    setLat(cafe.latitude);
    setLng(cafe.longitude);
    setArea(cafe.area);
    setCity(cafe.city);
    setState(cafe.state);
    setPinCode(cafe.pin_code);
    setStep(1);
    setIsWizardOpen(true);
  };

  const handleSave = () => {
    const data = {
      latitude: lat || 0,
      longitude: lng || 0,
      area,
      city,
      state,
      pin_code,
      cafe_name: name,
      cafe_unique_id: uniqueCode,
    };
    if (editingId) {
      updateCloudCafe(editingId, data);
    } else {
      addCloudCafe(data);
    }
    resetForm();
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteCloudCafe(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Cloud Cafes</h1>
        <button className="btn-primary" onClick={openAdd}>
          <Plus size={18} /> Add Cafe
        </button>
      </div>

      <div className="card table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Unique Code</th>
              <th>Open</th>
              <th style={{ width: 48 }}></th>
            </tr>
          </thead>
          <tbody>
            {cloudCafes.map((cafe) => (
              <tr key={cafe.id}>
                <td>{cafe.cafe_name}</td>
                <td>{cafe.city}, {cafe.state}</td>
                <td>{cafe.cafe_unique_id}</td>
                <td>
                  <div
                    className={`toggle-track ${cafe.status === 'open' ? 'on' : 'off'}`}
                    onClick={() => toggleCafeStatus(cafe.id)}
                  >
                    <span className="toggle-knob" />
                  </div>
                </td>
                <td>
                  <RowActions
                    onEdit={() => openEdit(cafe)}
                    onDelete={() => setDeleteTarget(cafe)}
                  />
                </td>
              </tr>
            ))}
            {cloudCafes.length === 0 && (
              <tr className="empty-state">
                <td colSpan={6}>
                  No cafes found. Click "Add Cafe" to start.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Image Preview */}
      {previewImage && (
        <ImagePreviewModal src={previewImage} onClose={() => setPreviewImage(null)} />
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <DeleteConfirmModal
          title="Delete Cloud Cafe"
          message={`Are you sure you want to delete "${deleteTarget.cafe_name}"? This action cannot be undone.`}
          onCancel={() => setDeleteTarget(null)}
          onDelete={handleDeleteConfirm}
        />
      )}

      {/* Add/Edit Wizard */}
      {isWizardOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h2 className="modal-title">{editingId ? 'Edit Cloud Cafe' : 'Add Cloud Cafe'}</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={resetForm}>
                <X size={24} color="var(--color-text-secondary)" />
              </button>
            </div>

            <div className="wizard-steps">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`wizard-step-dot ${step >= s ? 'active' : ''}`} />
              ))}
            </div>

            <div className="modal-body">
              {step === 1 && (
                <div>
                  <div className="form-group">
                    <label className="form-label">Cafe Location</label>
                    <input
                      className="form-input"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Search your location or enter coordinates"
                    />
                  </div>
                  <div className="form-group">
                    <button
                      type="button"
                      className="btn-location"
                      onClick={handleGetLocation}
                      disabled={locationLoading}
                    >
                      <Navigation size={16} />
                      {locationLoading ? 'Getting Location...' : 'Get Current Location'}
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Area</label>
                      <input className="form-input" value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. Downtown" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">City</label>
                      <input className="form-input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. New York" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">State</label>
                      <input className="form-input" value={state} onChange={(e) => setState(e.target.value)} placeholder="e.g. NY" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Pin Code</label>
                      <input className="form-input" value={pin_code} onChange={(e) => setPinCode(e.target.value)} placeholder="e.g. 10001" />
                    </div>
                  </div>
                  <div className="map-placeholder">
                    {lat && lng ? (
                      <div style={{ textAlign: 'center' }}>
                        <MapPin size={24} color="var(--color-primary)" />
                        <div style={{ marginTop: 8, fontSize: 13, fontWeight: 500 }}>
                          Lat: {lat.toFixed(6)}, Lng: {lng.toFixed(6)}
                        </div>
                        <div style={{ marginTop: 4, fontSize: 12, color: 'var(--color-text-secondary)' }}>
                          Location pinned successfully
                        </div>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <MapPin size={24} color="var(--color-text-secondary)" />
                        <div style={{ marginTop: 8 }}>Click "Get Current Location" to pin on map</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="form-group">
                  <label className="form-label">Cafe Name</label>
                  <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="ZNow Central" />
                </div>
              )}

              {step === 3 && (
                <div className="form-group">
                  <label className="form-label">Unique Code</label>
                  <input className="form-input" value={uniqueCode} onChange={(e) => setUniqueCode(e.target.value)} placeholder="ZN-001" />
                </div>
              )}


            </div>

            <div className="modal-footer">
              {step > 1 && (
                <button className="btn-secondary" onClick={() => setStep((s) => s - 1)}>
                  Back
                </button>
              )}
              {step < 3 ? (
                <button className="btn-primary" onClick={handleNext} disabled={(step === 1 && (!area || !city || !state || !pin_code)) || (step === 2 && !name)}>
                  Next
                </button>
              ) : (
                <button className="btn-primary" onClick={handleSave} disabled={!uniqueCode}>
                  {editingId ? 'Save Changes' : 'Save Cafe'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
