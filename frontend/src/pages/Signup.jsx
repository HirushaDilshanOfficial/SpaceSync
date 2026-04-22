import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import '../index.css';

export default function Signup() {
  const { user, loginWithGoogle, signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, go to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (email.toLowerCase() === 'admin@gmail.com') {
      setError('Admin accounts cannot be created via signup. Please use the login page.');
      setLoading(false);
      return;
    }
    
    const result = await signUp({ name, email, password });
    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-bg" style={{ background: 'var(--clr-bg)', backgroundImage: 'var(--grad-mesh)' }}></div>
      
      <motion.div 
        className="login-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          background: '#ffffff',
          border: '1px solid var(--clr-border)',
          borderRadius: '24px',
          padding: '48px',
          boxShadow: 'var(--shadow-xl)',
          width: '100%',
          maxWidth: '440px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div className="lock-icon" style={{ fontSize: '40px', marginBottom: '24px', display: 'block' }}>✍️</div>
        <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--clr-text)', marginBottom: '8px', letterSpacing: '-1px' }}>Create Account</h2>
        <p className="login-subtitle" style={{ color: 'var(--clr-text-muted)', fontSize: '16px' }}>Join the SpaceSync Hub</p>
        
        {error && (
          <div className="alert alert-error fade-up" style={{
            marginTop: '16px', 
            background: 'rgba(248,81,73,0.1)', 
            border: '1px solid var(--clr-danger)',
            padding: '12px',
            borderRadius: '8px',
            color: 'var(--clr-danger)',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginTop: '32px', textAlign: 'left' }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              className="input" 
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">University Email</label>
            <input 
              type="email" 
              className="input" 
              placeholder="name@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="input" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '12px', height: '48px' }}
            disabled={loading}
          >
            {loading ? <div className="spinner" style={{margin:'0 auto'}}></div> : 'Create Account'}
          </button>
        </form>

        <div className="divider">
          <div className="divider-line"></div>
          <span className="divider-text">OR</span>
          <div className="divider-line"></div>
        </div>
        
        <button className="btn google-btn" onClick={loginWithGoogle} style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          background: '#ffffff',
          color: 'var(--clr-text)',
          border: '1px solid var(--clr-border)',
          height: '48px',
          borderRadius: '12px',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.3s'
        }}>
          <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20" style={{marginRight: '12px'}}>
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <p style={{ marginTop: '32px', fontSize: '14px', color: 'var(--clr-text-muted)' }}>
          Already have an account? <Link to="/login" className="login-card-link">Sign In</Link>
        </p>
        
        <p className="login-footer">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
