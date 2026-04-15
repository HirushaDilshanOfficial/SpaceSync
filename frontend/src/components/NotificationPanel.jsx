import { motion } from 'framer-motion';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

export default function NotificationPanel({ closePanel, onViewAll }) {
  const { notifications, loading, markAsRead } = useNotifications();
  const navigate = useNavigate();

  // Show only top 5 notifications
  const recentNotifs = notifications.slice(0, 5);

  const getDotClass = (type) => {
    if (type.includes('APPROVED')) return 'dot-success';
    if (type.includes('REJECTED')) return 'dot-danger';
    if (type.includes('COMMENT')) return 'dot-info';
    return 'dot-warning';
  };

  const handleNotificationClick = (notif) => {
    if (!notif.read) markAsRead(notif.id);
    closePanel();
    if (notif.actionUrl) {
      navigate(notif.actionUrl);
    }
  };

  return (
    <motion.div 
      className="panel-container"
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ var: '--t-fast' }}
    >
      <div className="panel-header">
        <h3>Notifications</h3>
      </div>
      
      <div className="panel-body">
        {loading ? (
          <div className="panel-loading"><div className="spinner"></div></div>
        ) : notifications.length === 0 ? (
          <div className="panel-empty">No notifications yet</div>
        ) : (
          <ul className="notif-list">
            {recentNotifs.map(n => (
              <li 
                key={n.id} 
                className={`notif-item ${n.read ? 'read' : 'unread'}`}
                onClick={() => handleNotificationClick(n)}
              >
                {!n.read && <div className={`dot ${getDotClass(n.type)}`} />}
                <div className="notif-content">
                  <div className="notif-title">{n.title}</div>
                  <div className="notif-desc">{n.message}</div>
                  <div className="notif-time">{new Date(n.createdAt).toLocaleDateString()}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="panel-footer" onClick={onViewAll}>
        View All Notifications
      </div>

      <style>{`
        .panel-container {
          position: absolute;
          top: 48px;
          right: -8px;
          width: 340px;
          background: var(--clr-bg-card);
          border: 1px solid var(--clr-border);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          z-index: 1000;
          overflow: hidden;
        }

        .panel-header {
          padding: 14px 16px;
          border-bottom: 1px solid var(--clr-border);
          background: rgba(255,255,255,0.02);
        }

        .panel-header h3 {
          font-size: 14px;
          font-weight: 600;
          color: var(--clr-text);
        }

        .panel-body {
          max-height: 320px;
          overflow-y: auto;
        }

        .panel-loading, .panel-empty {
          padding: 32px 16px;
          text-align: center;
          color: var(--clr-text-muted);
          font-size: 13px;
          display: flex;
          justify-content: center;
        }

        .notif-list {
          list-style: none;
        }

        .notif-item {
          padding: 12px 16px;
          border-bottom: 1px solid var(--clr-border);
          display: flex;
          align-items: flex-start;
          gap: 12px;
          cursor: pointer;
          transition: background var(--t-fast);
        }

        .notif-item:hover {
          background: var(--clr-bg-hover);
        }

        .notif-item.read {
          opacity: 0.7;
        }

        .notif-item .dot {
          margin-top: 6px;
        }

        .notif-content {
          flex: 1;
        }

        .notif-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--clr-text);
          margin-bottom: 2px;
        }

        .notif-desc {
          font-size: 12px;
          color: var(--clr-text-muted);
          line-height: 1.4;
          margin-bottom: 6px;
        }

        .notif-time {
          font-size: 11px;
          color: var(--clr-text-faint);
        }

        .panel-footer {
          padding: 12px;
          text-align: center;
          font-size: 13px;
          font-weight: 500;
          color: var(--clr-primary);
          cursor: pointer;
          background: rgba(255,255,255,0.02);
          transition: background var(--t-fast);
        }

        .panel-footer:hover {
          background: var(--clr-bg-hover);
        }
      `}</style>
    </motion.div>
  );
}
