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
  const [recentIncidents, setRecentIncidents] = useState([]);

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
          setRecentIncidents(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3));
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
          <motion.div variants={itemVariants} className="header-actions" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="btn btn-ghost" onClick={() => navigate('/my-reports')}>
              <BookOpen size={18} />
              <span>My Reports</span>
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('/report-incident')}>
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
              className="stat-card"
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
                <div className="upcoming-main-card">
                  <div className="card-top">
                    <div className="space-meta">
                      <span className="space-type-badge">CONFIRMED</span>
                      <h3 className="space-name">{upcomingBooking.resourceName || upcomingBooking.resourceId}</h3>
                      <div className="time-meta">
                        <Clock size={16} className="icon-blue" />
                        <span>{new Date(upcomingBooking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(upcomingBooking.startTime).toLocaleDateString([], { weekday: 'long' })}</span>
                      </div>
                    </div>
                    <div className="qr-preview">
                      <QrCode size={36} strokeWidth={1.5} />
                    </div>
                  </div>
                  <div className="card-footer">
                    <div className="location-info">
                      <MapPin size={16} />
                      <span>{upcomingBooking.location || 'SLIIT Main Campus'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        className="btn btn-sm btn-primary"
                        style={{ padding: '8px 20px', fontSize: '13px' }}
                        onClick={() => navigate('/my-bookings')}
                      >
                        Check Details
                      </button>
                      <button 
                        className="btn btn-sm btn-ghost"
                        style={{ padding: '8px 12px', color: '#dc2626' }}
                        onClick={() => navigate('/report-incident', { state: { resourceId: upcomingBooking.resourceId } })}
                      >
                        <AlertTriangle size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <Calendar size={48} strokeWidth={1} style={{ opacity: 0.3 }} />
                  </div>
                  <h3>No upcoming sessions</h3>
                  <p>Book a space to get started with your research or study session.</p>
                  <button className="btn btn-ghost" onClick={() => navigate('/new-booking')} style={{ marginTop: '8px' }}>
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
                  { name: 'Study Pods', icon: BookOpen, count: 12, color: '#2563eb' },
                  { name: 'Meeting Rooms', icon: Users, count: 5, color: '#7c3aed' },
                  { name: 'Research Labs', icon: Zap, count: 3, color: '#ea580c' }
                ].map((cat, i) => (
                  <div key={i} className="cat-card hover-lift" onClick={() => navigate('/new-booking')}>
                    <div className="cat-icon-box" style={{ background: `${cat.color}10`, color: cat.color }}>
                      <cat.icon size={20} />
                    </div>
                    <div className="cat-info">
                      <h4>{cat.name}</h4>
                      <span>{cat.count} available</span>
                    </div>
                    <ArrowRight size={18} className="arrow" />
                  </div>
                ))}
              </div>
            </motion.section>
          </div>

          {/* Right Column: Side Info */}
          <div className="dash-col-right">
            <motion.section variants={itemVariants} className="side-card notifications-side">
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
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <p style={{ color: 'var(--clr-text-faint)', fontSize: '14px' }}>No recent notifications</p>
                  </div>
                )}
              </div>
              <button className="btn-link" onClick={() => navigate('/notifications')}>
                View all notifications
              </button>
            </motion.section>

            <motion.section variants={itemVariants} className="side-card">
              <div className="side-header">
                <h3>My Recent Reports</h3>
                <Link to="/my-reports" className="link-all" style={{fontSize: '12px'}}>All <ChevronRight size={12} /></Link>
              </div>
              <div className="side-list">
                {recentIncidents.length > 0 ? (
                  recentIncidents.map((inc, i) => (
                    <div key={i} className="side-item" style={{ borderBottom: '1px solid var(--clr-border)', paddingBottom: '12px', marginBottom: i === recentIncidents.length - 1 ? 0 : '8px' }}>
                      <div className="item-content" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                          <p className="item-text" style={{ fontWeight: '700', color: 'var(--clr-text)', margin: 0 }}>{inc.title}</p>
                          <span style={{ 
                            fontSize: '10px', 
                            padding: '2px 8px', 
                            borderRadius: '100px',
                            background: inc.status === 'OPEN' ? '#fef2f2' : '#ecfdf5',
                            color: inc.status === 'OPEN' ? '#dc2626' : '#059669',
                            fontWeight: '800'
                          }}>
                            {inc.status}
                          </span>
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--clr-text-muted)', margin: 0 }}>{inc.resourceName || inc.resourceId}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <p style={{ color: 'var(--clr-text-faint)', fontSize: '14px' }}>No issues reported yet</p>
                    <button className="btn-link" onClick={() => navigate('/report-incident')}>Report an Issue</button>
                  </div>
                )}
              </div>
            </motion.section>

            <motion.section variants={itemVariants} className="side-card promo-card grad-purple">
              <Zap size={32} className="promo-icon" />
              <h3>Premium Spaces</h3>
              <p>Get priority access to the new High-Performance Computing Lab.</p>
              <button className="btn btn-white" style={{ width: '100%' }}>Explore Lab</button>
            </motion.section>
          </div>
        </div>
      </motion.div>

      <style>{`
        .dashboard-root {
          min-height: 100vh;
          overflow-x: hidden;
          position: relative;
          background: var(--clr-bg);
          background-image: var(--grad-mesh);
        }

        .dash-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 48px;
          flex-wrap: wrap;
          gap: 24px;
        }
        .user-greeting { display: flex; align-items: center; gap: 24px; }
        .avatar-wrapper { position: relative; width: 80px; height: 80px; }
        .user-avatar {
          width: 100%; height: 100%; border-radius: 24px; object-fit: cover;
          border: 3px solid #fff;
          box-shadow: var(--shadow-md);
        }
        .user-avatar.placeholder {
          display: flex; align-items: center; justify-content: center;
          background: #ffffff;
          color: var(--clr-primary);
        }
        .status-dot {
          position: absolute; bottom: 4px; right: 4px; width: 18px; height: 18px;
          background: #10b981; border: 3px solid #fff; border-radius: 50%;
        }
        .greeting-text h1 {
          font-size: 36px; font-weight: 800; letter-spacing: -1.5px; margin-bottom: 4px;
          color: var(--clr-text);
        }
        .text-muted { color: var(--clr-text-muted); font-size: 16px; font-weight: 500; }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-bottom: 48px;
        }
        @media (max-width: 900px) { .stats-row { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 500px) { .stats-row { grid-template-columns: 1fr; } }

        .stat-card {
          display: flex; align-items: center; gap: 20px; padding: 24px;
          background: #ffffff;
          border: 1px solid var(--clr-border);
          border-radius: 20px;
          transition: all 0.3s cubic-bezier(.4,0,.2,1);
          box-shadow: var(--shadow-sm);
        }
        .stat-card:hover {
          transform: translateY(-6px);
          border-color: var(--clr-primary);
          box-shadow: var(--shadow-md);
        }
        .stat-icon {
          width: 52px; height: 52px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
        }
        .stat-info { display: flex; flex-direction: column; }
        .stat-value { font-size: 32px; font-weight: 800; line-height: 1; color: var(--clr-text); letter-spacing: -1px; }
        .stat-label { font-size: 14px; color: var(--clr-text-muted); font-weight: 700; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.5px; }

        .dash-main-grid { display: grid; grid-template-columns: 1fr 380px; gap: 40px; }
        @media (max-width: 1024px) { .dash-main-grid { grid-template-columns: 1fr; } }

        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .section-header h2 { font-size: 22px; font-weight: 800; color: var(--clr-text); letter-spacing: -0.5px; }
        .link-all {
          font-size: 14px; font-weight: 700; display: flex; align-items: center; gap: 6px;
          color: var(--clr-primary); transition: all 0.2s;
        }
        .link-all:hover { color: var(--clr-electric); gap: 10px; }

        .upcoming-main-card {
          padding: 32px; margin-bottom: 48px;
          border-radius: 28px;
          background: #ffffff;
          border: 1px solid var(--clr-border);
          box-shadow: var(--shadow-md);
          position: relative; overflow: hidden;
        }
        .upcoming-main-card::before {
          content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 6px;
          background: var(--grad-primary);
        }
        .card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
        .space-type-badge {
          font-size: 11px; font-weight: 800; letter-spacing: 1px; padding: 6px 14px;
          border-radius: 8px; display: inline-block; margin-bottom: 16px;
          background: #ecfdf5; color: #059669; border: 1px solid #d1fae5;
        }
        .space-name { font-size: 28px; font-weight: 800; margin-bottom: 8px; color: var(--clr-text); letter-spacing: -0.8px; }
        .time-meta { display: flex; align-items: center; gap: 8px; font-size: 16px; color: var(--clr-text-muted); font-weight: 600; }
        .icon-blue { color: var(--clr-primary); }
        .qr-preview {
          background: #f8fafc; color: var(--clr-primary);
          padding: 20px; border-radius: 20px; border: 1px solid var(--clr-border);
          transition: all 0.3s cubic-bezier(.4,0,.2,1); cursor: pointer;
        }
        .qr-preview:hover { transform: scale(1.05); border-color: var(--clr-primary); box-shadow: var(--shadow-md); color: var(--clr-electric); }
        .card-footer {
          display: flex; justify-content: space-between; align-items: center;
          padding-top: 32px; border-top: 1px solid #f1f5f9;
        }
        .location-info { display: flex; align-items: center; gap: 8px; font-size: 15px; color: var(--clr-text-muted); font-weight: 600; }

        .category-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; }
        .cat-card {
          display: flex; align-items: center; gap: 20px; padding: 24px; cursor: pointer;
          background: #ffffff;
          border: 1px solid var(--clr-border); border-radius: 20px;
          transition: all 0.3s cubic-bezier(.4,0,.2,1);
          box-shadow: var(--shadow-sm);
        }
        .cat-card:hover {
          transform: translateY(-6px); border-color: var(--clr-primary);
          box-shadow: var(--shadow-md);
        }
        .cat-icon-box {
          width: 56px; height: 56px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.3s;
        }
        .cat-card:hover .cat-icon-box {
          background: var(--grad-primary) !important; color: #fff !important;
        }
        .cat-info h4 { font-size: 17px; font-weight: 800; margin-bottom: 4px; color: var(--clr-text); }
        .cat-info span { font-size: 14px; color: var(--clr-text-muted); font-weight: 500; }
        .cat-card .arrow { margin-left: auto; opacity: 0; transform: translateX(-10px); transition: all 0.3s; color: var(--clr-primary); }
        .cat-card:hover .arrow { opacity: 1; transform: translateX(0); }

        .side-card {
          padding: 32px; margin-bottom: 32px; border-radius: 24px;
          background: #ffffff;
          border: 1px solid var(--clr-border);
          box-shadow: var(--shadow-md);
        }
        .side-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .side-header h3 { font-size: 19px; font-weight: 800; color: var(--clr-text); }
        .unread-dot-label {
          background: var(--clr-danger); color: #fff;
          font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 12px;
        }
        .side-list { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
        .side-item {
          display: flex; gap: 14px; padding: 14px; border-radius: 16px;
          transition: all 0.2s;
          border: 1px solid transparent;
        }
        .side-item:hover { background: #f8fafc; border-color: #f1f5f9; }
        .item-dot { width: 10px; height: 10px; border-radius: 50%; background: #e2e8f0; margin-top: 6px; flex-shrink: 0; }
        .item-dot.active { background: var(--clr-primary); box-shadow: 0 0 0 4px rgba(0,48,135,0.1); }
        .item-text { font-size: 14px; line-height: 1.6; color: var(--clr-text); margin-bottom: 4px; font-weight: 500; }
        .item-time { font-size: 12px; color: var(--clr-text-faint); font-weight: 600; }
        .btn-link {
          background: none; padding: 8px 0; color: var(--clr-primary); font-size: 14px; font-weight: 800;
          border: none; cursor: pointer; transition: all 0.2s; text-transform: uppercase; letter-spacing: 0.5px;
        }
        .btn-link:hover { color: var(--clr-electric); text-decoration: underline; }

        .promo-card {
          background: var(--grad-primary);
          color: #fff; text-align: center; display: flex; flex-direction: column;
          align-items: center; gap: 20px; border-radius: 24px;
          position: relative; overflow: hidden; border: none; padding: 40px 32px;
          box-shadow: 0 12px 32px rgba(0,48,135,0.25);
        }
        .promo-icon { color: var(--clr-accent); filter: drop-shadow(0 4px 12px rgba(245,168,0,0.4)); }
        .promo-card h3 { font-size: 22px; margin-bottom: 4px; font-weight: 800; position: relative; z-index: 1; letter-spacing: -0.5px; }
        .promo-card p { font-size: 15px; opacity: 0.95; position: relative; z-index: 1; margin-bottom: 8px; line-height: 1.6; }
        .btn-white {
          background: #ffffff; color: var(--clr-primary); font-weight: 800; border-radius: 12px;
          padding: 12px 24px; position: relative; z-index: 1;
          transition: all 0.25s; border: none;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          font-family: inherit; font-size: 14px; cursor: pointer;
        }
        .btn-white:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); color: var(--clr-electric); }

        .empty-state {
          padding: 80px 40px; text-align: center; display: flex; flex-direction: column;
          align-items: center; gap: 20px; border-radius: 28px;
          background: #ffffff;
          border: 2px dashed #e2e8f0;
        }
        .empty-icon { color: #cbd5e1; }
        .empty-state h3 { font-size: 20px; font-weight: 800; color: var(--clr-text); }
        .empty-state p { color: var(--clr-text-muted); max-width: 280px; line-height: 1.5; }

        .btn { display: inline-flex; align-items: center; justify-content: center; gap: 10px; padding: 12px 24px; border-radius: 12px; font-weight: 800; font-size: 14px; cursor: pointer; transition: all 0.3s cubic-bezier(.4,0,.2,1); border: none; font-family: inherit; }
        .btn-primary { background: var(--grad-primary); color: #fff; box-shadow: 0 4px 12px rgba(0,48,135,0.2); }
        .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,48,135,0.3); }
        .btn-ghost { background: #eff6ff; color: var(--clr-primary); border: 1px solid #dbeafe; box-shadow: var(--shadow-sm); }
        .btn-ghost:hover { background: #dbeafe; color: var(--clr-primary); border-color: var(--clr-primary); transform: translateY(-2px); }

        @keyframes float { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-20px) scale(1.02); } }
        .hover-lift { transition: all 0.25s cubic-bezier(.4,0,.2,1); }
        .hover-lift:hover { transform: translateY(-6px); }

        .dashboard-blobs { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
        .blob { position: absolute; border-radius: 50%; opacity: 0.4; }
        .blob-1 {
          width: 500px; height: 500px; top: -150px; right: -150px;
          background: radial-gradient(circle, rgba(0, 48, 135, 0.05), transparent 70%);
          filter: blur(60px); animation: float 12s ease-in-out infinite;
        }
        .blob-2 {
          width: 400px; height: 400px; bottom: -80px; left: -120px;
          background: radial-gradient(circle, rgba(245, 168, 0, 0.05), transparent 70%);
          filter: blur(60px); animation: float 15s ease-in-out infinite reverse;
        }
        .btn-sm { padding: 10px 20px; font-size: 14px; border-radius: 10px; }
      `}</style>
    </div>
  );
}

