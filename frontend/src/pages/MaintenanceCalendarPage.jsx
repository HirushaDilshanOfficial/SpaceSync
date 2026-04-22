import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, AlertTriangle, Wrench, Zap, CheckCircle, Clock } from 'lucide-react';

const PRIORITY_DOT = {
  CRITICAL: '#ef4444',
  HIGH:     '#f97316',
  MEDIUM:   '#eab308',
  LOW:      '#22c55e',
};

const PRIORITY_BG = {
  CRITICAL: 'rgba(239,68,68,.18)',
  HIGH:     'rgba(249,115,22,.18)',
  MEDIUM:   'rgba(234,179,8,.18)',
  LOW:      'rgba(34,197,94,.18)',
};

const STATUS_CFG = {
  OPEN:        { text: '#60a5fa', label: 'Open'        },
  IN_PROGRESS: { text: '#a78bfa', label: 'In Progress' },
  RESOLVED:    { text: '#34d399', label: 'Resolved'    },
  CLOSED:      { text: '#9ca3af', label: 'Closed'      },
};

const TYPE_ICON = { INCIDENT: Zap, MAINTENANCE: Wrench, REPAIR: Wrench };

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export function MaintenanceCalendarPage() {
  const navigate = useNavigate();
  const [current,  setCurrent]  = useState(new Date());
  const [events,   setEvents]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null); // {day, events[]}

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/incidents', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setEvents(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  /* ── calendar grid ── */
  const year  = current.getFullYear();
  const month = current.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const grid = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const getEventsForDay = day => {
    if (!day) return [];
    const dayDate = new Date(year, month, day).toDateString();
    return events.filter(e => {
      const d = e.scheduledStart ? new Date(e.scheduledStart) : new Date(e.createdAt);
      return d.toDateString() === dayDate;
    });
  };

  const today = new Date().toDateString();
  const isToday = day => day && new Date(year, month, day).toDateString() === today;

  const navMonth = dir => setCurrent(prev => {
    const d = new Date(prev);
    d.setDate(1);
    d.setMonth(prev.getMonth() + dir);
    return d;
  });

  /* upcoming: today and future */
  const todayStart = new Date(); todayStart.setHours(0,0,0,0);
  const upcoming = events
    .filter(e => {
      const d = e.scheduledStart ? new Date(e.scheduledStart) : new Date(e.createdAt);
      return d >= todayStart;
    })
    .sort((a, b) => {
      const dA = a.scheduledStart ? new Date(a.scheduledStart) : new Date(a.createdAt);
      const dB = b.scheduledStart ? new Date(b.scheduledStart) : new Date(b.createdAt);
      return dA - dB;
    })
    .slice(0, 8);

  const fmtDate = iso => iso
    ? new Date(iso).toLocaleDateString('en-GB', { day:'numeric', month:'short' })
    : '—';

  const fmtTime = iso => iso
    ? new Date(iso).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })
    : '';

  return (
    <div style={S.page}>

      {/* ── Header ─────────────────────────────────── */}
      <div style={S.topBar}>
        <div>
          <h1 style={S.h1}>Maintenance Calendar</h1>
          <p style={S.sub}>Scheduled activities &amp; reported incidents</p>
        </div>
        <button style={S.backBtn} onClick={() => navigate('/incidents')}>
          <ChevronLeft size={15} /> Back to Dashboard
        </button>
      </div>

      {/* ── Two-col layout ─────────────────────────── */}
      <div style={S.cols}>

        {/* ── Left: calendar ─────────────────────── */}
        <div style={S.calBox}>
          {/* Month nav */}
          <div style={S.monthRow}>
            <button style={S.navBtn} onClick={() => navMonth(-1)}><ChevronLeft size={18} /></button>
            <span style={S.monthLabel}>{MONTH_NAMES[month]} {year}</span>
            <button style={S.navBtn} onClick={() => navMonth(1)}><ChevronRight size={18} /></button>
          </div>

          {/* Day-of-week headers */}
          <div style={S.dayHeaders}>
            {DAY_LABELS.map(d => (
              <div key={d} style={S.dayHeader}>{d}</div>
            ))}
          </div>

          {/* Grid */}
          <div style={S.grid}>
            {grid.map((day, i) => {
              const dayEvts = getEventsForDay(day);
              const tod = isToday(day);
              return (
                <div
                  key={i}
                  style={{
                    ...S.cell,
                    ...(tod ? S.cellToday : {}),
                    ...(day ? S.cellActive : S.cellEmpty),
                    ...(selected?.day === day && month === new Date().getMonth() ? S.cellSelected : {}),
                  }}
                  onClick={() => day && setSelected(dayEvts.length > 0 ? { day, events: dayEvts } : null)}
                >
                  {day && (
                    <>
                      <span style={{ ...S.dayNum, ...(tod ? S.dayNumToday : {}) }}>{day}</span>
                      <div style={S.dotRow}>
                        {dayEvts.slice(0, 3).map(e => (
                          <span
                            key={e.id}
                            style={{ ...S.dot, background: PRIORITY_DOT[e.priority] || '#6b7280' }}
                            title={e.title}
                          />
                        ))}
                        {dayEvts.length > 3 && (
                          <span style={S.moreCount}>+{dayEvts.length - 3}</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected day popup */}
          {selected && (
            <div style={S.popup}>
              <div style={S.popupHeader}>
                <span style={S.popupTitle}>
                  {MONTH_NAMES[month]} {selected.day}
                </span>
                <button style={S.popupClose} onClick={() => setSelected(null)}>✕</button>
              </div>
              <div style={S.popupList}>
                {selected.events.map(e => {
                  const Icon = TYPE_ICON[e.ticketType] || Wrench;
                  const st   = STATUS_CFG[e.status] || STATUS_CFG.OPEN;
                  return (
                    <div
                      key={e.id}
                      style={S.popupItem}
                      onClick={() => navigate(`/incidents/${e.id}`)}
                    >
                      <div style={{ ...S.popupIcon, background: PRIORITY_BG[e.priority], color: PRIORITY_DOT[e.priority] }}>
                        <Icon size={14} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={S.popupItemTitle}>{e.title}</p>
                        <p style={S.popupItemMeta}>{e.resourceName || 'No resource'}</p>
                      </div>
                      <span style={{ ...S.statusDot, color: st.text }}>{st.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: upcoming ─────────────────────── */}
        <div style={S.sideBox}>
          <p style={S.sideTitle}>Upcoming &amp; Today</p>

          {loading ? (
            <p style={{ color: 'var(--clr-text-muted)', fontSize: 13, padding: '20px 0' }}>Loading…</p>
          ) : upcoming.length === 0 ? (
            <div style={S.emptyUpcoming}>
              <CheckCircle size={32} style={{ opacity: .2, marginBottom: 8 }} />
              <p>No upcoming activities</p>
            </div>
          ) : (
            <div style={S.upcomingList}>
              {upcoming.map(e => {
                const Icon    = TYPE_ICON[e.ticketType] || Wrench;
                const st      = STATUS_CFG[e.status]    || STATUS_CFG.OPEN;
                const dot     = PRIORITY_DOT[e.priority] || '#6b7280';
                const bg      = PRIORITY_BG[e.priority]  || 'rgba(107,114,128,.15)';
                const dateStr = e.scheduledStart ? fmtDate(e.scheduledStart) : fmtDate(e.createdAt);
                const timeStr = e.scheduledStart
                  ? `${fmtTime(e.scheduledStart)}${e.scheduledEnd ? ' – ' + fmtTime(e.scheduledEnd) : ''}`
                  : `Reported ${fmtTime(e.createdAt)}`;

                return (
                  <div
                    key={e.id}
                    style={S.upcomingCard}
                    onClick={() => navigate(`/incidents/${e.id}`)}
                    onMouseEnter={el => el.currentTarget.style.borderColor = 'rgba(88,166,255,.35)'}
                    onMouseLeave={el => el.currentTarget.style.borderColor = 'rgba(255,255,255,.06)'}
                  >
                    <div style={{ ...S.upIcon, background: bg, color: dot }}>
                      <Icon size={15} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={S.upTitle}>{e.title}</p>
                      <p style={S.upMeta}>{e.resourceName || 'No resource'}</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={S.upDate}>{dateStr}</p>
                      <p style={{ ...S.upTime, color: st.text }}>{st.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const S = {
  page: {
    minHeight: '100vh',
    padding: '40px 24px 80px',
    background: 'var(--clr-bg)',
    backgroundImage: 'var(--grad-mesh)',
    color: 'var(--clr-text)',
    boxSizing: 'border-box',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    gap: 24,
    flexWrap: 'wrap',
  },
  h1: {
    fontSize: 36,
    fontWeight: 800,
    letterSpacing: '-1.5px',
    color: 'var(--clr-text)',
    marginBottom: 8,
  },
  sub: {
    fontSize: 16,
    color: 'var(--clr-text-muted)',
    fontWeight: 500,
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
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: 'var(--shadow-sm)',
  },

  /* two col */
  cols: {
    display: 'grid',
    gridTemplateColumns: '1fr 380px',
    gap: 32,
    alignItems: 'start',
  },

  /* calendar box */
  calBox: {
    background: '#ffffff',
    border: '1px solid var(--clr-border)',
    borderRadius: '24px',
    padding: 32,
    boxShadow: 'var(--shadow-lg)',
  },
  monthRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  navBtn: {
    width: 42,
    height: 42,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f8fafc',
    border: '1px solid var(--clr-border)',
    borderRadius: 12,
    cursor: 'pointer',
    color: 'var(--clr-primary)',
    transition: 'all 0.2s',
  },
  monthLabel: {
    fontSize: 22,
    fontWeight: 800,
    color: 'var(--clr-text)',
    letterSpacing: '-0.8px',
  },
  dayHeaders: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: 12,
    marginBottom: 16,
  },
  dayHeader: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 800,
    color: 'var(--clr-text-faint)',
    textTransform: 'uppercase',
    padding: '8px 0',
    letterSpacing: '1px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: 12,
  },
  cell: {
    minHeight: 100,
    borderRadius: 16,
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    position: 'relative',
    transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
    border: '1px solid transparent',
    boxSizing: 'border-box',
  },
  cellActive: {
    background: '#f8fafc',
    cursor: 'pointer',
    border: '1px solid var(--clr-border)',
  },
  cellEmpty: {
    background: 'transparent',
  },
  cellToday: {
    background: 'var(--clr-primary-light)',
    border: '1.5px solid var(--clr-primary)',
  },
  cellSelected: {
    background: 'var(--clr-accent-light)',
    border: '1.5px solid var(--clr-accent)',
  },
  dayNum: {
    fontSize: 15,
    fontWeight: 700,
    color: 'var(--clr-text-muted)',
    lineHeight: 1,
  },
  dayNumToday: {
    color: 'var(--clr-primary)',
    fontWeight: 800,
  },
  dotRow: {
    display: 'flex',
    gap: 4,
    flexWrap: 'wrap',
    marginTop: 'auto',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
    boxShadow: '0 0 0 2px #fff',
  },
  moreCount: {
    fontSize: 10,
    color: 'var(--clr-text-faint)',
    fontWeight: 700,
  },

  /* day popup */
  popup: {
    marginTop: 24,
    background: '#f8fafc',
    border: '1px solid var(--clr-border)',
    borderRadius: 20,
    overflow: 'hidden',
    boxShadow: 'var(--shadow-md)',
  },
  popupHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderBottom: '1px solid var(--clr-border)',
    background: '#ffffff',
  },
  popupTitle: {
    fontSize: 16,
    fontWeight: 800,
    color: 'var(--clr-text)',
  },
  popupClose: {
    background: 'none',
    border: 'none',
    color: 'var(--clr-text-faint)',
    cursor: 'pointer',
    fontSize: 20,
  },
  popupList: {
    display: 'flex',
    flexDirection: 'column',
  },
  popupItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '16px 24px',
    cursor: 'pointer',
    borderBottom: '1px solid var(--clr-border)',
    transition: 'all 0.2s',
  },
  popupIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: '1px solid rgba(0,0,0,0.05)',
  },
  popupItemTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: 'var(--clr-text)',
    marginBottom: 4,
  },
  popupItemMeta: {
    fontSize: 13,
    color: 'var(--clr-text-muted)',
    fontWeight: 500,
  },
  statusDot: {
    fontSize: 12,
    fontWeight: 800,
    flexShrink: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  /* sidebar */
  sideBox: {
    background: '#ffffff',
    border: '1px solid var(--clr-border)',
    borderRadius: '24px',
    padding: 32,
    boxShadow: 'var(--shadow-lg)',
  },
  sideTitle: {
    fontSize: 12,
    fontWeight: 800,
    color: 'var(--clr-primary)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: 24,
  },
  upcomingList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  upcomingCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '16px',
    border: '1.5px solid var(--clr-border)',
    borderRadius: 16,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
    background: '#ffffff',
  },
  upIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: '1px solid rgba(0,0,0,0.05)',
  },
  upTitle: {
    fontSize: 15,
    fontWeight: 800,
    color: 'var(--clr-text)',
    marginBottom: 4,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  upMeta: {
    fontSize: 13,
    color: 'var(--clr-text-muted)',
    fontWeight: 500,
  },
  upDate: {
    fontSize: 14,
    fontWeight: 800,
    color: 'var(--clr-primary)',
    marginBottom: 4,
  },
  upTime: {
    fontSize: 12,
    color: 'var(--clr-text-muted)',
    fontWeight: 700,
  },
  emptyUpcoming: {
    textAlign: 'center',
    padding: '48px 0',
    color: 'var(--clr-text-faint)',
    fontSize: 15,
    fontWeight: 500,
  },
};
