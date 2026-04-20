import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check roles if provided
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Has account, but no permission for this route
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <h1 style={{ color: 'var(--clr-danger)' }}>Access Denied</h1>
        <p>You don't have permission to view this page.</p>
        <button className="btn btn-primary" onClick={() => window.location.href = '/dashboard'} style={{ marginTop: '20px' }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Authorized
  return <Outlet />;
}
