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
  AlertCircle
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
    systemHealth: 'Optimal'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you'd fetch these from the backend
    const fetchAdminStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8081/api/bookings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setStats({
            totalBookings: data.length,
            pendingBookings: data.filter(b => b.status === 'PENDING').length,
            activeUsers: new Set(data.map(b => b.userId)).size,
            systemHealth: 'Optimal'
          });
        }
      } catch (err) {
        console.error('Admin stats error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  const adminCards = [
    { label: 'Pending Requests', value: stats.pendingBookings, icon: Clock, color: '#f59e0b', link: '/admin/bookings' },
    { label: 'Total Reservations', value: stats.totalBookings, icon: Calendar, color: '#3b82f6', link: '/admin/bookings' },
    { label: 'Active Scholars', value: stats.activeUsers, icon: Users, color: '#10b981', link: '/admin/users' },
    { label: 'System Security', value: stats.systemHealth, icon: Shield, color: '#8b5cf6', link: '#' },
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
          background: #0d1117;
          position: relative;
          color: #e6edf3;
        }
        .admin-bg-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 300px;
          background: linear-gradient(180deg, rgba(88, 166, 255, 0.05) 0%, transparent 100%);
          pointer-events: none;
        }
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 40px;
        }
        .badge-admin {
          display: inline-block;
          padding: 4px 10px;
          background: rgba(88, 166, 255, 0.1);
          color: #58a6ff;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
          margin-bottom: 12px;
          border: 1px solid rgba(88, 166, 255, 0.2);
        }
        .admin-header h1 {
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -1px;
          margin-bottom: 8px;
        }
        .admin-header p {
          color: #8b949e;
        }
        .pulse-container {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #7ee787;
          font-weight: 600;
        }
        .pulse-dot {
          width: 8px;
          height: 8px;
          background: #7ee787;
          border-radius: 50%;
          box-shadow: 0 0 0 0 rgba(126, 231, 135, 0.7);
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(126, 231, 135, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(126, 231, 135, 0); }
          100% { box-shadow: 0 0 0 0 rgba(126, 231, 135, 0); }
        }
        .admin-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }
        .admin-stat-card {
          padding: 24px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(255,255,255,0.05);
        }
        .admin-stat-card:hover {
          border-color: rgba(88, 166, 255, 0.4);
          transform: translateY(-4px);
          background: rgba(255,255,255,0.02);
        }
        .card-inner {
          display: flex;
          align-items: center;
          gap: 16px;
          position: relative;
        }
        .icon-box {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .card-data h3 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 2px;
        }
        .card-data p {
          font-size: 13px;
          color: #8b949e;
          font-weight: 500;
        }
        .card-action {
          position: absolute;
          right: -4px;
          top: -4px;
          opacity: 0.3;
          transition: opacity 0.3s;
        }
        .admin-stat-card:hover .card-action { opacity: 1; }
        
        .admin-main-row {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }
        @media (max-width: 968px) {
          .admin-main-row { grid-template-columns: 1fr; }
        }
        .table-section { min-height: 400px; padding: 24px; }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .activity-placeholder {
          height: 300px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #8b949e;
        }
        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .action-btn {
          width: 100%;
          padding: 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px;
          color: #e6edf3;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }
        .action-btn:hover {
          background: rgba(88, 166, 255, 0.1);
          border-color: rgba(88, 166, 255, 0.3);
          transform: translateX(4px);
        }
      `}</style>
    </div>
  );
}
