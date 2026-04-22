import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  CalendarDays, LayoutDashboard, CalendarPlus,
  ShieldCheck, Menu, X, AlertTriangle, Wrench,
  LogOut, User, Bell, ChevronDown, Home
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/* ─── SLIIT tokens ───────────────────────────────────────────── */
const NAVY  = '#003087';
const GOLD  = '#F5A800';

const navItems = [
  { to: '/',                label: 'Home',         icon: Home            },
  { to: '/dashboard',       label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/new-booking',     label: 'Book Space',   icon: CalendarPlus    },
  { to: '/my-bookings',     label: 'My Bookings',  icon: CalendarDays    },
  { to: '/report-incident', label: 'Report Issue', icon: AlertTriangle   },
  { to: '/incidents',       label: 'Incidents',    icon: Wrench          },
];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  /* ── Navbar shell ── */
  .ss-nav-shell {
    position: sticky; top: 0; z-index: 999;
    background: #ffffff;
    border-bottom: 2px solid #003087;
    box-shadow: 0 2px 16px rgba(0,48,135,0.10);
    font-family: 'Inter', sans-serif;
  }

  .ss-nav-inner {
    max-width: 1280px; margin: 0 auto;
    padding: 0 28px;
    height: 60px;
    display: flex; align-items: center; gap: 16px;
  }

  /* ── Logo ── */
  .ss-logo {
    display: flex; align-items: center;
    gap: 11px; text-decoration: none; flex-shrink: 0;
  }
  .ss-logo-box {
    width: 36px; height: 36px;
    background: ${NAVY};
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 3px 10px rgba(0,48,135,0.30);
    flex-shrink: 0;
  }
  .ss-logo-text-wrap { display: flex; flex-direction: column; gap: 1px; }
  .ss-logo-name {
    font-size: 16px; font-weight: 800;
    color: #0f172a; letter-spacing: -0.3px; line-height: 1;
  }
  .ss-logo-name span { color: ${NAVY}; }
  .ss-logo-tag {
    font-size: 9px; font-weight: 700;
    color: ${GOLD}; letter-spacing: 0.9px;
    text-transform: uppercase; line-height: 1;
  }

  /* ── Nav divider ── */
  .ss-divider {
    width: 1px; height: 28px;
    background: #e2e8f0; flex-shrink: 0;
  }

  /* ── Nav links ── */
  .ss-nav-links {
    display: flex; align-items: center;
    gap: 1px; flex: 1; justify-content: center;
  }
  .ss-link {
    position: relative;
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: 9px;
    font-size: 13px; font-weight: 600;
    color: #64748b; text-decoration: none;
    transition: all 0.18s ease;
    white-space: nowrap;
  }
  .ss-link:hover {
    color: ${NAVY};
    background: #eef2f9;
  }
  .ss-link.active {
    color: ${NAVY};
    background: #eef2f9;
    font-weight: 700;
  }
  /* Gold underline on active */
  .ss-link.active::after {
    content: '';
    position: absolute;
    bottom: -1px; left: 50%;
    transform: translateX(-50%);
    width: 24px; height: 3px;
    background: ${GOLD};
    border-radius: 2px 2px 0 0;
  }

  /* ── Right side ── */
  .ss-right {
    display: flex; align-items: center; gap: 10px; flex-shrink: 0;
  }

  /* Admin badge */
  .ss-admin-chip {
    display: inline-flex; align-items: center; gap: 6px;
    background: ${NAVY}; color: #fff;
    border: none; border-radius: 9px;
    padding: 7px 14px; font-size: 12px; font-weight: 700;
    cursor: pointer; font-family: 'Inter', sans-serif;
    box-shadow: 0 2px 10px rgba(0,48,135,0.25);
    transition: all 0.2s; letter-spacing: 0.2px;
  }
  .ss-admin-chip:hover {
    background: #001a52;
    box-shadow: 0 4px 14px rgba(0,48,135,0.35);
    transform: translateY(-1px);
  }

  /* Bell */
  .ss-bell-btn {
    width: 38px; height: 38px;
    border-radius: 10px;
    background: #f8fafc; border: 1.5px solid #e2e8f0;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: #64748b;
    transition: all 0.2s; position: relative;
  }
  .ss-bell-btn:hover { border-color: ${NAVY}; color: ${NAVY}; background: #eef2f9; }

  /* Avatar wrap */
  .ss-av-wrap { position: relative; }
  .ss-av-btn {
    display: flex; align-items: center; gap: 9px;
    padding: 5px 10px 5px 5px;
    border-radius: 12px;
    background: #f8fafc; border: 1.5px solid #e2e8f0;
    cursor: pointer; transition: all 0.2s;
    font-family: 'Inter', sans-serif;
  }
  .ss-av-btn:hover { border-color: ${NAVY}; background: #eef2f9; }

  .ss-av-circle {
    width: 32px; height: 32px; border-radius: 8px;
    background: ${NAVY};
    display: flex; align-items: center; justify-content: center;
    overflow: hidden; flex-shrink: 0;
  }
  .ss-av-name  { font-size: 13px; font-weight: 700; color: #0f172a; line-height: 1.2; }
  .ss-av-role  { font-size: 10px; color: #94a3b8; font-weight: 500; line-height: 1; }

  /* Dropdown */
  .ss-dd {
    position: absolute; right: 0; top: calc(100% + 8px);
    background: #fff; border: 1.5px solid #dce6f5;
    border-radius: 14px;
    box-shadow: 0 12px 36px rgba(0,48,135,0.13);
    padding: 6px; min-width: 190px;
    opacity: 0; pointer-events: none;
    transform: translateY(-6px);
    transition: all 0.2s ease; z-index: 300;
  }
  .ss-av-wrap:hover .ss-dd {
    opacity: 1; pointer-events: auto; transform: translateY(0);
  }
  .ss-dd-row {
    display: flex; align-items: center; gap: 9px;
    padding: 9px 12px; border-radius: 9px;
    font-size: 13px; font-weight: 600; color: #334155;
    cursor: pointer; border: none; background: none;
    width: 100%; text-align: left; transition: background 0.15s;
    font-family: 'Inter', sans-serif;
  }
  .ss-dd-row:hover { background: #eef2f9; color: ${NAVY}; }
  .ss-dd-row.red   { color: #e11d48; font-weight: 700; }
  .ss-dd-row.red:hover { background: #fff1f2; color: #e11d48; }
  .ss-dd-sep { height: 1px; background: #dce6f5; margin: 4px 0; }

  /* ── Burger ── */
  .ss-burger {
    margin-left: auto; display: none;
    background: #f8fafc; border: 1.5px solid #e2e8f0;
    border-radius: 9px; padding: 8px;
    cursor: pointer; color: #64748b; transition: all 0.2s;
  }
  .ss-burger:hover { border-color: ${NAVY}; color: ${NAVY}; background: #eef2f9; }

  /* ── Mobile menu ── */
  .ss-mobile {
    background: #fff; border-top: 1px solid #dce6f5;
    padding: 12px 20px 20px;
  }
  .ss-m-link {
    display: flex; align-items: center; gap: 10px;
    padding: 11px 14px; border-radius: 11px;
    font-size: 14px; font-weight: 600; color: #64748b;
    text-decoration: none; transition: all 0.18s; margin-bottom: 2px;
  }
  .ss-m-link:hover { background: #eef2f9; color: ${NAVY}; }
  .ss-m-link.active { background: #eef2f9; color: ${NAVY}; border-left: 3px solid ${GOLD}; }

  @media (max-width: 900px) {
    .ss-nav-links, .ss-right, .ss-divider { display: none !important; }
    .ss-burger { display: flex !important; }
  }
`;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'SS';

  const isAdmin = user?.role === 'ADMIN' || user?.email?.includes('admin');
  const handleLogout = () => { logout?.(); navigate('/login'); };

  return (
    <>
      <style>{CSS}</style>

      <header className="ss-nav-shell">
        <div className="ss-nav-inner">

          {/* Logo */}
          <NavLink to="/dashboard" className="ss-logo">
            <div className="ss-logo-box">
              <CalendarDays size={18} color="#fff" strokeWidth={2.3} />
            </div>
            <div className="ss-logo-text-wrap">
              <span className="ss-logo-name">Space<span>Sync</span></span>
              <span className="ss-logo-tag">SLIIT Campus Hub</span>
            </div>
          </NavLink>

          <div className="ss-divider" />

          {/* Desktop nav */}
          <nav className="ss-nav-links">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `ss-link${isActive ? ' active' : ''}`}
              >
                <Icon size={14} strokeWidth={2.1} />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right */}
          <div className="ss-right">
            {isAdmin && (
              <button className="ss-admin-chip" onClick={() => navigate('/admin')}>
                <ShieldCheck size={13} /> Admin
              </button>
            )}

            <button className="ss-bell-btn" onClick={() => navigate('/notifications')}>
              <Bell size={16} />
            </button>

            <div className="ss-av-wrap">
              <button className="ss-av-btn">
                <div className="ss-av-circle">
                  {user?.pictureUrl
                    ? <img src={user.pictureUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ color: '#fff', fontSize: 11, fontWeight: 800 }}>{initials}</span>
                  }
                </div>
                <div>
                  <p className="ss-av-name">{user?.name?.split(' ')[0] || 'User'}</p>
                  <p className="ss-av-role">{user?.role || 'Student'}</p>
                </div>
                <ChevronDown size={13} color="#94a3b8" />
              </button>

              <div className="ss-dd">
                <button className="ss-dd-row" onClick={() => navigate('/dashboard')}>
                  <User size={14} /> My Profile
                </button>
                <button className="ss-dd-row" onClick={() => navigate('/notifications')}>
                  <Bell size={14} /> Notifications
                </button>
                <div className="ss-dd-sep" />
                <button className="ss-dd-row red" onClick={handleLogout}>
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Mobile burger */}
          <button className="ss-burger" onClick={() => setOpen(!open)}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="ss-mobile">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={({ isActive }) => `ss-m-link${isActive ? ' active' : ''}`}
              >
                <Icon size={16} /> {label}
              </NavLink>
            ))}
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #dce6f5', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="ss-av-circle" style={{ width: 36, height: 36, borderRadius: 10 }}>
                <span style={{ color: '#fff', fontSize: 13, fontWeight: 800 }}>{initials}</span>
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{user?.name || 'User'}</p>
                <p style={{ fontSize: 11, color: '#94a3b8' }}>{user?.role || 'Student'}</p>
              </div>
              <button onClick={handleLogout} style={{ marginLeft: 'auto', background: '#fff1f2', border: '1.5px solid #fecdd3', borderRadius: 9, padding: '7px 14px', fontSize: 12, fontWeight: 800, color: '#e11d48', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' }}>
                Sign Out
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
