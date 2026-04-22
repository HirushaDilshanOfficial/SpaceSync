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
  CRITICAL: { bg: '#fef2f2', text: '#dc2626', label: 'Critical', dot: '#ef4444' },
  HIGH:     { bg: '#fff7ed', text: '#ea580c', label: 'High',     dot: '#f97316' },
  MEDIUM:   { bg: '#fefce8', text: '#ca8a04', label: 'Medium',   dot: '#eab308' },
  LOW:      { bg: '#f0fdf4', text: '#16a34a', label: 'Low',      dot: '#22c55e' },
};

const STATUS_CFG = {
  OPEN:        { bg: '#eff6ff', text: '#2563eb', label: 'Open'        },
  IN_PROGRESS: { bg: '#f5f3ff', text: '#7c3aed', label: 'In Progress' },
  RESOLVED:    { bg: '#ecfdf5', text: '#059669', label: 'Resolved'    },
  CLOSED:      { bg: '#f8fafc', text: '#64748b', label: 'Closed'      },
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
                onMouseEnter={e => { 
                  e.currentTarget.style.borderColor = 'var(--clr-primary)'; 
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={e => { 
                  e.currentTarget.style.borderColor = 'var(--clr-border)'; 
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
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

                      {inc.status === 'RESOLVED' && (
                    <button style={{ ...S.actionBtn, color: '#9ca3af', background: '#f1f5f9', border: '1px solid var(--clr-border)' }}
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
    background: 'var(--clr-bg)',
    backgroundImage: 'var(--grad-mesh)',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
    gap: 16,
    flexWrap: 'wrap',
  },
  h1: {
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: '-1.2px',
    color: 'var(--clr-text)',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: 'var(--clr-text-muted)',
  },
  primaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '11px 22px',
    background: 'var(--grad-primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    flexShrink: 0,
    boxShadow: '0 4px 12px rgba(0,48,135,0.2)',
  },
  headerBtns: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    alignItems: 'center',
    flexShrink: 0,
  },
  secondaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '11px 22px',
    background: '#ffffff',
    color: 'var(--clr-text)',
    border: '1px solid var(--clr-border)',
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
    flexShrink: 0,
    boxShadow: 'var(--shadow-sm)',
  },
  /* search */
  searchRow: {
    display: 'flex',
    gap: 12,
    marginBottom: 16,
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
    left: 14,
    color: 'var(--clr-text-muted)',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '12px 36px 12px 42px',
    background: '#ffffff',
    border: '1px solid var(--clr-border)',
    borderRadius: 12,
    color: 'var(--clr-text)',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    boxShadow: 'var(--shadow-sm)',
    fontFamily: 'inherit',
  },
  clearBtn: {
    position: 'absolute',
    right: 12,
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
    gap: 8,
    padding: '12px 18px',
    background: '#ffffff',
    border: '1px solid var(--clr-border)',
    borderRadius: 12,
    color: 'var(--clr-text-muted)',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    flexShrink: 0,
    position: 'relative',
    boxShadow: 'var(--shadow-sm)',
    transition: 'all 0.2s',
  },
  filterToggleActive: {
    borderColor: 'var(--clr-primary)',
    color: 'var(--clr-primary)',
    background: '#eff6ff',
  },
  filterBadge: {
    background: 'var(--clr-primary)',
    color: '#fff',
    borderRadius: 20,
    padding: '1px 8px',
    fontSize: 10,
    fontWeight: 800,
  },
  /* filter panel */
  filterPanel: {
    background: '#ffffff',
    border: '1px solid var(--clr-border)',
    borderRadius: 16,
    padding: '24px',
    marginBottom: 20,
    boxShadow: 'var(--shadow-md)',
  },
  filterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 20,
  },
  filterField: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: 800,
    color: 'var(--clr-text)',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
  },
  select: {
    padding: '11px 14px',
    background: '#f8fafc',
    border: '1px solid var(--clr-border)',
    borderRadius: 10,
    color: 'var(--clr-text)',
    fontSize: 14,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    colorScheme: 'light',
  },
  clearFiltersBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
    padding: '8px 16px',
    background: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fee2e2',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
  },
  /* tabs */
  tabRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  tab: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 16px',
    background: '#ffffff',
    border: '1px solid var(--clr-border)',
    borderRadius: 10,
    color: 'var(--clr-text-muted)',
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    transition: 'all .2s',
    boxShadow: 'var(--shadow-sm)',
  },
  tabActive: {
    background: 'var(--clr-primary)',
    borderColor: 'var(--clr-primary)',
    color: '#fff',
    boxShadow: '0 4px 12px rgba(0,48,135,0.2)',
  },
  tabCount: {
    padding: '1px 8px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 800,
    background: '#f1f5f9',
    color: 'var(--clr-text-muted)',
  },
  tabCountActive: {
    background: 'rgba(255,255,255,0.2)',
    color: '#fff',
  },
  resultCount: {
    fontSize: 13,
    color: 'var(--clr-text-muted)',
    marginBottom: 16,
    fontWeight: 600,
  },
  /* list */
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '20px 24px',
    background: '#ffffff',
    border: '1px solid var(--clr-border)',
    borderRadius: 16,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
    flexWrap: 'wrap',
    boxShadow: 'var(--shadow-sm)',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
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
    fontSize: 16,
    fontWeight: 800,
    color: 'var(--clr-text)',
    marginBottom: 6,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    letterSpacing: '-0.3px',
  },
  cardMeta: {
    fontSize: 13,
    color: 'var(--clr-text-muted)',
  },
  cardRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
    flexWrap: 'wrap',
  },
  badge: {
    padding: '4px 12px',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 800,
    whiteSpace: 'nowrap',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  actionBtn: {
    padding: '6px 14px',
    borderRadius: 8,
    border: 'none',
    fontSize: 12,
    fontWeight: 800,
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  emptyState: {
    textAlign: 'center',
    padding: '100px 24px',
    color: 'var(--clr-text-muted)',
    fontSize: 15,
    background: '#ffffff',
    borderRadius: 16,
    border: '1px solid var(--clr-border)',
    boxShadow: 'var(--shadow-sm)',
  },
};
// End of file
