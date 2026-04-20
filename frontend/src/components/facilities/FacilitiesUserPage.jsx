import { useEffect, useState, useCallback } from 'react';
import { resourceApi }   from '../../api/resourceApi';
import ResourceCard      from '../../components/facilities/ResourceCard';
import ResourceFilters   from '../../components/facilities/ResourceFilters';

export default function FacilitiesUserPage() {
  const [resources,  setResources]  = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
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

  const handleFilter = (f) => { setFilters(f); load(f); };

  const stats = [
    { label: 'Total Resources', value: resources.length,
      bg: '#ffffff', color: '#000000', border: '#ffffff', icon: '🏛' },
    { label: 'Available', value: resources.filter(r => r.status === 'ACTIVE').length,
      bg: '#ffffff', color: '#000000', border: '#ffffff', icon: '✅' },
    { label: 'Unavailable', value: resources.filter(r => r.status === 'OUT_OF_SERVICE').length,
      bg: '#ffffff', color: '#000000', border: '#ffffff', icon: '⛔' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", background: '#f0f4f8' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: '230px', background: '#0a1628',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
      }}>
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
            background: 'rgba(232,135,26,0.15)',
            border: '1px solid rgba(232,135,26,0.3)',
            borderRadius: '6px', padding: '4px 10px',
            fontSize: '10px', color: '#e8871a',
            fontWeight: '700', letterSpacing: '0.5px', display: 'inline-block',
          }}>Faculty of Computing</div>
        </div>

        <nav style={{ padding: '16px 0', flex: 1 }}>
          <p style={{
            color: '#3a5a7a', fontSize: '10px', fontWeight: '700',
            letterSpacing: '1px', textTransform: 'uppercase',
            padding: '0 18px', marginBottom: '6px',
          }}>Main Menu</p>

          {[
            { icon: '🏛', label: 'Facilities',    active: true  },
            { icon: '📅', label: 'My Bookings',   active: false },
            { icon: '🔔', label: 'Notifications', active: false },
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

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.07)',
          padding: '14px 18px',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <div style={{
            width: '34px', height: '34px', background: '#1e3a5f',
            borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#7ab0d0',
            fontSize: '11px', fontWeight: '700', flexShrink: 0,
          }}>ST</div>
          <div>
            <div style={{ color: '#fff', fontSize: '12px', fontWeight: '600' }}>Student User</div>
            <div style={{ color: '#6a8caa', fontSize: '10px', marginTop: '2px' }}>student@sliit.lk</div>
          </div>
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
          padding: '0 28px',
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          <div style={{ fontSize: '15px', fontWeight: '600', color: '#1a2a3a' }}>
            Facilities &amp; Assets Catalogue
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '36px', height: '36px', background: '#f0f4f8',
              border: '1px solid #e0e6ed', borderRadius: '9px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '15px', cursor: 'pointer',
            }}>🔔</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', background: '#0a1628',
                borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '12px', fontWeight: '700',
              }}>ST</div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#1a2a3a', lineHeight: 1.2 }}>Student</div>
                <div style={{ fontSize: '11px', color: '#7a9cc0' }}>student@sliit.lk</div>
              </div>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: '28px' }}>

          {/* Breadcrumb */}
          <p style={{ fontSize: '12px', color: '#7a9cc0', marginBottom: '18px' }}>
            Dashboard / <span style={{ color: '#1a2a3a', fontWeight: '600' }}>Facilities</span>
          </p>

          {/* Page Header */}
          <div style={{ marginBottom: '22px' }}>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#1a2a3a' }}>
              Facilities &amp; Assets
            </h1>
            <p style={{ margin: '5px 0 0', fontSize: '13px', color: '#7a9cc0' }}>
              Browse and request available campus resources
            </p>
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
                Try adjusting your filters.
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
              gap: '18px',
            }}>
              {resources.map(r => (
                <ResourceCard
                  key={r.id}
                  resource={r}
                  isUser={true}       
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}