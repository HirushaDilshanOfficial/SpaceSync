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
    return 'badge-neutral';
  };

  const getIcon = (type) => {
    if (type.includes('APPROVED')) return '✅';
    if (type.includes('REJECTED')) return '❌';
    if (type.includes('COMMENT')) return '💬';
    if (type.includes('STATUS')) return '🔧';
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
          padding-top: 40px;
          padding-bottom: 80px;
          max-width: 800px;
        }

        .notif-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 32px;
          border-bottom: 1px solid var(--clr-border);
          padding-bottom: 24px;
        }

        .page-title {
          font-size: 28px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 8px;
        }

        .page-subtitle {
          color: var(--clr-text-muted);
          font-size: 15px;
        }

        .notif-filters {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }

        .filter-btn {
          background: transparent;
          border: 1px solid var(--clr-border);
          color: var(--clr-text-muted);
          padding: 8px 20px;
          border-radius: 100px;
          font-family: var(--font);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: var(--t-fast);
        }

        .filter-btn:hover {
          background: var(--clr-bg-hover);
          color: var(--clr-text);
        }

        .filter-btn.active {
          background: rgba(88, 166, 255, 0.15);
          color: var(--clr-primary);
          border-color: var(--clr-primary);
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
          cursor: pointer;
          border-left: 4px solid transparent;
        }

        .notif-card.unread {
          border-left-color: var(--clr-primary);
          background: linear-gradient(145deg, #1a202c 0%, #1c2128 100%);
        }

        .notif-card.read {
          opacity: 0.7;
        }

        .notif-card-icon {
          font-size: 28px;
          background: rgba(255,255,255,0.05);
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
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
          font-size: 16px;
          font-weight: 600;
          color: var(--clr-text);
        }

        .notif-date {
          font-size: 12px;
          color: var(--clr-text-faint);
        }

        .notif-message {
          color: var(--clr-text-muted);
          font-size: 14px;
          margin-bottom: 16px;
          line-height: 1.5;
        }

        .notif-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .notif-card-buttons {
          display: flex;
          gap: 8px;
        }

        .icon-btn {
          padding: 6px 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loading-state, .empty-state {
          text-align: center;
          padding: 64px 24px;
        }

        .loading-state p {
          margin-top: 16px;
          color: var(--clr-text-muted);
        }

        .empty-state h3 {
          font-size: 20px;
          margin-bottom: 8px;
          color: var(--clr-text);
        }

        .empty-state p {
          color: var(--clr-text-muted);
        }

        @media (max-width: 640px) {
          .notif-card {
            flex-direction: column;
            gap: 12px;
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
