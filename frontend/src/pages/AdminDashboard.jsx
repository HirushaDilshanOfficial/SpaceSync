import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Shield, 
  Activity, 
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    activeUsers: 0,
    reportedIssues: 0,
    systemHealth: 'Optimal'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you'd fetch these from the backend
    const fetchAdminStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const [bookingsRes, incidentsRes] = await Promise.all([
          fetch('/api/bookings', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/incidents', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        let bookingsData = [];
        let incidentsData = [];

        if (bookingsRes.ok) bookingsData = await bookingsRes.json();
        if (incidentsRes.ok) incidentsData = await incidentsRes.json();

        setStats({
          totalBookings: bookingsData.length,
          pendingBookings: bookingsData.filter(b => b.status === 'PENDING').length,
          activeUsers: new Set(bookingsData.map(b => b.userId)).size,
          reportedIssues: incidentsData.length,
          systemHealth: 'Optimal'
        });
      } catch (err) {
        console.error('Admin stats error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  const adminCards = [
    { label: 'Pending Requests',    value: stats.pendingBookings, icon: Clock,   color: '#f59e0b', link: '/admin/bookings'    },
    { label: 'Total Reservations',  value: stats.totalBookings,   icon: Calendar, color: '#3b82f6', link: '/admin/bookings'    },
    { label: 'Active Scholars',     value: stats.activeUsers,     icon: Users,    color: '#10b981', link: '/admin/users'       },
    { label: 'Reported Issues',     value: stats.reportedIssues,  icon: AlertCircle, color: '#ef4444', link: '/incidents'       },
    { label: 'Manage Facilities',   value: 'Resources',           icon: Layers,   color: '#e8871a', link: '/admin/facilities'  },
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-bg-overlay"></div>
      
      <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: '40px' }}>
        <header className="admin-header">
          <div className="title-area">
            <div className="badge-admin">ADMIN CONTROL PANEL</div>
            <h1>Command Center</h1>
            <p>Welcome back, Administrator. System is running smoothly.</p>
          </div>
          <div className="header-meta">
            <div className="pulse-container">
              <div className="pulse-dot"></div>
              <span>Live Updates</span>
            </div>
          </div>
        </header>

        <div className="admin-grid">
          {adminCards.map((card, i) => (
            <motion.div 
              key={i}
              className="admin-stat-card glass-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => card.link !== '#' && navigate(card.link)}
            >
              <div className="card-inner">
                <div className="icon-box" style={{ background: `${card.color}15`, color: card.color }}>
                  <card.icon size={24} />
                </div>
                <div className="card-data">
                  <h3>{card.value}</h3>
                  <p>{card.label}</p>
                </div>
                <div className="card-action">
                  <ArrowUpRight size={18} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="admin-main-row">
          <div className="admin-col-8">
            <section className="glass-card table-section">
              <div className="section-header">
                <h2><Activity size={18} style={{marginRight: '8px'}}/> System Activity</h2>
                <button className="btn btn-ghost btn-sm">Full Logs</button>
              </div>
              <div className="activity-placeholder">
                <TrendingUp size={48} strokeWidth={1} style={{opacity: 0.2, marginBottom: '16px'}}/>
                <p>Real-time analytics and booking trends will be displayed here.</p>
              </div>
            </section>
          </div>
          <div className="admin-col-4">
            <section className="glass-card status-section">
              <div className="section-header">
                <h2>Quick Actions</h2>
              </div>
              <div className="action-buttons">
                <button className="action-btn" onClick={() => navigate('/admin/bookings')}>
                  <AlertCircle size={18} />
                  <span>Review Pending Bookings</span>
                </button>
                <button className="action-btn" onClick={() => navigate('/admin/facilities')}>
                  <Layers size={18} />
                  <span>Manage Facilities & Resources</span>
                </button>
                <button className="action-btn" onClick={() => navigate('/incidents')}>
                  <AlertCircle size={18} />
                  <span>Review Incident Tickets</span>
                </button>
                <button className="action-btn" onClick={() => navigate('/notifications')}>
                  <Shield size={18} />
                  <span>Broadcast System Alert</span>
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>

      <style>{`
        .admin-dashboard {
          min-height: 100vh;
          background: var(--clr-bg);
          backgroundImage: var(--grad-mesh);
          position: relative;
          color: var(--clr-text);
          padding-bottom: 60px;
        }
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 40px;
          flex-wrap: wrap;
          gap: 20px;
        }
        .badge-admin {
          display: inline-block;
          padding: 6px 12px;
          background: #eff6ff;
          color: var(--clr-primary);
          border-radius: 8px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.8px;
          margin-bottom: 12px;
          border: 1px solid rgba(0,48,135,0.1);
        }
        .admin-header h1 {
          font-size: 36px;
          font-weight: 800;
          letter-spacing: -1.5px;
          margin-bottom: 8px;
          color: var(--clr-text);
        }
        .admin-header p {
          color: var(--clr-text-muted);
          font-size: 16px;
        }
        .pulse-container {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #059669;
          font-weight: 700;
          background: #ecfdf5;
          padding: 8px 16px;
          border-radius: 20px;
          border: 1px solid #d1fae5;
        }
        .pulse-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .admin-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }
        .admin-stat-card {
          padding: 28px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: #ffffff;
          border: 1px solid var(--clr-border);
          border-radius: 24px;
          box-shadow: var(--shadow-sm);
        }
        .admin-stat-card:hover {
          border-color: var(--clr-primary);
          transform: translateY(-6px);
          box-shadow: var(--shadow-md);
        }
        .card-inner {
          display: flex;
          align-items: center;
          gap: 20px;
          position: relative;
        }
        .icon-box {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
        }
        .card-data h3 {
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 2px;
          color: var(--clr-text);
          letter-spacing: -0.5px;
        }
        .card-data p {
          font-size: 14px;
          color: var(--clr-text-muted);
          font-weight: 600;
        }
        .card-action {
          position: absolute;
          right: -8px;
          top: -8px;
          opacity: 0;
          transition: all 0.3s;
          color: var(--clr-primary);
          background: #eff6ff;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .admin-stat-card:hover .card-action { opacity: 1; transform: translate(4px, -4px); }
        
        .admin-main-row {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 32px;
        }
        @media (max-width: 968px) {
          .admin-main-row { grid-template-columns: 1fr; }
        }
        .table-section { min-height: 400px; padding: 32px; background: #ffffff; border: 1px solid var(--clr-border); border-radius: 24px; box-shadow: var(--shadow-sm); }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }
        .section-header h2 { font-size: 20px; font-weight: 800; color: var(--clr-text); display: flex; align-items: center; }
        .activity-placeholder {
          height: 300px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: var(--clr-text-muted);
          background: #f8fafc;
          border-radius: 16px;
          border: 1px dashed var(--clr-border);
        }
        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .action-btn {
          width: 100%;
          padding: 18px 24px;
          background: #ffffff;
          border: 1px solid var(--clr-border);
          border-radius: 16px;
          color: var(--clr-text);
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(.4,0,.2,1);
          text-align: left;
          box-shadow: var(--shadow-sm);
          font-family: inherit;
          font-weight: 700;
          font-size: 14px;
        }
        .action-btn svg { color: var(--clr-primary); opacity: 0.7; }
        .action-btn:hover {
          background: #eff6ff;
          border-color: var(--clr-primary);
          transform: translateX(8px);
          color: var(--clr-primary);
        }
        .status-section { padding: 32px; background: #ffffff; border: 1px solid var(--clr-border); border-radius: 24px; box-shadow: var(--shadow-sm); }
        .btn-sm { padding: 8px 16px; font-size: 12px; }
        .btn-ghost { background: #f8fafc; color: var(--clr-text-muted); border: 1px solid var(--clr-border); border-radius: 8px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .btn-ghost:hover { background: #ffffff; color: var(--clr-primary); border-color: var(--clr-primary); }
      `}</style>
    </div>
  );
}
