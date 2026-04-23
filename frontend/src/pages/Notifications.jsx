import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

export default function Notifications() {
  const { notifications, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'
  const navigate = useNavigate();

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const getBadgeClass = (type) => {
    if (type.includes('APPROVED')) return 'badge-success';
    if (type.includes('REJECTED')) return 'badge-danger';
    if (type.includes('COMMENT')) return 'badge-info';
    if (type.includes('STATUS')) return 'badge-warning';
    if (type.includes('BKG_REQ')) return 'badge-primary';
    return 'badge-neutral';
  };

  const getIcon = (type) => {
    if (type.includes('APPROVED')) return '✅';
    if (type.includes('REJECTED')) return '❌';
    if (type.includes('COMMENT')) return '💬';
    if (type.includes('STATUS')) return '🔧';
    if (type.includes('BKG_REQ')) return '📅';
    return '🔔';
  };

  const handleActionClick = (e, actionUrl) => {
    e.stopPropagation();
    if (actionUrl) navigate(actionUrl);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    deleteNotification(id);
  };

  return (
    <div className="container notif-page-container fade-up">
      <div className="notif-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Stay updated on your bookings and tickets</p>
        </div>
        <div className="notif-actions">
          <button className="btn btn-ghost" onClick={markAllAsRead}>
            Mark all as read
          </button>
        </div>
      </div>

      <div className="notif-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          Unread
        </button>
      </div>

      <div className="notif-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading notifications...</p>
          </div>
        ) : filteredNotifs.length === 0 ? (
          <div className="empty-state card">
            <span style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>🎉</span>
            <h3>You're all caught up!</h3>
            <p>No {filter === 'unread' ? 'unread ' : ''}notifications to show at the moment.</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredNotifs.map(n => (
              <motion.div 
                key={n.id}
                className={`card notif-card ${n.read ? 'read' : 'unread'}`}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98, height: 0 }}
                onClick={() => !n.read && markAsRead(n.id)}
              >
                <div className="notif-card-icon">{getIcon(n.type)}</div>
                
                <div className="notif-card-content">
                  <div className="notif-card-header">
                    <h4>{n.title}</h4>
                    <span className="notif-date">{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                  
                  <p className="notif-message">{n.message}</p>
                  
                  <div className="notif-card-footer">
                    <span className={`badge ${getBadgeClass(n.type)}`}>
                      {n.type.replace(/_/g, ' ')}
                    </span>
                    
                    <div className="notif-card-buttons">
                      {n.actionUrl && (
                        <button 
                          className="btn btn-sm btn-ghost" 
                          onClick={(e) => handleActionClick(e, n.actionUrl)}
                        >
                          View Details
                        </button>
                      )}
                      <button 
                        className="btn btn-sm btn-danger icon-btn" 
                        onClick={(e) => handleDelete(e, n.id)}
                        title="Delete notification"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <style>{`
        .notif-page-container {
          padding: 48px 24px 80px;
          max-width: 900px;
          margin: 0 auto;
          min-height: 100vh;
          background: var(--clr-bg);
          background-image: var(--grad-mesh);
        }

        .notif-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--clr-border);
          flex-wrap: wrap;
          gap: 24px;
        }

        .page-title {
          font-size: 32px;
          font-weight: 800;
          color: var(--clr-text);
          margin-bottom: 8px;
          letter-spacing: -1px;
        }

        .page-subtitle {
          color: var(--clr-text-muted);
          font-size: 16px;
        }

        .notif-filters {
          display: flex;
          gap: 12px;
          margin-bottom: 32px;
        }

        .filter-btn {
          background: #ffffff;
          border: 1px solid var(--clr-border);
          color: var(--clr-text-muted);
          padding: 10px 24px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(.4,0,.2,1);
          box-shadow: var(--shadow-sm);
        }

        .filter-btn:hover {
          background: #f8fafc;
          color: var(--clr-primary);
          border-color: var(--clr-primary);
        }

        .filter-btn.active {
          background: var(--clr-primary);
          color: #fff;
          border-color: var(--clr-primary);
          box-shadow: 0 4px 12px rgba(0, 48, 135, 0.2);
        }

        .notif-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .notif-card {
          display: flex;
          gap: 20px;
          padding: 24px;
          background: #ffffff;
          border: 1px solid var(--clr-border);
          border-radius: var(--radius-lg);
          transition: all 0.3s cubic-bezier(.4,0,.2,1);
          position: relative;
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          cursor: pointer;
        }

        .notif-card.unread {
          border-left: 4px solid var(--clr-primary);
          background: #fdfdfd;
        }

        .notif-card.unread::after {
          content: '';
          position: absolute;
          top: 0; right: 0;
          width: 60px; height: 60px;
          background: radial-gradient(circle at top right, rgba(0, 48, 135, 0.03), transparent);
        }

        .notif-card.read {
          opacity: 0.85;
          background: #f9fafb;
        }
        
        .notif-card:hover {
          transform: translateY(-2px);
          border-color: var(--clr-primary);
          box-shadow: var(--shadow-md);
        }

        .notif-card-icon {
          font-size: 20px;
          background: #f8fafc;
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid var(--clr-border);
        }

        .notif-card-content {
          flex: 1;
        }

        .notif-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }

        .notif-card-header h4 {
          font-size: 17px;
          font-weight: 800;
          color: var(--clr-text);
          letter-spacing: -0.3px;
        }

        .notif-date {
          font-size: 12px;
          color: var(--clr-text-faint);
          font-weight: 600;
        }

        .notif-message {
          color: var(--clr-text-muted);
          font-size: 14px;
          margin-bottom: 20px;
          line-height: 1.6;
        }

        .notif-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid #f1f5f9;
        }

        .notif-card-buttons {
          display: flex;
          gap: 12px;
        }

        .badge {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .btn-sm { padding: 8px 16px; font-size: 13px; border-radius: 8px; }
        .btn-ghost { background: #f8fafc; color: var(--clr-text-muted); border: 1px solid var(--clr-border); }
        .btn-ghost:hover { background: #f1f5f9; color: var(--clr-primary); border-color: var(--clr-primary); }
        
        .btn-danger { background: #fef2f2; color: #dc2626; border: 1px solid #fee2e2; }
        .btn-danger:hover { background: #fee2e2; border-color: #fca5a5; }

        .loading-state, .empty-state {
          text-align: center;
          padding: 80px 24px;
          background: #ffffff;
          border: 1px solid var(--clr-border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
        }

        .empty-state h3 {
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 12px;
          color: var(--clr-text);
        }

        .empty-state p {
          color: var(--clr-text-muted);
          font-size: 16px;
        }

        @media (max-width: 640px) {
          .notif-card {
            flex-direction: column;
            gap: 16px;
          }
          .notif-card-header {
            flex-direction: column;
            gap: 4px;
          }
        }
      `}</style>
    </div>
  );
}
