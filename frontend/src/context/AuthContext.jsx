import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Create an axios instance for authorized requests globally so it's not recreated on every render
const api = axios.create({
  baseURL: '/api'
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle unauthorized responses globally
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // We will handle logout in the component or via a custom event
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth-logout'));
    }
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
      navigate('/login');
    };
    window.addEventListener('auth-logout', handleLogout);
    return () => window.removeEventListener('auth-logout', handleLogout);
  }, [navigate]);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      alert('Login failed: ' + (error.response?.data?.error || error.message));
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if we just returned from OAuth callback
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    
    // In our Vite setup React Router might handle the path, but let's be safe
    if (location.pathname === '/oauth2/callback' && token) {
      localStorage.setItem('token', token);
      // Clean up URL and navigate to dashboard
      window.history.replaceState({}, document.title, '/dashboard');
      checkAuth().then(() => {
        navigate('/dashboard', { replace: true });
      });
    } else {
      checkAuth();
    }
  }, [location.pathname, navigate]);

  const loginWithGoogle = () => {
    // Redirect to Spring Boot OAuth2 endpoint
    // In dev mode, Vite proxy will forward this to localhost:8080
    window.location.href = '/api/oauth2/authorization/google';
  };

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/signin', { email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      console.error('Sign in failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Invalid credentials. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (userData) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/signup', userData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      console.error('Sign up failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    loading,
    loginWithGoogle,
    signIn,
    signUp,
    logout,
    api // Expose the configured axios instance for other components
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
