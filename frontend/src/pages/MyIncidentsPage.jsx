import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft, 
  Search, 
  Filter, 
  MessageSquare,
  Wrench,
  Zap,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const statusConfig = {
  OPEN:        { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', icon: AlertCircle, label: 'Open' },
  IN_PROGRESS: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', icon: Clock, label: 'In Progress' },
  RESOLVED:    { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', icon: CheckCircle, label: 'Resolved' },
  CLOSED:      { color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)', icon: CheckCircle, label: 'Closed' },
};

const priorityConfig = {
  CRITICAL: { color: '#ef4444', label: 'Critical' },
  HIGH:     { color: '#f97316', label: 'High' },
  MEDIUM:   { color: '#f59e0b', label: 'Medium' },
  LOW:      { color: '#10b981', label: 'Low' },
};

const typeIcons = {
  INCIDENT:    Zap,
  MAINTENANCE: AlertTriangle,
  REPAIR:      AlertTriangle,
};

export default function MyIncidentsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const fetchIncidents = async () => {
    try {
      if (!user?.email) return;
      setLoading(true);
      const token = localStorage.getItem('token');
      // The backend uses 'userId' parameter but stores email in reportedBy field
      const response = await fetch(`/api/incidents/reported-by?userId=${user.email}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch reported issues');
      const data = await response.json();
      setIncidents(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [user?.email]);

  const filteredIncidents = incidents.filter(inc => {
    const matchesSearch = inc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         inc.resourceName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || inc.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) return (
    <div className="loading-state">
      <div className="spinner"></div>
      <p>Loading your reports...</p>
      <style>{`
        .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; gap: 16px; color: #94a3b8; }
        .spinner { width: 32px; height: 32px; border: 3px solid #334155; border-top-color: #6366f1; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );

  return (
    <div className="my-incidents-root">
      <div className="container">
        <header className="page-header">
          <div className="header-left">
            <button onClick={() => navigate('/dashboard')} className="back-btn">
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
            <h1 className="page-title">My Reported Issues</h1>
            <p className="page-subtitle">Track the status of incidents and maintenance requests you've submitted.</p>
          </div>
          <button onClick={() => navigate('/report-incident')} className="btn btn-primary">
            <PlusIcon size={18} /> Report New Issue
          </button>
        </header>

        <div className="filters-row glass-card">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by title or resource..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <Filter size={18} className="filter-icon" />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>

        {filteredIncidents.length === 0 ? (
          <div className="empty-state glass-card">
            <div className="empty-icon-box">
              <AlertTriangle size={48} />
            </div>
            <h3>No issues found</h3>
            <p>
              {incidents.length === 0 
                ? "You haven't reported any issues yet. If you spot a problem on campus, let us know!"
                : "No issues match your current filters."}
            </p>
            {incidents.length === 0 && (
              <button onClick={() => navigate('/report-incident')} className="btn btn-primary">
                Report an Issue
              </button>
            )}
          </div>
        ) : (
          <div className="incidents-list">
            {filteredIncidents.map((inc) => {
              const status = statusConfig[inc.status] || statusConfig.OPEN;
              const priority = priorityConfig[inc.priority] || priorityConfig.MEDIUM;
              const TypeIcon = typeIcons[inc.ticketType] || AlertTriangle;
              
              return (
                <div key={inc.id} className="incident-card glass-card">
                  <div className="card-header">
                    <div className="type-badge">
                      <TypeIcon size={14} />
                      <span>{inc.ticketType}</span>
                    </div>
                    <div className="status-badge" style={{ color: status.color, backgroundColor: status.bg }}>
                      <status.icon size={14} />
                      <span>{status.label}</span>
                    </div>
                  </div>

                  <div className="card-body">
                    <h3 className="incident-title">{inc.title}</h3>
                    <p className="incident-desc">{inc.description}</p>
                    
                    <div className="incident-meta">
                      <div className="meta-item">
                        <span className="meta-label">Resource:</span>
                        <span className="meta-value">{inc.resourceName || inc.resourceId}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Priority:</span>
                        <span className="meta-value" style={{ color: priority.color, fontWeight: 700 }}>
                          {priority.label}
                        </span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Reported:</span>
                        <span className="meta-value">{new Date(inc.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {inc.notes && (
                      <div className="admin-notes">
                        <div className="notes-header">
                          <Info size={14} />
                          <span>Admin Feedback</span>
                        </div>
                        <p>{inc.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .my-incidents-root {
          min-height: 100vh;
          padding: 40px 20px 80px;
          background: #0d1117;
          color: #e6edf3;
        }
        .container {
          max-width: 900px;
          margin: 0 auto;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 40px;
          gap: 20px;
        }
        .back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          color: #8b949e;
          font-size: 14px;
          cursor: pointer;
          padding: 0;
          margin-bottom: 12px;
        }
        .back-btn:hover { color: #6366f1; }
        .page-title { font-size: 32px; font-weight: 700; margin: 0 0 8px; letter-spacing: -0.5px; }
        .page-subtitle { color: #8b949e; font-size: 16px; margin: 0; }

        .filters-row {
          display: grid;
          grid-template-columns: 1fr 200px;
          gap: 16px;
          padding: 16px;
          margin-bottom: 32px;
          border-radius: 16px;
        }
        .search-box {
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          left: 12px;
          color: #8b949e;
        }
        .search-box input {
          width: 100%;
          padding: 12px 12px 12px 42px;
          background: rgba(255,255,255,0.03);
          border: 1px solid #30363d;
          border-radius: 12px;
          color: #fff;
          font-size: 14px;
        }
        .filter-group {
          position: relative;
          display: flex;
          align-items: center;
        }
        .filter-icon {
          position: absolute;
          left: 12px;
          color: #8b949e;
          pointer-events: none;
        }
        .filter-group select {
          width: 100%;
          padding: 12px 12px 12px 42px;
          background: rgba(255,255,255,0.03);
          border: 1px solid #30363d;
          border-radius: 12px;
          color: #fff;
          font-size: 14px;
          appearance: none;
        }

        .incidents-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .incident-card {
          padding: 24px;
          border-radius: 20px;
          transition: transform 0.2s;
        }
        .incident-card:hover { transform: translateY(-2px); }

        .card-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .type-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          color: #8b949e;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .status-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .incident-title { font-size: 20px; font-weight: 700; margin: 0 0 10px; }
        .incident-desc { color: #8b949e; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }

        .incident-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 24px;
          padding-top: 20px;
          border-top: 1px solid #30363d;
        }
        .meta-item { display: flex; flex-direction: column; gap: 4px; }
        .meta-label { font-size: 11px; font-weight: 700; color: #484f58; text-transform: uppercase; }
        .meta-value { font-size: 14px; color: #c9d1d9; }

        .admin-notes {
          margin-top: 24px;
          padding: 16px;
          background: rgba(99, 102, 241, 0.05);
          border: 1px solid rgba(99, 102, 241, 0.15);
          border-radius: 12px;
        }
        .notes-header {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #818cf8;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 8px;
          text-transform: uppercase;
        }
        .admin-notes p { font-size: 14px; color: #c9d1d9; line-height: 1.5; margin: 0; }

        .empty-state {
          padding: 80px 40px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }
        .empty-icon-box {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(255,255,255,0.03);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #30363d;
        }
        .empty-state h3 { font-size: 24px; margin: 0; }
        .empty-state p { color: #8b949e; max-width: 400px; margin: 0; }

        .glass-card {
          background: rgba(22, 27, 34, 0.8);
          border: 1px solid #30363d;
          backdrop-filter: blur(12px);
        }
        .btn {
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: none;
        }
        .btn-primary {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: #fff;
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4); }
      `}</style>
    </div>
  );
}

function PlusIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}
