import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, Clock, CheckCircle, Plus, Search,
  ChevronRight, Wrench, Zap, Filter, X, Calendar
} from 'lucide-react';

/* ── Static config ───────────────────────────────────────── */
const STATUS_TABS = [
  { key: 'ALL',         label: 'All'         },
  { key: 'OPEN',        label: 'Open'        },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'RESOLVED',    label: 'Resolved'    },
  { key: 'CLOSED',      label: 'Closed'      },
];

const PRIORITY_CFG = {
  CRITICAL: { bg: 'rgba(239,68,68,.18)',  text: '#f87171', label: 'Critical', dot: '#ef4444' },
  HIGH:     { bg: 'rgba(249,115,22,.18)', text: '#fb923c', label: 'High',     dot: '#f97316' },
  MEDIUM:   { bg: 'rgba(234,179,8,.18)',  text: '#facc15', label: 'Medium',   dot: '#eab308' },
  LOW:      { bg: 'rgba(34,197,94,.18)',  text: '#4ade80', label: 'Low',      dot: '#22c55e' },
};

const STATUS_CFG = {
  OPEN:        { bg: 'rgba(59,130,246,.18)',  text: '#60a5fa', label: 'Open'        },
  IN_PROGRESS: { bg: 'rgba(139,92,246,.18)', text: '#a78bfa', label: 'In Progress' },
  RESOLVED:    { bg: 'rgba(16,185,129,.18)', text: '#34d399', label: 'Resolved'    },
  CLOSED:      { bg: 'rgba(107,114,128,.18)',text: '#9ca3af', label: 'Closed'      },
};

const TYPE_ICON = { INCIDENT: Zap, MAINTENANCE: Wrench, REPAIR: Wrench };

/* ── Component ───────────────────────────────────────────── */
export function IncidentDashboardPage() {
  const navigate = useNavigate();

  const [incidents, setIncidents] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  // Filter state
  const [search,       setSearch]       = useState('');
  const [filterType,   setFilterType]   = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStart,  setFilterStart]  = useState('');
  const [filterEnd,    setFilterEnd]    = useState('');
  const [showFilters,  setShowFilters]  = useState(false);

  /* fetch */
  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/incidents', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setIncidents(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchIncidents(); }, [fetchIncidents]);

  /* status update */
  const updateStatus = async (e, id, status) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    await fetch(`/api/incidents/${id}/status?status=${status}&performedBy=ADMIN`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchIncidents();
  };

  /* active filter count */
  const activeFilters = [filterType, filterPriority, filterStart, filterEnd].filter(Boolean).length;

  /* clear all */
  const clearFilters = () => {
    setFilterType(''); setFilterPriority(''); setFilterStart(''); setFilterEnd('');
  };

  /* derived list */
  const filtered = incidents.filter(inc => {
    if (activeTab !== 'ALL' && inc.status !== activeTab) return false;
    if (search && !`${inc.title} ${inc.description}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType && inc.ticketType !== filterType) return false;
    if (filterPriority && inc.priority !== filterPriority) return false;
    if (filterStart) {
      const d = new Date(inc.createdAt);
      if (d < new Date(filterStart)) return false;
    }
    if (filterEnd) {
      const d = new Date(inc.createdAt);
      if (d > new Date(filterEnd + 'T23:59:59')) return false;
    }
    return true;
  });

  const counts = key =>
    key === 'ALL' ? incidents.length : incidents.filter(i => i.status === key).length;

  const fmtDate = iso => iso
    ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

  return (
    <div style={S.page}>
      {/* ── Page header ───────────────────────────── */}
      <div style={S.topBar}>
        <div>
          <h1 style={S.h1}>Incident Dashboard</h1>
          <p style={S.subtitle}>Track and manage all reported issues &amp; maintenance tickets</p>
        </div>
        <div style={S.headerBtns}>
          <button style={S.secondaryBtn} onClick={() => navigate('/maintenance-calendar')}>
            <Calendar size={15} /> Maintenance Calendar
          </button>
          <button style={S.primaryBtn} onClick={() => navigate('/report-incident')}>
            <Plus size={15} /> Report Issue
          </button>
        </div>
      </div>

      {/* ── Search + Filter toggle row ─────────────── */}
      <div style={S.searchRow}>
        <div style={S.searchBox}>
          <Search size={15} style={S.searchIcon} />
          <input
            style={S.searchInput}
            placeholder="Search by title or description…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button style={S.clearBtn} onClick={() => setSearch('')}><X size={13} /></button>
          )}
        </div>

        <button
          style={{ ...S.filterToggle, ...(showFilters ? S.filterToggleActive : {}) }}
          onClick={() => setShowFilters(v => !v)}
        >
          <Filter size={14} />
          Filters
          {activeFilters > 0 && (
            <span style={S.filterBadge}>{activeFilters}</span>
          )}
        </button>
      </div>

      {/* ── Filter panel ─────────────────────────── */}
      {showFilters && (
        <div style={S.filterPanel}>
          <div style={S.filterGrid}>
            {/* Type */}
            <div style={S.filterField}>
              <label style={S.label}>Type</label>
              <select style={S.select} value={filterType} onChange={e => setFilterType(e.target.value)}>
                <option value="">All Types</option>
                <option value="INCIDENT">Incident</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="REPAIR">Repair</option>
              </select>
            </div>

            {/* Priority */}
            <div style={S.filterField}>
              <label style={S.label}>Priority</label>
              <select style={S.select} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
                <option value="">All Priorities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            {/* Date From */}
            <div style={S.filterField}>
              <label style={S.label}>From Date</label>
              <input type="date" style={S.select} value={filterStart} onChange={e => setFilterStart(e.target.value)} />
            </div>

            {/* Date To */}
            <div style={S.filterField}>
              <label style={S.label}>To Date</label>
              <input type="date" style={S.select} value={filterEnd} onChange={e => setFilterEnd(e.target.value)} />
            </div>
          </div>

          {activeFilters > 0 && (
            <button style={S.clearFiltersBtn} onClick={clearFilters}>
              <X size={13} /> Clear Filters
            </button>
          )}
        </div>
      )}

      {/* ── Status tabs ──────────────────────────── */}
      <div style={S.tabRow}>
        {STATUS_TABS.map(t => (
          <button
            key={t.key}
            style={{ ...S.tab, ...(activeTab === t.key ? S.tabActive : {}) }}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
            <span style={{ ...S.tabCount, ...(activeTab === t.key ? S.tabCountActive : {}) }}>
              {counts(t.key)}
            </span>
          </button>
        ))}
      </div>

      {/* ── Result count ─────────────────────────── */}
      {!loading && (
        <p style={S.resultCount}>
          {filtered.length} {filtered.length === 1 ? 'ticket' : 'tickets'} found
        </p>
      )}

      {/* ── List ─────────────────────────────────── */}
      {loading ? (
        <div style={S.emptyState}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p>Loading…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={S.emptyState}>
          <AlertTriangle size={44} style={{ opacity: .18, marginBottom: 14 }} />
          <p>No incidents match your filters.</p>
          {activeFilters > 0 && (
            <button style={{ ...S.primaryBtn, marginTop: 14 }} onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div style={S.list}>
          {filtered.map(inc => {
            const pr   = PRIORITY_CFG[inc.priority] ?? PRIORITY_CFG.LOW;
            const st   = STATUS_CFG[inc.status]     ?? STATUS_CFG.OPEN;
            const Icon = TYPE_ICON[inc.ticketType]  ?? Wrench;

            return (
              <div
                key={inc.id}
                style={S.card}
                onClick={() => navigate(`/incidents/${inc.id}`)}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(88,166,255,.35)'; e.currentTarget.style.background = 'rgba(255,255,255,.035)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.07)'; e.currentTarget.style.background = 'var(--clr-surface)'; }}
              >
                {/* Priority dot */}
                <div style={{ ...S.dot, background: pr.dot }} />

                {/* Icon */}
                <div style={{ ...S.typeIcon, background: pr.bg, color: pr.text }}>
                  <Icon size={17} />
                </div>

                {/* Info */}
                <div style={S.cardBody}>
                  <p style={S.cardTitle}>{inc.title}</p>
                  <p style={S.cardMeta}>
                    {inc.resourceName || 'No resource'} · Reported {fmtDate(inc.createdAt)}
                    {inc.reportedBy ? ` · ${inc.reportedBy}` : ''}
                  </p>
                </div>

                {/* Right badges + actions */}
                <div style={S.cardRight} onClick={e => e.stopPropagation()}>
                  <span style={{ ...S.badge, background: pr.bg, color: pr.text }}>{pr.label}</span>
                  <span style={{ ...S.badge, background: st.bg, color: st.text }}>{st.label}</span>

                  {inc.status === 'OPEN' && (
                    <button style={{ ...S.actionBtn, color: '#a78bfa', background: 'rgba(139,92,246,.2)' }}
                      onClick={e => updateStatus(e, inc.id, 'IN_PROGRESS')}>Start</button>
                  )}
                  {inc.status === 'IN_PROGRESS' && (
                    <button style={{ ...S.actionBtn, color: '#34d399', background: 'rgba(16,185,129,.2)' }}
                      onClick={e => updateStatus(e, inc.id, 'RESOLVED')}>Resolve</button>
                  )}
                  {inc.status === 'RESOLVED' && (
                    <button style={{ ...S.actionBtn, color: '#9ca3af', background: 'rgba(107,114,128,.2)' }}
                      onClick={e => updateStatus(e, inc.id, 'CLOSED')}>Close</button>
                  )}

                  <ChevronRight size={15} style={{ color: 'var(--clr-text-muted)', cursor: 'pointer' }}
                    onClick={() => navigate(`/incidents/${inc.id}`)} />
                </div>
              </div>
            );
          })}
        </div>
      )}
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
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
    gap: 16,
    flexWrap: 'wrap',
  },
  h1: {
    fontSize: 26,
    fontWeight: 800,
    letterSpacing: '-0.5px',
    color: 'var(--clr-text)',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 13,
    color: 'var(--clr-text-muted)',
  },
  primaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    padding: '10px 20px',
    background: 'var(--clr-primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 13,
    cursor: 'pointer',
    flexShrink: 0,
  },
  headerBtns: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
    alignItems: 'center',
    flexShrink: 0,
  },
  secondaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    padding: '10px 20px',
    background: 'var(--clr-surface)',
    color: 'var(--clr-text)',
    border: '1px solid var(--clr-border)',
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
    flexShrink: 0,
  },
  /* search */
  searchRow: {
    display: 'flex',
    gap: 10,
    marginBottom: 14,
    alignItems: 'center',
  },
  searchBox: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 13,
    color: 'var(--clr-text-muted)',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '10px 36px 10px 38px',
    background: 'var(--clr-surface)',
    border: '1px solid var(--clr-border)',
    borderRadius: 10,
    color: 'var(--clr-text)',
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box',
  },
  clearBtn: {
    position: 'absolute',
    right: 10,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--clr-text-muted)',
    display: 'flex',
    alignItems: 'center',
  },
  filterToggle: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '10px 16px',
    background: 'var(--clr-surface)',
    border: '1px solid var(--clr-border)',
    borderRadius: 10,
    color: 'var(--clr-text-muted)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    flexShrink: 0,
    position: 'relative',
  },
  filterToggleActive: {
    borderColor: 'var(--clr-primary)',
    color: 'var(--clr-primary)',
  },
  filterBadge: {
    background: 'var(--clr-primary)',
    color: '#fff',
    borderRadius: 20,
    padding: '1px 7px',
    fontSize: 10,
    fontWeight: 800,
  },
  /* filter panel */
  filterPanel: {
    background: 'var(--clr-surface)',
    border: '1px solid var(--clr-border)',
    borderRadius: 12,
    padding: '20px 20px 16px',
    marginBottom: 16,
  },
  filterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 14,
  },
  filterField: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--clr-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  select: {
    padding: '9px 12px',
    background: 'rgba(255,255,255,.04)',
    border: '1px solid var(--clr-border)',
    borderRadius: 8,
    color: 'var(--clr-text)',
    fontSize: 13,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    colorScheme: 'dark',
  },
  clearFiltersBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    marginTop: 14,
    padding: '7px 14px',
    background: 'rgba(239,68,68,.12)',
    color: '#f87171',
    border: '1px solid rgba(239,68,68,.2)',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  /* tabs */
  tabRow: {
    display: 'flex',
    gap: 6,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  tab: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    padding: '7px 14px',
    background: 'transparent',
    border: '1px solid var(--clr-border)',
    borderRadius: 8,
    color: 'var(--clr-text-muted)',
    fontWeight: 500,
    fontSize: 13,
    cursor: 'pointer',
    transition: 'all .15s',
  },
  tabActive: {
    background: 'var(--clr-primary)',
    borderColor: 'var(--clr-primary)',
    color: '#fff',
    fontWeight: 700,
  },
  tabCount: {
    padding: '1px 7px',
    borderRadius: 20,
    fontSize: 10,
    fontWeight: 800,
    background: 'rgba(255,255,255,.1)',
  },
  tabCountActive: {
    background: 'rgba(255,255,255,.28)',
  },
  resultCount: {
    fontSize: 12,
    color: 'var(--clr-text-muted)',
    marginBottom: 14,
  },
  /* list */
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '15px 18px',
    background: 'var(--clr-surface)',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'border-color .2s, background .2s',
    flexWrap: 'wrap',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  typeIcon: {
    width: 38,
    height: 38,
    borderRadius: 9,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--clr-text)',
    marginBottom: 4,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cardMeta: {
    fontSize: 12,
    color: 'var(--clr-text-muted)',
  },
  cardRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    flexShrink: 0,
    flexWrap: 'wrap',
  },
  badge: {
    padding: '3px 9px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  actionBtn: {
    padding: '5px 12px',
    borderRadius: 7,
    border: 'none',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'opacity .15s',
    whiteSpace: 'nowrap',
  },
  emptyState: {
    textAlign: 'center',
    padding: '90px 24px',
    color: 'var(--clr-text-muted)',
    fontSize: 14,
  },
};