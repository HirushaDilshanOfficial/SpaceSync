import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, AlertTriangle, CheckCircle, Clock,
  Wrench, Zap, User, MapPin, Tag, Calendar,
  UserPlus, MessageSquare, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PRIORITY_CFG = {
  CRITICAL: { bg: '#fef2f2', text: '#dc2626', dot: '#ef4444', label: 'Critical' },
  HIGH:     { bg: '#fff7ed', text: '#ea580c', dot: '#f97316', label: 'High'     },
  MEDIUM:   { bg: '#fefce8', text: '#ca8a04', dot: '#eab308', label: 'Medium'   },
  LOW:      { bg: '#f0fdf4', text: '#16a34a', dot: '#22c55e', label: 'Low'      },
};

const STATUS_CFG = {
  OPEN:        { bg: '#eff6ff', text: '#2563eb', label: 'Open'        },
  IN_PROGRESS: { bg: '#f5f3ff', text: '#7c3aed', label: 'In Progress' },
  RESOLVED:    { bg: '#ecfdf5', text: '#059669', label: 'Resolved'    },
  CLOSED:      { bg: '#eef2ff', text: '#4338ca', label: 'Closed'      },
};

const TYPE_CFG = {
  INCIDENT:    { Icon: Zap,    label: 'Incident'    },
  MAINTENANCE: { Icon: Wrench, label: 'Maintenance' },
  REPAIR:      { Icon: Wrench, label: 'Repair'      },
};

export function IncidentDetailsPage() {
  const navigate  = useNavigate();
  const { user: currentUser } = useAuth();
  const { id }    = useParams();
  const [incident, setIncident] = useState(null);
  const [logs,     setLogs]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [technicians, setTechnicians] = useState([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [newNotes, setNewNotes] = useState('');

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.email?.includes('admin');
  const isTechnician = currentUser?.role === 'TECHNICIAN';
  const isAssignedToMe = incident?.assignedTo === currentUser?.email;

  const fetchData = useCallback(async () => {
    try {
      const token   = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [incRes, logRes] = await Promise.all([
        fetch(`/api/incidents/${id}`,      { headers }),
        fetch(`/api/incidents/${id}/logs`, { headers }),
      ]);
      if (incRes.ok) setIncident(await incRes.json());
      if (logRes.ok) setLogs(await logRes.json());
      
      // If admin, fetch potential technicians
      if (isAdmin) {
        const userRes = await fetch('/api/users', { headers });
        if (userRes.ok) {
          const allUsers = await userRes.json();
          setTechnicians(allUsers.filter(u => u.role === 'TECHNICIAN'));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id, isAdmin]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateStatus = async status => {
    const token = localStorage.getItem('token');
    await fetch(`/api/incidents/${id}/status?status=${status}&performedBy=${currentUser.email}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchData();
  };

  const assignTechnician = async (techEmail) => {
    setIsAssigning(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/incidents/${id}/assign?assignedTo=${techEmail}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (e) {
      console.error('Failed to assign technician:', e);
    } finally {
      setIsAssigning(false);
    }
  };

  const fmtDate = iso => iso
    ? new Date(iso).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })
    : '—';

  const fmtTime = iso => iso
    ? new Date(iso).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })
    : '';

  /* ── Loading ── */
  if (loading) return (
    <div style={{ ...S.centered, minHeight: '60vh' }}>
      <Clock size={32} className="animate-spin" style={{ opacity: .2, marginBottom: 12 }} />
      <p style={{ color: 'var(--clr-text-muted)', fontSize: 14 }}>Loading details…</p>
    </div>
  );

  /* ── Not found ── */
  if (!incident) return (
    <div style={{ ...S.centered, minHeight: '60vh' }}>
      <AlertTriangle size={40} style={{ opacity: .2, marginBottom: 12 }} />
      <p style={{ color: 'var(--clr-text-muted)', fontSize: 14, marginBottom: 16 }}>Incident not found.</p>
      <button style={S.backBtn} onClick={() => navigate('/incidents')}>
        <ArrowLeft size={14} /> Back to Dashboard
      </button>
    </div>
  );

  const pr  = PRIORITY_CFG[incident.priority] ?? PRIORITY_CFG.LOW;
  const st  = STATUS_CFG[incident.status]     ?? STATUS_CFG.OPEN;
  const tp  = TYPE_CFG[incident.ticketType]   ?? TYPE_CFG.INCIDENT;
  const { Icon: TypeIcon } = tp;

  return (
    <div style={S.page}>

      {/* ── Top bar ───────────────────────────────── */}
      <div style={S.topBar}>
        <button style={S.backBtn} onClick={() => navigate(isAdmin ? '/incidents' : (isTechnician ? '/technician' : '/my-reports'))}>
          <ArrowLeft size={14} /> {isAdmin ? 'Incident Center' : 'My Reports'}
        </button>
        <div style={S.topBadges}>
          <span style={{ ...S.badge, background: pr.bg, color: pr.text }}>{pr.label} Priority</span>
          <span style={{ ...S.badge, background: st.bg, color: st.text }}>{st.label}</span>
        </div>
      </div>

      {/* ── Title block ───────────────────────────── */}
      <div style={S.titleBlock}>
        <div style={{ ...S.typeChip, background: pr.bg, color: pr.text }}>
          <TypeIcon size={16} />
          <span>{tp.label}</span>
        </div>
        <h1 style={S.h1}>{incident.title}</h1>
        <div style={S.metaRow}>
          <span style={S.metaItem}><MapPin size={13} /> {incident.resourceName || 'No resource'}</span>
          <span style={S.metaItem}><Calendar size={13} /> Reported {fmtDate(incident.createdAt)}</span>
          {incident.reportedBy && (
            <span style={S.metaItem}><User size={13} /> {incident.reportedBy}</span>
          )}
        </div>
      </div>

      {/* ── Two column ───────────────────────────── */}
      <div style={S.cols}>

        {/* Left: main info */}
        <div style={S.colLeft}>

          {/* Description */}
          <div style={S.card}>
            <p style={S.cardLabel}>Description</p>
            <p style={S.descText}>{incident.description || 'No description provided.'}</p>
          </div>

          {/* Activity Log */}
          <div style={S.card}>
            <p style={S.cardLabel}>Timeline & Activity</p>
            {logs.length === 0 ? (
              <p style={{ color: 'var(--clr-text-muted)', fontSize: 13, padding: '12px 0' }}>No activity yet.</p>
            ) : (
              <div style={S.logList}>
                {logs.map((log, i) => (
                  <div key={log.id ?? i} style={S.logItem}>
                    <div style={S.logDotCol}>
                      <div style={S.logDot} />
                      {i < logs.length - 1 && <div style={S.logLine} />}
                    </div>
                    <div style={{ flex: 1, paddingBottom: 16 }}>
                      <div style={S.logHeader}>
                        <span style={S.logActor}>{log.performedByName || log.performedBy || 'System'}</span>
                        <span style={S.logAction}>{(log.action || '').toLowerCase().replace(/_/g, ' ')}</span>
                        <span style={S.logTime}>{fmtDate(log.timestamp)} · {fmtTime(log.timestamp)}</span>
                      </div>
                      {log.details && <p style={S.logDetails}>{log.details}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: sidebar */}
        <div style={S.colRight}>

          {/* Status actions */}
          <div style={S.card}>
            <p style={S.cardLabel}>Management Actions</p>
            <div style={S.actionBtns}>
              {/* Technician / Admin Start Work */}
              {(isAdmin || isTechnician) && incident.status === 'OPEN' && (
                <button
                  style={{ ...S.actionBtn, background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ede9fe' }}
                  onClick={() => updateStatus('IN_PROGRESS')}
                >
                  <Wrench size={16} /> Mark In Progress
                </button>
              )}
              
              {/* Mark Resolved - Only if in progress and user is admin or assigned tech */}
              {(isAdmin || isAssignedToMe) && incident.status === 'IN_PROGRESS' && (
                <button
                  style={{ ...S.actionBtn, background: '#ecfdf5', color: '#059669', border: '1px solid #d1fae5' }}
                  onClick={() => updateStatus('RESOLVED')}
                >
                  <CheckCircle size={16} /> Confirm Resolution
                </button>
              )}
              
              {/* Close Ticket - Only Admin */}
              {isAdmin && incident.status === 'RESOLVED' && (
                <button
                  style={{ ...S.actionBtn, background: '#eff6ff', color: '#1e40af', border: '1px solid #dbeafe' }}
                  onClick={() => updateStatus('CLOSED')}
                >
                  <ShieldCheck size={16} /> Close Ticket Permanently
                </button>
              )}

              {incident.status === 'CLOSED' && (
                <div style={{ textAlign: 'center', padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
                  <p style={{ color: 'var(--clr-text-muted)', fontSize: 13, fontWeight: 700, margin: 0 }}>Ticket is officially closed.</p>
                </div>
              )}
            </div>
          </div>

          {/* Assign Technician (Admin Only) */}
          {isAdmin && incident.status !== 'CLOSED' && (
            <div style={S.card}>
              <p style={S.cardLabel}>Assignment Control</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ position: 'relative' }}>
                  <select 
                    style={S.select} 
                    value={incident.assignedTo || ''} 
                    onChange={(e) => assignTechnician(e.target.value)}
                    disabled={isAssigning}
                  >
                    <option value="">Unassigned</option>
                    {technicians.map(tech => (
                      <option key={tech.email} value={tech.email}>{tech.name} ({tech.email})</option>
                    ))}
                  </select>
                  <UserPlus size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }} />
                </div>
                {incident.assignedTo && (
                  <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, margin: 0 }}>
                    Assigned to: <span style={{ color: '#003087' }}>{incident.assignedTo}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Info grid */}
          <div style={S.card}>
            <p style={S.cardLabel}>Ticket Metadata</p>
            <div style={S.infoGrid}>
              <InfoRow icon={<Tag size={13}/>}      label="Type"       value={tp.label} />
              <InfoRow icon={<AlertTriangle size={13}/>} label="Priority" value={pr.label} valueColor={pr.text} />
              <InfoRow icon={<Clock size={13}/>}    label="Status"     value={st.label} valueColor={st.text} />
              <InfoRow icon={<MapPin size={13}/>}   label="Resource"   value={incident.resourceName || '—'} />
              {incident.assignedTo && (
                <InfoRow icon={<Wrench size={13}/>} label="Assigned to" value={incident.assignedTo} />
              )}
              <InfoRow icon={<Calendar size={13}/>} label="Reported"   value={fmtDate(incident.createdAt)} />
              {incident.resolvedAt && (
                <InfoRow icon={<CheckCircle size={13}/>} label="Resolved" value={fmtDate(incident.resolvedAt)} valueColor="#059669" />
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ── Small helper component ─────────────────────────────── */
function InfoRow({ icon, label, value, valueColor }) {
  return (
    <div style={S.infoRow}>
      <span style={S.infoIcon}>{icon}</span>
      <span style={S.infoLabel}>{label}</span>
      <span style={{ ...S.infoValue, ...(valueColor ? { color: valueColor, fontWeight: 700 } : {}) }}>
        {value}
      </span>
    </div>
  );
}

/* ── Styles ──────────────────────────────────────────────── */
const S = {
  page: {
    minHeight: '100vh',
    padding: '40px 24px 80px',
    background: 'var(--clr-bg)',
    backgroundImage: 'var(--grad-mesh)',
    color: 'var(--clr-text)',
    boxSizing: 'border-box',
  },
  centered: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--clr-text-muted)',
    fontSize: 15,
    gap: 16,
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
    flexWrap: 'wrap',
    gap: 16,
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 20px',
    background: '#ffffff',
    border: '1px solid var(--clr-border)',
    borderRadius: 12,
    color: 'var(--clr-text-muted)',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: 'var(--shadow-sm)',
  },
  topBadges: {
    display: 'flex',
    gap: 12,
  },
  badge: {
    padding: '6px 16px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    border: '1px solid rgba(0,0,0,0.05)',
  },
  titleBlock: {
    marginBottom: 40,
  },
  typeChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 16px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    border: '1px solid rgba(0,0,0,0.05)',
  },
  h1: {
    fontSize: 36,
    fontWeight: 800,
    letterSpacing: '-1.5px',
    color: 'var(--clr-text)',
    marginBottom: 16,
    lineHeight: 1.1,
  },
  metaRow: {
    display: 'flex',
    gap: 24,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  metaItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 15,
    color: 'var(--clr-text-muted)',
    fontWeight: 600,
  },
  cols: {
    display: 'grid',
    gridTemplateColumns: '1fr 360px',
    gap: 32,
    alignItems: 'start',
  },
  colLeft:  { display: 'flex', flexDirection: 'column', gap: 24 },
  colRight: { display: 'flex', flexDirection: 'column', gap: 24 },
  card: {
    background: '#ffffff',
    border: '1px solid var(--clr-border)',
    borderRadius: '24px',
    padding: 32,
    boxShadow: 'var(--shadow-sm)',
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: 800,
    color: 'var(--clr-primary)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: 24,
    display: 'block',
  },
  descText: {
    fontSize: 16,
    color: 'var(--clr-text)',
    lineHeight: 1.6,
    fontWeight: 500,
  },
  actionBtns: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  actionBtn: {
    padding: '14px 20px',
    borderRadius: 12,
    border: 'none',
    fontSize: 14,
    fontWeight: 800,
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px'
  },
  select: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1.5px solid #e2e8f0',
    background: '#f8fafc',
    fontSize: '14px',
    fontWeight: 600,
    color: '#1e293b',
    outline: 'none',
    appearance: 'none',
    cursor: 'pointer'
  },
  infoGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontSize: 14,
  },
  infoIcon: {
    color: 'var(--clr-text-faint)',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
  },
  infoLabel: {
    color: 'var(--clr-text-muted)',
    width: 110,
    flexShrink: 0,
    fontSize: 13,
    fontWeight: 700,
  },
  infoValue: {
    color: 'var(--clr-text)',
    fontWeight: 700,
    flex: 1,
  },
  logList: {
    display: 'flex',
    flexDirection: 'column',
  },
  logItem: {
    display: 'flex',
    gap: 20,
  },
  logDotCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flexShrink: 0,
    width: 20,
  },
  logDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: 'var(--clr-primary)',
    flexShrink: 0,
    marginTop: 6,
    border: '2px solid #fff',
    zIndex: 1,
    boxShadow: '0 0 0 4px #eff6ff',
  },
  logLine: {
    flex: 1,
    width: 2,
    background: '#f1f5f9',
    minHeight: 32,
  },
  logHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  logActor: {
    fontSize: 15,
    fontWeight: 800,
    color: 'var(--clr-text)',
  },
  logAction: {
    fontSize: 13,
    color: 'var(--clr-text-muted)',
    fontWeight: 600,
  },
  logTime: {
    fontSize: 12,
    color: 'var(--clr-text-faint)',
    marginLeft: 'auto',
  },
  logDetails: {
    fontSize: 14,
    color: 'var(--clr-text-muted)',
    lineHeight: 1.5,
    background: '#f8fafc',
    padding: '12px 16px',
    borderRadius: '12px',
    marginTop: 4,
  },
};