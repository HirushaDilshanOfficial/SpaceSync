import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, MapPin, Users, CheckCircle, XCircle, Search, AlertTriangle, ShieldX, SlidersHorizontal } from 'lucide-react';

const statusConfig = {
  PENDING:   { color: 'text-amber-700 bg-amber-50 border-amber-200',   dot: 'bg-amber-400' },
  APPROVED:  { color: 'text-emerald-700 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-400' },
  REJECTED:  { color: 'text-red-700 bg-red-50 border-red-200',         dot: 'bg-red-400' },
  CANCELLED: { color: 'text-gray-500 bg-gray-50 border-gray-200',      dot: 'bg-gray-300' },
};

const formatBackendTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};

const formatBackendDate = (isoString) => {
  if (!isoString) return '';
  return isoString.split('T')[0];
};

const parseTime = (isoString) => {
  if (!isoString) return 0;
  const date = new Date(isoString);
  return date.getHours() * 60 + date.getMinutes();
};

const toHHMM = (mins) => `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

const hasConflict = (b, all) => {
  if (b.status !== 'PENDING') return false;
  const bS = parseTime(b.startTime), bE = parseTime(b.endTime);
  const bDate = formatBackendDate(b.startTime);
  
  return all.some(o => {
    if (o.id === b.id || o.status !== 'APPROVED' || o.resourceId !== b.resourceId || formatBackendDate(o.startTime) !== bDate) return false;
    return bS < parseTime(o.endTime) && parseTime(o.startTime) < bE;
  });
};

const inputClass = "h-10 px-3 text-sm text-gray-700 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all placeholder:text-gray-400 w-full";

const TAB_STYLES = {
  active: 'bg-white text-gray-900 font-semibold shadow-sm border border-gray-200',
  inactive: 'text-gray-500 hover:text-gray-700',
};

const API_BASE = 'http://localhost:8080/api';

export function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('PENDING');
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterTime, setFilterTime] = useState('');
  const [rejectModal, setRejectModal] = useState({ open: false, booking: null, reason: '' });
  const [approveConfirmModal, setApproveConfirmModal] = useState({ open: false, booking: null });

  const fetchData = useCallback(async () => {
    try {
      const [bookingsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/bookings`),
        fetch(`${API_BASE}/admin/stats`)
      ]);
      
      if (bookingsRes.ok && statsRes.ok) {
        const bookingsData = await bookingsRes.json();
        const statsData = await statsRes.json();
        setBookings(bookingsData);
        setStats(statsData);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateStatus = async (id, status, reason = '') => {
    try {
      const url = new URL(`${API_BASE}/admin/bookings/${id}/status`);
      url.searchParams.append('status', status);
      if (reason) url.searchParams.append('rejectReason', reason);

      const res = await fetch(url, { method: 'PATCH' });
      if (res.ok) {
        fetchData(); // Refresh all data
      }
    } catch (error) {
      console.error(`Failed to update status to ${status}:`, error);
    }
  };

  const filtered = bookings.filter(b => {
    if (b.status !== activeTab) return false;
    const s = search.toLowerCase();
    const bUser = b.userName || b.userId || '';
    const bResource = b.resourceName || b.resourceId || '';
    
    if (s && !bResource.toLowerCase().includes(s) && !bUser.toLowerCase().includes(s) && !String(b.id).toLowerCase().includes(s)) return false;
    if (filterDate && formatBackendDate(b.startTime) !== filterDate) return false;
    if (filterTime && toHHMM(parseTime(b.startTime)) !== filterTime) return false;
    return true;
  });

  const openApprove = (booking) => setApproveConfirmModal({ open: true, booking });
  const cancel = (id) => updateStatus(id, 'PENDING'); // Moving back to pending

  const confirmApprove = async () => {
    await updateStatus(approveConfirmModal.booking.id, 'APPROVED');
    setApproveConfirmModal({ open: false, booking: null });
  };
  const openReject = (booking, conflict) => setRejectModal({ open: true, booking, reason: conflict ? 'Rejected due to scheduling conflict with an approved booking.' : '' });
  
  const confirmReject = async () => {
    if (!rejectModal.reason.trim()) return;
    await updateStatus(rejectModal.booking.id, 'REJECTED', rejectModal.reason);
    setRejectModal({ open: false, booking: null, reason: '' });
  };

  return (
    <div className="space-y-7">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Booking Dashboard</h1>
          <p className="text-gray-500 mt-1 text-sm">Review, approve, and manage workspace reservations.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> {stats.pending} Pending
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {stats.approved} Approved
          </span>
        </div>
      </div>

      {/* Filter + Tabs bar */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-card p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">

          {/* Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-xl shrink-0 gap-1">
            {['PENDING', 'APPROVED'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-sm transition-all ${activeTab === tab ? TAB_STYLES.active : TAB_STYLES.inactive}`}
              >
                {tab[0] + tab.slice(1).toLowerCase()}
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-medium ${activeTab === tab ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-200 text-gray-500'}`}>
                  {tab === 'PENDING' ? stats.pending : stats.approved}
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
            {(search || filterDate || filterTime) && (
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

    {loading ? (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    ) : filtered.length === 0 ? (
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
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase bg-gray-50 border border-gray-100 px-2 py-1 rounded-md">{booking.id}</span>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                    {booking.status}
                  </span>
                </div>

                <h2 className="font-semibold text-gray-900 text-lg leading-snug mb-1">{booking.resourceName}</h2>

                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[9px] font-bold shrink-0">
                    {(booking.userName || 'U').substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-400">{booking.userName}</span>
                </div>

                  {/* Conflict alert */}
                  {conflict && (
                    <div className="flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-3">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      Conflicts with an approved booking
                    </div>
                  )}

                  {/* Details */}
                  <div className="space-y-2 flex-1 mb-4">
                    <div className="flex items-center gap-2.5 text-sm text-gray-500">
                      <Calendar className="w-3.5 h-3.5 text-gray-300 shrink-0" /> {formatBackendDate(booking.startTime)}
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-gray-500">
                      <Clock className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                      <span className={conflict ? 'text-amber-700 font-semibold' : ''}>{formatBackendTime(booking.startTime)} – {formatBackendTime(booking.endTime)}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-gray-500">
                      <Users className="w-3.5 h-3.5 text-gray-300 shrink-0" /> {booking.attendees} attendees
                    </div>
                    <div className="flex items-start gap-2.5 text-sm text-gray-500">
                      <MapPin className="w-3.5 h-3.5 text-gray-300 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{booking.purpose}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-gray-100 mt-auto">
                    {booking.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => openApprove(booking)}
                          disabled={conflict}
                          title={conflict ? 'Cannot approve — scheduling conflict detected' : 'Approve this booking'}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed rounded-xl transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" /> Approve
                        </button>
                        <button
                          onClick={() => openReject(booking, conflict)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    )}
                    {booking.status === 'APPROVED' && (
                      <button
                        onClick={() => cancel(booking.id)}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
                      >
                        <ShieldX className="w-4 h-4" /> Cancel Approval
                      </button>
                    )}
                  </div>

              </div>
            </div>
          );
        })}
      </div>
    )}

      {/* Rejection Modal (already exists) */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">Reject Booking?</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to reject <span className="font-medium text-gray-700">{rejectModal.booking?.resourceName}</span> for <span className="font-medium text-gray-700">{rejectModal.booking?.userName}</span>?
              </p>
              <textarea
                className="w-full h-24 px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all mb-4"
                placeholder="Reason for rejection (required)…"
                value={rejectModal.reason}
                onChange={e => setRejectModal(m => ({ ...m, reason: e.target.value }))}
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setRejectModal({ open: false, booking: null, reason: '' })}
                  className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReject}
                  disabled={!rejectModal.reason.trim()}
                  className="flex-1 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 rounded-xl shadow-sm transition-colors"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      {approveConfirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">Confirm Approval</h3>
              <p className="text-sm text-gray-500 mb-6 px-2">
                You are about to approve the <span className="font-medium text-gray-900">{approveConfirmModal.booking?.resourceName}</span> booking for <span className="font-medium text-gray-900">{approveConfirmModal.booking?.userName}</span>. This will notify the user.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setApproveConfirmModal({ open: false, booking: null })}
                  className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Go Back
                </button>
                <button
                  onClick={confirmApprove}
                  className="flex-1 py-2.5 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl shadow-sm transition-colors"
                >
                  Yes, Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
