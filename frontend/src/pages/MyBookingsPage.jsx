import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, CheckCircle, AlertCircle, QrCode, X, Search, Users, AlertTriangle, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ── SLIIT Brand tokens ───────────────────────────────────────── */
/* ── SLIIT Brand tokens ───────────────────────────────────────── */
const C = {
  navy:      '#003087',      /* SLIIT Navy */
  navyDark:  '#001a52',
  navyLight: 'rgba(0, 48, 135, 0.08)',
  gold:      '#F5A800',
  goldLight: 'rgba(245, 168, 0, 0.1)',
  bg:        '#f8fafc',
  white:     '#ffffff',
  border:    '#e2e8f0',
  text:      '#0f172a',
  muted:     '#475569',
  faint:     '#94a3b8',
};

const STATUS = {
  PENDING:     { label: 'Pending',     color: '#d97706', bg: '#fffbeb', border: '#fef3c7', dot: '#f59e0b' },
  APPROVED:    { label: 'Approved',    color: '#059669', bg: '#ecfdf5', border: '#d1fae5', dot: '#10b981' },
  CHECKED_IN:  { label: 'Checked In',  color: '#2563eb', bg: '#eff6ff', border: '#dbeafe', dot: '#3b82f6' },
  CHECKED_OUT: { label: 'Checked Out', color: '#475569', bg: '#f1f5f9', border: '#e2e8f0', dot: '#64748b' },
  REJECTED:    { label: 'Rejected',    color: '#dc2626', bg: '#fef2f2', border: '#fee2e2', dot: '#ef4444' },
  CANCELLED:   { label: 'Cancelled',   color: '#64748b', bg: '#f8fafc', border: '#f1f5f9', dot: '#94a3b8' },
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; }

  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes fadeUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes modalIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }

  .bk-card {
    background: #ffffff;
    border: 1px solid var(--clr-border);
    border-radius: 20px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    box-shadow: var(--shadow-sm);
    transition: all 0.3s cubic-bezier(.4,0,.2,1);
    animation: fadeUp 0.4s ease both;
  }
  .bk-card:hover {
    border-color: var(--clr-primary);
    box-shadow: var(--shadow-md);
    transform: translateY(-4px);
  }

  .bk-stat {
    background: #ffffff;
    border: 1px solid var(--clr-border);
    border-radius: 16px;
    padding: 20px 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: all 0.3s;
    box-shadow: var(--shadow-sm);
  }
  .bk-stat:hover { 
    transform: translateY(-3px); 
    border-color: var(--clr-primary);
    box-shadow: var(--shadow-md);
  }

  .bk-input {
    border: 1px solid var(--clr-border);
    border-radius: 12px;
    padding: 0 16px;
    height: 46px;
    font-size: 14px;
    color: var(--clr-text);
    background: #ffffff;
    outline: none;
    font-family: inherit;
    transition: all 0.2s;
    width: 100%;
  }
  .bk-input:focus {
    border-color: var(--clr-primary);
    box-shadow: 0 0 0 3px rgba(0, 48, 135, 0.08);
  }

  .bk-btn-primary {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    background: var(--grad-primary);
    color: #ffffff; border: none; border-radius: 12px;
    padding: 12px 24px; font-size: 14px; font-weight: 700;
    cursor: pointer; font-family: inherit;
    box-shadow: 0 4px 12px rgba(0, 48, 135, 0.2);
    transition: all 0.25s;
  }
  .bk-btn-primary:hover { 
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 48, 135, 0.3);
  }

  .bk-btn-navy {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    background: var(--clr-primary);
    color: #fff; border: none; border-radius: 12px;
    padding: 10px 20px; font-size: 14px; font-weight: 700;
    cursor: pointer; font-family: inherit;
    transition: all 0.25s;
  }
  .bk-btn-navy:hover { 
    background: var(--clr-primary-dark);
    transform: translateY(-2px);
  }

  .bk-btn-ghost {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    background: #ffffff; border: 1px solid var(--clr-border);
    border-radius: 12px; padding: 10px 20px;
    font-size: 14px; font-weight: 700; color: var(--clr-text-muted);
    cursor: pointer; font-family: inherit;
    transition: all 0.2s;
  }
  .bk-btn-ghost:hover { 
    background: #eff6ff; 
    border-color: var(--clr-primary); 
    color: var(--clr-primary); 
  }

  .bk-btn-danger {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    background: #fef2f2; border: 1px solid #fee2e2;
    border-radius: 12px; padding: 10px 20px;
    font-size: 14px; font-weight: 700; color: #dc2626;
    cursor: pointer; font-family: inherit;
    transition: all 0.2s;
  }
  .bk-btn-danger:hover { background: #fee2e2; border-color: #fca5a5; }

  .bk-modal-overlay {
    position: fixed; inset: 0;
    background: rgba(15, 23, 42, 0.4);
    backdrop-filter: blur(8px);
    z-index: 2000;
    display: flex; align-items: center; justify-content: center;
    padding: 24px;
  }
  .bk-modal {
    background: #ffffff;
    border-radius: 24px;
    padding: 32px;
    width: 100%; max-width: 440px;
    display: flex; flex-direction: column; gap: 24px;
    box-shadow: var(--shadow-xl);
    animation: modalIn 0.3s cubic-bezier(.4,0,.2,1);
    border: 1px solid var(--clr-border);
  }
  .bk-empty-state {
    text-align: center; padding: 80px 40px; 
    background: #ffffff; 
    border-radius: 24px; 
    border: 2px dashed var(--clr-border);
  }
`;
`;
`;

/* ── Sub-components ───────────────────────────────────────────── */
function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.PENDING;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      background: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
      borderRadius: '20px', padding: '4px 11px',
      fontSize: '11px', fontWeight: '700',
      textTransform: 'uppercase', letterSpacing: '0.4px',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
      {s.label}
    </span>
  );
}

function StatCard({ label, value, icon, accent }) {
  return (
    <div className="bk-stat">
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: accent + '18',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: accent, fontSize: 20, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, color: accent, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: 3 }}>{label}</div>
      </div>
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────────────── */
export function MyBookingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings,     setBookings]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [qrModal,      setQrModal]      = useState({ open: false, bookingId: null });
  const [qrImage,      setQrImage]      = useState(null);
  const [qrLoading,    setQrLoading]    = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterDate,   setFilterDate]   = useState('');
  const [filterSearch, setFilterSearch] = useState('');

  /* ── Fetch ── */
  const fetchBookings = async () => {
    try {
      if (!user?.id) return;
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/bookings/my?userId=${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch bookings');
      const data = await res.json();
      // Sort by createdAt descending (newest first)
      setBookings(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, [user?.id]);

  /* ── QR ── */
  const handleOpenQr = async (bookingId) => {
    setQrModal({ open: true, bookingId });
    setQrImage(null); setQrLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/bookings/${bookingId}/qr`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setQrImage(URL.createObjectURL(await res.blob()));
    } catch (e) { console.error(e); }
    finally { setQrLoading(false); }
  };

  /* ── Cancel ── */
  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/bookings/${id}/status?status=CANCELLED`, {
        method: 'PATCH', headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchBookings();
    } catch (e) { console.error(e); }
  };

  /* ── Filter ── */
  const filtered = bookings.filter(b => {
    if (filterStatus !== 'ALL' && b.status !== filterStatus) return false;
    if (filterDate) {
      const d = new Date(b.startTime).toISOString().split('T')[0];
      if (d !== filterDate) return false;
    }
    if (filterSearch && !b.resourceId?.toLowerCase().includes(filterSearch.toLowerCase())) return false;
    return true;
  });

  const hasFilter = filterStatus !== 'ALL' || filterDate || filterSearch;

  /* ── States ── */
  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 14, fontFamily: 'Inter, sans-serif' }}>
      <style>{CSS}</style>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #dce6f5', borderTopColor: C.navy, animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: C.muted, fontSize: 14 }}>Loading your bookings…</p>
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', padding: 60, color: '#dc2626', fontFamily: 'Inter, sans-serif' }}>
      <style>{CSS}</style>
      <AlertCircle size={40} style={{ margin: '0 auto 12px' }} />
      <p style={{ marginBottom: 16 }}>{error}</p>
      <button className="bk-btn-ghost" onClick={fetchBookings}>Try Again</button>
    </div>
  );

  return (
    <div style={{ maxWidth: 1200, margin: '36px auto', padding: '0 24px 72px', fontFamily: "'Inter','Segoe UI',sans-serif", color: C.text }}>
      <style>{CSS}</style>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg, ${C.navyDark}, ${C.navy})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 10px rgba(0,48,135,0.25)' }}>
              <Calendar size={18} color="#fff" />
            </div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' }}>My Bookings</h1>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: C.muted }}>Track and manage your SLIIT workspace reservations</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="bk-btn-ghost" onClick={() => navigate('/report-incident')}>
            <AlertCircle size={15} /> Report Issue
          </button>
          <button className="bk-btn-primary" onClick={() => navigate('/new-booking')}>
            <Plus size={15} /> New Booking
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginBottom: 28 }}>
        <StatCard label="Total"      value={bookings.length}                                          icon="📋" accent={C.navy} />
        <StatCard label="Pending"    value={bookings.filter(b=>b.status==='PENDING').length}          icon="⏳" accent="#b45309" />
        <StatCard label="Approved"   value={bookings.filter(b=>b.status==='APPROVED').length}         icon="✅" accent="#059669" />
        <StatCard label="Checked In" value={bookings.filter(b=>b.status==='CHECKED_IN').length}       icon="🔵" accent={C.navy} />
      </div>

      {/* ── Filters ── */}
      <div style={{ background: '#ffffff', border: `1px solid ${C.border}`, borderRadius: 16, padding: '14px 18px', marginBottom: 28, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        {/* Search */}
        <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: C.faint, pointerEvents: 'none' }} />
          <input className="bk-input" style={{ paddingLeft: 34 }} placeholder="Search resource…" value={filterSearch} onChange={e => setFilterSearch(e.target.value)} />
        </div>

        {/* Status */}
        <select className="bk-input" style={{ width: 160 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="CHECKED_IN">Checked In</option>
          <option value="CHECKED_OUT">Checked Out</option>
          <option value="REJECTED">Rejected</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        {/* Date */}
        <input className="bk-input" type="date" style={{ width: 160 }} value={filterDate} onChange={e => setFilterDate(e.target.value)} />

        {hasFilter && (
          <button className="bk-btn-danger" style={{ padding: '8px 14px' }} onClick={() => { setFilterStatus('ALL'); setFilterDate(''); setFilterSearch(''); }}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* ── Empty ── */}
      {filtered.length === 0 ? (
        <div className="bk-empty-state">
          <p style={{ fontSize: 52, marginBottom: 14 }}>📅</p>
          <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: C.text }}>No bookings found</p>
          <p style={{ fontSize: 14, color: C.muted, marginBottom: 24 }}>
            {hasFilter ? 'Try adjusting your filters.' : "You haven't made any reservations yet."}
          </p>
          {!hasFilter && <button className="bk-btn-primary" onClick={() => navigate('/new-booking')}>📅 Book a Space</button>}
        </div>
      ) : (
        <>
          <p style={{ margin: '0 0 16px', fontSize: 13, color: C.faint }}>
            Showing <strong style={{ color: C.text }}>{filtered.length}</strong> booking{filtered.length !== 1 ? 's' : ''}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 22 }}>
            {filtered.map((booking, i) => {
              const start   = new Date(booking.startTime);
              const end     = new Date(booking.endTime);
              const dateStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              const timeStr = `${start.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})} – ${end.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}`;
              const canQr     = booking.status === 'APPROVED' || booking.status === 'CHECKED_IN';
              const canCancel = booking.status === 'APPROVED' || booking.status === 'PENDING';

              return (
                <div className="bk-card" key={booking.id} style={{ animationDelay: `${i * 0.04}s` }}>
                  {/* Top stripe */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.faint, background: C.navyLight, padding: '3px 9px', borderRadius: 6 }}>
                      BKG-{String(booking.id).slice(-4).toUpperCase()}
                    </span>
                    <StatusBadge status={booking.status} />
                  </div>

                  {/* Resource name */}
                  <div style={{ fontSize: 17, fontWeight: 700, color: C.navy }}>{booking.resourceId}</div>

                  {/* Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.muted }}>
                      <Calendar size={14} color={C.navy} /> <span>{dateStr}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.muted }}>
                      <Clock size={14} color={C.navy} /> <span>{timeStr}</span>
                    </div>
                    {booking.attendees && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.muted }}>
                        <Users size={14} color={C.navy} /> <span>{booking.attendees} attendees</span>
                      </div>
                    )}
                    {booking.purpose && (
                      <div style={{ borderLeft: `3px solid ${C.gold}`, paddingLeft: 10, marginTop: 4 }}>
                        <p style={{ margin: 0, fontSize: 12, color: C.muted, fontStyle: 'italic', lineHeight: 1.5 }}>{booking.purpose}</p>
                      </div>
                    )}
                    {(booking.status === 'REJECTED' || booking.status === 'CANCELLED') && booking.rejectReason && (
                      <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10, padding: '10px 12px', marginTop: 4 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Reason</div>
                        <div style={{ fontSize: 12, color: C.text, lineHeight: 1.4 }}>{booking.rejectReason}</div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 4, borderTop: `1px solid ${C.border}` }}>
                    {canQr && (
                      <button className="bk-btn-navy" style={{ padding: '7px 14px', fontSize: 12 }} onClick={() => handleOpenQr(booking.id)}>
                        <QrCode size={13} /> QR Code
                      </button>
                    )}
                    {canCancel && (
                      <button className="bk-btn-danger" style={{ padding: '7px 14px', fontSize: 12 }} onClick={() => handleCancel(booking.id)}>
                        Cancel
                      </button>
                    )}
                    <button className="bk-btn-ghost" style={{ padding: '7px 12px', fontSize: 12, marginLeft: 'auto' }}
                      onClick={() => navigate('/report-incident', { state: { resourceId: booking.resourceId } })}>
                      <AlertTriangle size={12} /> Issue
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── QR Modal ── */}
      {qrModal.open && (
        <div className="bk-modal-overlay" onClick={() => setQrModal({ open: false, bookingId: null })}>
          <div className="bk-modal" onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${C.navyDark}, ${C.navy})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <QrCode size={18} color="#fff" />
                </div>
                <span style={{ fontWeight: 800, fontSize: 17 }}>Check-in QR</span>
              </div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 4 }}
                onClick={() => setQrModal({ open: false, bookingId: null })}>
                <X size={20} />
              </button>
            </div>

            {/* QR Image */}
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240, border: `1px solid ${C.border}` }}>
              {qrLoading ? (
                <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #dce6f5', borderTopColor: C.navy, animation: 'spin 0.8s linear infinite' }} />
              ) : qrImage ? (
                <img src={qrImage} alt="QR" style={{ width: 190, height: 190, objectFit: 'contain', borderRadius: 8 }} />
              ) : (
                <p style={{ color: C.muted, fontSize: 13 }}>QR not available</p>
              )}
            </div>

            {/* Info */}
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Scan at Entrance</p>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>Show this QR to the administrator to check-in to your reserved space.</p>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="bk-btn-ghost" style={{ flex: 1 }} disabled={!qrImage || qrLoading}
                onClick={() => {
                  if (!qrImage) return;
                  const a = document.createElement('a');
                  a.href = qrImage;
                  a.download = `SpaceSync-QR-${qrModal.bookingId}.png`;
                  a.click();
                }}>
                <Download size={15} /> Download
              </button>
              <button className="bk-btn-navy" style={{ flex: 1 }} onClick={() => setQrModal({ open: false, bookingId: null })}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
