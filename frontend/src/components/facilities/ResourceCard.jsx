import { useState } from 'react';
import StatusBadge from './StatusBadge';

const TYPE_META = {
  LECTURE_HALL: { bg: '#e8f0fe', color: '#000000' },
  LAB:          { bg: '#e6f4ea', color: '#000000' },
  MEETING_ROOM: { bg: '#fff3e0', color: '#000000' },
  EQUIPMENT:    { bg: '#f3e5f5', color: '#000000' },
};

export default function ResourceCard({
  resource,
  onEdit,
  onDelete,
  onStatusChange,
  isUser = false
}) {
  const [hovered, setHovered] = useState(false);
  const meta = TYPE_META[resource.type] ?? { bg: '#f0f4f8', color: '#555' };
  
  const isAvailable = resource.status === 'ACTIVE';
  const statusColor = isAvailable ? '#000000' : '#000000';
  const statusBg = isAvailable ? '#e6f4ea' : '#fff3e0';
  const statusText = isAvailable ? 'Available' : 'Unavailable';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        border: `1px solid ${hovered ? '#b8c8e8' : '#e8edf2'}`,
        borderRadius: '14px',
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        boxShadow: hovered
          ? '0 8px 28px rgba(10,22,40,0.10)'
          : '0 1px 4px rgba(0,0,0,0.04)',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              background: meta.bg,
              borderRadius: '11px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              flexShrink: 0,
            }}
          ></div>

          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#1a2a3a', lineHeight: 1.3 }}>
              {resource.name}
            </div>
            <div
              style={{
                fontSize: '10px',
                color: meta.color,
                marginTop: '3px',
                fontWeight: '700',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              {resource.type.replace(/_/g, ' ')}
            </div>
          </div>
        </div>

        <div
          style={{
            background: statusBg,
            color: statusColor,
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: '700',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
          }}
        >
          {statusText}
        </div>
      </div>

      {/* Details */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          fontSize: '12px',
          color: '#5a7a9a',
        }}
      >
        <div>
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#7a9cc0', marginBottom: '3px', textTransform: 'uppercase' }}>
            Building
          </div>
          <div style={{ color: '#1a2a3a', fontWeight: '500' }}>
            {resource.building}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#7a9cc0', marginBottom: '3px', textTransform: 'uppercase' }}>
            Location
          </div>
          <div style={{ color: '#1a2a3a', fontWeight: '500' }}>
            {resource.location}
          </div>
        </div>

        {resource.capacity && (
          <div>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#7a9cc0', marginBottom: '3px', textTransform: 'uppercase' }}>
              Capacity
            </div>
            <div style={{ color: '#1a2a3a', fontWeight: '500' }}>
              {resource.capacity} persons
            </div>
          </div>
        )}

        {/* ✅ Hide Hours when EQUIPMENT */}
        {resource.type !== 'EQUIPMENT' && (
          <div>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#7a9cc0', marginBottom: '3px', textTransform: 'uppercase' }}>
              Hours
            </div>
            <div style={{ color: '#1a2a3a', fontWeight: '500' }}>
              {resource.availabilityStart} – {resource.availabilityEnd}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ paddingTop: '12px', borderTop: '1px solid #f0f4f8' }}>
        {!isUser && (
          // ADMIN VIEW
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => onEdit(resource)}
              style={{
                flex: 1,
                background: '#ffffff',
                border: '1px solid #e0e6ed',
                borderRadius: '8px',
                padding: '8px',
                fontSize: '12px',
                fontWeight: '700',
                color: '#080707',
                cursor: 'pointer',
              }}
            >
              Edit
            </button>

            <select
              value={resource.status}
              onChange={(e) => onStatusChange(resource.id, e.target.value)}
              style={{
                border: '1px solid #e0e6ed',
                borderRadius: '8px',
                padding: '0 8px',
                fontSize: '11px',
                color: '#555',
                background: '#f8fafc',
                cursor: 'pointer',
                height: '34px',
              }}
            >
              <option value="ACTIVE">Available</option>
              <option value="OUT_OF_SERVICE">Unavailable</option>
            </select>

            <button
              onClick={() => onDelete(resource.id)}
              style={{
                background: '#ffffff',
                border: '1px solid #e0e6ed',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: '700',
                color: '#080707',
                cursor: 'pointer',
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}