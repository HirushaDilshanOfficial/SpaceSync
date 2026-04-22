import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, Outlet } from 'react-router-dom';
import { Plus } from 'lucide-react';
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
import './index.css';


import { useAuth } from './context/AuthContext';

// Layout for protected pages
const ProtectedLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN' || user?.email?.includes('admin');

  return (
    <>
      <header className="app-header">
        <div className="header-container">
          <div 
            onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}
            className="header-logo"
          >
            <div className="logo-mark">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
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
            </div>
            <span className="logo-text">SpaceSync</span>
          </div>
          
          <nav className="header-nav">
            {!isAdmin ? (
              <>
                <Link to="/dashboard" className="nav-link"><span className="nav-dot"></span>Dashboard</Link>
                <Link to="/my-bookings" className="nav-link"><span className="nav-dot"></span>My Bookings</Link>
                <Link to="/my-reports" className="nav-link"><span className="nav-dot"></span>My Reports</Link>
                <Link to="/new-booking" className="nav-link nav-link-accent"><Plus size={14}/>New Booking</Link>
              </>
            ) : (
              <>
                <Link to="/admin" className="nav-link admin-link"><span className="nav-dot"></span>Admin Dashboard</Link>
                <Link to="/admin/bookings" className="nav-link"><span className="nav-dot"></span>Manage Bookings</Link>
                <Link to="/admin/users" className="nav-link"><span className="nav-dot"></span>User Management</Link>
                <Link to="/admin/facilities" className="nav-link"><span className="nav-dot"></span>Facilities</Link>
                <Link to="/incidents" className="nav-link"><span className="nav-dot"></span>Incidents</Link>
              </>
            )}
          </nav>

          <div className="header-actions">
            <NotificationBell />
            <div className="user-profile-mini" onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}>
              <div className="user-avatar-ring">
                {user?.pictureUrl ? (
                  <img src={user.pictureUrl} alt="" className="header-avatar-img" />
                ) : (
                  <div className="header-avatar-placeholder">{user?.name?.[0] || 'U'}</div>
                )}
              </div>
              <div className="user-info">
                <span className="user-name">{user?.name?.split(' ')[0] || 'User'}</span>
                <span className="user-role">{user?.role || 'Student'}</span>
              </div>
            </div>
            <button onClick={logout} className="btn btn-ghost btn-logout">Logout</button>
          </div>
        </div>
        <style>{`
          .app-header {
            background: #003087; /* SLIIT Navy */
            border-bottom: 3px solid var(--clr-accent);
            position: sticky;
            top: 0;
            z-index: 1000;
            box-shadow: 0 4px 20px rgba(0, 48, 135, 0.2);
          }
          .app-header::after {
            content: '';
            position: absolute;
            bottom: -3px; left: 0; right: 0;
            height: 3px;
            background: linear-gradient(90deg, #F5A800, #ffc107, #F5A800);
            background-size: 200% 100%;
            animation: headerGradientFlow 3s linear infinite;
          }
          @keyframes headerGradientFlow {
            0% { background-position: 0% 0; }
            100% { background-position: 200% 0; }
          }
          .header-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 10px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .header-logo {
            display: flex;
            align-items: center;
            gap: 12px;
            cursor: pointer;
            transition: all 0.3s;
          }
          .header-logo:hover { transform: scale(1.02); }
          .logo-mark {
            display: flex;
            align-items: center;
            justify-content: center;
            filter: drop-shadow(0 0 10px rgba(255,255,255,0.2));
          }
          .logo-text {
            font-weight: 900; font-size: 24px; letter-spacing: -1.2px;
            color: #ffffff;
          }
          
          .header-nav { display: flex; gap: 4px; align-items: center; margin: 0 30px; }
          .nav-link { 
            font-size: 14px; 
            font-weight: 700; 
            color: rgba(255, 255, 255, 0.85);
            transition: all 0.2s cubic-bezier(.4,0,.2,1);
            padding: 10px 18px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .nav-dot {
            width: 6px; height: 6px; border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transition: all 0.2s;
          }
          .nav-link:hover {
            color: #ffffff;
            background: rgba(255, 255, 255, 0.15);
            transform: translateY(-1px);
          }
          .nav-link:hover .nav-dot {
            background: #F5A800;
            box-shadow: 0 0 10px #F5A800;
            transform: scale(1.3);
          }
          .nav-link-accent {
            background: #F5A800 !important;
            color: #003087 !important;
            box-shadow: 0 4px 12px rgba(245, 168, 0, 0.3);
          }
          .nav-link-accent:hover {
            background: #ffb700 !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 6px 18px rgba(245, 168, 0, 0.4) !important;
          }
          
          .header-actions { display: flex; gap: 18px; align-items: center; }
          .btn-logout {
            padding: 9px 18px; font-size: 13px; border-radius: 12px; font-weight: 800;
            background: rgba(239, 68, 68, 0.15); color: #fecaca;
            border: 1px solid rgba(239, 68, 68, 0.3);
            transition: all 0.2s;
            cursor: pointer;
          }
          .btn-logout:hover { 
            background: #ef4444;
            color: #ffffff;
            border-color: #ef4444;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
          }
          
          .user-profile-mini {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 6px 14px 6px 6px;
            border-radius: 16px;
            cursor: pointer;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.25s;
          }
          .user-profile-mini:hover { 
            background: rgba(255, 255, 255, 0.15);
            border-color: rgba(255, 255, 255, 0.2);
          }
          .user-avatar-ring {
            width: 38px; height: 38px; border-radius: 12px;
            padding: 2px;
            background: #F5A800;
            display: flex; align-items: center; justify-content: center;
          }
          .header-avatar-img {
            width: 100%; height: 100%; border-radius: 10px; object-fit: cover;
            border: 2px solid #003087;
          }
          .header-avatar-placeholder {
            width: 100%; height: 100%; border-radius: 10px;
            background: #003087; color: #fff;
            display: flex; align-items: center; justify-content: center;
            font-weight: 800; font-size: 16px;
          }
          .user-info { display: flex; flex-direction: column; }
          .user-name { font-size: 14px; font-weight: 800; color: #ffffff; line-height: 1.2; }
          .user-role { 
            font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;
            color: rgba(255, 255, 255, 0.6);
          }

          @media (max-width: 900px) {
            .header-nav { display: none; }
            .user-info { display: none; }
          }
        `}</style>
      </header>
      <Outlet />
    </>
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

            {/* Admin Only Routes */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route element={<ProtectedLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/bookings" element={<AdminBookingsPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/facilities" element={<FacilitiesPage />} />
                <Route path="/my-reports" element={<MyIncidentsPage />} />
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
