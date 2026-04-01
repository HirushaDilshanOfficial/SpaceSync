import React, { useState } from 'react';
import { Calendar, Clock, Users, Plus, XCircle, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOCK_BOOKINGS = [
  { id: 'BKG-001', resource: 'Conference Room A', date: '2026-04-10', startTime: '10:00 AM', endTime: '11:00 AM', purpose: 'Quarterly Planning', attendees: 8, status: 'APPROVED' },
  { id: 'BKG-002', resource: 'Projector XYZ', date: '2026-04-12', startTime: '01:00 PM', endTime: '03:00 PM', purpose: 'Client Presentation', attendees: 12, status: 'PENDING' },
  { id: 'BKG-003', resource: 'Training Lab', date: '2026-04-05', startTime: '09:00 AM', endTime: '05:00 PM', purpose: 'New Hire Onboarding', attendees: 15, status: 'REJECTED', rejectReason: 'Lab is under scheduled maintenance.' },
  { id: 'BKG-004', resource: 'Conference Room B', date: '2026-04-01', startTime: '11:00 AM', endTime: '12:00 PM', purpose: 'Team Sync', attendees: 5, status: 'CANCELLED' },
];

const statusConfig = {
  PENDING:   { color: 'text-amber-700 bg-amber-50 border-amber-200',   dot: 'bg-amber-400',   icon: AlertCircle },
  APPROVED:  { color: 'text-emerald-700 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-400', icon: CheckCircle },
  REJECTED:  { color: 'text-red-700 bg-red-50 border-red-200',         dot: 'bg-red-400',     icon: XCircle },
  CANCELLED: { color: 'text-gray-500 bg-gray-50 border-gray-200',      dot: 'bg-gray-300',    icon: XCircle },
};

const statCards = [
  { key: 'PENDING',   label: 'Pending',   bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-100'  },
  { key: 'APPROVED',  label: 'Approved',  bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
  { key: 'REJECTED',  label: 'Rejected',  bg: 'bg-red-50',     text: 'text-red-600',     border: 'border-red-100'   },
  { key: 'CANCELLED', label: 'Cancelled', bg: 'bg-gray-50',    text: 'text-gray-500',    border: 'border-gray-100'  },
];

export function MyBookingsPage() {
  const [bookings, setBookings] = useState(MOCK_BOOKINGS);
  const navigate = useNavigate();

  const handleCancel = (id) => setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b));

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {bookings.map((booking) => {
          const { color, dot, icon: Icon } = statusConfig[booking.status];
          return (
            <div
              key={booking.id}
              className="bg-white border border-gray-100 rounded-2xl shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
            >
              <div className="p-5 flex flex-col flex-1">

                {/* Top Row */}
                <div className="flex items-start justify-between mb-4">
                  <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase bg-gray-50 border border-gray-100 px-2 py-1 rounded-md">{booking.id}</span>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                    {booking.status}
                  </span>
                </div>

                {/* Resource */}
                <h2 className="font-semibold text-gray-900 text-lg leading-snug mb-4">{booking.resource}</h2>

                {/* Details */}
                <div className="space-y-2 flex-1 mb-4">
                  <div className="flex items-center gap-2.5 text-sm text-gray-500">
                    <Calendar className="w-4 h-4 text-gray-300 shrink-0" /> {booking.date}
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-500">
                    <Clock className="w-4 h-4 text-gray-300 shrink-0" /> {booking.startTime} – {booking.endTime}
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-500">
                    <Users className="w-4 h-4 text-gray-300 shrink-0" /> {booking.attendees} attendees
                  </div>
                </div>

                {/* Purpose */}
                <p className="text-xs text-gray-400 bg-gray-50 rounded-xl px-3 py-2.5 leading-relaxed line-clamp-2 mb-4">{booking.purpose}</p>

                {/* Rejection Notice */}
                {booking.status === 'REJECTED' && booking.rejectReason && (
                  <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 mb-4">
                    <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>{booking.rejectReason}</span>
                  </div>
                )}

                {/* Actions */}
                {booking.status === 'APPROVED' && (
                  <div className="pt-3 border-t border-gray-100 mt-auto">
                    <button
                      onClick={() => handleCancel(booking.id)}
                      className="w-full py-2 px-3 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
                    >
                      Cancel Booking
                    </button>
                  </div>
                )}
                {booking.status === 'PENDING' && (
                  <div className="pt-3 border-t border-gray-100 mt-auto">
                    <button
                      onClick={() => handleCancel(booking.id)}
                      className="w-full py-2 px-3 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Withdraw Request
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
