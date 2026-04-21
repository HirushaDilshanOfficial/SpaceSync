import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, AlertTriangle, CheckCircle, Clock,
  Wrench, Zap, User, MapPin, Tag, Calendar
} from 'lucide-react';

const PRIORITY_CFG = {
  CRITICAL: { bg: 'rgba(239,68,68,.18)',  text: '#f87171', dot: '#ef4444', label: 'Critical' },
  HIGH:     { bg: 'rgba(249,115,22,.18)', text: '#fb923c', dot: '#f97316', label: 'High'     },
  MEDIUM:   { bg: 'rgba(234,179,8,.18)',  text: '#facc15', dot: '#eab308', label: 'Medium'   },
  LOW:      { bg: 'rgba(34,197,94,.18)',  text: '#4ade80', dot: '#22c55e', label: 'Low'      },
};

const STATUS_CFG = {
  OPEN:        { bg: 'rgba(59,130,246,.18)',  text: '#60a5fa', label: 'Open'        },
  IN_PROGRESS: { bg: 'rgba(139,92,246,.18)', text: '#a78bfa', label: 'In Progress' },
  RESOLVED:    { bg: 'rgba(16,185,129,.18)', text: '#34d399', label: 'Resolved'    },
  CLOSED:      { bg: 'rgba(107,114,128,.18)',text: '#9ca3af', label: 'Closed'      },
};

const TYPE_CFG = {
  INCIDENT:    { Icon: Zap,    label: 'Incident'    },
  MAINTENANCE: { Icon: Wrench, label: 'Maintenance' },
  REPAIR:      { Icon: Wrench, label: 'Repair'      },
};

export function IncidentDetailsPage() {
  const navigate  = useNavigate();
  const { id }    = useParams();
  const [incident, setIncident] = useState(null);
  const [logs,     setLogs]     = useState([]);
  const [loading,  setLoading]  = useState(true);

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
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateStatus = async status => {
    const token = localStorage.getItem('token');
    await fetch(`/api/incidents/${id}/status?status=${status}&performedBy=ADMIN`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchData();
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
      <Clock size={32} style={{ opacity: .2, marginBottom: 12 }} />
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
        <button style={S.backBtn} onClick={() => navigate('/incidents')}>
          <ArrowLeft size={14} /> Incidents
        </button>
        <div style={S.topBadges}>
          <span style={{ ...S.badge, background: pr.bg, color: pr.text }}>{pr.label}</span>
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

          {/* Notes */}
          {incident.notes && (
            <div style={S.card}>
              <p style={S.cardLabel}>Notes</p>
              <p style={S.descText}>{incident.notes}</p>
            </div>
          )}

          {/* Activity Log */}
          <div style={S.card}>
            <p style={S.cardLabel}>Activity Log</p>
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
            <p style={S.cardLabel}>Actions</p>
            <div style={S.actionBtns}>
              {incident.status === 'OPEN' && (
                <button
                  style={{ ...S.actionBtn, background: 'rgba(139,92,246,.2)', color: '#a78bfa' }}
                  onClick={() => updateStatus('IN_PROGRESS')}
                >Start Work</button>
              )}
              {incident.status === 'IN_PROGRESS' && (
                <button
                  style={{ ...S.actionBtn, background: 'rgba(16,185,129,.2)', color: '#34d399' }}
                  onClick={() => updateStatus('RESOLVED')}
                >Mark Resolved</button>
              )}
              {incident.status === 'RESOLVED' && (
                <button
                  style={{ ...S.actionBtn, background: 'rgba(107,114,128,.2)', color: '#9ca3af' }}
                  onClick={() => updateStatus('CLOSED')}
                >Close Ticket</button>
              )}
              {incident.status === 'CLOSED' && (
                <p style={{ color: 'var(--clr-text-muted)', fontSize: 13 }}>Ticket is closed.</p>
              )}
            </div>
          </div>

          {/* Info grid */}
          <div style={S.card}>
            <p style={S.cardLabel}>Details</p>
            <div style={S.infoGrid}>
              <InfoRow icon={<Tag size={13}/>}      label="Type"       value={tp.label} />
              <InfoRow icon={<AlertTriangle size={13}/>} label="Priority" value={pr.label} valueColor={pr.text} />
              <InfoRow icon={<Clock size={13}/>}    label="Status"     value={st.label} valueColor={st.text} />
              <InfoRow icon={<MapPin size={13}/>}   label="Resource"   value={incident.resourceName || '—'} />
              <InfoRow icon={<User size={13}/>}     label="Reported by" value={incident.reportedBy || '—'} />
              {incident.assignedTo && (
                <InfoRow icon={<Wrench size={13}/>} label="Assigned to" value={incident.assignedTo} />
              )}
              <InfoRow icon={<Calendar size={13}/>} label="Reported"   value={fmtDate(incident.createdAt)} />
              {incident.resolvedAt && (
                <InfoRow icon={<CheckCircle size={13}/>} label="Resolved" value={fmtDate(incident.resolvedAt)} valueColor="#34d399" />
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
    padding: '28px 28px 60px',
    width: '100%',
    boxSizing: 'border-box',
  },
  centered: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--clr-text-muted)',
    fontSize: 14,
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 12,
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    background: 'var(--clr-surface)',
    border: '1px solid var(--clr-border)',
    borderRadius: 9,
    color: 'var(--clr-text)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  topBadges: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  badge: {
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
  },

  /* Title */
  titleBlock: {
    marginBottom: 24,
  },
  typeChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 12px',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 10,
  },
  h1: {
    fontSize: 24,
    fontWeight: 800,
    letterSpacing: '-0.4px',
    color: 'var(--clr-text)',
    marginBottom: 10,
    lineHeight: 1.25,
  },
  metaRow: {
    display: 'flex',
    gap: 18,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  metaItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 13,
    color: 'var(--clr-text-muted)',
  },

  /* Two col */
  cols: {
    display: 'grid',
    gridTemplateColumns: '1fr 300px',
    gap: 18,
    alignItems: 'start',
  },
  colLeft:  { display: 'flex', flexDirection: 'column', gap: 16 },
  colRight: { display: 'flex', flexDirection: 'column', gap: 16 },

  /* Card */
  card: {
    background: 'var(--clr-surface)',
    border: '1px solid var(--clr-border)',
    borderRadius: 14,
    padding: '18px 20px',
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: 800,
    color: 'var(--clr-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    marginBottom: 12,
  },

  /* Description */
  descText: {
    fontSize: 14,
    color: 'var(--clr-text)',
    lineHeight: 1.7,
  },

  /* Actions */
  actionBtns: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  actionBtn: {
    padding: '10px 16px',
    borderRadius: 9,
    border: 'none',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'opacity .15s',
  },

  /* Info grid */
  infoGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
  },
  infoIcon: {
    color: 'var(--clr-text-muted)',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
  },
  infoLabel: {
    color: 'var(--clr-text-muted)',
    width: 90,
    flexShrink: 0,
    fontSize: 12,
  },
  infoValue: {
    color: 'var(--clr-text)',
    fontWeight: 500,
    flex: 1,
  },

  /* Activity log */
  logList: {
    display: 'flex',
    flexDirection: 'column',
  },
  logItem: {
    display: 'flex',
    gap: 12,
  },
  logDotCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flexShrink: 0,
    width: 16,
  },
  logDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: 'var(--clr-primary)',
    flexShrink: 0,
    marginTop: 3,
  },
  logLine: {
    flex: 1,
    width: 1,
    background: 'var(--clr-border)',
    minHeight: 16,
    marginTop: 4,
  },
  logHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  logActor: {
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--clr-text)',
  },
  logAction: {
    fontSize: 12,
    color: 'var(--clr-text-muted)',
  },
  logTime: {
    fontSize: 11,
    color: 'var(--clr-text-muted)',
    marginLeft: 'auto',
  },
  logDetails: {
    fontSize: 13,
    color: 'var(--clr-text-muted)',
    lineHeight: 1.5,
  },
};