import { useState } from 'react';

const sel = {
  border: '1px solid #e0e6ed', borderRadius: '8px', padding: '0 12px',
  fontSize: '13px', color: '#333', background: '#fff',
  height: '38px', outline: 'none', cursor: 'pointer',
};

export default function ResourceFilters({ onFilter }) {
  const [f, setF] = useState({
    type: '', status: '', location: '', building: '', minCapacity: '',
  });

  const handle = (e) => {
    const updated = { ...f, [e.target.name]: e.target.value };
    setF(updated); onFilter(updated);
  };

  const reset = () => {
    const empty = { type: '', status: '', location: '', building: '', minCapacity: '' };
    setF(empty); onFilter(empty);
  };

  return (
    <div style={{
      background: '#fff', border: '1px solid #e8edf2', borderRadius: '12px',
      padding: '14px 20px', marginBottom: '24px',
      display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center',
    }}>
      <span style={{
        fontSize: '11px', fontWeight: '700', color: '#8a9cc0',
        textTransform: 'uppercase', letterSpacing: '0.6px',
      }}>Filter:</span>

      <select name="type" value={f.type} onChange={handle} style={sel}>
        <option value="">All Types</option>
        <option value="LECTURE_HALL">Lecture Hall</option>
        <option value="LAB">Lab</option>
        <option value="MEETING_ROOM">Meeting Room</option>
        <option value="EQUIPMENT">Equipment</option>
      </select>

      <select name="status" value={f.status} onChange={handle} style={sel}>
        <option value="">All Statuses</option>
        <option value="ACTIVE">Active</option>
        <option value="OUT_OF_SERVICE">Out of Service</option>
      </select>

      <input name="building" value={f.building} onChange={handle}
        placeholder="Building" style={{ ...sel, padding: '0 12px', width: '140px' }} />

      <input name="location" value={f.location} onChange={handle}
        placeholder="Location" style={{ ...sel, padding: '0 12px', width: '150px' }} />

      <input name="minCapacity" value={f.minCapacity} onChange={handle}
        type="number" min="1" placeholder="Min capacity"
        style={{ ...sel, padding: '0 12px', width: '130px' }} />

      <button onClick={reset} style={{
        background: '#f4f6f9', border: '1px solid #e0e6ed', borderRadius: '8px',
        padding: '0 16px', height: '38px', fontSize: '13px',
        color: '#555', cursor: 'pointer', fontWeight: '500',
      }}>Reset</button>
    </div>
  );
}