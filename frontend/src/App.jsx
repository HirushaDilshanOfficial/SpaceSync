import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationBell from './components/NotificationBell';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Notifications from './pages/Notifications';
import './index.css';

// Basic Layout Header that will appear on protected routes
const Header = () => (
  <header style={{ 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '16px 24px', 
    backgroundColor: 'var(--clr-bg-card)',
    borderBottom: '1px solid var(--clr-border)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: 'var(--shadow-sm)'
  }}>
    <div style={{fontWeight: 700, fontSize: '20px', color: 'var(--clr-primary)', display: 'flex', alignItems: 'center', gap: '8px'}}>
      <span style={{fontSize: '24px'}}>🚀</span> SpaceSync
    </div>
    <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
      <NotificationBell />
      {/* Sign Out removed as per user request to only show notification bell for status confirmation */}
    </div>
  </header>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <div className="page-wrapper">
            <div className="main-content">
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                
                {/* Fallback for OAuth redirect */}
                <Route path="/oauth2/callback" element={
                  <div style={{ display: 'grid', placeItems: 'center', height: '100vh', textAlign: 'center' }}>
                    <div className="fade-up">
                      <div className="spinner" style={{margin: '0 auto 16px auto'}}></div>
                      <p style={{color: 'var(--clr-text-muted)'}}>Authenticating securely...</p>
                    </div>
                  </div>
                } />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/*" element={
                    <>
                      <Header />
                      <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/notifications" element={<Notifications />} />
                        {/* Placeholder for admin users page */}
                        <Route path="/admin/users" element={
                          <div className="container" style={{paddingTop: '40px'}}>
                            <h2>User Management</h2>
                            <p>Admin panel to assign roles and deactivate users. (Coming soon)</p>
                          </div>
                        } />
                      </Routes>
                    </>
                  } />
                </Route>
              </Routes>
            </div>
          </div>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
