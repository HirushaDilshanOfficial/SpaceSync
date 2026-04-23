import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, Outlet } from 'react-router-dom';
import React from 'react';
import { 
  Plus, 
  Home, 
  LayoutDashboard, 
  BookOpen, 
  ClipboardList, 
  Settings, 
  Users, 
  Wrench, 
  Bell,
  LogOut,
  Calendar as CalendarIcon,
  AlertCircle
} from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationBell from './components/NotificationBell';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Notifications from './pages/Notifications';
import LandingPage from './pages/LandingPage';
import { NewBookingPage } from './pages/NewBookingPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { AdminBookingsPage } from './pages/AdminBookingsPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import AdminDashboard from './pages/AdminDashboard';
import FacilitiesUserPage from './components/facilities/FacilitiesUserPage';
import FacilitiesPage from './components/facilities/FacilitiesPage';
import { ReportIncidentPage } from './pages/ReportIncidentPage';
import { IncidentDashboardPage } from './pages/IncidentDashboardPage';
import { IncidentDetailsPage } from './pages/IncidentDetailsPage';
import { MaintenanceCalendarPage } from './pages/MaintenanceCalendarPage';
import MyIncidentsPage from './pages/MyIncidentsPage';
import TechnicianDashboard from './pages/TechnicianDashboard';
import './index.css';


import { useAuth } from './context/AuthContext';

// Layout for protected pages
const ProtectedLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN' || user?.email?.includes('admin');
  const isTechnician = user?.role === 'TECHNICIAN';

  const NavItem = ({ to, icon: Icon, label }) => (
    <Link to={to} className="side-nav-link">
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  );

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="app-sidebar">
        <div className="sidebar-top">
          <div className="sidebar-logo" onClick={() => navigate(isAdmin ? '/admin' : (isTechnician ? '/technician' : '/dashboard'))}>
            <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
              <defs>
                <linearGradient id="logoGrad1" x1="0" y1="0" x2="32" y2="32">
                  <stop offset="0%" stopColor="#4f6ef7"/>
                  <stop offset="50%" stopColor="#7c3aed"/>
                  <stop offset="100%" stopColor="#F5A800"/>
                </linearGradient>
                <linearGradient id="logoGrad2" x1="0" y1="0" x2="32" y2="32">
                  <stop offset="0%" stopColor="#F5A800"/>
                  <stop offset="100%" stopColor="#f43f5e"/>
                </linearGradient>
              </defs>
              <rect width="32" height="32" rx="10" fill="url(#logoGrad1)"/>
              <path d="M10 22V14C10 10.686 12.686 8 16 8C19.314 8 22 10.686 22 14V22" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="16" cy="18" r="2.5" fill="url(#logoGrad2)"/>
              <path d="M8 22H24" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            <span className="logo-text">SpaceSync</span>
          </div>

          <nav className="side-nav">
            <div className="nav-section-label">Main Menu</div>
            {isTechnician ? (
              <>
                <NavItem to="/" icon={Home} label="Home" />
                <NavItem to="/technician" icon={LayoutDashboard} label="Tech Dashboard" />
                <NavItem to="/incidents" icon={Wrench} label="Assigned Tasks" />
                <NavItem to="/resources" icon={BookOpen} label="Campus Map" />
              </>
            ) : !isAdmin ? (
              <>
                <NavItem to="/" icon={Home} label="Home" />
                <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                <NavItem to="/my-bookings" icon={BookOpen} label="My Bookings" />
                <NavItem to="/my-reports" icon={ClipboardList} label="My Reports" />
                <Link to="/new-booking" className="side-nav-btn">
                  <Plus size={18} /> 
                  <span>New Booking</span>
                </Link>
              </>
            ) : (
              <>
                <NavItem to="/" icon={Home} label="Home" />
                <NavItem to="/admin" icon={LayoutDashboard} label="Admin Panel" />
                <NavItem to="/admin/bookings" icon={BookOpen} label="Manage Bookings" />
                <NavItem to="/admin/users" icon={Users} label="Users" />
                <NavItem to="/admin/facilities" icon={Settings} label="Facilities" />
                <NavItem to="/incidents" icon={Wrench} label="Incident Center" />
                <NavItem to="/maintenance-calendar" icon={CalendarIcon} label="Calendar" />
              </>
            )}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <button onClick={logout} className="side-logout-btn">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="app-main-wrapper">
        <header className="app-top-header">
          <div className="top-header-left">
            <h2 className="view-title">Welcome back, {user?.name?.split(' ')[0]}</h2>
          </div>
          <div className="top-header-actions">
            <NotificationBell />
            <div className="user-profile-top" onClick={() => navigate(isAdmin ? '/admin' : (isTechnician ? '/technician' : '/dashboard'))}>
              <div className="user-info-text">
                <span className="user-name">{user?.name || 'User'}</span>
                <span className="user-role">{user?.role || 'Student'}</span>
              </div>
              <div className="user-avatar-small">
                {user?.pictureUrl ? (
                  <img src={user.pictureUrl} alt="" />
                ) : (
                  <span>{user?.name?.[0]}</span>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="content-viewport">
          <Outlet />
        </main>
      </div>
        <style>{`
          .app-layout {
            display: flex;
            min-height: 100vh;
            background: #f4f7fe;
          }

          /* Sidebar Styles */
          .app-sidebar {
            width: 280px;
            background: #003087; /* SLIIT Navy */
            color: #ffffff;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 32px 20px;
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            z-index: 1000;
            box-shadow: 4px 0 20px rgba(0, 48, 135, 0.1);
          }

          .sidebar-logo {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 48px;
            padding: 0 12px;
            cursor: pointer;
          }
          .logo-text {
            font-size: 24px;
            font-weight: 900;
            letter-spacing: -1px;
          }

          .side-nav {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .nav-section-label {
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: rgba(255, 255, 255, 0.4);
            margin: 24px 12px 12px;
          }

          .side-nav-link {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 12px 16px;
            color: rgba(255, 255, 255, 0.7);
            text-decoration: none;
            font-weight: 700;
            font-size: 15px;
            border-radius: 12px;
            transition: all 0.2s;
          }
          .side-nav-link:hover {
            background: rgba(255, 255, 255, 0.1);
            color: #ffffff;
          }

          .side-nav-btn {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 20px;
            margin-top: 24px;
            background: #F5A800; /* SLIIT Gold */
            color: #003087;
            text-decoration: none;
            font-weight: 800;
            border-radius: 14px;
            box-shadow: 0 4px 15px rgba(245, 168, 0, 0.3);
            transition: all 0.2s;
          }
          .side-nav-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(245, 168, 0, 0.4);
          }

          .side-logout-btn {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 14px 20px;
            color: rgba(255, 255, 255, 0.6);
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            cursor: pointer;
            width: 100%;
            font-weight: 700;
            transition: all 0.2s;
          }
          .side-logout-btn:hover {
            background: rgba(244, 63, 94, 0.1);
            color: #f43f5e;
            border-color: rgba(244, 63, 94, 0.2);
          }

          /* Main Wrapper */
          .app-main-wrapper {
            flex: 1;
            margin-left: 280px;
            display: flex;
            flex-direction: column;
          }

          .app-top-header {
            height: 80px;
            background: #ffffff;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 40px;
            position: sticky;
            top: 0;
            z-index: 100;
          }
          .view-title {
            font-size: 18px;
            font-weight: 800;
            color: #1e293b;
          }

          .top-header-actions {
            display: flex;
            align-items: center;
            gap: 24px;
          }
          .user-profile-top {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 6px 6px 6px 16px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            cursor: pointer;
            transition: all 0.2s;
          }
          .user-profile-top:hover {
            background: #f1f5f9;
            border-color: #cbd5e1;
          }
          .user-info-text {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
          }
          .user-name {
            font-size: 14px;
            font-weight: 800;
            color: #1e293b;
          }
          .user-role {
            font-size: 10px;
            font-weight: 800;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .user-avatar-small {
            width: 36px;
            height: 36px;
            border-radius: 10px;
            background: #F5A800;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-weight: 800;
            overflow: hidden;
          }
          .user-avatar-small img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .content-viewport {
            padding: 40px;
            flex: 1;
          }

          @media (max-width: 1100px) {
            .app-sidebar { width: 80px; padding: 32px 12px; }
            .logo-text, .nav-section-label, .side-nav-link span, .side-nav-btn span, .side-logout-btn span { display: none; }
            .app-main-wrapper { margin-left: 80px; }
            .side-nav-link { justify-content: center; padding: 12px; }
            .side-nav-btn { justify-content: center; padding: 12px; }
            .side-logout-btn { justify-content: center; padding: 12px; }
          }
        `}</style>
      </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/resources" element={<FacilitiesUserPage />} />
            
            {/* Fallback for OAuth redirect */}
            <Route path="/oauth2/callback" element={
              <div style={{ display: 'grid', placeItems: 'center', height: '100vh', textAlign: 'center' }}>
                <div className="fade-up">
                  <div className="spinner" style={{margin: '0 auto 16px auto'}}></div>
                  <p style={{color: 'var(--clr-text-muted)'}}>Authenticating securely...</p>
                </div>
              </div>
            } />

            {/* Protected Routes (All Users) */}
            <Route element={<ProtectedRoute />}>
              <Route element={<ProtectedLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/new-booking" element={<NewBookingPage />} />
                <Route path="/my-bookings" element={<MyBookingsPage />} />
                <Route path="/my-reports" element={<MyIncidentsPage />} />
                <Route path="/report-incident" element={<ReportIncidentPage />} />
                <Route path="/incidents" element={<IncidentDashboardPage />} />
                <Route path="/incidents/:id" element={<IncidentDetailsPage />} />
                <Route path="/maintenance-calendar" element={<MaintenanceCalendarPage />} />
              </Route>
            </Route>

            {/* Technician Only Routes */}
            <Route element={<ProtectedRoute allowedRoles={['TECHNICIAN']} />}>
              <Route element={<ProtectedLayout />}>
                <Route path="/technician" element={<TechnicianDashboard />} />
              </Route>
            </Route>

            {/* Admin Only Routes */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route element={<ProtectedLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/bookings" element={<AdminBookingsPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/facilities" element={<FacilitiesPage />} />
              </Route>
            </Route>
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
