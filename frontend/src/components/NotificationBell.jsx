import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../context/NotificationContext';
import NotificationPanel from './NotificationPanel';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef(null);
  const navigate = useNavigate();

  // Close panel if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const togglePanel = () => setIsOpen(!isOpen);

  return (
    <div className="notification-bell-container" ref={bellRef}>
      <button className="bell-btn" onClick={togglePanel} aria-label="Notifications">
        <svg fill="currentColor" viewBox="0 0 24 24" width="24" height="24">
          <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
        </svg>
        
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span 
              className="badge-count"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {isOpen && (
          <NotificationPanel 
            closePanel={() => setIsOpen(false)} 
            onViewAll={() => {
              setIsOpen(false);
              navigate('/notifications');
            }}
          />
        )}
      </AnimatePresence>

      <style>{`
        .notification-bell-container {
          position: relative;
        }

        .bell-btn {
          background: transparent;
          border: none;
          color: var(--clr-text-muted);
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--t-fast);
          position: relative;
        }

        .bell-btn:hover {
          color: var(--clr-text);
          background: rgba(255,255,255,0.05);
        }

        .badge-count {
          position: absolute;
          top: 2px;
          right: 2px;
          background: var(--clr-danger);
          color: white;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 5px;
          border-radius: 10px;
          border: 2px solid var(--clr-bg);
          line-height: 1;
        }
      `}</style>
    </div>
  );
}
