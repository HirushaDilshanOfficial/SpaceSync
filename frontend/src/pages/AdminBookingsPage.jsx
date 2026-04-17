import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, CheckCircle, XCircle, Search, AlertTriangle, ShieldX, SlidersHorizontal, QrCode, ScanLine, Loader2, X } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const statusConfig = {
  PENDING:    { color: 'text-amber-700 bg-amber-50 border-amber-200',   dot: 'bg-amber-400' },
  APPROVED:   { color: 'text-emerald-700 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-400' },
  CONFIRMED:  { color: 'text-emerald-700 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-400' }, // Map CONFIRMED same as APPROVED
  CHECKED_IN: { color: 'text-indigo-700 bg-indigo-50 border-indigo-200', dot: 'bg-indigo-400' },
  REJECTED:   { color: 'text-red-700 bg-red-50 border-red-200',         dot: 'bg-red-400' },
  CANCELLED:  { color: 'text-gray-500 bg-gray-50 border-gray-200',      dot: 'bg-gray-300' },
};

const parseTime = (t) => {
  const [time, period] = t.trim().split(' ');
  let [h, m] = time.split(':').map(Number);
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return h * 60 + m;
};

const toHHMM = (mins) => `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

const hasConflict = (b, all) => {
  if (b.status !== 'PENDING') return false;
  const bS = parseTime(b.startTime), bE = parseTime(b.endTime);
  return all.some(o => {
    if (o.id === b.id || o.status !== 'APPROVED' || o.resource !== b.resource || o.date !== b.date) return false;
    return bS < parseTime(o.endTime) && parseTime(o.startTime) < bE;
  });
};

const inputClass = "h-10 px-3 text-sm text-gray-700 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all placeholder:text-gray-400 w-full";

const TAB_STYLES = {
  active: 'bg-white text-gray-900 font-semibold shadow-sm border border-gray-200',
  inactive: 'text-gray-500 hover:text-gray-700',
};

export function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('PENDING');
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterTime, setFilterTime] = useState('');
  const [rejectModal, setRejectModal] = useState({ open: false, booking: null, reason: '' });
  const [scannerModal, setScannerModal] = useState({ open: false, processing: false, feedback: null });

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/bookings');
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filtered = bookings.filter(b => {
    // Map CONFIRMED to APPROVED for UI tabs if needed
    const status = (b.status === 'CONFIRMED' || b.status === 'APPROVED') ? 'APPROVED' : b.status;
    if (status !== activeTab && b.status !== activeTab) return false;
    
    const s = search.toLowerCase();
    if (s && !b.resourceId.toLowerCase().includes(s) && !b.userId.toLowerCase().includes(s) && !`BKG-${b.id}`.toLowerCase().includes(s)) return false;
    
    if (filterDate && b.startTime.split('T')[0] !== filterDate) return false;
    return true;
  });

  const handleStatusChange = async (id, status) => {
    try {
      const response = await fetch(`http://localhost:8080/api/bookings/${id}/status?status=${status}`, {
        method: 'PATCH',
      });
      if (response.ok) fetchBookings();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleCheckIn = async (token) => {
    setScannerModal(prev => ({ ...prev, processing: true, feedback: 'Validating token...' }));
    try {
      const response = await fetch(`http://localhost:8080/api/bookings/check-in?token=${token}`, {
        method: 'POST',
      });
      const data = await response.json();
      
      if (response.ok) {
        setScannerModal(prev => ({ ...prev, feedback: `Success! Checked-in ${data.userId}`, processing: false }));
        setTimeout(() => {
          setScannerModal({ open: false, processing: false, feedback: null });
          fetchBookings();
        }, 2000);
      } else {
        throw new Error(data.message || 'Check-in failed');
      }
    } catch (err) {
      setScannerModal(prev => ({ ...prev, feedback: `Error: ${err.message}`, processing: false }));
    }
  };

  const openReject = (booking) => setRejectModal({ open: true, booking, reason: '' });

  const confirmReject = () => {
    if (!rejectModal.reason.trim()) return;
    handleStatusChange(rejectModal.booking.id, 'REJECTED');
    setRejectModal({ open: false, booking: null, reason: '' });
  };

  useEffect(() => {
    if (scannerModal.open) {
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
      scanner.render((decodedText) => {
        scanner.clear();
        handleCheckIn(decodedText);
      }, (error) => {
        // console.warn(error);
      });
      return () => scanner.clear();
    }
  }, [scannerModal.open]);

  const hasFilters = search || filterDate || filterTime;
  const pendingCount = bookings.filter(b => b.status === 'PENDING').length;
  const approvedCount = bookings.filter(b => b.status === 'APPROVED' || b.status === 'CONFIRMED').length;
  const checkedInCount = bookings.filter(b => b.status === 'CHECKED_IN').length;

  return (
    <div className="space-y-7">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Booking Dashboard</h1>
          <p className="text-gray-500 mt-1 text-sm">Review, approve, and manage workspace reservations.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setScannerModal({ open: true, processing: false, feedback: null })}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <ScanLine className="w-4 h-4" />
            Scan QR to Check-in
          </button>
          <div className="flex items-center gap-2 h-10 px-3 bg-gray-50 border border-gray-100 rounded-xl">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> {pendingCount} Pending
            </span>
            <div className="w-px h-3 bg-gray-200 mx-1" />
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {approvedCount} Approved
            </span>
          </div>
        </div>
      </div>

      {/* Filter + Tabs bar */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-card p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">

          {/* Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-xl shrink-0 gap-1 overflow-x-auto">
            {['PENDING', 'APPROVED', 'CHECKED_IN'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-sm transition-all whitespace-nowrap ${activeTab === tab ? TAB_STYLES.active : TAB_STYLES.inactive}`}
              >
                {tab.replace('_', ' ')[0] + tab.replace('_', ' ').slice(1).toLowerCase()}
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-medium ${activeTab === tab ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-200 text-gray-500'}`}>
                  {tab === 'PENDING' ? pendingCount : tab === 'APPROVED' ? approvedCount : checkedInCount}
                </span>
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by user, resource, or ID…"
                className={`${inputClass} pl-9`}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="relative sm:w-44">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
              <input type="date" className={`${inputClass} pl-9`} value={filterDate} onChange={e => setFilterDate(e.target.value)} />
            </div>
            <div className="relative sm:w-36">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
              <input type="time" className={`${inputClass} pl-9`} value={filterTime} onChange={e => setFilterTime(e.target.value)} />
            </div>
            {hasFilters && (
              <button
                onClick={() => { setSearch(''); setFilterDate(''); setFilterTime(''); }}
                className="text-sm text-gray-400 hover:text-gray-700 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-100 border-dashed rounded-2xl gap-3 text-center">
          <SlidersHorizontal className="w-10 h-10 text-gray-200" />
          <p className="font-semibold text-gray-500">No {activeTab.toLowerCase()} bookings found</p>
          <p className="text-sm text-gray-400">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(booking => {
            const conflict = hasConflict(booking, bookings);
            const { color, dot } = statusConfig[booking.status];
            return (
              <div
                key={booking.id}
                className={`bg-white border rounded-2xl shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 flex flex-col ${conflict ? 'border-amber-200 ring-1 ring-amber-100' : 'border-gray-100'}`}
              >
                <div className="p-5 flex flex-col flex-1">

                  {/* Top Row */}
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase bg-gray-50 border border-gray-100 px-2 py-1 rounded-md">{booking.id}</span>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                      {booking.status}
                    </span>
                  </div>

                  <h2 className="font-semibold text-gray-900 text-lg leading-snug mb-1">{booking.resourceId}</h2>

                  {/* Requester */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[9px] font-bold shrink-0">
                      {booking.userId.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-400">{booking.userId}</span>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 flex-1 mb-4">
                    <div className="flex items-center gap-2.5 text-sm text-gray-500">
                      <Calendar className="w-3.5 h-3.5 text-gray-300 shrink-0" /> {new Date(booking.startTime).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-gray-500">
                      <Clock className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                      <span>{new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-gray-100 mt-auto">
                    {booking.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusChange(booking.id, 'APPROVED')}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" /> Approve
                        </button>
                        <button
                          onClick={() => openReject(booking)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    )}
                    {(booking.status === 'APPROVED' || booking.status === 'CONFIRMED') && (
                      <button
                        onClick={() => handleStatusChange(booking.id, 'CANCELLED')}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
                      >
                        <ShieldX className="w-4 h-4" /> Cancel Approval
                      </button>
                    )}
                    {booking.status === 'CHECKED_IN' && (
                      <div className="text-center py-2 px-3 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-100 flex items-center justify-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5" /> Checked in at {new Date(booking.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center">
                  <XCircle className="w-4 h-4 text-red-500" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Reject Booking</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4 mt-1">
                Provide a reason for rejecting <span className="font-medium text-gray-700">{rejectModal.booking?.resource}</span>.
              </p>
              <textarea
                className="w-full h-24 px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all"
                placeholder="Reason for rejection…"
                value={rejectModal.reason}
                onChange={e => setRejectModal(m => ({ ...m, reason: e.target.value }))}
                autoFocus
              />
            </div>
            <div className="flex gap-2 px-6 pb-6 pt-0">
              <button
                onClick={() => setRejectModal({ open: false, booking: null, reason: '' })}
                className="flex-1 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={!rejectModal.reason.trim()}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 rounded-xl transition-colors"
              >
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      {scannerModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                   <QrCode className="w-5 h-5 text-indigo-600" />
                   <h3 className="font-bold text-gray-900 text-lg">Scan Check-in QR</h3>
                </div>
                <button 
                  onClick={() => setScannerModal({ open: false, processing: false, feedback: null })} 
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div id="reader" className="w-full aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center mb-6 overflow-hidden relative">
                {!scannerModal.processing && !scannerModal.feedback && (
                  <div className="text-center p-8">
                     <ScanLine className="w-12 h-12 text-gray-200 mx-auto mb-3 animate-pulse" />
                     <p className="text-sm text-gray-400">Position the QR code within the frame</p>
                  </div>
                )}
                {(scannerModal.processing || scannerModal.feedback) && (
                   <div className="text-center p-8 bg-white/90 absolute inset-0 z-10 flex flex-col items-center justify-center">
                      {scannerModal.processing ? (
                        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                      ) : (
                        <CheckCircle className={`w-12 h-12 mb-4 ${scannerModal.feedback.includes('Error') ? 'text-red-500' : 'text-emerald-500'}`} />
                      )}
                      <p className={`font-semibold ${scannerModal.feedback?.includes('Error') ? 'text-red-700' : 'text-gray-900'}`}>
                        {scannerModal.feedback}
                      </p>
                   </div>
                )}
              </div>

              <p className="text-sm text-center text-gray-500 mb-2">
                Scan the student's booking QR code to instantly validate their presence.
              </p>
              <p className="text-[10px] text-center text-gray-400">
                Grant camera permissions in your browser to enable scanning.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
