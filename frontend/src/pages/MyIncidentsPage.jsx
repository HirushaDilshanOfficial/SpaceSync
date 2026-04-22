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
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight
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
  const [filterStatus, setFilterStatus]     = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterType, setFilterType]         = useState('ALL');
  const [viewMode, setViewMode]             = useState('LIST');
  const [currentDate, setCurrentDate]       = useState(new Date());
  const [selectedDay, setSelectedDay]       = useState(null);

  const stats = {
    total:   incidents.length,
    solved:  incidents.filter(i => i.status === 'RESOLVED' || i.status === 'CLOSED').length,
    pending: incidents.filter(i => i.status === 'OPEN' || i.status === 'IN_PROGRESS').length,
  };

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
    const matchesSearch   = titleMatch || resourceMatch;
    const matchesStatus   = filterStatus === 'ALL' || inc.status === filterStatus;
    const matchesPriority = filterPriority === 'ALL' || inc.priority === filterPriority;
    const matchesType     = filterType === 'ALL' || inc.ticketType === filterType;
    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  /* ── Calendar Helpers ── */
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const calendarGrid = [...Array(firstDayOfMonth).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const getIncidentsForDay = (day) => {
    if (!day) return [];
    const dateStr = new Date(year, month, day).toDateString();
    return filteredIncidents.filter(inc => {
      const d = inc.scheduledStart ? new Date(inc.scheduledStart) : new Date(inc.createdAt);
      return d.toDateString() === dateStr;
    });
  };

  const navMonth = (dir) => {
    setCurrentDate(new Date(year, month + dir, 1));
    setSelectedDay(null);
  };

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

        <div className="stats-row-mini">
          <div className="stat-card-mini">
            <div className="stat-icon-mini" style={{ background: 'rgba(0,48,135,0.1)', color: 'var(--clr-primary)' }}>
              <AlertTriangle size={20} />
            </div>
            <div className="stat-info-mini">
              <span className="stat-label-mini">Total Reports</span>
              <span className="stat-value-mini">{stats.total}</span>
            </div>
          </div>
          <div className="stat-card-mini">
            <div className="stat-icon-mini" style={{ background: 'rgba(5,150,105,0.1)', color: '#059669' }}>
              <CheckCircle size={20} />
            </div>
            <div className="stat-info-mini">
              <span className="stat-label-mini">Solved</span>
              <span className="stat-value-mini">{stats.solved}</span>
            </div>
          </div>
          <div className="stat-card-mini">
            <div className="stat-icon-mini" style={{ background: 'rgba(217,119,6,0.1)', color: '#d97706' }}>
              <Clock size={20} />
            </div>
            <div className="stat-info-mini">
              <span className="stat-label-mini">Pending</span>
              <span className="stat-value-mini">{stats.pending}</span>
            </div>
          </div>
        </div>

        <div className="view-toggle-row">
          <div className="view-toggle">
            <button className={viewMode === 'LIST' ? 'active' : ''} onClick={() => setViewMode('LIST')}>
              <Filter size={16} /> List View
            </button>
            <button className={viewMode === 'CALENDAR' ? 'active' : ''} onClick={() => setViewMode('CALENDAR')}>
              <Calendar size={16} /> Calendar
            </button>
          </div>
        </div>

        <div className="filters-row-advanced">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search issues..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="ALL">All Status</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
          <div className="filter-group">
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
              <option value="ALL">All Priority</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          <div className="filter-group">
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="ALL">All Type</option>
              <option value="INCIDENT">Incident</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="REPAIR">Repair</option>
            </select>
          </div>
        </div>

        {viewMode === 'CALENDAR' ? (
          <div className="calendar-view">
            <div className="cal-card">
              <div className="cal-header">
                <button className="nav-btn" onClick={() => navMonth(-1)}>
                  <ChevronLeft size={20} />
                </button>
                <h3>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                <button className="nav-btn" onClick={() => navMonth(1)}>
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="cal-days-header">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
              </div>

              <div className="cal-grid">
                {calendarGrid.map((day, i) => {
                  const dayIncidents = getIncidentsForDay(day);
                  const isToday = day && new Date().toDateString() === new Date(year, month, day).toDateString();
                  const isSelected = selectedDay?.day === day;

                  return (
                    <div 
                      key={i} 
                      className={`cal-cell ${day ? 'active' : 'empty'} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                      onClick={() => day && setSelectedDay({ day, incidents: dayIncidents })}
                    >
                      {day && <span className="day-num">{day}</span>}
                      {dayIncidents.length > 0 && (
                        <div className="day-dots">
                          {dayIncidents.slice(0, 3).map(inc => (
                            <span 
                              key={inc.id} 
                              className="dot" 
                              style={{ background: statusConfig[inc.status]?.color || '#64748b' }}
                            />
                          ))}
                          {dayIncidents.length > 3 && <span className="more-dots">+{dayIncidents.length - 3}</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedDay && (
              <div className="selected-day-details">
                <div className="details-header">
                  <h4>{new Date(year, month, selectedDay.day).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h4>
                  <button className="close-btn" onClick={() => setSelectedDay(null)}>✕</button>
                </div>
                <div className="details-list">
                  {selectedDay.incidents.length === 0 ? (
                    <p className="no-incidents">No issues reported for this day.</p>
                  ) : (
                    selectedDay.incidents.map(inc => {
                      const status = statusConfig[inc.status] || statusConfig.OPEN;
                      return (
                        <div key={inc.id} className="detail-item" onClick={() => navigate(`/incidents/${inc.id}`)}>
                          <div className="detail-status" style={{ background: status.color }} />
                          <div className="detail-info">
                            <h5>{inc.title}</h5>
                            <span>{inc.ticketType} · {status.label}</span>
                          </div>
                          <ChevronDown size={14} style={{ transform: 'rotate(-90deg)', opacity: 0.5 }} />
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        ) : filteredIncidents.length === 0 ? (
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
        .view-toggle-row { margin-bottom: 24px; display: flex; justify-content: flex-start; }
        .view-toggle {
          display: flex; background: #ffffff; padding: 6px; border-radius: 14px;
          border: 1px solid var(--clr-border); box-shadow: var(--shadow-sm);
        }
        .view-toggle button {
          display: flex; align-items: center; gap: 8px; padding: 8px 20px;
          border-radius: 10px; border: none; font-size: 14px; font-weight: 700;
          cursor: pointer; transition: all 0.2s; background: transparent; color: var(--clr-text-muted);
        }
        .view-toggle button.active {
          background: var(--clr-primary); color: #ffffff; box-shadow: 0 4px 10px rgba(0,48,135,0.2);
        }
        .view-toggle button:not(.active):hover { background: #f8fafc; color: var(--clr-primary); }

        .calendar-view { display: grid; grid-template-columns: 1fr 340px; gap: 32px; align-items: start; animation: fadeUp 0.5s ease both; }
        @media (max-width: 900px) { .calendar-view { grid-template-columns: 1fr; } }
        
        .cal-card {
          background: #ffffff; border: 1px solid var(--clr-border); border-radius: 24px;
          padding: 32px; box-shadow: var(--shadow-sm);
        }
        .cal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .cal-header h3 { font-size: 20px; font-weight: 800; color: var(--clr-text); letter-spacing: -0.5px; }
        .nav-btn {
          width: 40px; height: 40px; border-radius: 12px; border: 1px solid var(--clr-border);
          background: #f8fafc; color: var(--clr-primary); display: flex; align-items: center;
          justify-content: center; cursor: pointer; transition: all 0.2s;
        }
        .nav-btn:hover { background: #ffffff; border-color: var(--clr-primary); transform: translateY(-2px); }

        .cal-days-header {
          display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; margin-bottom: 16px;
        }
        .cal-days-header div {
          text-align: center; font-size: 12px; font-weight: 800; color: var(--clr-text-faint);
          text-transform: uppercase; letter-spacing: 1px;
        }

        .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; }
        .cal-cell {
          aspect-ratio: 1; border-radius: 12px; display: flex; flex-direction: column;
          align-items: center; justify-content: center; position: relative; transition: all 0.2s;
        }
        .cal-cell.active { background: #f8fafc; border: 1px solid var(--clr-border); cursor: pointer; }
        .cal-cell.active:hover { transform: translateY(-2px); border-color: var(--clr-primary); background: #ffffff; }
        .cal-cell.today { border: 2px solid var(--clr-primary); background: #eff6ff; }
        .cal-cell.selected { background: var(--clr-primary); color: #ffffff; border-color: var(--clr-primary); }
        .cal-cell.selected .day-num { color: #ffffff; }
        .cal-cell.empty { opacity: 0.3; }
        
        .day-num { font-size: 14px; font-weight: 700; color: var(--clr-text); }
        .day-dots {
          display: flex; gap: 3px; position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%);
        }
        .dot { width: 4px; height: 4px; border-radius: 50%; }
        .more-dots { font-size: 8px; font-weight: 800; color: var(--clr-text-faint); margin-left: 1px; }

        .selected-day-details {
          background: #ffffff; border: 1px solid var(--clr-border); border-radius: 24px;
          padding: 24px; box-shadow: var(--shadow-md); position: sticky; top: 40px;
          animation: slideInRight 0.4s cubic-bezier(.4,0,.2,1);
        }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        .details-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .details-header h4 { font-size: 16px; font-weight: 800; color: var(--clr-text); }
        .close-btn { background: none; border: none; font-size: 18px; color: var(--clr-text-faint); cursor: pointer; }
        
        .details-list { display: flex; flex-direction: column; gap: 12px; }
        .detail-item {
          display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 12px;
          background: #f8fafc; border: 1px solid var(--clr-border); cursor: pointer; transition: all 0.2s;
        }
        .detail-item:hover { transform: scale(1.02); border-color: var(--clr-primary); background: #ffffff; }
        .detail-status { width: 4px; height: 24px; border-radius: 2px; }
        .detail-info { flex: 1; min-width: 0; }
        .detail-info h5 { font-size: 14px; font-weight: 700; margin: 0 0 2px; color: var(--clr-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .detail-info span { font-size: 11px; color: var(--clr-text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .stats-row-mini { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 32px; }
        @media (max-width: 768px) { .stats-row-mini { grid-template-columns: 1fr; } }
        .stat-card-mini {
          display: flex; align-items: center; gap: 16px; padding: 20px;
          background: #ffffff; border: 1px solid var(--clr-border); border-radius: 20px;
          box-shadow: var(--shadow-sm); transition: all 0.3s ease;
        }
        .stat-card-mini:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); border-color: var(--clr-primary); }
        .stat-icon-mini {
          width: 44px; height: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
        }
        .stat-info-mini { display: flex; flex-direction: column; }
        .stat-label-mini { font-size: 11px; font-weight: 800; color: var(--clr-text-faint); text-transform: uppercase; letter-spacing: 0.5px; }
        .stat-value-mini { font-size: 24px; font-weight: 800; color: var(--clr-text); line-height: 1.2; }

        .filters-row-advanced {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1fr;
          gap: 16px;
          padding: 16px;
          margin-bottom: 32px;
          background: #ffffff;
          border: 1px solid var(--clr-border);
          border-radius: 20px;
          box-shadow: var(--shadow-sm);
        }
        @media (max-width: 900px) { .filters-row-advanced { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 500px) { .filters-row-advanced { grid-template-columns: 1fr; } }

        .search-box { position: relative; display: flex; align-items: center; }
        .search-icon { position: absolute; left: 16px; color: var(--clr-text-faint); }
        .search-box input {
          width: 100%;
          padding: 12px 16px 12px 48px;
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

        .filter-group select {
          width: 100%;
          padding: 12px 16px;
          background: #f8fafc;
          border: 1px solid var(--clr-border);
          border-radius: 12px;
          color: var(--clr-text);
          font-size: 14px;
          appearance: none;
          outline: none;
          cursor: pointer;
          font-family: inherit;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 14px;
        }
        .filter-group select:focus { border-color: var(--clr-primary); background-color: #ffffff; }

        .no-incidents { text-align: center; color: var(--clr-text-faint); font-size: 14px; padding: 20px 0; font-weight: 500; }

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
