import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, Search, ShieldX, SlidersHorizontal, QrCode, ScanLine, Loader2, X, Filter, Trash2, AlertTriangle, Users } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const statusConfig = {
  PENDING:    { color: 'var(--clr-warning)', bg: 'rgba(210,153,34,0.1)',   dot: 'var(--clr-warning)' },
  APPROVED:   { color: 'var(--clr-success)', bg: 'rgba(63,185,80,0.1)', dot: 'var(--clr-success)' },
  CONFIRMED:  { color: 'var(--clr-success)', bg: 'rgba(63,185,80,0.1)', dot: 'var(--clr-success)' },
  CHECKED_IN: { color: 'var(--clr-primary)', bg: 'rgba(88,166,255,0.1)', dot: 'var(--clr-primary)' },
  REJECTED:   { color: 'var(--clr-danger)', bg: 'rgba(248,81,73,0.1)',         dot: 'var(--clr-danger)' },
  CANCELLED:  { color: 'var(--clr-text-muted)', bg: 'rgba(139,148,158,0.1)',    dot: 'var(--clr-text-muted)' },
};

export function AdminBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('PENDING');
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [rejectModal, setRejectModal] = useState({ open: false, booking: null, reason: '' });
  const [approveModal, setApproveModal] = useState({ open: false, booking: null });
  const [cancelModal, setCancelModal] = useState({ open: false, booking: null, reason: '' });
  const [scannerModal, setScannerModal] = useState({ open: false, processing: false, feedback: null, scannedBooking: null });
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filtered = bookings.filter(b => {
    let statusGroup = b.status;
    if (b.status === 'CONFIRMED' || b.status === 'APPROVED') statusGroup = 'APPROVED';
    if (b.status === 'REJECTED' || b.status === 'CANCELLED') statusGroup = 'DECLINED';
    
    if (statusGroup !== activeTab) return false;
    
    const s = search.toLowerCase();
    if (s && !b.resourceId.toLowerCase().includes(s) && !b.userId.toLowerCase().includes(s) && !`BKG-${b.id}`.toLowerCase().includes(s)) return false;
    
    if (filterDate && b.startTime.split('T')[0] !== filterDate) return false;
    return true;
  });

  const handleStatusChange = async (id, status, reason = '') => {
    try {
      const token = localStorage.getItem('token');
      const url = `/api/bookings/${id}/status?status=${status}` + (reason ? `&rejectReason=${encodeURIComponent(reason)}` : '');
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) fetchBookings();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleCheckIn = async (qrToken) => {
    setScannerModal(prev => ({ ...prev, processing: true, feedback: 'Validating token...' }));
    const authToken = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/bookings/check-in?token=${qrToken}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setScannerModal(prev => ({ 
          ...prev, 
          feedback: `Success! Checked-in User`, 
          processing: false,
          scannedBooking: data 
        }));
        fetchBookings();
      } else {
        throw new Error(data.message || 'Check-in failed');
      }
    } catch (err) {
      setScannerModal(prev => ({ ...prev, feedback: `Error: ${err.message}`, processing: false }));
    }
  };

  useEffect(() => {
    if (scannerModal.open) {
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
      scanner.render((decodedText) => {
        scanner.clear();
        handleCheckIn(decodedText);
      }, (error) => {
        // scanner noise
      });
      return () => { try { scanner.clear(); } catch(e){} };
    }
  }, [scannerModal.open]);

  const pendingCount = bookings.filter(b => b.status === 'PENDING').length;
  const approvedCount = bookings.filter(b => b.status === 'APPROVED' || b.status === 'CONFIRMED').length;
  const checkedInCount = bookings.filter(b => b.status === 'CHECKED_IN').length;
  const declinedCount = bookings.filter(b => b.status === 'REJECTED' || b.status === 'CANCELLED').length;

  if (loading && bookings.length === 0) return (
    <div className="admin-loading">
      <div className="spinner"></div>
      <p>Loading administration data...</p>
      <style>{`
        .admin-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; gap: 16px; color: var(--clr-text-muted); }
        .spinner { width: 32px; height: 32px; border: 3px solid var(--clr-border); border-top-color: var(--clr-primary); border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );

  return (
    <div className="admin-bookings-container">
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

      <header className="admin-header">
        <div className="header-text">
          <h1>Booking Dashboard</h1>
          <p>Review, approve, and manage workspace reservations.</p>
        </div>
        <button onClick={() => setScannerModal({ open: true, processing: false, feedback: null })} className="btn btn-primary">
          <ScanLine size={18} /> Scan QR Check-in
        </button>
      </header>

      <div className="admin-toolbar glass-card">
        <div className="tabs">
          {[
            { id: 'PENDING', label: 'Pending', count: pendingCount, color: 'var(--clr-warning)' },
            { id: 'APPROVED', label: 'Approved', count: approvedCount, color: 'var(--clr-success)' },
            { id: 'CHECKED_IN', label: 'Checked In', count: checkedInCount, color: 'var(--clr-primary)' },
            { id: 'DECLINED', label: 'Declined/Cancelled', count: declinedCount, color: 'var(--clr-danger)' }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.label}
              <span className="count-badge" style={{ backgroundColor: tab.color + '20', color: tab.color }}>{tab.count}</span>
            </button>
          ))}
        </div>

        <div className="filters">
          <div className="search-box">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search bookings..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="date-filter">
            <Calendar size={16} />
            <input 
              type="date" 
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
            />
          </div>
          {(search || filterDate) && (
            <button onClick={() => { setSearch(''); setFilterDate(''); }} className="clear-btn">
              <X size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state glass-card">
          <SlidersHorizontal size={48} className="empty-icon" />
          <h3>No bookings found</h3>
          <p>Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="admin-grid">
          {filtered.map(booking => {
            const status = statusConfig[booking.status] || statusConfig.PENDING;
            const startDate = new Date(booking.startTime);
            const endDate = new Date(booking.endTime);
            
            return (
              <div key={booking.id} className="admin-card glass-card">
                <div className="card-top">
                  <span className="booking-id">ID: {booking.id.toString().slice(-6).toUpperCase()}</span>
                  <span className="status-badge" style={{ color: status.color, backgroundColor: status.bg }}>
                    <span className="status-dot" style={{ backgroundColor: status.dot }}></span>
                    {booking.status}
                  </span>
                </div>

                <div className="card-body">
                  <h3 className="resource-title">{booking.resourceId}</h3>
                  <div className="user-info">
                    <div className="user-avatar">{booking.userName?.charAt(0).toUpperCase() || 'U'}</div>
                    <div className="user-meta-small">
                      <span className="user-name-small">{booking.userName || 'Unknown User'}</span>
                      <span className="user-email-small">{booking.userEmail}</span>
                    </div>
                  </div>

                  <div className="time-details">
                    <div className="detail-row">
                      <Calendar size={14} /> <span>{startDate.toLocaleDateString()}</span>
                    </div>
                    <div className="detail-row">
                      <Clock size={14} /> <span>{startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="detail-row">
                      <Users size={14} /> <span>{booking.attendees} attendees</span>
                    </div>
                    <div className="purpose-text-small">{booking.purpose}</div>
                    {(booking.status === 'REJECTED' || booking.status === 'CANCELLED') && booking.rejectReason && (
                      <div className="reason-text-small mt-2" style={{ color: 'var(--clr-danger)', fontSize: '12px', background: 'rgba(248,81,73,0.1)', padding: '6px 10px', borderRadius: '6px', borderLeft: '2px solid var(--clr-danger)' }}>
                        <strong>Reason:</strong> {booking.rejectReason}
                      </div>
                    )}
                  </div>
                </div>

                <div className="card-footer">
                  {booking.status === 'PENDING' && (
                    <div className="action-buttons">
                      <button onClick={() => setApproveModal({ open: true, booking })} className="btn-action approve">
                        <CheckCircle size={16} /> Approve
                      </button>
                      <button onClick={() => setRejectModal({ open: true, booking, reason: '' })} className="btn-action reject">
                        <XCircle size={16} /> Reject
                      </button>
                    </div>
                  )}
                  {(booking.status === 'APPROVED' || booking.status === 'CONFIRMED') && (
                    <button onClick={() => setCancelModal({ open: true, booking, reason: '' })} className="btn btn-ghost btn-sm w-full">
                      <ShieldX size={14} /> Cancel Approval
                    </button>
                  )}
                  {booking.status === 'CHECKED_IN' && (
                    <div className="check-in-info">
                      <CheckCircle size={14} className="text-success" />
                      <span>Checked-in: {new Date(booking.checkedInAt).toLocaleTimeString()}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Approve Modal */}
      {approveModal.open && (
        <div className="modal-overlay" onClick={() => setApproveModal({ open: false, booking: null })}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Approval</h3>
              <button onClick={() => setApproveModal({ open: false, booking: null })} className="close-btn"><X size={20} /></button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to approve the booking for <strong>{approveModal.booking?.resourceId}</strong>?</p>
              <p style={{ fontSize: '13px', color: 'var(--clr-text-muted)' }}>An email confirmation will be sent to the user.</p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setApproveModal({ open: false, booking: null })} className="btn btn-ghost">Cancel</button>
              <button 
                onClick={() => {
                  handleStatusChange(approveModal.booking.id, 'APPROVED');
                  setApproveModal({ open: false, booking: null });
                }} 
                className="btn btn-success"
              >
                Confirm Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="modal-overlay" onClick={() => setRejectModal({ open: false, booking: null, reason: '' })}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reject Booking</h3>
              <button onClick={() => setRejectModal({ open: false, booking: null, reason: '' })} className="close-btn"><X size={20} /></button>
            </div>
            <div className="modal-body">
              <p>Reason for rejecting <strong>{rejectModal.booking?.resourceId}</strong>:</p>
              <textarea 
                value={rejectModal.reason}
                onChange={e => setRejectModal(m => ({ ...m, reason: e.target.value }))}
                placeholder="Enter rejection reason..."
                className="form-control"
              />
            </div>
            <div className="modal-footer">
              <button onClick={() => setRejectModal({ open: false, booking: null, reason: '' })} className="btn btn-ghost">Cancel</button>
              <button 
                onClick={() => {
                  handleStatusChange(rejectModal.booking.id, 'REJECTED', rejectModal.reason);
                  setRejectModal({ open: false, booking: null, reason: '' });
                }} 
                className="btn btn-danger"
                disabled={!rejectModal.reason.trim()}
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {cancelModal.open && (
        <div className="modal-overlay" onClick={() => setCancelModal({ open: false, booking: null, reason: '' })}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cancel Approved Booking</h3>
              <button onClick={() => setCancelModal({ open: false, booking: null, reason: '' })} className="close-btn"><X size={20} /></button>
            </div>
            <div className="modal-body">
              <p>Reason for cancelling <strong>{cancelModal.booking?.resourceId}</strong>:</p>
              <textarea 
                value={cancelModal.reason}
                onChange={e => setCancelModal(m => ({ ...m, reason: e.target.value }))}
                placeholder="Enter cancellation reason..."
                className="form-control"
              />
              <p style={{ fontSize: '13px', color: 'var(--clr-text-muted)' }}>The user will receive an email about this cancellation.</p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setCancelModal({ open: false, booking: null, reason: '' })} className="btn btn-ghost">Back</button>
              <button 
                onClick={() => {
                  handleStatusChange(cancelModal.booking.id, 'CANCELLED', cancelModal.reason);
                  setCancelModal({ open: false, booking: null, reason: '' });
                }} 
                className="btn btn-danger"
                disabled={!cancelModal.reason.trim()}
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scanner Modal */}
      {scannerModal.open && (
        <div className="modal-overlay" onClick={() => setScannerModal({ open: false, processing: false, feedback: null })}>
          <div className="modal-content scanner-modal glass-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <QrCode size={20} className="text-primary" />
                <h3>Scan Check-in QR</h3>
              </div>
              <button onClick={() => setScannerModal({ open: false, processing: false, feedback: null })} className="close-btn"><X size={20} /></button>
            </div>
            
            <div id="reader" className="scanner-view">
              {scannerModal.processing && (
                <div className="scanner-overlay">
                  <Loader2 size={32} className="animate-spin" />
                  <p>{scannerModal.feedback}</p>
                </div>
              )}
              {scannerModal.feedback && !scannerModal.processing && (
                <div className={`scanner-overlay ${scannerModal.feedback.includes('Error') ? 'error' : 'success'}`}>
                  {scannerModal.feedback.includes('Error') ? <XCircle size={32} /> : <CheckCircle size={32} />}
                  <p>{scannerModal.feedback}</p>
                  
                  {scannerModal.scannedBooking && (
                    <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.5)', padding: '16px', borderRadius: '12px', width: '90%', fontSize: '13px', marginTop: '16px', overflowY: 'auto', maxHeight: '200px' }}>
                      <p style={{ marginBottom: '4px' }}><strong>ID:</strong> BKG-{scannerModal.scannedBooking.id}</p>
                      <p style={{ marginBottom: '4px' }}><strong>Resource:</strong> {scannerModal.scannedBooking.resourceId}</p>
                      <p style={{ marginBottom: '4px' }}><strong>User:</strong> {scannerModal.scannedBooking.userName || scannerModal.scannedBooking.userId}</p>
                      <p style={{ marginBottom: '4px' }}><strong>Time:</strong> {new Date(scannerModal.scannedBooking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(scannerModal.scannedBooking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      <p style={{ marginBottom: '4px' }}><strong>Attendees:</strong> {scannerModal.scannedBooking.attendees}</p>
                      <p style={{ marginBottom: '4px' }}><strong>Purpose:</strong> {scannerModal.scannedBooking.purpose}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="scanner-footer">
              <p>Position the student's QR code within the frame to validate.</p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-bookings-container { max-width: 1400px; margin: 40px auto; padding: 0 24px; }
        .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; flex-wrap: wrap; gap: 20px; }
        .header-text h1 { font-size: 32px; font-weight: 700; margin-bottom: 4px; letter-spacing: -0.5px; }
        .header-text p { color: var(--clr-text-muted); font-size: 15px; }

        .admin-toolbar { padding: 12px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; flex-wrap: wrap; gap: 20px; border-radius: 16px; }
        
        .tabs { display: flex; gap: 8px; background: rgba(0,0,0,0.2); padding: 4px; border-radius: 12px; }
        .tab-btn { 
          display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 8px; 
          font-size: 13px; font-weight: 600; color: var(--clr-text-muted); transition: all 0.2s; border: none; background: none; cursor: pointer;
        }
        .tab-btn.active { background: var(--clr-bg-card); color: var(--clr-text); box-shadow: var(--shadow-sm); }
        .count-badge { font-size: 10px; padding: 1px 6px; border-radius: 10px; font-weight: 700; }

        .filters { display: flex; gap: 12px; align-items: center; }
        .search-box, .date-filter { 
          display: flex; align-items: center; gap: 10px; background: rgba(0,0,0,0.2); 
          padding: 8px 14px; border-radius: 10px; border: 1px solid var(--clr-border);
        }
        .search-box input, .date-filter input { background: none; border: none; color: var(--clr-text); font-size: 13px; outline: none; }
        .clear-btn { background: none; border: none; color: var(--clr-text-muted); font-size: 13px; display: flex; align-items: center; gap: 4px; cursor: pointer; }
        .clear-btn:hover { color: var(--clr-text); }

        .admin-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
        .admin-card { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
        
        .card-top { display: flex; justify-content: space-between; align-items: center; }
        .booking-id { font-size: 10px; font-weight: 700; color: var(--clr-text-faint); }
        .status-badge { display: flex; align-items: center; gap: 6px; font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 20px; }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; }

        .resource-title { font-size: 18px; font-weight: 700; color: var(--clr-text); }
        .user-info { display: flex; align-items: center; gap: 10px; }
        .user-avatar { width: 24px; height: 24px; border-radius: 6px; background: var(--clr-primary); color: #fff; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
        .user-meta-small { display: flex; flex-direction: column; gap: 1px; }
        .user-name-small { font-size: 13px; font-weight: 600; color: var(--clr-text); }
        .user-email-small { font-size: 10px; color: var(--clr-text-faint); }

        .time-details { display: flex; flex-direction: column; gap: 6px; }
        .detail-row { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--clr-text-muted); }
        .purpose-text-small { font-size: 12px; color: var(--clr-text-muted); font-style: italic; margin-top: 4px; padding-left: 10px; border-left: 1px solid var(--clr-border); }

        .card-footer { margin-top: auto; padding-top: 16px; border-top: 1px solid var(--clr-border); }
        .action-buttons { display: flex; gap: 10px; }
        .btn-action { 
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px; border-radius: 10px; 
          font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s;
        }
        .btn-action.approve { background: var(--clr-success); color: #fff; }
        .btn-action.reject { background: rgba(248,81,73,0.1); color: var(--clr-danger); border: 1px solid rgba(248,81,73,0.2); }
        .btn-action:hover { transform: translateY(-2px); }
        
        .btn-success { background: var(--clr-success); color: #fff; border: none; padding: 10px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .btn-success:hover { filter: brightness(1.1); }
        
        .check-in-info { display: flex; align-items: center; gap: 8px; justify-content: center; font-size: 12px; font-weight: 600; color: var(--clr-success); }

        .empty-state { text-align: center; padding: 80px 40px; display: flex; flex-direction: column; align-items: center; gap: 20px; }
        .empty-icon { color: var(--clr-text-faint); margin-bottom: 8px; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .modal-content { width: 100%; max-width: 500px; padding: 32px; display: flex; flex-direction: column; gap: 24px; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; }
        .close-btn { background: none; border: none; color: var(--clr-text-muted); cursor: pointer; }
        .modal-body { display: flex; flex-direction: column; gap: 12px; }
        .modal-footer { display: flex; justify-content: flex-end; gap: 12px; }

        .scanner-modal { max-width: 400px; }
        .scanner-view { 
          width: 100%; aspect-ratio: 1; background: #000; border-radius: 16px; position: relative; overflow: hidden; 
          border: 2px dashed var(--clr-border);
        }
        .scanner-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.7); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; color: #fff; text-align: center; padding: 20px; }
        .scanner-overlay.success { color: var(--clr-success); }
        .scanner-overlay.error { color: var(--clr-danger); }
        .scanner-footer { text-align: center; font-size: 12px; color: var(--clr-text-muted); }
        
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .w-full { width: 100%; }
        .text-success { color: var(--clr-success); }

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
