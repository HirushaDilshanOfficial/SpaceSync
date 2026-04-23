import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import authBg from '../assets/auth-bg.png';
import '../index.css';

export default function Signup() {
  const { user, loginWithGoogle, signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const visualImage = authBg;

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (email.toLowerCase() === 'admin@gmail.com') {
      setError('Admin accounts cannot be created via signup.');
      setLoading(false);
      return;
    }
    
    const result = await signUp({ name, email, password });
    if (!result.success) setError(result.error);
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <Link to="/" className="auth-back-btn">
        <ArrowLeft size={16} />
        Back to Home
      </Link>
      <div className="auth-visual">
        <img src={visualImage} className="auth-visual-img" alt="Campus" />
        <div className="auth-visual-overlay" style={{ background: 'linear-gradient(to bottom, rgba(245, 168, 0, 0.2), rgba(0, 48, 135, 0.9))' }}></div>
        <div className="auth-visual-content">
          <motion.h1 
            className="auth-visual-title"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Join the Smart <br/> Campus Network
          </motion.h1>
          <motion.p 
            className="auth-visual-text"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Create your account today and start accessing premium university resources with ease.
          </motion.p>
        </div>
      </div>

      <div className="auth-form-container">
        <div className="auth-card">
          <div className="auth-logo-box" style={{ background: '#F5A800' }}>
            <UserPlus size={32} color="#003087" />
          </div>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join thousands of students and staff</p>
          
          {error && (
            <motion.div 
              className="badge-danger" 
              style={{ width: '100%', padding: '14px', borderRadius: '14px', marginBottom: '24px', fontSize: '13px', display: 'block', textAlign: 'center', fontWeight: 700 }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-input-group">
              <label className="auth-label">Full Name</label>
              <input 
                type="text" 
                className="auth-input" 
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            </div>
            <div className="auth-input-group">
              <label className="auth-label">University Email</label>
              <input 
                type="email" 
                className="auth-input" 
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="auth-input-group">
              <label className="auth-label">Password</label>
              <input 
                type="password" 
                className="auth-input" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', height: '52px', marginTop: '10px', fontSize: '15px' }}
              disabled={loading}
            >
              {loading ? <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}><Loader2 className="animate-spin" size={20} /> Registering...</div> : <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>Create Account <ArrowRight size={18} /></div>}
            </button>
          </form>

          <div className="auth-divider">OR</div>

          <button 
            onClick={loginWithGoogle} 
            className="google-auth-btn"
          >
            <div className="google-icon-wrapper">
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" width="20" alt="" />
            </div>
            <span>Continue with Google</span>
          </button>

          <div className="auth-footer">
            Already have an account? 
            <Link to="/login" className="auth-link">Login Here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
