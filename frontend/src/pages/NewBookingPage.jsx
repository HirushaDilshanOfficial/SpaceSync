import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Loader2, Info, AlertTriangle, X, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export function NewBookingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resources, setResources] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [formData, setFormData] = useState({
    resourceId: '',
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

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShowError(false);
    
    try {
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
      <div className="submit-success-view">
        <div className="success-icon-wrapper">
          <CheckCircle size={40} className="text-success" />
        </div>
        <div className="success-text">
          <h2>Request Submitted!</h2>
          <p>Your booking is now pending admin approval. Redirecting to dashboard...</p>
        </div>
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <style>{`
          .submit-success-view {
            display: flex;
            flex-direction: column;
            items-center: center;
            justify-content: center;
            min-height: 60vh;
            gap: 24px;
            text-align: center;
          }
          .success-icon-wrapper {
            width: 80px;
            height: 80px;
            background: rgba(63, 185, 80, 0.1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto;
            border: 4px solid rgba(63, 185, 80, 0.05);
          }
          .success-text h2 { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
          .success-text p { color: var(--clr-text-muted); font-size: 15px; max-width: 320px; margin: 0 auto; }
          .loading-dots { display: flex; gap: 6px; justify-content: center; margin-top: 8px; }
          .loading-dots span { width: 6px; height: 6px; background: var(--clr-primary); border-radius: 50%; animation: bounce 1.4s infinite ease-in-out; }
          .loading-dots span:nth-child(2) { animation-delay: 0.2s; opacity: 0.7; }
          .loading-dots span:nth-child(3) { animation-delay: 0.4s; opacity: 0.4; }
          @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
        `}</style>
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
                className="form-control" 
                required 
                value={formData.date}
                onChange={handleChange}
              />
            </div>
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
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startTime">Start Time <span className="req">*</span></label>
              <input 
                id="startTime"
                type="time" 
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
          max-width: 800px;
          margin: 40px auto;
          padding: 0 20px;
        }
        .page-header { margin-bottom: 32px; }
        .back-btn {
          background: none;
          border: none;
          color: var(--clr-text-muted);
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          cursor: pointer;
          padding: 0;
          margin-bottom: 12px;
          transition: color 0.2s;
        }
        .back-btn:hover { color: var(--clr-primary); }
        .page-title { font-size: 32px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.5px; }
        .page-subtitle { color: var(--clr-text-muted); font-size: 15px; }
        
        .booking-card { padding: 40px; border-radius: 24px; }
        .booking-form { display: flex; flex-direction: column; gap: 24px; }
        
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } }
        
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-group label { font-size: 14px; font-weight: 600; color: var(--clr-text); }
        .req { color: var(--clr-danger); }
        
        .textarea { min-height: 120px; resize: vertical; }
        
        .info-box {
          display: flex;
          gap: 12px;
          background: rgba(88, 166, 255, 0.08);
          border: 1px solid rgba(88, 166, 255, 0.15);
          padding: 16px;
          border-radius: 12px;
          color: var(--clr-primary);
          font-size: 13px;
          line-height: 1.5;
        }
        .info-box strong { color: var(--clr-text); }
        
        .conflict-warning {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(248, 81, 73, 0.08);
          border: 1px solid rgba(248, 81, 73, 0.15);
          padding: 16px;
          border-radius: 12px;
          color: var(--clr-danger);
          font-size: 13px;
          line-height: 1.5;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding-top: 24px;
          border-top: 1px solid var(--clr-border);
        }
        
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        /* ── Custom Toast ── */
        .custom-toast {
          position: fixed;
          top: 0;
          left: 50%;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          background: rgba(248, 81, 73, 0.95);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(248, 81, 73, 0.2);
          border-radius: 12px;
          color: #fff;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          min-width: 320px;
          max-width: 90vw;
          justify-content: space-between;
        }
        .toast-content { display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 500; }
        .toast-close { background: none; border: none; color: rgba(255,255,255,0.7); cursor: pointer; padding: 4px; display: flex; }
        .toast-close:hover { color: #fff; }
        .toast-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          background: rgba(255,255,255,0.3);
          width: 100%;
          animation: progress 3s linear forwards;
          border-bottom-left-radius: 12px;
        }
        @keyframes progress { from { width: 100%; } to { width: 0%; } }
      `}</style>
    </div>
  );
}
