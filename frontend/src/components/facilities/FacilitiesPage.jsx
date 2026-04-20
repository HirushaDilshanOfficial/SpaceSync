import { useEffect, useState, useCallback } from 'react';
import { resourceApi }    from '../../api/resourceApi';
import ResourceCard       from '../../components/facilities/ResourceCard';
import ResourceForm       from '../../components/facilities/ResourceForm';
import ResourceFilters    from '../../components/facilities/ResourceFilters';

export default function FacilitiesPage() {
  const [resources,  setResources]  = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [showForm,   setShowForm]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [filters,    setFilters]    = useState({});

  const load = useCallback(async (f = filters) => {
    setLoading(true); setError('');
    try {
      const { data } = await resourceApi.getAll(f);
      setResources(data);
    } catch {
      setError('Could not connect to backend. Make sure Spring Boot is running on port 8080.');
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, []);

  const handleFilter       = (f)  => { setFilters(f); load(f); };
  const handleStatusChange = async (id, status) => {
    try { await resourceApi.updateStatus(id, status); load(); }
    catch { alert('Failed to update status.'); }
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resource?')) return;
    try { await resourceApi.remove(id); load(); }
    catch { alert('Failed to delete.'); }
  };
  const handleSubmit = async (payload) => {
    try {
      editTarget
        ? await resourceApi.update(editTarget.id, payload)
        : await resourceApi.create(payload);
      setShowForm(false); setEditTarget(null); load();
    } catch (err) {
      alert(err.response?.data?.message ?? 'Failed to save.');
    }
  };

  const stats = [
    { label: 'Total Resources', value: resources.length,
      bg: '#eef2ff', color: '#3b5bdb', border: '#c5d0fa', icon: '🏛' },
    { label: 'Available', value: resources.filter(r => r.status === 'ACTIVE').length,
      bg: '#e6f4ea', color: '#1a7a34', border: '#b0dbb8', icon: '✅' },
    { label: 'Unavailable', value: resources.filter(r => r.status === 'OUT_OF_SERVICE').length,
      bg: '#fdecea', color: '#c0392b', border: '#f5b7b1', icon: '⛔' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", background: '#f0f4f8' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: '230px', background: '#0a1628',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ padding: '22px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '40px', height: '40px', background: '#e8871a',
              borderRadius: '10px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '14px',
            }}>SC</div>
            <div>
              <div style={{ color: '#fff', fontWeight: '700', fontSize: '15px' }}>SpaceSynce</div>
              <div style={{ color: '#6a8caa', fontSize: '10px', marginTop: '2px' }}>SLIIT Campus Hub</div>
            </div>
          </div>
          <div style={{
            background: 'rgba(232,135,26,0.15)', border: '1px solid rgba(232,135,26,0.3)',
            borderRadius: '6px', padding: '4px 10px', fontSize: '10px',
            color: '#e8871a', fontWeight: '700', letterSpacing: '0.5px', display: 'inline-block',
          }}>
            Faculty of Computing
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '16px 0', flex: 1 }}>
          <p style={{
            color: '#3a5a7a', fontSize: '10px', fontWeight: '700',
            letterSpacing: '1px', textTransform: 'uppercase',
            padding: '0 18px', marginBottom: '6px',
          }}>Main Menu</p>

          {[
            { icon: '🏛', label: 'Facilities',     active: true },
            { icon: '📅', label: 'Bookings',        active: false },
            { icon: '🔧', label: 'Incidents',       active: false },
            { icon: '🔔', label: 'Notifications',   active: false },
          ].map(({ icon, label, active }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 18px', cursor: 'pointer',
              color: active ? '#fff' : '#7a9cc0',
              background: active ? 'rgba(255,255,255,0.07)' : 'transparent',
              borderLeft: active ? '3px solid #e8871a' : '3px solid transparent',
              fontSize: '13px', fontWeight: active ? '600' : '400',
            }}>
              <span style={{ fontSize: '16px' }}>{icon}</span>
              {label}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '12px 0' }}>
          {[{ icon: '⚙', label: 'Settings' }, { icon: '🚪', label: 'Sign Out' }].map(({ icon, label }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 18px', color: '#6a8caa', fontSize: '13px', cursor: 'pointer',
            }}>
              <span>{icon}</span>{label}
            </div>
          ))}
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div style={{ marginLeft: '230px', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Topbar */}
        <header style={{
          height: '58px', background: '#fff',
          borderBottom: '1px solid #e0e6ed',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px', position: 'sticky', top: 0, zIndex: 50,
        }}>
          <div style={{ fontSize: '15px', fontWeight: '600', color: '#1a2a3a' }}>
            Facilities &amp; Assets Catalogue
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '36px', height: '36px', background: '#f0f4f8',
              border: '1px solid #e0e6ed', borderRadius: '9px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '15px', cursor: 'pointer',
            }}>🔔</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', background: '#0a1628',
                borderRadius: '50%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: '700',
              }}>AD</div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#1a2a3a', lineHeight: 1.2 }}>Admin</div>
                <div style={{ fontSize: '11px', color: '#7a9cc0' }}>Administrator</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main style={{ flex: 1, padding: '28px' }}>

          {/* Breadcrumb */}
          <p style={{ fontSize: '12px', color: '#7a9cc0', marginBottom: '18px' }}>
            Dashboard / <span style={{ color: '#1a2a3a', fontWeight: '600' }}>Facilities</span>
          </p>

          {/* Page Header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'flex-start', marginBottom: '22px',
          }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#1a2a3a' }}>
                Facilities &amp; Assets
              </h1>
              <p style={{ margin: '5px 0 0', fontSize: '13px', color: '#7a9cc0' }}>
                Manage all bookable campus resources
              </p>
            </div>
            <button
              onClick={() => { setEditTarget(null); setShowForm(true); }}
              style={{
                background: '#e8871a', color: '#fff', border: 'none',
                borderRadius: '10px', padding: '10px 22px',
                fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                boxShadow: '0 3px 10px rgba(232,135,26,0.3)',
              }}>
              + Add Resource
            </button>
          </div>

          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '24px' }}>
            {stats.map(({ label, value, bg, color, border, icon }) => (
              <div key={label} style={{
                background: '#fff', border: '1px solid #e8edf2',
                borderRadius: '12px', padding: '18px 20px',
                display: 'flex', alignItems: 'center', gap: '16px',
              }}>
                <div style={{
                  width: '48px', height: '48px', background: bg,
                  border: `1px solid ${border}`, borderRadius: '12px',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '22px', flexShrink: 0,
                }}>{icon}</div>
                <div>
                  <div style={{ fontSize: '26px', fontWeight: '700', color, lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: '12px', color: '#7a9cc0', marginTop: '4px', fontWeight: '500' }}>{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <ResourceFilters onFilter={handleFilter} />

          {/* Error */}
          {error && (
            <div style={{
              background: '#fdecea', border: '1px solid #f5b7b1',
              borderRadius: '10px', padding: '14px 18px',
              marginBottom: '20px', color: '#c0392b', fontSize: '13px',
            }}>
              ⚠ {error}
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#7a9cc0', fontSize: '14px' }}>
              Loading resources…
            </div>
          ) : resources.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '80px 0',
              background: '#fff', borderRadius: '14px',
              border: '1px dashed #dde1e7',
            }}>
              <p style={{ fontSize: '40px', marginBottom: '12px' }}>📭</p>
              <p style={{ fontSize: '14px', color: '#7a9cc0', margin: 0 }}>No resources found.</p>
              <p style={{ fontSize: '12px', color: '#aab4be', marginTop: '6px' }}>
                Try adjusting your filters or add a new resource.
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
              gap: '18px',
            }}>
              {resources.map(r => (
                <ResourceCard key={r.id} resource={r}
                  onEdit={(r) => { setEditTarget(r); setShowForm(true); }}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
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