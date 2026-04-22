import { useEffect, useState, useCallback } from 'react';
import { resourceApi }   from '../../api/resourceApi';
import ResourceForm      from './ResourceForm';

/* ─── Type metadata ──────────────────────────────────────────────── */
const TYPE_META = {
  LECTURE_HALL: { bg: '#e8f0fe', color: '#3b5bdb', emoji: '🏛️', label: 'Lecture Hall' },
  LAB:          { bg: '#e6f4ea', color: '#1a7a34', emoji: '🔬', label: 'Lab'           },
  MEETING_ROOM: { bg: '#fff3e0', color: '#e65100', emoji: '🤝', label: 'Meeting Room'  },
  EQUIPMENT:    { bg: '#f3e5f5', color: '#7b1fa2', emoji: '🖥️', label: 'Equipment'     },
  ROOM:         { bg: '#f0f4f8', color: '#444444', emoji: '🚪', label: 'Room'           },
};

/* ─── Status Badge ───────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const isActive = status === 'ACTIVE';
  return (
    <span style={{
      background: isActive ? '#e6f4ea' : '#fdecea',
      color:      isActive ? '#1a7a34' : '#c0392b',
      border:     `1px solid ${isActive ? '#b0dbb8' : '#f5b7b1'}`,
      borderRadius: '20px', padding: '4px 12px',
      fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px',
      textTransform: 'uppercase', display: 'inline-flex',
      alignItems: 'center', gap: '5px',
    }}>
      <span style={{
        width: '6px', height: '6px', borderRadius: '50%',
        background: isActive ? '#1a7a34' : '#c0392b', display: 'inline-block',
        boxShadow: isActive ? '0 0 6px #1a7a34' : '0 0 6px #c0392b',
      }} />
      {isActive ? 'Available' : 'Unavailable'}
    </span>
  );
}

/* ─── Resource Card (Admin) ──────────────────────────────────────── */
function ResourceCard({ resource, onEdit, onDelete, onStatusChange }) {
  const [hovered, setHovered] = useState(false);
  const meta = TYPE_META[resource.type] ?? { bg: '#f0f4f8', color: '#555', emoji: '📦', label: resource.type };
  const isActive = resource.status === 'ACTIVE';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        border: `1.5px solid ${hovered ? '#a5b4fc' : '#e8edf2'}`,
        borderRadius: '16px', padding: '20px',
        display: 'flex', flexDirection: 'column', gap: '14px',
        boxShadow: hovered ? '0 10px 28px rgba(59,91,219,0.10)' : '0 2px 6px rgba(0,0,0,0.04)',
        transition: 'all 0.22s ease', position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Top colour strip */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
        background: isActive
          ? 'linear-gradient(90deg,#1a7a34,#52b788)'
          : 'linear-gradient(90deg,#c0392b,#e57373)',
        borderRadius: '16px 16px 0 0',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '46px', height: '46px', background: meta.bg, borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', flexShrink: 0, border: `1px solid ${meta.color}22`,
            overflow: 'hidden',
          }}>
            {resource.imageUrl ? (
              <img src={resource.imageUrl} alt={resource.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : meta.emoji}
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#1a2a3a', lineHeight: 1.3 }}>
              {resource.name}
            </div>
            <div style={{
              fontSize: '10px', color: meta.color, marginTop: '3px',
              fontWeight: '700', letterSpacing: '0.6px', textTransform: 'uppercase',
            }}>
              {meta.label}
            </div>
          </div>
        </div>
        <StatusBadge status={resource.status} />
      </div>

      {/* Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
        {[
          { label: 'Building', value: resource.building },
          { label: 'Location', value: resource.location },
          resource.capacity ? { label: 'Capacity', value: `${resource.capacity} persons` } : null,
          resource.type !== 'EQUIPMENT' && resource.availabilityStart
            ? { label: 'Hours', value: `${resource.availabilityStart} – ${resource.availabilityEnd}` }
            : null,
        ].filter(Boolean).map(({ label, value }) => (
          <div key={label}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#7a9cc0', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {label}
            </div>
            <div style={{ color: '#1a2a3a', fontWeight: '500', fontSize: '13px' }}>{value || '—'}</div>
          </div>
        ))}
      </div>

      {/* Admin Actions */}
      <div style={{ paddingTop: '12px', borderTop: '1px solid #f0f4f8', display: 'flex', gap: '8px' }}>
        <button
          onClick={() => onEdit(resource)}
          style={{
            flex: 1, background: '#eef2ff', border: '1px solid #c5d0fa',
            borderRadius: '9px', padding: '8px', fontSize: '12px',
            fontWeight: '700', color: '#3b5bdb', cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          ✏️ Edit
        </button>

        <select
          value={resource.status}
          onChange={(e) => onStatusChange(resource.id, e.target.value)}
          style={{
            border: '1px solid #e0e6ed', borderRadius: '9px', padding: '0 10px',
            fontSize: '11px', color: '#555', background: '#f8fafc',
            cursor: 'pointer', height: '36px', fontWeight: '600',
          }}
        >
          <option value="ACTIVE">Set Active</option>
          <option value="OUT_OF_SERVICE">Set Unavailable</option>
        </select>

        <button
          onClick={() => onDelete(resource.id)}
          style={{
            background: '#fff0f0', border: '1px solid #f5b7b1',
            borderRadius: '9px', padding: '8px 12px', fontSize: '12px',
            fontWeight: '700', color: '#e03131', cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

/* ─── Filters Bar ────────────────────────────────────────────────── */
function FiltersBar({ onFilter }) {
  const [f, setF] = useState({ type: '', status: '', building: '', location: '', minCapacity: '' });

  const sel = {
    border: '1.5px solid #e0e6ed', borderRadius: '10px', padding: '0 13px',
    fontSize: '13px', color: '#1a2a3a', background: '#fff',
    height: '40px', outline: 'none', cursor: 'pointer',
  };

  const handle = (e) => {
    const updated = { ...f, [e.target.name]: e.target.value };
    setF(updated); onFilter(updated);
  };

  const reset = () => {
    const empty = { type: '', status: '', building: '', location: '', minCapacity: '' };
    setF(empty); onFilter(empty);
  };

  const hasFilters = Object.values(f).some(v => v !== '');

  return (
    <div style={{
      background: '#fff', border: '1.5px solid #e8edf2', borderRadius: '14px',
      padding: '14px 20px', marginBottom: '24px',
      display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center',
      boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
    }}>
      <span style={{ fontSize: '11px', fontWeight: '800', color: '#8a9cc0', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
        🔍 Filter
      </span>

      <select name="type" value={f.type} onChange={handle} style={sel}>
        <option value="">All Types</option>
        <option value="LECTURE_HALL">Lecture Hall</option>
        <option value="LAB">Lab</option>
        <option value="MEETING_ROOM">Meeting Room</option>
        <option value="EQUIPMENT">Equipment</option>
        <option value="ROOM">Room</option>
      </select>

      <select name="status" value={f.status} onChange={handle} style={sel}>
        <option value="">All Statuses</option>
        <option value="ACTIVE">Available</option>
        <option value="OUT_OF_SERVICE">Unavailable</option>
      </select>

      <input name="building" value={f.building} onChange={handle}
        placeholder="🏢 Building" style={{ ...sel, padding: '0 13px', width: '140px' }} />

      <input name="location" value={f.location} onChange={handle}
        placeholder="📍 Location" style={{ ...sel, padding: '0 13px', width: '150px' }} />

      <input name="minCapacity" value={f.minCapacity} onChange={handle}
        type="number" min="1" placeholder="👥 Min capacity"
        style={{ ...sel, padding: '0 13px', width: '140px' }} />

      {hasFilters && (
        <button onClick={reset} style={{
          background: '#f4f6f9', border: '1.5px solid #e0e6ed', borderRadius: '10px',
          padding: '0 16px', height: '40px', fontSize: '13px',
          color: '#555', cursor: 'pointer', fontWeight: '600',
        }}>
          ✕ Reset
        </button>
      )}
    </div>
  );
}

/* ─── Main Admin Facilities Page ─────────────────────────────────── */
export default function FacilitiesPage() {
  const [resources,  setResources]  = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [showForm,   setShowForm]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [filters,    setFilters]    = useState({});
  const [toast,      setToast]      = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const load = useCallback(async (f = filters) => {
    setLoading(true); setError('');
    try {
      const { data } = await resourceApi.getAll(f);
      setResources(data);
    } catch {
      setError('Could not connect to backend. Make sure Spring Boot is running on port 8081.');
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, []);

  const handleFilter       = (f)  => { setFilters(f); load(f); };

  const handleStatusChange = async (id, status) => {
    try { await resourceApi.updateStatus(id, status); load(); showToast('Status updated ✓'); }
    catch { alert('Failed to update status.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try { await resourceApi.remove(id); load(); showToast('Resource deleted ✓'); }
    catch { alert('Failed to delete resource.'); }
  };

  const handleSubmit = async (payload) => {
    try {
      if (editTarget) {
        await resourceApi.update(editTarget.id, payload);
        showToast('Resource updated ✓');
      } else {
        await resourceApi.create(payload);
        showToast('Resource created ✓');
      }
      setShowForm(false); setEditTarget(null); load();
    } catch (err) {
      alert(err.response?.data?.message ?? 'Failed to save resource.');
    }
  };

  const stats = [
    { label: 'Total Resources', value: resources.length,                                          emoji: '🏛️', color: '#3b5bdb', bg: '#eef2ff', border: '#c5d0fa' },
    { label: 'Available',       value: resources.filter(r => r.status === 'ACTIVE').length,       emoji: '✅', color: '#1a7a34', bg: '#e6f4ea', border: '#b0dbb8' },
    { label: 'Unavailable',     value: resources.filter(r => r.status === 'OUT_OF_SERVICE').length, emoji: '⛔', color: '#c0392b', bg: '#fdecea', border: '#f5b7b1' },
    { label: 'Lecture Halls',   value: resources.filter(r => r.type === 'LECTURE_HALL').length,   emoji: '🏛️', color: '#e65100', bg: '#fff3e0', border: '#fed7aa' },
    { label: 'Labs',            value: resources.filter(r => r.type === 'LAB').length,            emoji: '🔬', color: '#7b1fa2', bg: '#f3e5f5', border: '#d8b4fe' },
    { label: 'Equipment',       value: resources.filter(r => r.type === 'EQUIPMENT').length,      emoji: '🖥️', color: '#0891b2', bg: '#e0f7fa', border: '#a5f3fc' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7fb' }}>

      {/* ── Toast notification ── */}
      {toast && (
        <div style={{
          position: 'fixed', top: '80px', right: '24px', zIndex: 9999,
          background: '#1a7a34', color: '#fff', padding: '12px 22px',
          borderRadius: '12px', fontSize: '13px', fontWeight: '700',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          animation: 'slideIn 0.3s ease',
        }}>
          {toast}
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(40px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '36px 28px 60px' }}>

        {/* ── Page Header ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start', marginBottom: '32px',
        }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'rgba(232,135,26,0.1)', border: '1px solid rgba(232,135,26,0.3)',
              borderRadius: '20px', padding: '4px 12px', fontSize: '10px',
              fontWeight: '800', color: '#e8871a', letterSpacing: '0.6px',
              textTransform: 'uppercase', marginBottom: '10px',
            }}>
              ⚙️ ADMIN PANEL
            </div>
            <h1 style={{ margin: '0 0 6px', fontSize: '28px', fontWeight: '800', color: '#0d1117', letterSpacing: '-0.5px' }}>
              Facilities & Resources
            </h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#6a8caa' }}>
              Manage all bookable campus spaces and equipment
            </p>
          </div>

          <button
            onClick={() => { setEditTarget(null); setShowForm(true); }}
            style={{
              background: 'linear-gradient(135deg, #e8871a, #f0a040)',
              color: '#fff', border: 'none', borderRadius: '12px',
              padding: '12px 24px', fontSize: '14px', fontWeight: '700',
              cursor: 'pointer', boxShadow: '0 4px 14px rgba(232,135,26,0.4)',
              display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'all 0.2s',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: '18px' }}>+</span>
            Add New Resource
          </button>
        </div>

        {/* ── Stat Cards ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '14px', marginBottom: '28px',
        }}>
          {stats.map(({ label, value, emoji, color, bg, border }) => (
            <div key={label} style={{
              background: bg, border: `1.5px solid ${border}`,
              borderRadius: '14px', padding: '18px 20px',
              display: 'flex', alignItems: 'center', gap: '14px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            }}>
              <span style={{ fontSize: '26px' }}>{emoji}</span>
              <div>
                <div style={{ fontSize: '26px', fontWeight: '800', color, lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: '11px', color: '#7a9cc0', marginTop: '3px', fontWeight: '600' }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <FiltersBar onFilter={handleFilter} />

        {/* ── Error ── */}
        {error && (
          <div style={{
            background: '#fdecea', border: '1.5px solid #f5b7b1', borderRadius: '12px',
            padding: '14px 20px', marginBottom: '24px', color: '#c0392b',
            fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── Section title ── */}
        {!loading && !error && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1a2a3a' }}>
              All Resources
              <span style={{
                marginLeft: '10px', background: '#e8edf2', borderRadius: '20px',
                padding: '2px 10px', fontSize: '12px', color: '#6a8caa', fontWeight: '600',
              }}>
                {resources.length}
              </span>
            </h2>
          </div>
        )}

        {/* ── Grid / States ── */}
        {loading ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '80px 0', gap: '16px',
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              border: '3px solid #e0e6ed', borderTopColor: '#e8871a',
              animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ color: '#7a9cc0', fontSize: '14px', margin: 0 }}>Loading resources…</p>
          </div>
        ) : resources.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 0',
            background: '#fff', borderRadius: '16px',
            border: '1.5px dashed #dde1e7',
          }}>
            <p style={{ fontSize: '48px', marginBottom: '12px' }}>📭</p>
            <p style={{ fontSize: '16px', fontWeight: '700', color: '#1a2a3a', margin: '0 0 8px' }}>
              No resources found
            </p>
            <p style={{ fontSize: '13px', color: '#7a9cc0', margin: '0 0 20px' }}>
              Try adjusting filters or add a new resource.
            </p>
            <button
              onClick={() => { setEditTarget(null); setShowForm(true); }}
              style={{
                background: '#e8871a', color: '#fff', border: 'none',
                borderRadius: '10px', padding: '10px 24px',
                fontSize: '13px', fontWeight: '700', cursor: 'pointer',
              }}
            >
              + Add First Resource
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: '18px',
          }}>
            {resources.map(r => (
              <ResourceCard
                key={r.id}
                resource={r}
                onEdit={(r) => { setEditTarget(r); setShowForm(true); }}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {showForm && (
        <ResourceForm
          initial={editTarget}
          onSubmit={handleSubmit}
          onClose={() => { setShowForm(false); setEditTarget(null); }}
        />
      )}
    </div>
  );
}