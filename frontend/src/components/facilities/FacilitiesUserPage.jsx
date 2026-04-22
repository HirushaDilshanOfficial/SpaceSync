import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { resourceApi } from '../../api/resourceApi';
import { useAuth } from '../../context/AuthContext';

/* ─── Type metadata ─────────────────────────────────────────────── */
const TYPE_META = {
  LECTURE_HALL: { bg: '#e8f0fe', color: '#3b5bdb', emoji: '🏛️', label: 'Lecture Hall' },
  LAB:          { bg: '#e6f4ea', color: '#1a7a34', emoji: '🔬', label: 'Lab'          },
  MEETING_ROOM: { bg: '#fff3e0', color: '#e65100', emoji: '🤝', label: 'Meeting Room'  },
  EQUIPMENT:    { bg: '#f3e5f5', color: '#7b1fa2', emoji: '🖥️', label: 'Equipment'     },
  ROOM:         { bg: '#f0f4f8', color: '#444444', emoji: '🚪', label: 'Room'           },
};

/* ─── Status Badge ──────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const isActive = status === 'ACTIVE';
  return (
    <span style={{
      background: isActive ? '#e6f4ea' : '#fdecea',
      color:      isActive ? '#1a7a34' : '#c0392b',
      border:     `1px solid ${isActive ? '#b0dbb8' : '#f5b7b1'}`,
      borderRadius: '20px',
      padding: '4px 12px',
      fontSize: '11px',
      fontWeight: '700',
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
    }}>
      <span style={{
        width: '6px', height: '6px', borderRadius: '50%',
        background: isActive ? '#1a7a34' : '#c0392b',
        display: 'inline-block',
        boxShadow: isActive ? '0 0 6px #1a7a34' : '0 0 6px #c0392b',
      }} />
      {isActive ? 'Available' : 'Unavailable'}
    </span>
  );
}

/* ─── Resource Card ─────────────────────────────────────────────── */
function ResourceCard({ resource, onBook }) {
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
        borderRadius: '16px',
        padding: '22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: hovered
          ? '0 12px 32px rgba(59,91,219,0.12)'
          : '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'all 0.22s ease',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top colour strip */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '4px',
        background: isActive
          ? 'linear-gradient(90deg, #1a7a34, #52b788)'
          : 'linear-gradient(90deg, #c0392b, #e57373)',
        borderRadius: '16px 16px 0 0',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '48px', height: '48px',
            background: meta.bg,
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', flexShrink: 0,
            border: `1px solid ${meta.color}22`,
            overflow: 'hidden',
          }}>
            {resource.imageUrl ? (
              <img src={resource.imageUrl} alt={resource.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : meta.emoji}
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#1a2a3a', lineHeight: 1.3 }}>
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

      {/* Details grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '12px', fontSize: '12px',
      }}>
        {[
          { label: 'Building',  value: resource.building  },
          { label: 'Location',  value: resource.location  },
          resource.capacity
            ? { label: 'Capacity', value: `${resource.capacity} persons` }
            : null,
          resource.type !== 'EQUIPMENT' && resource.availabilityStart
            ? { label: 'Hours', value: `${resource.availabilityStart} – ${resource.availabilityEnd}` }
            : null,
        ].filter(Boolean).map(({ label, value }) => (
          <div key={label}>
            <div style={{
              fontSize: '10px', fontWeight: '700', color: '#7a9cc0',
              marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              {label}
            </div>
            <div style={{ color: '#1a2a3a', fontWeight: '500', fontSize: '13px' }}>
              {value || '—'}
            </div>
          </div>
        ))}
      </div>

      {/* Description (if any) */}
      {resource.description && (
        <p style={{
          margin: 0, fontSize: '12px', color: '#6a8caa',
          lineHeight: 1.5, borderTop: '1px solid #f0f4f8', paddingTop: '12px',
        }}>
          {resource.description}
        </p>
      )}

      {/* Booking Button */}
      <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
        <button
          onClick={() => onBook(resource)}
          style={{
            width: '100%', background: '#e8871a', color: '#fff', border: 'none',
            borderRadius: '10px', padding: '10px', fontSize: '13px',
            fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s',
            boxShadow: '0 3px 10px rgba(232,135,26,0.25)',
          }}
          onMouseOver={e => e.target.style.filter = 'brightness(1.1)'}
          onMouseOut={e => e.target.style.filter = 'brightness(1)'}
        >
          Book Now
        </button>
      </div>
    </div>
  );
}

/* ─── Filters Bar ───────────────────────────────────────────────── */
function FiltersBar({ onFilter }) {
  const [f, setF] = useState({ type: '', status: '', building: '', location: '', minCapacity: '' });

  const sel = {
    border: '1.5px solid #e0e6ed', borderRadius: '10px', padding: '0 14px',
    fontSize: '13px', color: '#1a2a3a', background: '#fff',
    height: '42px', outline: 'none', cursor: 'pointer',
    transition: 'border-color 0.2s',
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
      background: '#fff',
      border: '1.5px solid #e8edf2',
      borderRadius: '14px',
      padding: '16px 22px',
      marginBottom: '28px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
      alignItems: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        fontSize: '11px', fontWeight: '800', color: '#8a9cc0',
        textTransform: 'uppercase', letterSpacing: '0.8px',
        marginRight: '4px',
      }}>
        🔍 Filter
      </div>

      <select name="type" value={f.type} onChange={handle} style={sel}>
        <option value="">All Types</option>
        <option value="LECTURE_HALL">Lecture Hall</option>
        <option value="LAB">Lab</option>
        <option value="MEETING_ROOM">Meeting Rooms</option>
        <option value="EQUIPMENT">Equipment</option>
        <option value="ROOM">Room</option>
      </select>

      <select name="status" value={f.status} onChange={handle} style={sel}>
        <option value="">All Statuses</option>
        <option value="ACTIVE">Available</option>
        <option value="OUT_OF_SERVICE">Unavailable</option>
      </select>

      <input name="building" value={f.building} onChange={handle}
        placeholder="🏢 Building" style={{ ...sel, padding: '0 14px', width: '140px' }} />

      <input name="location" value={f.location} onChange={handle}
        placeholder="📍 Location" style={{ ...sel, padding: '0 14px', width: '150px' }} />

      <input name="minCapacity" value={f.minCapacity} onChange={handle}
        type="number" min="1" placeholder="👥 Min capacity"
        style={{ ...sel, padding: '0 14px', width: '140px' }} />

      {hasFilters && (
        <button onClick={reset} style={{
          background: '#f4f6f9', border: '1.5px solid #e0e6ed', borderRadius: '10px',
          padding: '0 18px', height: '42px', fontSize: '13px',
          color: '#555', cursor: 'pointer', fontWeight: '600',
          transition: 'all 0.2s',
        }}>
          ✕ Reset
        </button>
      )}
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────── */
export default function FacilitiesUserPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [filters,   setFilters]   = useState({});

  const load = useCallback(async (f = filters) => {
    setLoading(true); setError('');
    try {
      const { data } = await resourceApi.getAll(f);
      setResources(data);
    } catch {
      setError('Could not load resources. Please check the server connection.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, []);

  const handleFilter = (f) => { setFilters(f); load(f); };

  const handleBook = (resource) => {
    if (!user) {
      navigate('/login');
    } else {
      navigate('/new-booking', { state: { preselectedResource: resource.name } });
    }
  };

  const stats = [
    {
      label: 'Lecture Halls',
      value: resources.filter(r => r.type === 'LECTURE_HALL').length,
      bg: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
      color: '#3b5bdb', border: '#c5d0fa', emoji: '🏛️',
    },
    {
      label: 'Labs',
      value: resources.filter(r => r.type === 'LAB').length,
      bg: 'linear-gradient(135deg, #e6f4ea 0%, #d1fae5 100%)',
      color: '#1a7a34', border: '#b0dbb8', emoji: '🔬',
    },
    {
      label: 'Meeting Rooms',
      value: resources.filter(r => r.type === 'MEETING_ROOM').length,
      bg: 'linear-gradient(135deg, #fff3e0 0%, #ffedd5 100%)',
      color: '#e65100', border: '#fed7aa', emoji: '🤝',
    },
    {
      label: 'Equipment',
      value: resources.filter(r => r.type === 'EQUIPMENT').length,
      bg: 'linear-gradient(135deg, #f3e5f5 0%, #ede9fe 100%)',
      color: '#7b1fa2', border: '#d8b4fe', emoji: '🖥️',
    },
    {
      label: 'Study Rooms',
      value: resources.filter(r => r.type === 'ROOM').length,
      bg: 'linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)',
      color: '#444444', border: '#cbd5e1', emoji: '🚪',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7fb', fontFamily: "'Segoe UI', sans-serif" }}>

      {/* ── Navbar ── */}
      <nav style={{
        background: 'rgba(10, 22, 40, 0.96)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 20px rgba(0,0,0,0.3)',
      }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto',
          padding: '14px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              width: '36px', height: '36px', background: '#e8871a',
              borderRadius: '9px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '13px',
            }}>
              SC
            </div>
            <span style={{ color: '#fff', fontWeight: '700', fontSize: '17px', letterSpacing: '-0.3px' }}>
              SpaceSync
            </span>
          </Link>

          {/* Centre label */}
          <div style={{
            color: '#a0b4cc', fontSize: '13px', fontWeight: '500',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <span style={{ color: '#e8871a', fontSize: '16px' }}>🏛️</span>
            Campus Resources & Facilities
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link to="/" style={{
              color: '#7a9cc0', fontSize: '13px', fontWeight: '500',
              textDecoration: 'none', padding: '6px 14px',
              borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.2s',
            }}>
              ← Back
            </Link>
            {user ? (
              <button
                onClick={() => navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard')}
                style={{
                  background: '#e8871a', color: '#fff', border: 'none',
                  borderRadius: '9px', padding: '8px 18px',
                  fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                  boxShadow: '0 3px 10px rgba(232,135,26,0.35)',
                  transition: 'all 0.2s',
                }}
              >
                Dashboard →
              </button>
            ) : (
              <Link to="/login" style={{
                background: '#e8871a', color: '#fff', borderRadius: '9px',
                padding: '8px 18px', fontSize: '13px', fontWeight: '700',
                textDecoration: 'none', boxShadow: '0 3px 10px rgba(232,135,26,0.35)',
              }}>
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── Page Hero ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #112240 60%, #1a3a5c 100%)',
        padding: '52px 28px 44px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative orbs */}
        <div style={{
          position: 'absolute', top: '-60px', left: '10%',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'rgba(232,135,26,0.08)', filter: 'blur(60px)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-80px', right: '10%',
          width: '250px', height: '250px', borderRadius: '50%',
          background: 'rgba(59,91,219,0.1)', filter: 'blur(50px)', pointerEvents: 'none',
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: 'rgba(232,135,26,0.12)', border: '1px solid rgba(232,135,26,0.3)',
          borderRadius: '20px', padding: '5px 14px',
          fontSize: '11px', fontWeight: '700', color: '#e8871a',
          letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '18px',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#e8871a', display: 'inline-block', boxShadow: '0 0 8px #e8871a' }} />
          SLIIT Campus Hub
        </div>

        <h1 style={{
          margin: '0 0 12px',
          fontSize: 'clamp(26px, 4vw, 40px)',
          fontWeight: '800',
          color: '#fff',
          letterSpacing: '-1px',
          lineHeight: 1.2,
        }}>
          Campus Facilities & Resources
        </h1>
        <p style={{
          margin: 0, fontSize: '15px', color: '#8aa8c8', maxWidth: '500px',
          lineHeight: 1.6, marginInline: 'auto',
        }}>
          Browse available rooms, labs, and equipment across campus. Filter by type, status, or location.
        </p>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '36px 28px 60px' }}>

        {/* Stat Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}>
          {stats.map(({ label, value, bg, color, border, emoji }) => (
            <div key={label} style={{
              background: bg,
              border: `1.5px solid ${border}`,
              borderRadius: '14px',
              padding: '20px 22px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <div style={{ fontSize: '28px' }}>{emoji}</div>
              <div>
                <div style={{ fontSize: '28px', fontWeight: '800', color, lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: '12px', color: '#7a9cc0', marginTop: '4px', fontWeight: '600' }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <FiltersBar onFilter={handleFilter} />

        {/* Error */}
        {error && (
          <div style={{
            background: '#fdecea', border: '1.5px solid #f5b7b1',
            borderRadius: '12px', padding: '14px 20px',
            marginBottom: '24px', color: '#c0392b', fontSize: '13px',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '80px 0', gap: '16px',
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              border: '3px solid #e0e6ed', borderTopColor: '#3b5bdb',
              animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ color: '#7a9cc0', fontSize: '14px', margin: 0 }}>Loading resources…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
            <p style={{ fontSize: '13px', color: '#7a9cc0', margin: 0 }}>
              Try adjusting your filters or check back later.
            </p>
          </div>
        ) : (
          <>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: '18px',
            }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#7a9cc0', fontWeight: '500' }}>
                Showing <strong style={{ color: '#1a2a3a' }}>{resources.length}</strong> resource{resources.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
              gap: '20px',
            }}>
              {resources.map(r => (
                <ResourceCard key={r.id} resource={r} onBook={handleBook} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Footer strip ── */}
      <div style={{
        background: '#0a1628', padding: '20px 28px',
        textAlign: 'center', color: '#3a5a7a', fontSize: '12px',
      }}>
        SpaceSync — SLIIT Campus Hub · Faculty of Computing
      </div>
    </div>
  );
}