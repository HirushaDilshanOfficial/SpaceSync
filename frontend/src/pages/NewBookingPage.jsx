import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Loader2, Info, AlertTriangle, X, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export function NewBookingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resources, setResources] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [formData, setFormData] = useState({
    resourceId: location.state?.preselectedResource || '',
    date: '',
    startTime: '',
    endTime: '',
    attendees: '1',
    purpose: ''
  });
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    fetch('/api/v1/resources')
      .then(res => res.json())
      .then(data => setResources(data))
      .catch(err => console.error("Failed to fetch resources:", err));

    const token = localStorage.getItem('token');
    fetch('/api/bookings', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setAllBookings(data))
      .catch(err => console.error("Failed to fetch bookings:", err));
  }, []);

  const parseT = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const hasConflict = () => {
    if (!formData.resourceId || !formData.date || !formData.startTime || !formData.endTime) return false;
    const start = parseT(formData.startTime);
    const end = parseT(formData.endTime);
    
    return allBookings.some(b => {
      if (b.status !== 'APPROVED' && b.status !== 'CONFIRMED') return false;
      if (String(b.resourceId) !== String(formData.resourceId)) return false;
      if (b.startTime.split('T')[0] !== formData.date) return false;
      const bStart = parseT(b.startTime.split('T')[1].substring(0, 5));
      const bEnd = parseT(b.endTime.split('T')[1].substring(0, 5));
      return start < bEnd && end > bStart;
    });
  };

  const conflict = hasConflict();

  const getTodayDateString = () => {
    const today = new Date();
    // Use local timezone instead of strict ISO to avoid shifting issues
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getCurrentTimeString = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  const todayStr = getTodayDateString();
  const nowStr = getCurrentTimeString();

  const handleChange = (e) => {
    const { id, value } = e.target;
    let updates = { [id]: value };
    
    if (id === 'date' && value === todayStr) {
      if (formData.startTime && formData.startTime < nowStr) {
        updates.startTime = nowStr;
      }
    }
    
    if (id === 'startTime' && (formData.date === todayStr || !formData.date)) {
      if (value < nowStr) {
        updates.startTime = nowStr;
        if (!formData.date) updates.date = todayStr;
        setError("Past times cannot be selected for today's date.");
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
      }
    }
    
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShowError(false);
    
    try {
      if (parseInt(formData.attendees, 10) < 1) {
        throw new Error("At least 1 attendee is required.");
      }
      
      if (formData.date < todayStr) {
        throw new Error("Cannot book a workspace for a past date.");
      }
      
      const startTimeMins = parseT(formData.startTime);
      const endTimeMins = parseT(formData.endTime);
      const nowMins = parseT(nowStr);

      if (formData.date === todayStr && startTimeMins < nowMins) {
        throw new Error("Start time cannot be in the past.");
      }

      if (startTimeMins >= endTimeMins) {
        throw new Error("End time must be after the start time.");
      }
      
      const durationMins = endTimeMins - startTimeMins;
      if (durationMins < 30) {
        throw new Error("Booking duration must be at least 30 minutes.");
      }
      if (durationMins > 240) {
        throw new Error("Booking duration cannot exceed 4 hours.");
      }

      // Capacity Validation
      const selectedResource = resources.find(r => r.name === formData.resourceId);
      if (selectedResource && selectedResource.capacity) {
        if (parseInt(formData.attendees, 10) > selectedResource.capacity) {
          throw new Error(`Maximum capacity for ${selectedResource.name} is ${selectedResource.capacity} attendees.`);
        }
      }

      // Operating Hours Validation
      if (selectedResource && selectedResource.availabilityStart && selectedResource.availabilityEnd) {
        const resStartMins = parseT(selectedResource.availabilityStart.substring(0, 5));
        const resEndMins = parseT(selectedResource.availabilityEnd.substring(0, 5));
        
        if (startTimeMins < resStartMins || endTimeMins > resEndMins) {
          throw new Error(`${selectedResource.name} is only available between ${selectedResource.availabilityStart.substring(0, 5)} and ${selectedResource.availabilityEnd.substring(0, 5)}.`);
        }
      }

      const startDateTime = `${formData.date}T${formData.startTime}:00`;
      const endDateTime = `${formData.date}T${formData.endTime}:00`;

      const payload = {
        userId: user?.id || 'USER-001',
        resourceId: formData.resourceId,
        startTime: startDateTime,
        endTime: endDateTime,
        attendees: parseInt(formData.attendees, 10),
        purpose: formData.purpose
      };

      const token = localStorage.getItem('token');
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit booking');
      }

      setSubmitted(true);
      setTimeout(() => navigate('/dashboard'), 1800);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setShowError(true);
      // Auto-hide after 3 seconds
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 24, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ width: 80, height: 80, background: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid #a7f3d0', margin: '0 auto' }}>
          <CheckCircle size={40} color="#059669" />
        </div>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--clr-text)', marginBottom: 12, letterSpacing: '-0.5px' }}>Request Submitted!</h2>
          <p style={{ color: 'var(--clr-text-muted)', fontSize: 16, maxWidth: 360, margin: '0 auto', lineHeight: 1.6 }}>Your booking is now pending admin approval. You'll receive a notification once it's reviewed.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
          {[0,200,400].map(d => <span key={d} style={{ width: 10, height: 10, background: 'var(--clr-primary)', borderRadius: '50%', display: 'inline-block', animation: `bounce 1.4s ${d}ms infinite ease-in-out` }} />)}
        </div>
        <style>{`@keyframes bounce { 0%,80%,100%{transform:scale(0); opacity: 0.3;} 40%{transform:scale(1); opacity: 1;} }`}</style>
      </div>
    );
  }

  return (
    <div className="booking-page-container">
      {/* Custom Timed Notification */}
      <AnimatePresence>
        {showError && (
          <motion.div 
            className="custom-toast error"
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
          >
            <div className="toast-content">
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
            <button className="toast-close" onClick={() => setShowError(false)}>
              <X size={14} />
            </button>
            <div className="toast-progress"></div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="page-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="page-title">Book a Workspace</h1>
        <p className="page-subtitle">Fill in the details to request a workspace reservation.</p>
      </header>

      <div className="booking-card glass-card">
        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-group">
            <label htmlFor="resourceId">Resource / Location <span className="req">*</span></label>
            <select 
              id="resourceId"
              className="form-control" 
              required 
              value={formData.resourceId}
              onChange={handleChange}
            >
              <option value="" disabled>Select a workspace to book</option>
              {resources.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Date <span className="req">*</span></label>
              <input 
                id="date"
                type="date" 
                min={todayStr}
                className="form-control" 
                required 
                value={formData.date}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="startTime">Start Time <span className="req">*</span></label>
              <input 
                id="startTime"
                type="time" 
                min={formData.date === todayStr ? nowStr : undefined}
                className="form-control" 
                required 
                value={formData.startTime}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="endTime">End Time <span className="req">*</span></label>
              <input 
                id="endTime"
                type="time" 
                className="form-control" 
                required 
                value={formData.endTime}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row" style={{ gridTemplateColumns: '1fr 2fr' }}>
            <div className="form-group">
              <label htmlFor="attendees">Expected Attendees <span className="req">*</span></label>
              <input 
                id="attendees"
                type="number" 
                min="1" 
                placeholder="e.g. 8" 
                className="form-control" 
                required 
                value={formData.attendees}
                onChange={handleChange}
              />
            </div>
            <div style={{ visibility: 'hidden' }}></div>
          </div>

          <div className="form-group">
            <label htmlFor="purpose">Purpose of Booking <span className="req">*</span></label>
            <textarea
              id="purpose"
              className="form-control textarea"
              rows={4}
              placeholder="Briefly describe why you need this space..."
              required
              value={formData.purpose}
              onChange={handleChange}
            />
          </div>

          <div className="info-box">
            <Info size={16} />
            <span>Once submitted, an admin will review your request. You'll see the status under <strong>My Bookings</strong>.</span>
          </div>

          {/* Conflict Warning */}
          {conflict && (
            <div className="conflict-warning">
              <XCircle size={16} />
              <span>This time slot overlaps with an already approved booking.</span>
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={() => navigate(-1)} className="btn btn-ghost">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || conflict}
              className="btn btn-primary"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .booking-page-container {
          max-width: 1200px;
          margin: 40px auto;
          padding: 0 24px 80px;
          font-family: 'Inter', sans-serif;
        }
        .page-header { margin-bottom: 40px; }
        .back-btn {
          background: none;
          border: none;
          color: var(--clr-text-muted);
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          padding: 0;
          margin-bottom: 16px;
          transition: all 0.2s;
        }
        .back-btn:hover { color: var(--clr-primary); transform: translateX(-4px); }
        .page-title { font-size: 36px; font-weight: 800; margin-bottom: 8px; letter-spacing: -1.5px; color: var(--clr-text); }
        .page-subtitle { color: var(--clr-text-muted); font-size: 16px; font-weight: 500; }
        
        .booking-card {
          background: #ffffff;
          border: 1px solid var(--clr-border);
          border-radius: 28px;
          padding: 60px;
          box-shadow: var(--shadow-lg);
        }
        .booking-form { display: flex; flex-direction: column; gap: 40px; }
        
        .form-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
        @media (max-width: 900px) { .form-row { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } }
        
        .form-group { display: flex; flex-direction: column; gap: 10px; }
        .form-group label { font-size: 14px; font-weight: 800; color: var(--clr-text); text-transform: uppercase; letter-spacing: 0.5px; }
        .req { color: #ef4444; }
        
        .form-control {
          background: #f8fafc !important;
          border: 1px solid var(--clr-border) !important;
          color: var(--clr-text) !important;
          border-radius: 12px !important;
          padding: 14px 18px !important;
          transition: all 0.2s cubic-bezier(.4,0,.2,1) !important;
          font-family: inherit;
          font-size: 15px !important;
          outline: none !important;
        }
        .form-control:focus {
          border-color: var(--clr-primary) !important;
          box-shadow: 0 0 0 4px rgba(0,48,135,0.08) !important;
          background: #ffffff !important;
        }
        .form-control option { background: #ffffff; color: var(--clr-text); }

        .textarea { min-height: 140px; resize: vertical; line-height: 1.6; }
        
        .info-box {
          display: flex;
          gap: 16px;
          background: #eff6ff;
          border: 1px solid #dbeafe;
          padding: 20px 24px;
          border-radius: 16px;
          color: #1e40af;
          font-size: 14px;
          line-height: 1.6;
          align-items: center;
          font-weight: 500;
        }
        .info-box svg { color: var(--clr-primary); }
        
        .conflict-warning {
          display: flex;
          align-items: center;
          gap: 14px;
          background: #fef2f2;
          border: 1px solid #fee2e2;
          padding: 16px 24px;
          border-radius: 16px;
          color: #dc2626;
          font-size: 14px;
          font-weight: 700;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 16px;
          padding-top: 32px;
          border-top: 1px solid #f1f5f9;
        }
        
        .btn { padding: 14px 36px; border-radius: 12px; font-weight: 800; transition: all 0.3s cubic-bezier(.4,0,.2,1); cursor: pointer; font-size: 15px; border: none; font-family: inherit; }
        .btn-primary { background: var(--grad-primary); color: #ffffff; box-shadow: 0 4px 14px rgba(0,48,135,0.25); }
        .btn-primary:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,48,135,0.35); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .btn-ghost { background: #ffffff; color: var(--clr-text-muted); border: 1px solid var(--clr-border); }
        .btn-ghost:hover { background: #f8fafc; color: var(--clr-primary); border-color: var(--clr-primary); }

        .custom-toast {
          position: fixed; top: 24px; left: 50%; transform: translateX(-50%); z-index: 10000;
          display: flex; align-items: center; gap: 16px; padding: 18px 28px;
          background: #ffffff; border-radius: 16px; color: #dc2626;
          box-shadow: 0 16px 48px rgba(0,0,0,0.15); min-width: 400px; max-width: 90vw;
          justify-content: space-between; border: 1px solid #fee2e2;
        }
        .toast-content { display: flex; align-items: center; gap: 12px; font-size: 15px; font-weight: 800; }
        .toast-close { background: none; border: none; color: #94a3b8; cursor: pointer; padding: 6px; display: flex; }
        .toast-close:hover { color: #dc2626; }
        .toast-progress { position: absolute; bottom: 0; left: 0; height: 4px; background: #ef4444; width: 100%; animation: progress 3s linear forwards; border-bottom-left-radius: 16px; }
        @keyframes progress { from { width: 100%; } to { width: 0%; } }

        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
