import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, CheckCircle, AlertCircle, QrCode, X, Search, Filter, Users, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const statusConfig = {
  PENDING:    { color: 'var(--clr-warning)', bg: 'rgba(210,153,34,0.1)',   dot: 'var(--clr-warning)',   icon: AlertCircle },
  APPROVED:   { color: 'var(--clr-success)', bg: 'rgba(63,185,80,0.1)', dot: 'var(--clr-success)', icon: CheckCircle },
  CHECKED_IN: { color: 'var(--clr-primary)', bg: 'rgba(88,166,255,0.1)', dot: 'var(--clr-primary)', icon: CheckCircle },
  REJECTED:   { color: 'var(--clr-danger)', bg: 'rgba(248,81,73,0.1)',         dot: 'var(--clr-danger)',     icon: X },
  CANCELLED:  { color: 'var(--clr-text-muted)', bg: 'rgba(139,148,158,0.1)',    dot: 'var(--clr-text-muted)',    icon: X },
};

export function MyBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrModal, setQrModal] = useState({ open: false, bookingId: null });
  const [qrImage, setQrImage] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);

  const handleOpenQr = async (bookingId) => {
    setQrModal({ open: true, bookingId });
    setQrImage(null);
    setQrLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookings/${bookingId}/qr`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const blob = await response.blob();
        setQrImage(URL.createObjectURL(blob));
      } else {
        console.error('Failed to load QR');
      }
    } catch (error) {
      console.error('Error fetching QR:', error);
    } finally {
      setQrLoading(false);
    }
  };
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      if (!user?.id) return;
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookings/my?userId=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      setBookings(data.sort((a, b) => new Date(b.startTime) - new Date(a.startTime)));
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user?.id]);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookings/${id}/status?status=CANCELLED`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        fetchBookings(); // Refresh data
      }
    } catch (err) {
      console.error('Failed to cancel:', err);
    }
  };

  if (loading) return (
    <div className="loading-state">
      <div className="spinner"></div>
      <p>Loading your bookings...</p>
      <style>{`
        .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; gap: 16px; color: var(--clr-text-muted); }
        .spinner { width: 32px; height: 32px; border: 3px solid var(--clr-border); border-top-color: var(--clr-primary); border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );

  if (error) return (
    <div className="error-state">
      <AlertCircle size={40} />
      <p>Error: {error}</p>
      <button onClick={fetchBookings} className="btn btn-ghost btn-sm">Try Again</button>
      <style>{`
        .error-state { text-align: center; padding: 60px; color: var(--clr-danger); display: flex; flex-direction: column; align-items: center; gap: 16px; background: rgba(248,81,73,0.05); border-radius: 20px; border: 1px solid rgba(248,81,73,0.1); }
      `}</style>
    </div>
  );

  return (
    <div className="my-bookings-container">
      <header className="page-header">
        <div className="header-text">
          <h1 className="page-title">My Bookings</h1>
          <p className="page-subtitle">Track and manage your workspace reservations.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/report-incident')} className="btn btn-ghost border-indigo-100 text-indigo-600">
            <AlertCircle size={18} /> Report Issue
          </button>
          <button onClick={() => navigate('/new-booking')} className="btn btn-primary">
            <Plus size={18} /> New Booking
          </button>
        </div>
      </header>

      <div className="stats-grid">
        {[
          { label: 'Pending', count: bookings.filter(b => b.status === 'PENDING').length, color: 'var(--clr-warning)' },
          { label: 'Approved', count: bookings.filter(b => b.status === 'APPROVED').length, color: 'var(--clr-success)' },
          { label: 'Checked In', count: bookings.filter(b => b.status === 'CHECKED_IN').length, color: 'var(--clr-primary)' },
          { label: 'Total', count: bookings.length, color: 'var(--clr-text)' }
        ].map((stat, i) => (
          <div key={i} className="stat-card glass-card">
            <span className="stat-label">{stat.label}</span>
            <span className="stat-value" style={{ color: stat.color }}>{stat.count}</span>
          </div>
        ))}
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state glass-card">
          <Calendar size={48} className="empty-icon" />
          <h3>No bookings yet</h3>
          <p>You haven't made any workspace reservations. Start by booking a space!</p>
          <button onClick={() => navigate('/new-booking')} className="btn btn-primary">Book Now</button>
        </div>
      ) : (
        <div className="bookings-grid">
          {bookings.map((booking) => {
            const status = statusConfig[booking.status] || statusConfig.PENDING;
            const startDate = new Date(booking.startTime);
            const endDate = new Date(booking.endTime);
            const dateStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const timeRange = `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

            return (
              <div key={booking.id} className="booking-card glass-card">
                <div className="card-header">
                  <span className="booking-id">BKG-{booking.id.toString().slice(-4).toUpperCase()}</span>
                  <span className="status-badge" style={{ color: status.color, backgroundColor: status.bg }}>
                    <span className="status-dot" style={{ backgroundColor: status.dot }}></span>
                    {booking.status}
                  </span>
                </div>

                <h3 className="resource-name">{booking.resourceId}</h3>

                <div className="booking-details">
                  <div className="detail-item">
                    <Calendar size={14} /> <span>{dateStr}</span>
                  </div>
                  <div className="detail-item">
                    <Clock size={14} /> <span>{timeRange}</span>
                  </div>
                  <div className="detail-item">
                    <Users size={14} /> <span>{booking.attendees} attendees</span>
                  </div>
                  <div className="purpose-box">
                    <p className="purpose-text">{booking.purpose}</p>
                  </div>

                  {booking.status === 'REJECTED' && booking.rejectReason && (
                    <div className="reject-reason-box">
                      <p className="reject-label">Admin Feedback</p>
                      <p className="reject-text">{booking.rejectReason}</p>
                    </div>
                  )}
                </div>

                <div className="card-actions">
                  {(booking.status === 'APPROVED' || booking.status === 'CHECKED_IN') && (
                    <button
                      onClick={() => handleOpenQr(booking.id)}
                      className="btn btn-ghost btn-sm btn-qr"
                    >
                      <QrCode size={14} /> Check-in QR
                    </button>
                  )}
                  {(booking.status === 'APPROVED' || booking.status === 'PENDING') && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      className="btn btn-danger btn-sm"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/report-incident', { state: { resourceId: booking.resourceId } })}
                    className="btn btn-ghost btn-sm text-amber-600 hover:bg-amber-50"
                  >
                    <AlertTriangle size={14} /> Report Issue
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Modal */}
      {qrModal.open && (
        <div className="modal-overlay" onClick={() => setQrModal({ open: false, bookingId: null })}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Check-in QR Code</h3>
              <button onClick={() => setQrModal({ open: false, bookingId: null })} className="close-btn"><X size={20} /></button>
            </div>
            
            <div className="qr-container">
              {qrLoading ? (
                <div className="spinner"></div>
              ) : qrImage ? (
                <img 
                  src={qrImage} 
                  alt="Check-in QR" 
                />
              ) : (
                <div style={{ color: 'var(--clr-text-muted)', textAlign: 'center', fontSize: '14px' }}>QR Code not available</div>
              )}
            </div>

            <div className="qr-info">
              <p className="qr-title">Scan at Entrance</p>
              <p className="qr-desc">Show this QR to the administrator to check-in to your reserved space.</p>
            </div>

            <button onClick={() => setQrModal({ open: false, bookingId: null })} className="btn btn-primary w-full">Close</button>
          </div>
        </div>
      )}

      <style>{`
        .my-bookings-container { max-width: 1200px; margin: 40px auto; padding: 0 24px; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; gap: 20px; flex-wrap: wrap; }
        .page-title { font-size: 32px; font-weight: 700; margin-bottom: 4px; letter-spacing: -0.5px; }
        .page-subtitle { color: var(--clr-text-muted); font-size: 15px; }

        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-bottom: 40px; }
        .stat-card { padding: 20px; display: flex; flex-direction: column; gap: 8px; }
        .stat-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: var(--clr-text-muted); }
        .stat-value { font-size: 28px; font-weight: 700; }

        .bookings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
        .booking-card { padding: 24px; display: flex; flex-direction: column; gap: 16px; transition: transform 0.2s; }
        .booking-card:hover { transform: translateY(-4px); }

        .card-header { display: flex; justify-content: space-between; align-items: center; }
        .booking-id { font-size: 11px; font-weight: 700; color: var(--clr-text-faint); background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 4px; }
        .status-badge { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; }

        .resource-name { font-size: 20px; font-weight: 600; color: var(--clr-text); }
        .booking-details { display: flex; flex-direction: column; gap: 8px; }
        .detail-item { display: flex; align-items: center; gap: 8px; color: var(--clr-text-muted); font-size: 14px; }

        .purpose-box { margin-top: 8px; padding-left: 12px; border-left: 2px solid var(--clr-primary); opacity: 0.8; }
        .purpose-text { font-size: 13px; line-height: 1.4; color: var(--clr-text-muted); font-style: italic; }
        
        .reject-reason-box { margin-top: 12px; padding: 12px; background: rgba(248,81,73,0.08); border: 1px solid rgba(248,81,73,0.2); border-radius: 12px; }
        .reject-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--clr-danger); margin-bottom: 4px; }
        .reject-text { font-size: 12px; color: var(--clr-text); line-height: 1.4; }

        .empty-state { text-align: center; padding: 80px 40px; display: flex; flex-direction: column; align-items: center; gap: 20px; }
        .empty-icon { color: var(--clr-text-faint); margin-bottom: 8px; }
        .empty-state h3 { font-size: 24px; }
        .empty-state p { color: var(--clr-text-muted); max-width: 400px; margin-bottom: 12px; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .modal-content { width: 100%; max-width: 400px; padding: 32px; position: relative; display: flex; flex-direction: column; gap: 24px; animation: modalIn 0.3s ease-out; }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        
        .modal-header { display: flex; justify-content: space-between; align-items: center; }
        .close-btn { background: none; border: none; color: var(--clr-text-muted); cursor: pointer; padding: 4px; }
        .close-btn:hover { color: var(--clr-text); }

        .qr-container { background: #fff; padding: 16px; border-radius: 16px; display: flex; align-items: center; justify-content: center; width: 240px; height: 240px; margin: 0 auto; }
        .qr-container img { width: 100%; height: 100%; object-fit: contain; }

        .qr-info { text-align: center; }
        .qr-title { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
        .qr-desc { color: var(--clr-text-muted); font-size: 14px; }
      `}</style>
    </div>
  );
}
