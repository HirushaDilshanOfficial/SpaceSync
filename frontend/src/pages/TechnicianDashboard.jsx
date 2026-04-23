import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Wrench, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Zap, 
  ChevronRight, 
  ClipboardList,
  User,
  MapPin,
  Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PRIORITY_CFG = {
  CRITICAL: { bg: '#fef2f2', text: '#dc2626', label: 'Critical' },
  HIGH:     { bg: '#fff7ed', text: '#ea580c', label: 'High'     },
  MEDIUM:   { bg: '#fefce8', text: '#ca8a04', label: 'Medium'   },
  LOW:      { bg: '#f0fdf4', text: '#16a34a', label: 'Low'      },
};

const STATUS_CFG = {
  OPEN:        { bg: '#eff6ff', text: '#2563eb', label: 'Open'        },
  IN_PROGRESS: { bg: '#f5f3ff', text: '#7c3aed', label: 'In Progress' },
  RESOLVED:    { bg: '#ecfdf5', text: '#059669', label: 'Resolved'    },
  CLOSED:      { bg: '#f8fafc', text: '#64748b', label: 'Closed'      },
};

export default function TechnicianDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ assigned: 0, inProgress: 0, resolved: 0 });

  const fetchAssignedTickets = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch tickets assigned to this technician
      const res = await fetch(`/api/incidents?assignedTo=${user.email}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
        
        // Calculate stats
        const inProgress = data.filter(t => t.status === 'IN_PROGRESS').length;
        const resolved = data.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
        setStats({ assigned: data.length, inProgress, resolved });
      }
    } catch (e) {
      console.error('Error fetching technician tickets:', e);
    } finally {
      setLoading(false);
    }
  }, [user.email]);

  useEffect(() => {
    if (user?.email) fetchAssignedTickets();
  }, [user.email, fetchAssignedTickets]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="tech-dashboard" style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#003087', letterSpacing: '-1px', marginBottom: '8px' }}>
          Technician Workspace
        </h1>
        <p style={{ color: '#64748b', fontWeight: 500 }}>
          Manage your assigned maintenance tasks and technical reports.
        </p>
      </header>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <StatCard icon={<ClipboardList />} label="Assigned Tasks" value={stats.assigned} color="#003087" bg="#eef2f9" />
        <StatCard icon={<Clock />} label="In Progress" value={stats.inProgress} color="#7c3aed" bg="#f5f3ff" />
        <StatCard icon={<CheckCircle />} label="Resolved (Total)" value={stats.resolved} color="#059669" bg="#ecfdf5" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '40px' }}>
        {/* Main Task List */}
        <div className="tasks-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>Active Assignments</h2>
            <button 
              onClick={fetchAssignedTickets}
              style={{ background: 'none', border: 'none', color: '#003087', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}
            >
              Refresh List
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
              <Clock className="animate-spin" style={{ color: '#003087', marginBottom: '16px' }} />
              <p style={{ color: '#64748b' }}>Loading your tasks...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div style={{ padding: '80px', textAlign: 'center', background: '#fff', borderRadius: '24px', border: '1px dashed #cbd5e1' }}>
              <div style={{ width: '64px', height: '64px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle size={32} color="#94a3b8" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>No Assigned Tasks</h3>
              <p style={{ color: '#64748b', maxWidth: '300px', margin: '0 auto' }}>You are all caught up! New tasks assigned by admins will appear here.</p>
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              {tickets.filter(t => t.status !== 'RESOLVED' && t.status !== 'CLOSED').map(ticket => (
                <TaskItem key={ticket.id} ticket={ticket} onClick={() => navigate(`/incidents/${ticket.id}`)} />
              ))}
              
              {tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length > 0 && (
                <>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '32px', marginBottom: '16px' }}>
                    Recently Completed
                  </h3>
                  {tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').slice(0, 5).map(ticket => (
                    <TaskItem key={ticket.id} ticket={ticket} onClick={() => navigate(`/incidents/${ticket.id}`)} isCompleted />
                  ))}
                </>
              )}
            </motion.div>
          )}
        </div>

        {/* Sidebar Info */}
        <aside>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0', position: 'sticky', top: '100px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '20px' }}>Technician Guidelines</h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <GuidelineItem number="01" text="Always update status to 'In Progress' when starting work." />
              <GuidelineItem number="02" text="Attach resolution notes for all fixed equipment." />
              <GuidelineItem number="03" text="Coordinate with admins for critical resource downtime." />
              <GuidelineItem number="04" text="Notify users via the platform once an issue is resolved." />
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, bg }) {
  return (
    <div style={{ 
      background: bg, 
      padding: '24px', 
      borderRadius: '24px', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '20px',
      border: '1px solid rgba(0,0,0,0.05)'
    }}>
      <div style={{ 
        width: '56px', 
        height: '56px', 
        background: '#fff', 
        borderRadius: '16px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: color,
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
      }}>
        {React.cloneElement(icon, { size: 28 })}
      </div>
      <div>
        <div style={{ fontSize: '28px', fontWeight: 900, color: '#1e293b', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', marginTop: '4px' }}>{label}</div>
      </div>
    </div>
  );
}

function TaskItem({ ticket, onClick, isCompleted }) {
  const pr = PRIORITY_CFG[ticket.priority] || PRIORITY_CFG.LOW;
  const st = STATUS_CFG[ticket.status] || STATUS_CFG.OPEN;

  return (
    <motion.div 
      variants={{ hidden: { y: 10, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
      onClick={onClick}
      style={{ 
        background: '#fff', 
        padding: '20px', 
        borderRadius: '20px', 
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        transition: 'all 0.2s',
        opacity: isCompleted ? 0.7 : 1
      }}
      whileHover={{ scale: 1.01, boxShadow: '0 10px 20px rgba(0,0,0,0.05)', borderColor: '#003087' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
        <div style={{ 
          width: '48px', 
          height: '48px', 
          background: ticket.ticketType === 'INCIDENT' ? '#fff1f2' : '#f5f3ff', 
          borderRadius: '12px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: ticket.ticketType === 'INCIDENT' ? '#dc2626' : '#7c3aed'
        }}>
          {ticket.ticketType === 'INCIDENT' ? <Zap size={24} /> : <Wrench size={24} />}
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>{ticket.title}</h4>
            <span style={{ 
              padding: '2px 8px', 
              borderRadius: '6px', 
              fontSize: '10px', 
              fontWeight: 800, 
              background: pr.bg, 
              color: pr.text,
              textTransform: 'uppercase'
            }}>{pr.label}</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {ticket.resourceName}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {new Date(ticket.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ 
          padding: '6px 12px', 
          borderRadius: '10px', 
          fontSize: '11px', 
          fontWeight: 800, 
          background: st.bg, 
          color: st.text,
          textTransform: 'uppercase'
        }}>{st.label}</span>
        <ChevronRight size={20} color="#cbd5e1" />
      </div>
    </motion.div>
  );
}

function GuidelineItem({ number, text }) {
  return (
    <li style={{ display: 'flex', gap: '16px' }}>
      <span style={{ fontSize: '11px', fontWeight: 900, color: '#003087', opacity: 0.3, marginTop: '2px' }}>{number}</span>
      <p style={{ fontSize: '13px', color: '#475569', fontWeight: 500, lineHeight: 1.4 }}>{text}</p>
    </li>
  );
}
