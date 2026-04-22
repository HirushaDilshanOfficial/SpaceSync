import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Bell, 
  Zap, 
  CheckCircle, 
  QrCode, 
  ChevronRight, 
  Plus, 
  User as UserIcon,
  Users,
  Search,
  BookOpen,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const { notifications, unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [incidentsCount, setIncidentsCount] = useState(0);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        if (!user?.id) return;
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/bookings/my?userId=${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          // Sort by start time, upcoming first
          setBookings(data.sort((a, b) => new Date(a.startTime) - new Date(b.startTime)));
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user?.id]);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        if (!user?.email) return;
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/incidents/reported-by?userId=${user.email}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setIncidentsCount(data.length);
        }
      } catch (err) {
        console.error('Incidents count fetch error:', err);
      }
    };
    fetchIncidents();
  }, [user?.email]);

  const upcomingBooking = bookings.find(b => 
    (b.status === 'APPROVED' || b.status === 'CHECKED_IN') && 
    new Date(b.endTime) > new Date()
  );

  const stats = [
    { label: 'Upcoming', value: bookings.filter(b => b.status === 'APPROVED').length, icon: Calendar, color: 'var(--clr-primary)' },
    { label: 'Completed', value: bookings.filter(b => b.status === 'CHECKED_IN').length, icon: CheckCircle, color: 'var(--clr-success)' },
    { label: 'Reports', value: incidentsCount, icon: AlertTriangle, color: 'var(--clr-warning)', onClick: () => navigate('/my-reports') },
    { label: 'Alerts', value: unreadCount, icon: Bell, color: 'var(--clr-accent)' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="dashboard-root">
      {/* Background Decorative Orbs */}
      <div className="dashboard-blobs">
        <div className="blob blob-1 animate-blob"></div>
        <div className="blob blob-2 animate-blob animation-delay-2000"></div>
      </div>

      <motion.div 
        className="container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ position: 'relative', zIndex: 1, paddingTop: '32px', paddingBottom: '60px' }}
      >
        {/* Header Section */}
        <header className="dash-header">
          <div className="user-greeting">
            <motion.div variants={itemVariants} className="avatar-wrapper">
              {user?.pictureUrl ? (
                <img src={user.pictureUrl} alt={user.name} className="user-avatar" />
              ) : (
                <div className="user-avatar placeholder">
                  <UserIcon size={24} />
                </div>
              )}
              <div className="status-dot"></div>
            </motion.div>
            <div className="greeting-text">
              <motion.h1 variants={itemVariants}>
                Welcome back, {user?.name?.split(' ')[0] || 'Scholar'}
              </motion.h1>
              <motion.p variants={itemVariants} className="text-muted">
                Here's what's happening on your campus today.
              </motion.p>
            </div>
          </div>
          <motion.div variants={itemVariants} className="header-actions" style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-ghost border-indigo-100 text-indigo-600" onClick={() => navigate('/my-reports')}>
              <BookOpen size={18} />
              <span>My Reports</span>
            </button>
            <button className="btn btn-ghost border-indigo-100 text-indigo-600" onClick={() => navigate('/report-incident')}>
              <AlertTriangle size={18} />
              <span>Report Issue</span>
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/new-booking')}>
              <Plus size={18} />
              <span>New Booking</span>
            </button>
          </motion.div>
        </header>

        {/* Stats Grid */}
        <div className="stats-row">
          {stats.map((stat, idx) => (
            <motion.div 
              key={idx} 
              variants={itemVariants} 
              className="stat-card glass-card"
              onClick={stat.onClick}
              style={{ cursor: stat.onClick ? 'pointer' : 'default' }}
            >
              <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                <stat.icon size={20} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="dash-main-grid">
          {/* Left Column: Focus Section */}
          <div className="dash-col-left">
            <motion.section variants={itemVariants} className="focus-section">
              <div className="section-header">
                <h2>Next Reservation</h2>
                <Link to="/my-bookings" className="link-all">View Schedule <ChevronRight size={14} /></Link>
              </div>

              {upcomingBooking ? (
                <div className="upcoming-main-card glass-card active-border">
                  <div className="card-top">
                    <div className="space-meta">
                      <span className="space-type-badge">CONFIRMED</span>
                      <h3 className="space-name">{upcomingBooking.resourceId}</h3>
                      <div className="time-meta">
                        <Clock size={14} className="icon-blue" />
                        <span>{new Date(upcomingBooking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} Today</span>
                      </div>
                    </div>
                    <div className="qr-preview">
                      <QrCode size={32} strokeWidth={1.5} />
                    </div>
                  </div>
                  <div className="card-footer">
                    <div className="location-info">
                      <MapPin size={14} />
                      <span>Main Campus, Level 2</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        className="btn btn-sm btn-blur"
                        onClick={() => navigate('/my-bookings')}
                      >
                        Check Details
                      </button>
                      <button 
                        className="btn btn-sm btn-ghost text-amber-500 hover:bg-amber-500/10"
                        onClick={() => navigate('/report-incident', { state: { resourceId: upcomingBooking.resourceId } })}
                      >
                        <AlertTriangle size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-state glass-card">
                  <div className="empty-icon">
                    <Zap size={32} />
                  </div>
                  <h3>No upcoming sessions</h3>
                  <p>Book a space to get started with your research or study session.</p>
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate('/new-booking')}>
                    Browse Spaces
                  </button>
                </div>
              )}
            </motion.section>

            <motion.section variants={itemVariants} className="quick-book-section">
              <div className="section-header">
                <h2>Popular Categories</h2>
              </div>
              <div className="category-grid">
                {[
                  { name: 'Study Pods', icon: BookOpen, count: 12 },
                  { name: 'Meeting Rooms', icon: Users, count: 5 },
                  { name: 'Research Labs', icon: Zap, count: 3 }
                ].map((cat, i) => (
                  <div key={i} className="cat-card glass-card hover-lift">
                    <div className="cat-icon-box">
                      <cat.icon size={20} />
                    </div>
                    <div className="cat-info">
                      <h4>{cat.name}</h4>
                      <span>{cat.count} available</span>
                    </div>
                    <ArrowRight size={16} className="arrow" />
                  </div>
                ))}
              </div>
            </motion.section>
          </div>

          {/* Right Column: Side Info */}
          <div className="dash-col-right">
            <motion.section variants={itemVariants} className="side-card notifications-side glass-card">
              <div className="side-header">
                <h3>Recent Alerts</h3>
                {unreadCount > 0 && <span className="unread-dot-label">{unreadCount}</span>}
              </div>
              <div className="side-list">
                {notifications.length > 0 ? (
                  notifications.slice(0, 3).map((note, i) => (
                    <div key={i} className="side-item">
                      <div className={`item-dot ${note.read ? '' : 'active'}`}></div>
                      <div className="item-content">
                        <p className="item-text">{note.message}</p>
                        <span className="item-time">2 hours ago</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="empty-msg">No recent notifications</p>
                )}
              </div>
              <button className="btn btn-link" onClick={() => navigate('/notifications')}>
                View all notifications
              </button>
            </motion.section>

            <motion.section variants={itemVariants} className="side-card promo-card grad-purple">
              <Zap size={24} className="promo-icon" />
              <h3>Premium Spaces</h3>
              <p>Get priority access to the new High-Performance Computing Lab.</p>
              <button className="btn btn-white btn-sm">Explore Lab</button>
            </motion.section>
          </div>
        </div>
      </motion.div>

      <style>{`
        .dashboard-root {
          min-height: 100vh;
          overflow-x: hidden;
          position: relative;
        }

        /* ── Header ── */
        .dash-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .user-greeting {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .avatar-wrapper {
          position: relative;
          width: 64px;
          height: 64px;
        }

        .user-avatar {
          width: 100%;
          height: 100%;
          border-radius: 20px;
          object-fit: cover;
          border: 2px solid var(--clr-border);
        }

        .user-avatar.placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--clr-bg-card);
          color: var(--clr-primary);
        }

        .status-dot {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 16px;
          height: 16px;
          background: var(--clr-success);
          border: 3px solid var(--clr-bg);
          border-radius: 50%;
        }

        .greeting-text h1 {
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.5px;
          margin-bottom: 4px;
        }

        .text-muted {
          color: var(--clr-text-muted);
          font-size: 15px;
        }

        /* ── Stats ── */
        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
        }

        .stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          line-height: 1;
        }

        .stat-label {
          font-size: 13px;
          color: var(--clr-text-muted);
          font-weight: 500;
          margin-top: 4px;
        }

        /* ── Grid Layout ── */
        .dash-main-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 32px;
        }

        @media (max-width: 1024px) {
          .dash-main-grid {
            grid-template-columns: 1fr;
          }
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .section-header h2 {
          font-size: 20px;
          font-weight: 600;
        }

        .link-all {
          font-size: 14px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* ── Upcoming Card ── */
        .upcoming-main-card {
          padding: 32px;
          margin-bottom: 40px;
          border-left: 4px solid var(--clr-primary);
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .space-type-badge {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          color: var(--clr-primary);
          background: rgba(88, 166, 255, 0.1);
          padding: 4px 8px;
          border-radius: 6px;
          display: inline-block;
          margin-bottom: 12px;
        }

        .space-name {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .time-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          color: var(--clr-text);
        }

        .icon-blue { color: var(--clr-primary); }

        .qr-preview {
          background: #fff;
          color: #000;
          padding: 12px;
          border-radius: 16px;
          opacity: 0.9;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 24px;
          border-top: 1px solid var(--clr-border);
        }

        .location-info {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: var(--clr-text-muted);
        }

        .btn-blur {
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(10px);
          border: 1px solid var(--clr-border);
        }

        /* ── Categories ── */
        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
        }

        .cat-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          cursor: pointer;
          position: relative;
        }

        .cat-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: var(--clr-bg-hover);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--clr-accent);
        }

        .cat-info h4 {
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .cat-info span {
          font-size: 12px;
          color: var(--clr-text-muted);
        }

        .cat-card .arrow {
          margin-left: auto;
          opacity: 0;
          transform: translateX(-10px);
          transition: all 0.3s ease;
        }

        .cat-card:hover .arrow {
          opacity: 1;
          transform: translateX(0);
        }

        /* ── Side Cards ── */
        .side-card {
          padding: 24px;
          margin-bottom: 24px;
        }

        .side-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .side-header h3 {
          font-size: 16px;
          font-weight: 600;
        }

        .unread-dot-label {
          background: var(--clr-danger);
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 10px;
        }

        .side-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 20px;
        }

        .side-item {
          display: flex;
          gap: 12px;
        }

        .item-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--clr-border);
          margin-top: 6px;
          flex-shrink: 0;
        }

        .item-dot.active {
          background: var(--clr-primary);
          box-shadow: 0 0 8px var(--clr-primary);
        }

        .item-text {
          font-size: 13px;
          line-height: 1.4;
          color: var(--clr-text);
          margin-bottom: 4px;
        }

        .item-time {
          font-size: 11px;
          color: var(--clr-text-muted);
        }

        .btn-link {
          background: none;
          padding: 0;
          color: var(--clr-primary);
          font-size: 13px;
          font-weight: 600;
        }

        .promo-card {
          background: var(--grad-primary);
          color: #fff;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .grad-purple {
          background: linear-gradient(135deg, #a371f7 0%, #7c3aed 100%);
        }

        .promo-card h3 { margin-bottom: 0; }
        .promo-card p { font-size: 14px; opacity: 0.9; }
        .btn-white { background: #fff; color: #7c3aed; }

        /* ── Empty State ── */
        .empty-state {
          padding: 60px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .empty-icon {
          color: var(--clr-text-faint);
        }

        /* ── Blobs ── */
        .dashboard-blobs {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }

        .blob {
          position: absolute;
          filter: blur(80px);
          opacity: 0.15;
          border-radius: 50%;
        }

        .blob-1 {
          width: 400px;
          height: 400px;
          background: var(--clr-primary);
          top: -100px;
          right: -100px;
        }

        .blob-2 {
          width: 300px;
          height: 300px;
          background: var(--clr-accent);
          bottom: 100px;
          left: -50px;
        }

        /* ── Utilities ── */
        .hover-lift {
          transition: transform 0.2s ease;
        }
        .hover-lift:hover {
          transform: translateY(-4px);
        }

        .btn-sm {
          padding: 8px 16px;
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}

