import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  return (
    <motion.div 
      className="container fade-up"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ paddingTop: '40px', paddingBottom: '80px' }}
    >
      <div className="dashboard-header card">
        <h1>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="subtitle">
          You are signed in as <span className="badge badge-primary">{user?.role}</span>
        </p>
      </div>

      <div className="dashboard-grid">
        {/* Module B/C quick actions (Placeholder for other members) */}
        <div className="card action-card">
          <div className="card-icon">📅</div>
          <h3>Book a Resource</h3>
          <p>Find and book lecture halls, labs, or equipment.</p>
          <button className="btn btn-ghost" disabled>Coming Soon</button>
        </div>

        <div className="card action-card">
          <div className="card-icon">🔧</div>
          <h3>Report an Incident</h3>
          <p>Raise a ticket for broken equipment or IT issues.</p>
          <button className="btn btn-ghost" disabled>Coming Soon</button>
        </div>

        {/* Member 4 Modules */}
        <div className="card action-card highlight">
          <div className="card-icon">🔔</div>
          <h3>Notifications</h3>
          <p>You have {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}.</p>
          <button className="btn btn-primary" onClick={() => navigate('/notifications')}>
            View Inbox
          </button>
        </div>

        {/* Admin only features */}
        {user?.role === 'ADMIN' && (
          <div className="card action-card admin-card">
            <div className="card-icon">🛡️</div>
            <h3>User Management</h3>
            <p>Manage roles and accounts across the platform.</p>
            <button className="btn btn-primary" onClick={() => navigate('/admin/users')}>
              Manage Users
            </button>
          </div>
        )}
      </div>

      <style>{`
        .dashboard-header {
          margin-bottom: 32px;
          text-align: center;
          padding: 40px;
        }

        .dashboard-header h1 {
          font-size: 32px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 8px;
          background: var(--grad-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .dashboard-header .subtitle {
          color: var(--clr-text-muted);
          font-size: 16px;
        }

        .dashboard-header .badge {
          font-size: 12px;
          vertical-align: middle;
          background: rgba(88,166,255,0.2);
          color: var(--clr-primary);
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }

        .action-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          transition: transform var(--t-fast), box-shadow var(--t-fast);
        }

        .action-card.highlight {
          border-color: rgba(88,166,255,0.4);
          box-shadow: 0 8px 24px rgba(88,166,255,0.1);
        }

        .action-card.admin-card {
          border-color: rgba(163,113,247,0.4);
        }

        .action-card .card-icon {
          font-size: 32px;
          margin-bottom: 16px;
          background: rgba(255,255,255,0.05);
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .action-card h3 {
          font-size: 18px;
          font-weight: 600;
          color: var(--clr-text);
          margin-bottom: 8px;
        }

        .action-card p {
          color: var(--clr-text-muted);
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 24px;
          flex: 1;
        }

        .action-card .btn {
          width: 100%;
          justify-content: center;
        }
      `}</style>
    </motion.div>
  );
}
