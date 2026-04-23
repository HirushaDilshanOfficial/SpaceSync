import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Lock, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import authBg from '../assets/auth-bg.png';
import '../index.css';

export default function Login() {
  const { user, loginWithGoogle, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Note: Since I can't move files easily, I'll use the generated image path directly if possible or a high-quality placeholder.
  // The generated image path was: /Users/hirushadilshan/.gemini/antigravity/brain/967bcb2e-d84d-49ce-9b9e-67d8aee5a09c/campus_modern_study_area_1776883205544.png
  // Use the local generated image
  const visualImage = authBg;

  if (user) {
    const isAdmin = user.role === 'ADMIN' || user.email?.includes('admin');
    const isTechnician = user.role === 'TECHNICIAN';
    return <Navigate to={isAdmin ? "/admin" : (isTechnician ? "/technician" : "/dashboard")} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await signIn(email, password);
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
        <div className="auth-visual-overlay"></div>
        <div className="auth-visual-content">
          <motion.h1 
            className="auth-visual-title"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            The Future of <br/> Campus Operations
          </motion.h1>
          <motion.p 
            className="auth-visual-text"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Seamlessly manage bookings, report incidents, and coordinate campus maintenance all in one smart platform.
          </motion.p>
        </div>
      </div>

      <div className="auth-form-container">
        <div className="auth-card">
          <div className="auth-logo-box">
            <Lock size={32} />
          </div>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to your SpaceSync account</p>
          
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
              {loading ? <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}><Loader2 className="animate-spin" size={20} /> Signing in...</div> : <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>Sign In <ArrowRight size={18} /></div>}
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
            New to the platform? 
            <Link to="/signup" className="auth-link">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
