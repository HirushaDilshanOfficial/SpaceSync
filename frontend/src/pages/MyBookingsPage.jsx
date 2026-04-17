import React, { useState } from 'react';
import { Calendar, Clock, Users, Plus, XCircle, CheckCircle, AlertCircle, ChevronRight, QrCode, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const statusConfig = {
  PENDING:    { color: 'text-amber-700 bg-amber-50 border-amber-200',   dot: 'bg-amber-400',   icon: AlertCircle },
  APPROVED:   { color: 'text-emerald-700 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-400', icon: CheckCircle },
  CHECKED_IN: { color: 'text-indigo-700 bg-indigo-50 border-indigo-200', dot: 'bg-indigo-400', icon: CheckCircle },
  REJECTED:   { color: 'text-red-700 bg-red-50 border-red-200',         dot: 'bg-red-400',     icon: XCircle },
  CANCELLED:  { color: 'text-gray-500 bg-gray-50 border-gray-200',      dot: 'bg-gray-300',    icon: XCircle },
};

const statCards = [
  { key: 'PENDING',    label: 'Pending',    bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-100'  },
  { key: 'APPROVED',   label: 'Approved',   bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
  { key: 'CHECKED_IN', label: 'Checked In', bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
  { key: 'CANCELLED',  label: 'Cancelled',  bg: 'bg-gray-50',    text: 'text-gray-500',    border: 'border-gray-100'  },
];

export function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrModal, setQrModal] = useState({ open: false, bookingId: null });
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      // Using a hardcoded userId for demo purposes until auth is implemented
      const response = await fetch('http://localhost:8080/api/bookings/my?userId=USER-001');
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/bookings/${id}/status?status=CANCELLED`, {
        method: 'PATCH',
      });
      if (response.ok) {
        fetchBookings(); // Refresh data
      }
    } catch (err) {
      console.error('Failed to cancel:', err);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px] text-gray-500">Loading your bookings...</div>;
  if (error) return <div className="p-8 text-center text-red-600 bg-red-50 rounded-2xl border border-red-100">Error: {error}</div>;

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">My Bookings</h1>
          <p className="text-gray-500 mt-1 text-sm">Track and manage your workspace reservations.</p>
        </div>
        <button
          onClick={() => navigate('/new-booking')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          New Booking
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map(({ key, label, bg, text, border }) => (
          <div key={key} className={`${bg} ${border} border rounded-2xl p-4`}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">{label}</p>
            <p className={`text-3xl font-bold ${text}`}>{bookings.filter(b => b.status === key).length}</p>
          </div>
        ))}
      </div>

      {/* Bookings Grid */}
      {bookings.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
             <p className="text-gray-400">No bookings found in the database.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {bookings.map((booking) => {
            const statusStyle = statusConfig[booking.status] || statusConfig.PENDING;
            const { color, dot, icon: Icon } = statusStyle;
            
            // Basic formatting for ISO strings
            const startDate = new Date(booking.startTime);
            const endDate = new Date(booking.endTime);
            const dateStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const timeRange = `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

            return (
              <div
                key={booking.id}
                className="bg-white border border-gray-100 rounded-2xl shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
              >
                <div className="p-5 flex flex-col flex-1">

                  {/* Top Row */}
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase bg-gray-50 border border-gray-100 px-2 py-1 rounded-md">BKG-{booking.id}</span>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                      {booking.status}
                    </span>
                  </div>

                  {/* Resource */}
                  <h2 className="font-semibold text-gray-900 text-lg leading-snug mb-4">{booking.resourceId}</h2>

                  {/* Details */}
                  <div className="space-y-2 flex-1 mb-4">
                    <div className="flex items-center gap-2.5 text-sm text-gray-500">
                      <Calendar className="w-4 h-4 text-gray-300 shrink-0" /> {dateStr}
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-gray-500">
                      <Clock className="w-4 h-4 text-gray-300 shrink-0" /> {timeRange}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-gray-100 mt-auto space-y-2">
                    {(booking.status === 'APPROVED' || booking.status === 'CHECKED_IN') && (
                      <button
                        onClick={() => setQrModal({ open: true, bookingId: booking.id })}
                        className="w-full py-2 px-3 flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-xl hover:bg-indigo-100 transition-colors"
                      >
                        <QrCode className="w-4 h-4" />
                        View Check-in QR
                      </button>
                    )}
                    {(booking.status === 'APPROVED' || booking.status === 'PENDING') && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        className="w-full py-2 px-3 text-sm font-medium text-red-600 border border-red-100 rounded-xl hover:bg-red-50 transition-colors"
                      >
                        {booking.status === 'APPROVED' ? 'Cancel Booking' : 'Withdraw Request'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Modal */}
      {qrModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-900 text-lg">Check-in QR Code</h3>
                <button onClick={() => setQrModal({ open: false, bookingId: null })} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <div className="aspect-square w-full max-w-[240px] mx-auto bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center mb-6 overflow-hidden">
                <img 
                  src={`http://localhost:8080/api/bookings/${qrModal.bookingId}/qr`} 
                  alt="Check-in QR" 
                  className="w-full h-full object-contain p-2"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/240?text=QR+Error';
                  }}
                />
              </div>

              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-2">
                <p className="text-sm text-indigo-700 font-medium">Scan this at the entrance</p>
                <p className="text-xs text-indigo-500 mt-1">Show this to the administrator to check-in.</p>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => setQrModal({ open: false, bookingId: null })}
                className="w-full py-3 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-2xl hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
