import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Calendar, Clock, MapPin, Users, Plus, XCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOCK_BOOKINGS = [
  {
    id: 'BKG-001',
    resource: 'Conference Room A',
    date: '2026-04-10',
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    purpose: 'Quarterly Planning',
    attendees: 8,
    status: 'APPROVED',
  },
  {
    id: 'BKG-002',
    resource: 'Projector XYZ',
    date: '2026-04-12',
    startTime: '01:00 PM',
    endTime: '03:00 PM',
    purpose: 'Client Presentation',
    attendees: 12,
    status: 'PENDING',
  },
  {
    id: 'BKG-003',
    resource: 'Training Lab',
    date: '2026-04-05',
    startTime: '09:00 AM',
    endTime: '05:00 PM',
    purpose: 'New Hire Onboarding',
    attendees: 15,
    status: 'REJECTED',
    rejectReason: 'Lab is under maintenance.',
  },
  {
    id: 'BKG-004',
    resource: 'Conference Room B',
    date: '2026-04-01',
    startTime: '11:00 AM',
    endTime: '12:00 PM',
    purpose: 'Team Sync',
    attendees: 5,
    status: 'CANCELLED',
  }
];

const StatusBadge = ({ status }) => {
  const styles = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
    CANCELLED: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {status}
    </span>
  );
};

export function MyBookingsPage() {
  const [bookings, setBookings] = useState(MOCK_BOOKINGS);
  const navigate = useNavigate();

  const handleCancelBooking = (id) => {
    // Optimistic UI update
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Clean Professional Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            My Bookings
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your past and upcoming resource requests.
          </p>
        </div>
        <Button onClick={() => navigate('/new-booking')}>
          <Plus className="w-4 h-4 mr-2" />
          New Booking
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookings.map((booking) => (
          <Card key={booking.id} className="hover:border-slate-300 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <CardTitle className="text-base font-medium">{booking.resource}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Status</span>
                <StatusBadge status={booking.status} />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-slate-600">
                  <Calendar className="w-4 h-4 mr-2.5 text-slate-400" />
                  {booking.date}
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <Clock className="w-4 h-4 mr-2.5 text-slate-400" />
                  {booking.startTime} - {booking.endTime}
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <Users className="w-4 h-4 mr-2.5 text-slate-400" />
                  {booking.attendees} Attendees
                </div>
                <div className="flex items-start text-sm text-slate-600 mt-2">
                  <Info className="w-4 h-4 mr-2.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{booking.purpose}</span>
                </div>
              </div>
              
              {booking.status === 'REJECTED' && booking.rejectReason && (
                <div className="mt-4 p-3 bg-red-50 rounded-md text-sm text-red-800 border border-red-100 flex items-start">
                  <XCircle className="w-4 h-4 mr-2 shrink-0 mt-0.5 text-red-600" />
                  <span><strong className="font-medium">Reason:</strong> {booking.rejectReason}</span>
                </div>
              )}
            </CardContent>
            
            {(booking.status === 'APPROVED' || booking.status === 'PENDING') && (
              <CardFooter className="pt-3 border-t border-slate-100 bg-slate-50 rounded-b-xl">
                {booking.status === 'APPROVED' && (
                  <Button 
                    variant="danger" 
                    size="sm"
                    className="w-full"
                    onClick={() => handleCancelBooking(booking.id)}
                  >
                    Cancel Booking
                  </Button>
                )}
                {booking.status === 'PENDING' && (
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="w-full"
                    onClick={() => handleCancelBooking(booking.id)}
                  >
                    Withdraw Request
                  </Button>
                )}
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
