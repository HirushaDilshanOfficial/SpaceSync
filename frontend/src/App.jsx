import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, Outlet } from 'react-router-dom';
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
            <span className="logo-icon">🚀</span>
            <span className="logo-text">SpaceSync</span>
          </div>
          
          <nav className="header-nav">
            {!isAdmin ? (
              <>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <Link to="/my-bookings" className="nav-link">My Bookings</Link>
                <Link to="/new-booking" className="nav-link">New Booking</Link>
              </>
            ) : (
              <>
                <Link to="/admin" className="nav-link admin-link">Admin Dashboard</Link>
                <Link to="/admin/bookings" className="nav-link">Manage Bookings</Link>
                <Link to="/admin/users" className="nav-link">User Management</Link>
                <Link to="/admin/facilities" className="nav-link">Facilities</Link>
              </>
            )}
          </nav>

          <div className="header-actions">
            <NotificationBell />
            <div className="user-profile-mini" onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}>
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
            background-color: rgba(22, 27, 34, 0.8);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid var(--clr-border);
            position: sticky;
            top: 0;
            z-index: 1000;
            box-shadow: var(--shadow-sm);
          }
          .header-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 12px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .header-logo {
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            transition: transform 0.2s;
          }
          .header-logo:hover { transform: scale(1.02); }
          .logo-icon { font-size: 24px; }
          .logo-text { font-weight: 800; font-size: 20px; color: var(--clr-primary); letter-spacing: -0.5px; }
          
          .header-nav { display: flex; gap: 32px; align-items: center; margin: 0 40px; }
          .nav-link { 
            font-size: 14px; 
            font-weight: 500; 
            color: var(--clr-text-muted); 
            transition: all 0.2s;
            position: relative;
            padding: 4px 0;
          }
          .nav-link:hover { color: var(--clr-text); }
          .nav-link.admin-link { color: var(--clr-accent); }
          
          .header-actions { display: flex; gap: 20px; align-items: center; }
          .btn-logout { padding: 6px 12px; font-size: 13px; }
          
          .user-profile-mini {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 4px 8px;
            border-radius: 10px;
            cursor: pointer;
            transition: background 0.2s;
          }
          .user-profile-mini:hover { background: rgba(255,255,255,0.05); }
          .user-info { display: flex; flex-direction: column; text-align: right; }
          .user-name { font-size: 13px; font-weight: 600; color: var(--clr-text); line-height: 1.2; }
          .user-role { font-size: 10px; font-weight: 700; color: var(--clr-text-muted); text-transform: uppercase; letter-spacing: 0.5px; }

          @media (max-width: 768px) {
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
