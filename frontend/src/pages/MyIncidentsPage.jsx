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
  Info,
  Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const statusConfig = {
  OPEN:        { color: '#dc2626', bg: '#fef2f2', border: '#fee2e2', icon: AlertCircle, label: 'Open' },
  IN_PROGRESS: { color: '#d97706', bg: '#fffbeb', border: '#fef3c7', icon: Clock, label: 'In Progress' },
  RESOLVED:    { color: '#059669', bg: '#ecfdf5', border: '#d1fae5', icon: CheckCircle, label: 'Resolved' },
  CLOSED:      { color: '#4338ca', bg: '#eef2ff', border: '#e0e7ff', icon: CheckCircle, label: 'Closed' },
};

const priorityConfig = {
  CRITICAL: { color: '#dc2626', bg: '#fef2f2', label: 'Critical' },
  HIGH:     { color: '#ea580c', bg: '#fff7ed', label: 'High' },
  MEDIUM:   { color: '#d97706', bg: '#fffbeb', label: 'Medium' },
  LOW:      { color: '#059669', bg: '#f0fdf4', label: 'Low' },
};

const typeIcons = {
  INCIDENT:    Zap,
  MAINTENANCE: Wrench,
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
    const titleMatch = inc.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const resourceMatch = inc.resourceName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         inc.resourceId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = titleMatch || resourceMatch;
    const matchesStatus = filterStatus === 'ALL' || inc.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) return (
    <div className="loading-state">
      <div className="spinner"></div>
      <p>Loading your reports...</p>
      <style>{`
        .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; gap: 16px; color: var(--clr-text-muted); font-family: 'Inter', sans-serif; }
        .spinner { width: 36px; height: 36px; border: 3px solid #e2e8f0; border-top-color: var(--clr-primary); border-radius: 50%; animation: spin 1s linear infinite; }
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

        <div className="filters-row">
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
          <div className="empty-state">
            <div className="empty-icon-box">
              <AlertTriangle size={48} strokeWidth={1} />
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
            {filteredIncidents.map((inc, i) => {
              const status = statusConfig[inc.status] || statusConfig.OPEN;
              const priority = priorityConfig[inc.priority] || priorityConfig.MEDIUM;
              const TypeIcon = typeIcons[inc.ticketType] || AlertTriangle;
              
              return (
                <div key={inc.id} className="incident-card" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="card-header">
                    <div className="type-badge">
                      <TypeIcon size={14} />
                      <span>{inc.ticketType}</span>
                    </div>
                    <div className="status-badge" style={{ color: status.color, backgroundColor: status.bg, borderColor: status.border }}>
                      <status.icon size={14} />
                      <span>{status.label}</span>
                    </div>
                  </div>

                  <div className="card-body">
                    <h3 className="incident-title">{inc.title}</h3>
                    <p className="incident-desc">{inc.description}</p>
                    
                    <div className="incident-meta">
                      <div className="meta-item">
                        <span className="meta-label">Resource</span>
                        <div className="meta-value-box">
                          <Zap size={14} className="meta-icon" />
                          <span className="meta-value">{inc.resourceName || inc.resourceId}</span>
                        </div>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Priority</span>
                        <div className="priority-pill" style={{ color: priority.color, backgroundColor: priority.bg }}>
                          {priority.label}
                        </div>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Reported On</span>
                        <div className="meta-value-box">
                          <Calendar size={14} className="meta-icon" />
                          <span className="meta-value">{new Date(inc.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>

                    {inc.notes && (
                      <div className="admin-notes">
                        <div className="notes-header">
                          <MessageSquare size={14} />
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
          padding: 40px 24px 80px;
          background: var(--clr-bg);
          background-image: var(--grad-mesh);
          color: var(--clr-text);
          font-family: 'Inter', sans-serif;
        }
        .container {
          max-width: 1000px;
          margin: 0 auto;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 48px;
          flex-wrap: wrap;
          gap: 24px;
        }
        .header-left { flex: 1; }
        .back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          color: var(--clr-text-muted);
          font-size: 14px;
          cursor: pointer;
          padding: 0;
          margin-bottom: 12px;
          transition: all 0.2s;
          font-weight: 700;
        }
        .back-btn:hover { color: var(--clr-primary); transform: translateX(-4px); }
        .page-title { font-size: 36px; font-weight: 800; margin: 0 0 8px; color: var(--clr-text); letter-spacing: -1.5px; }
        .page-subtitle { color: var(--clr-text-muted); font-size: 16px; margin: 0; font-weight: 500; }

        .filters-row {
          display: grid;
          grid-template-columns: 1fr 240px;
          gap: 24px;
          padding: 24px;
          margin-bottom: 40px;
          background: #ffffff;
          border: 1px solid var(--clr-border);
          border-radius: 20px;
          box-shadow: var(--shadow-sm);
        }
        @media (max-width: 640px) { .filters-row { grid-template-columns: 1fr; } }

        .search-box { position: relative; display: flex; align-items: center; }
        .search-icon { position: absolute; left: 16px; color: var(--clr-text-faint); }
        .search-box input {
          width: 100%;
          padding: 14px 16px 14px 48px;
          background: #f8fafc;
          border: 1px solid var(--clr-border);
          border-radius: 12px;
          color: var(--clr-text);
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
          font-family: inherit;
        }
        .search-box input:focus { border-color: var(--clr-primary); background: #ffffff; box-shadow: 0 0 0 3px rgba(0,48,135,0.06); }

        .filter-group { position: relative; display: flex; align-items: center; }
        .filter-icon { position: absolute; left: 16px; color: var(--clr-text-faint); pointer-events: none; }
        .filter-group select {
          width: 100%;
          padding: 14px 16px 14px 48px;
          background: #f8fafc;
          border: 1px solid var(--clr-border);
          border-radius: 12px;
          color: var(--clr-text);
          font-size: 14px;
          appearance: none;
          outline: none;
          cursor: pointer;
          font-family: inherit;
        }
        .filter-group select:focus { border-color: var(--clr-primary); background: #ffffff; }

        .incidents-list { display: flex; flex-direction: column; gap: 28px; }
        .incident-card {
          padding: 32px;
          background: #ffffff;
          border: 1px solid var(--clr-border);
          border-radius: 28px;
          transition: all 0.3s cubic-bezier(.4,0,.2,1);
          box-shadow: var(--shadow-sm);
          animation: fadeUp 0.5s ease both;
        }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .incident-card:hover { 
          transform: translateY(-6px); 
          border-color: var(--clr-primary);
          box-shadow: var(--shadow-md);
        }

        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .type-badge {
          display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 800;
          color: var(--clr-text-muted); text-transform: uppercase; letter-spacing: 1px;
          background: #f8fafc; padding: 6px 14px; border-radius: 8px; border: 1px solid var(--clr-border);
        }
        .status-badge {
          display: flex; align-items: center; gap: 8px; padding: 6px 16px; border-radius: 20px;
          font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;
          border: 1px solid;
        }

        .incident-title { font-size: 24px; font-weight: 800; margin: 0 0 12px; color: var(--clr-text); letter-spacing: -0.8px; }
        .incident-desc { color: var(--clr-text-muted); font-size: 16px; line-height: 1.6; margin-bottom: 32px; font-weight: 500; }

        .incident-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 40px;
          padding-top: 32px;
          border-top: 1px solid #f1f5f9;
        }
        .meta-item { display: flex; flex-direction: column; gap: 8px; }
        .meta-label { font-size: 11px; font-weight: 800; color: var(--clr-text-faint); text-transform: uppercase; letter-spacing: 0.8px; }
        .meta-value-box { display: flex; align-items: center; gap: 8px; }
        .meta-icon { color: var(--clr-primary); opacity: 0.7; }
        .meta-value { font-size: 15px; color: var(--clr-text); font-weight: 700; }
        .priority-pill { padding: 4px 12px; border-radius: 8px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }

        .admin-notes {
          margin-top: 32px;
          padding: 24px;
          background: #eff6ff;
          border: 1px solid #dbeafe;
          border-radius: 20px;
          position: relative;
        }
        .admin-notes::before {
          content: ''; position: absolute; top: -8px; left: 32px; width: 16px; height: 16px;
          background: #eff6ff; border-left: 1px solid #dbeafe; border-top: 1px solid #dbeafe;
          transform: rotate(45deg);
        }
        .notes-header { display: flex; align-items: center; gap: 10px; color: var(--clr-primary); font-size: 13px; font-weight: 800; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; }
        .admin-notes p { font-size: 15px; color: #1e40af; line-height: 1.7; margin: 0; font-weight: 500; }

        .empty-state {
          padding: 100px 40px; text-align: center; display: flex; flex-direction: column;
          align-items: center; gap: 24px; background: #ffffff; border: 2px dashed var(--clr-border); border-radius: 28px;
        }
        .empty-icon-box { width: 80px; height: 80px; border-radius: 50%; background: #f8fafc; display: flex; align-items: center; justify-content: center; color: var(--clr-text-faint); }
        .empty-state h3 { font-size: 28px; font-weight: 800; margin: 0; color: var(--clr-text); letter-spacing: -1px; }
        .empty-state p { color: var(--clr-text-muted); max-width: 440px; margin: 0; font-size: 16px; line-height: 1.6; font-weight: 500; }

        .btn {
          padding: 12px 28px; border-radius: 12px; font-weight: 800; font-size: 15px;
          cursor: pointer; transition: all 0.3s; display: inline-flex; align-items: center; gap: 10px; border: none; font-family: inherit;
        }
        .btn-primary { background: var(--grad-primary); color: #ffffff; box-shadow: 0 4px 14px rgba(0,48,135,0.2); }
        .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,48,135,0.3); }
      `}</style>
    </div>
  );
}

function PlusIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}
