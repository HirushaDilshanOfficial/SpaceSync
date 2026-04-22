import { useState, useEffect } from 'react';
import { resourceApi } from '../../api/resourceApi';

const EMPTY = {
  name: '', type: 'LECTURE_HALL', capacity: '',
  location: '', building: '', status: 'ACTIVE',
  availabilityStart: '08:00', availabilityEnd: '18:00',
  imageUrl: '',
};

const inp = (err) => ({
  width: '100%', boxSizing: 'border-box',
  border: `1.5px solid ${err ? '#e03131' : '#e0e6ed'}`,
  borderRadius: '8px', padding: '9px 13px',
  fontSize: '13px', color: '#1a2a3a', background: '#fff', outline: 'none',
});

const lbl = {
  display: 'block', fontSize: '11px', fontWeight: '700',
  color: '#7a9cc0', marginBottom: '5px',
  textTransform: 'uppercase', letterSpacing: '0.5px',
};

export default function ResourceForm({ initial, onSubmit, onClose }) {
  const [form, setForm]     = useState(initial ?? EMPTY);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => { setForm(initial ?? EMPTY); }, [initial]);

  const set = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())     e.name     = 'Name is required';
    if (!form.location.trim()) e.location = 'Location is required';
    if (!form.building.trim()) e.building = 'Building is required';
    if (form.type !== 'EQUIPMENT' && (!form.capacity || form.capacity < 1))
      e.capacity = 'Capacity is required for this type';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...form,
      capacity: form.type === 'EQUIPMENT' ? null : Number(form.capacity),
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const { data } = await resourceApi.uploadImage(file);
      setForm(f => ({ ...f, imageUrl: data.url }));
    } catch (err) {
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(10,22,40,0.55)',
      zIndex: 1000, display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '16px',
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px', width: '100%',
        maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 24px 64px rgba(10,22,40,0.2)',
      }}>
        {/* Header */}
        <div style={{
          background: '#0a1628', borderRadius: '16px 16px 0 0',
          padding: '20px 24px', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ color: '#fff', fontWeight: '700', fontSize: '16px' }}>
              {initial ? 'Edit Resource' : 'Add New Resource'}
            </div>
            <div style={{ color: '#6a8caa', fontSize: '12px', marginTop: '3px' }}>
              Facilities &amp; Assets Catalogue
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.1)', border: 'none',
            borderRadius: '8px', width: '32px', height: '32px',
            color: '#fff', fontSize: '18px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          <form onSubmit={handleSubmit}>

            <div style={{ marginBottom: '16px' }}>
              <label style={lbl}>Resource Name *</label>
              <input name="name" value={form.name} onChange={set} style={inp(errors.name)} />
              {errors.name && <p style={{ fontSize: '11px', color: '#e03131', margin: '4px 0 0' }}>{errors.name}</p>}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={lbl}>Resource Type *</label>
              <select name="type" value={form.type} onChange={set} style={inp(false)}>
                <option value="LECTURE_HALL">Lecture Hall</option>
                <option value="LAB">Lab</option>
                <option value="MEETING_ROOM">Meeting Room</option>
                <option value="EQUIPMENT">Equipment</option>
                <option value="ROOM">Room</option>
              </select>
            </div>

            {form.type !== 'EQUIPMENT' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={lbl}>Capacity *</label>
                <input type="number" name="capacity" min="1"
                  value={form.capacity} onChange={set} style={inp(errors.capacity)} />
                {errors.capacity && <p style={{ fontSize: '11px', color: '#e03131', margin: '4px 0 0' }}>{errors.capacity}</p>}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div>
                <label style={lbl}>Building *</label>
                <input name="building" value={form.building} onChange={set} style={inp(errors.building)} />
                {errors.building && <p style={{ fontSize: '11px', color: '#e03131', margin: '4px 0 0' }}>{errors.building}</p>}
              </div>
              <div>
                <label style={lbl}>Location *</label>
                <input name="location" value={form.location} onChange={set} style={inp(errors.location)} />
                {errors.location && <p style={{ fontSize: '11px', color: '#e03131', margin: '4px 0 0' }}>{errors.location}</p>}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={lbl}>Status</label>
              <select name="status" value={form.status} onChange={set} style={inp(false)}>
                <option value="ACTIVE">Active</option>
                <option value="OUT_OF_SERVICE">Out of Service</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={lbl}>Resource Image</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {form.imageUrl && (
                  <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e0e6ed' }}>
                    <img src={form.imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    style={{ ...inp(false), padding: '6px' }} 
                  />
                  {uploading && <p style={{ fontSize: '11px', color: '#e8871a', margin: '4px 0 0' }}>Uploading to Cloudinary...</p>}
                </div>
              </div>
              <input 
                name="imageUrl" 
                value={form.imageUrl} 
                onChange={set} 
                placeholder="Or paste image URL here..." 
                style={{ ...inp(false), marginTop: '8px' }} 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
              <div>
                <label style={lbl}>Available From *</label>
                <input type="time" name="availabilityStart" value={form.availabilityStart} onChange={set} style={inp(false)} />
              </div>
              <div>
                <label style={lbl}>Available Until *</label>
                <input type="time" name="availabilityEnd" value={form.availabilityEnd} onChange={set} style={inp(false)} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" onClick={onClose} style={{
                flex: 1, padding: '11px', border: '1.5px solid #e0e6ed',
                borderRadius: '10px', background: '#fff', fontSize: '13px',
                fontWeight: '600', color: '#555', cursor: 'pointer',
              }}>Cancel</button>
              <button type="submit" style={{
                flex: 1, padding: '11px', border: 'none',
                borderRadius: '10px', background: '#e8871a',
                fontSize: '13px', fontWeight: '700', color: '#fff', cursor: 'pointer',
              }}>
                {initial ? 'Save Changes' : 'Create Resource'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}