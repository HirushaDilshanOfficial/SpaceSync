import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Users, 
  Clock, 
  Search, 
  X, 
  Calendar, 
  Ban, 
  AlertCircle, 
  Inbox,
  ArrowLeft,
  LayoutDashboard,
  LogIn,
  Library,
  FlaskConical,
  Users2,
  Monitor,
  DoorOpen
} from 'lucide-react';
import { resourceApi } from '../../api/resourceApi';
import { useAuth } from '../../context/AuthContext';

/* ─── Injected global styles ────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; }
  body { margin: 0; }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse-dot {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }

  .res-card {
    background: #fff;
    border: 1.5px solid #e8eef6;
    border-radius: 18px;
    padding: 0;
    display: flex;
    flex-direction: column;
    box-shadow: 0 2px 12px rgba(0,48,135,0.05);
    transition: all 0.22s ease;
    cursor: default;
    overflow: hidden;
    animation: fadeUp 0.35s ease both;
  }
  .res-card:hover {
    border-color: #a8bce0;
    box-shadow: 0 10px 36px rgba(0,48,135,0.13);
    transform: translateY(-3px);
  }

  .res-card-img {
    width: 100%;
    height: 160px;
    object-fit: cover;
  }
  .res-card-img-placeholder {
    width: 100%;
    height: 160px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 48px;
  }

  .filter-input {
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    padding: 0 14px;
    height: 40px;
    font-size: 13px;
    color: #1e293b;
    background: #f8fafc;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    font-family: 'Inter', sans-serif;
  }
  .filter-input:focus {
    border-color: #003087;
    box-shadow: 0 0 0 3px rgba(0,48,135,0.12);
    background: #fff;
  }

  .book-btn {
    width: 100%;
    background: linear-gradient(135deg, #e69500, #F5A800);
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 11px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.22s ease;
    font-family: 'Inter', sans-serif;
    letter-spacing: 0.2px;
    box-shadow: 0 4px 14px rgba(245,168,0,0.35);
  }
  .book-btn:hover {
    filter: brightness(1.08);
    box-shadow: 0 6px 20px rgba(245,168,0,0.45);
    transform: translateY(-1px);
  }
  .book-btn:disabled {
    background: #e2e8f0;
    color: #94a3b8;
    box-shadow: none;
    cursor: not-allowed;
    transform: none;
  }

  .type-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    border-radius: 20px;
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.4px;
    text-transform: uppercase;
  }

  .stat-card {
    border-radius: 16px;
    padding: 20px 22px;
    display: flex;
    align-items: center;
    gap: 16px;
    border: 1.5px solid transparent;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  }

  .nav-link-btn {
    color: #475569;
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    padding: 7px 16px;
    border-radius: 9px;
    border: 1.5px solid #e2e8f0;
    background: #fff;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
  }
  .nav-link-btn:hover {
    border-color: #003087;
    color: #003087;
    background: #eef2f9;
  }

  .dash-btn {
    background: linear-gradient(135deg, #002370, #003087);
    color: #fff;
    border: none;
    border-radius: 9px;
    padding: 8px 20px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    box-shadow: 0 3px 12px rgba(0,48,135,0.3);
    transition: all 0.2s;
  }
  .dash-btn:hover {
    filter: brightness(1.15);
    box-shadow: 0 5px 18px rgba(0,48,135,0.4);
  }

  .search-wrap {
    position: relative;
    flex: 1;
    min-width: 180px;
  }
  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    font-size: 15px;
    pointer-events: none;
  }
  .search-input {
    width: 100%;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    padding: 0 14px 0 36px;
    height: 40px;
    font-size: 13px;
    color: #1e293b;
    background: #f8fafc;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    font-family: 'Inter', sans-serif;
  }
  .search-input:focus {
    border-color: #003087;
    box-shadow: 0 0 0 3px rgba(0,48,135,0.12);
    background: #fff;
  }
`;

/* ─── Type metadata ─────────────────────────────────────────────── */
const TYPE_META = {
  LECTURE_HALL: { bg: '#eef2f9', color: '#003087', border: '#b3c3e0', icon: Library, label: 'Lecture Hall' },
  LAB:          { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0', icon: FlaskConical, label: 'Lab'           },
  MEETING_ROOM: { bg: '#fffbeb', color: '#b45309', border: '#fde68a', icon: Users2, label: 'Meeting Room'  },
  EQUIPMENT:    { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe', icon: Monitor, label: 'Equipment'     },
  ROOM:         { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa', icon: DoorOpen, label: 'Study Room'    },
};

/* ─── Status Badge ──────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const isActive = status === 'ACTIVE';
  return (
    <span style={{
      background: isActive ? '#ecfdf5' : '#fff1f2',
      color:      isActive ? '#059669' : '#e11d48',
      border:     `1px solid ${isActive ? '#a7f3d0' : '#fecdd3'}`,
      borderRadius: '20px',
      padding: '4px 11px',
      fontSize: '11px',
      fontWeight: '700',
      letterSpacing: '0.4px',
      textTransform: 'uppercase',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
    }}>
      <span style={{
        width: '6px', height: '6px', borderRadius: '50%',
        background: isActive ? '#059669' : '#e11d48',
        display: 'inline-block',
        animation: isActive ? 'pulse-dot 1.8s ease-in-out infinite' : 'none',
      }} />
      {isActive ? 'Available' : 'Unavailable'}
    </span>
  );
}

/* ─── Resource Card ─────────────────────────────────────────────── */
function ResourceCard({ resource, onBook }) {
  const meta = TYPE_META[resource.type] ?? { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0', emoji: '📦', label: resource.type };
  const isActive = resource.status === 'ACTIVE';

  return (
    <div className="res-card">
      {/* Image / Emoji banner */}
      {resource.imageUrl ? (
        <img src={resource.imageUrl} alt={resource.name} className="res-card-img" />
      ) : (
        <div className="res-card-img-placeholder" style={{ background: meta.bg, color: meta.color }}>
          {meta.icon && <meta.icon size={48} />}
        </div>
      )}

      {/* Content */}
      <div style={{ padding: '18px 20px 20px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', lineHeight: 1.3 }}>
              {resource.name}
            </div>
            <span className="type-chip" style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}`, marginTop: '5px' }}>
              {meta.icon && <meta.icon size={12} />} {meta.label}
            </span>
          </div>
          <StatusBadge status={resource.status} />
        </div>

        {/* Info grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {[
            resource.building  ? { icon: Building2, label: 'Building',  value: resource.building  } : null,
            resource.location  ? { icon: MapPin, label: 'Location',  value: resource.location  } : null,
            resource.capacity  ? { icon: Users, label: 'Capacity',  value: `${resource.capacity} persons` } : null,
            resource.type !== 'EQUIPMENT' && resource.availabilityStart
              ? { icon: Clock, label: 'Hours', value: `${resource.availabilityStart} – ${resource.availabilityEnd}` }
              : null,
          ].filter(Boolean).map(({ icon: Icon, label, value }) => (
            <div key={label} style={{
              background: '#f8fafc', borderRadius: '10px', padding: '9px 11px',
              border: '1px solid #f1f5f9',
            }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Icon size={10} /> {label}
              </div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Description */}
        {resource.description && (
          <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>
            {resource.description}
          </p>
        )}

        {/* Book button */}
        <div style={{ marginTop: 'auto' }}>
          <button
            className="book-btn"
            onClick={() => onBook(resource)}
            disabled={!isActive}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {isActive ? <><Calendar size={16} /> Book Now</> : <><Ban size={16} /> Unavailable</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Filters Bar ───────────────────────────────────────────────── */
function FiltersBar({ onFilter }) {
  const [f, setF] = useState({ type: '', status: '', building: '', location: '', minCapacity: '', search: '' });

  const handle = (e) => {
    const updated = { ...f, [e.target.name]: e.target.value };
    setF(updated); onFilter(updated);
  };

  const reset = () => {
    const empty = { type: '', status: '', building: '', location: '', minCapacity: '', search: '' };
    setF(empty); onFilter(empty);
  };

  const hasFilters = Object.values(f).some(v => v !== '');

  return (
    <div style={{
      background: '#fff',
      border: '1.5px solid #e8eef6',
      borderRadius: '16px',
      padding: '16px 20px',
      marginBottom: '28px',
      boxShadow: '0 2px 12px rgba(0,48,135,0.05)',
    }}>
      {/* Row 1: Search + dropdowns */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
        {/* Search */}
        <div className="search-wrap">
          <span className="search-icon"><Search size={16} /></span>
          <input
            className="search-input"
            name="search"
            value={f.search}
            onChange={handle}
            placeholder="Search resources…"
          />
        </div>

        <select name="type" value={f.type} onChange={handle} className="filter-input" style={{ width: '150px' }}>
          <option value="">All Types</option>
          <option value="LECTURE_HALL">Lecture Hall</option>
          <option value="LAB">Lab</option>
          <option value="MEETING_ROOM">Meeting Room</option>
          <option value="EQUIPMENT">Equipment</option>
          <option value="ROOM">Study Room</option>
        </select>

        <select name="status" value={f.status} onChange={handle} className="filter-input" style={{ width: '150px' }}>
          <option value="">All Statuses</option>
          <option value="ACTIVE">Available</option>
          <option value="OUT_OF_SERVICE">Unavailable</option>
        </select>

        <input name="building" value={f.building} onChange={handle}
          placeholder="Building" className="filter-input" style={{ width: '140px' }} />

        <input name="location" value={f.location} onChange={handle}
          placeholder="Location" className="filter-input" style={{ width: '140px' }} />

        <input name="minCapacity" value={f.minCapacity} onChange={handle}
          type="number" min="1" placeholder="Min capacity"
          className="filter-input" style={{ width: '140px' }} />

        {hasFilters && (
          <button onClick={reset} style={{
            background: '#f1f5f9', border: '1.5px solid #e2e8f0', borderRadius: '10px',
            padding: '0 16px', height: '40px', fontSize: '13px',
            color: '#64748b', cursor: 'pointer', fontWeight: '600',
            fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            <X size={14} /> Clear
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Stat Card ─────────────────────────────────────────────────── */
function StatCard({ label, value, bg, color, border, icon: Icon }) {
  return (
    <div className="stat-card" style={{ background: bg, border: `1.5px solid ${border}` }}>
      <div style={{ color, opacity: 0.8 }}><Icon size={30} /></div>
      <div>
        <div style={{ fontSize: '26px', fontWeight: '800', color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</div>
      </div>
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
  const [localSearch, setLocalSearch] = useState('');

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

  const handleFilter = (f) => {
    setLocalSearch(f.search || '');
    const { search, ...apiFilters } = f;
    setFilters(apiFilters);
    load(apiFilters);
  };

  const handleBook = (resource) => {
    if (!user) {
      navigate('/login');
    } else {
      navigate('/new-booking', { state: { preselectedResource: resource.name } });
    }
  };

  /* client-side search filter */
  const displayed = localSearch
    ? resources.filter(r =>
        r.name?.toLowerCase().includes(localSearch.toLowerCase()) ||
        r.building?.toLowerCase().includes(localSearch.toLowerCase()) ||
        r.location?.toLowerCase().includes(localSearch.toLowerCase()) ||
        r.description?.toLowerCase().includes(localSearch.toLowerCase())
      )
    : resources;

  const stats = [
    { label: 'Lecture Halls', value: resources.filter(r => r.type === 'LECTURE_HALL').length, bg: '#eef2f9', color: '#003087', border: '#b3c3e0', icon: Library },
    { label: 'Labs',          value: resources.filter(r => r.type === 'LAB').length,          bg: '#ecfdf5', color: '#059669', border: '#a7f3d0', icon: FlaskConical },
    { label: 'Meeting Rooms', value: resources.filter(r => r.type === 'MEETING_ROOM').length, bg: '#fffbeb', color: '#b45309', border: '#fde68a', icon: Users2 },
    { label: 'Equipment',     value: resources.filter(r => r.type === 'EQUIPMENT').length,    bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe', icon: Monitor },
    { label: 'Study Rooms',   value: resources.filter(r => r.type === 'ROOM').length,         bg: '#fff7ed', color: '#c2410c', border: '#fed7aa', icon: DoorOpen },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4fa', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <style>{GLOBAL_CSS}</style>

      {/* ── Navbar ── */}
      <nav style={{
        background: '#fff',
        borderBottom: '1px solid #dce6f5',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 12px rgba(0,48,135,0.08)',
      }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto',
          padding: '13px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              width: '36px', height: '36px',
              background: 'linear-gradient(135deg, #002370, #003087)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: '800', fontSize: '13px',
              boxShadow: '0 3px 10px rgba(0,48,135,0.3)',
            }}>
              SS
            </div>
            <span style={{ color: '#0f172a', fontWeight: '800', fontSize: '17px', letterSpacing: '-0.3px' }}>
              Space<span style={{ color: '#003087' }}>Sync</span>
            </span>
          </Link>


          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link to="/" className="nav-link-btn">
              <ArrowLeft size={16} /> Back
            </Link>
            {user ? (
              <button
                className="dash-btn"
                onClick={() => navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                Dashboard <LayoutDashboard size={16} />
              </button>
            ) : (
              <Link to="/login" className="dash-btn" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Sign In <LogIn size={16} />
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── Page Hero ── */}
      <div style={{
        background: 'linear-gradient(135deg, #001a52 0%, #003087 55%, #0047c2 100%)',
        padding: '52px 28px 48px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle circles */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-40px',
          width: '320px', height: '320px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', left: '5%',
          width: '200px', height: '200px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)', pointerEvents: 'none',
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '7px',
          background: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '20px', padding: '5px 16px',
          fontSize: '11px', fontWeight: '700', color: '#fff',
          letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '18px',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F5A800', display: 'inline-block', boxShadow: '0 0 8px #F5A800' }} />
          SLIIT · Sri Lanka
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
          margin: 0, fontSize: '15px', color: 'rgba(255,255,255,0.78)',
          maxWidth: '480px', lineHeight: 1.7, marginInline: 'auto',
        }}>
          Browse and book rooms, labs, and equipment across campus. Filter by type, status, or location.
        </p>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '36px 28px 72px' }}>

        {/* Stat Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))',
          gap: '14px',
          marginBottom: '32px',
        }}>
          {stats.map(s => <StatCard key={s.label} {...s} />)}
        </div>

        {/* Filters */}
        <FiltersBar onFilter={handleFilter} />

        {/* Error */}
        {error && (
          <div style={{
            background: '#fff1f2', border: '1.5px solid #fecdd3',
            borderRadius: '12px', padding: '14px 18px',
            marginBottom: '24px', color: '#e11d48', fontSize: '13px',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Grid / States */}
        {loading ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '80px 0', gap: '16px',
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              border: '3px solid #dce6f5', borderTopColor: '#003087',
              animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0, fontWeight: '500' }}>Loading resources…</p>
          </div>
        ) : displayed.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 0',
            background: '#fff', borderRadius: '18px',
            border: '1.5px dashed #b3c3e0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <Inbox size={52} color="#94a3b8" />
            <div>
              <p style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px' }}>
                No resources found
              </p>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                Try adjusting your filters or check back later.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>
                Showing <strong style={{ color: '#0f172a' }}>{displayed.length}</strong> resource{displayed.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(295px, 1fr))',
              gap: '22px',
            }}>
              {displayed.map((r, i) => (
                <div key={r.id} style={{ animationDelay: `${i * 0.05}s` }}>
                  <ResourceCard resource={r} onBook={handleBook} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Footer ── */}
      <div style={{
        borderTop: '2px solid #003087',
        background: '#001a52',
        padding: '22px 28px',
        textAlign: 'center',
        color: '#8faad4',
        fontSize: '12px',
        fontWeight: '500',
      }}>
        <span style={{ color: '#F5A800', fontWeight: '700' }}>SpaceSync</span> — Sri Lanka Institute of Information Technology · Faculty of Computing
      </div>
    </div>
  );
}