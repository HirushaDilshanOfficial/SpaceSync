import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Loader2, AlertTriangle, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function ReportIncidentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [loading, setLoading]     = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resources, setResources] = useState([]);
  const [formData, setFormData]   = useState({
    title:          '',
    description:    '',
    resourceId:     location.state?.resourceId || '',
    priority:       '',
    ticketType:     '',
    notes:          '',
  });

  React.useEffect(() => {
    fetch('/api/v1/resources')
      .then(r => r.json())
      .then(d => setResources(d))
      .catch(() => {});
  }, []);

  const handleChange = e => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title:       formData.title,
          description: formData.description,
          resourceId:  formData.resourceId,
          priority:    formData.priority,
          ticketType:  formData.ticketType,
          reportedBy:  user?.email || 'ANONYMOUS',
          notes:       formData.notes,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setSubmitted(true);
      setTimeout(() => navigate('/dashboard'), 2500);
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Success ── */
  if (submitted) {
    return (
      <div style={styles.successWrap}>
        <div style={styles.successCard}>
          <div style={styles.successIconRing}>
            <CheckCircle size={36} color="#22c55e" />
          </div>
          <h2 style={styles.successTitle}>Report Submitted!</h2>
          <p style={styles.successText}>
            Your incident has been logged. Our team will look into it shortly.
          </p>
          <p style={{ color: '#6b7280', fontSize: 13, marginTop: 8 }}>Redirecting to dashboard…</p>
        </div>
      </div>
    );
  }

  const isValid = formData.title && formData.description && formData.ticketType && formData.priority;

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <div>
            <h1 style={styles.pageTitle}>Report an Issue</h1>
            <p style={styles.pageSubtitle}>Tell us about a problem — we'll get it sorted.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>

          {/* Title */}
          <Field label="What's the issue?" required>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Projector not working in Lab 2"
              style={styles.input}
              required
            />
          </Field>

          {/* Description */}
          <Field label="Describe the problem" required>
            <textarea
              id="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="What happened? When did it start? Any other details…"
              style={{ ...styles.input, resize: 'vertical', lineHeight: '1.6' }}
              required
            />
          </Field>

          {/* Row: Type + Priority */}
          <div style={styles.row}>
            <Field label="Type" required>
              <select id="ticketType" value={formData.ticketType} onChange={handleChange} style={styles.input} required>
                <option value="">Select type…</option>
                <option value="INCIDENT">⚡ Incident</option>
                <option value="MAINTENANCE">🔧 Maintenance</option>
                <option value="REPAIR">🔨 Repair</option>
              </select>
            </Field>

            <Field label="Priority" required>
              <select id="priority" value={formData.priority} onChange={handleChange} style={styles.input} required>
                <option value="">Select priority…</option>
                <option value="CRITICAL">🔴 Critical</option>
                <option value="HIGH">🟠 High</option>
                <option value="MEDIUM">🟡 Medium</option>
                <option value="LOW">🟢 Low</option>
              </select>
            </Field>
          </div>

          {/* Resource */}
          <Field label="Affected Space / Resource" required>
            <select id="resourceId" value={formData.resourceId} onChange={handleChange} style={styles.input} required>
              <option value="">Select a resource…</option>
              {resources.map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.type})</option>
              ))}
            </select>
          </Field>

          {/* Notes */}
          <Field label="Additional notes" hint="Optional">
            <textarea
              id="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Anything else the team should know?"
              style={{ ...styles.input, resize: 'vertical', lineHeight: '1.6' }}
            />
          </Field>

          {/* Priority hint */}
          {formData.priority === 'CRITICAL' && (
            <div style={styles.criticalBanner}>
              <AlertTriangle size={16} color="#ef4444" />
              <span>Critical issues are escalated immediately to the facilities team.</span>
            </div>
          )}

          {/* Actions */}
          <div style={styles.actions}>
            <button type="button" onClick={() => navigate(-1)} style={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" disabled={loading || !isValid} style={{
              ...styles.submitBtn,
              opacity: (!isValid || loading) ? 0.5 : 1,
              cursor:  (!isValid || loading) ? 'not-allowed' : 'pointer',
            }}>
              {loading ? (
                <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Submitting…</>
              ) : (
                <><Send size={16} /> Submit Report</>
              )}
            </button>
          </div>

          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
            input:focus, select:focus, textarea:focus {
              outline: none;
              border-color: #6366f1 !important;
              box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15) !important;
            }
            select option { background: #1e1e2e; color: #e2e8f0; }
          `}</style>

        </form>
      </div>
    </div>
  );
}

/* ── Field wrapper ── */
function Field({ label, required, hint, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <label style={styles.label}>
          {label}
          {required && <span style={{ color: '#f87171', marginLeft: 3 }}>*</span>}
        </label>
        {hint && <span style={styles.hint}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

/* ── Styles ── */
const styles = {
  page: {
    minHeight: '100vh',
    padding: '40px 20px 60px',
  },
  container: {
    maxWidth: 640,
    margin: '0 auto',
  },
  header: {
    marginBottom: 36,
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'none',
    border: 'none',
    color: '#8b949e',
    fontSize: 14,
    cursor: 'pointer',
    padding: 0,
    marginBottom: 16,
    transition: 'color 0.2s',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: '#e6edf3',
    letterSpacing: '-0.5px',
    margin: 0,
  },
  pageSubtitle: {
    color: '#8b949e',
    fontSize: 15,
    marginTop: 6,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: 600,
    color: '#c9d1d9',
  },
  hint: {
    fontSize: 11,
    fontWeight: 500,
    color: '#6b7280',
    background: 'rgba(255,255,255,0.05)',
    padding: '2px 8px',
    borderRadius: 20,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    background: 'rgba(22, 27, 34, 0.8)',
    border: '1px solid #30363d',
    borderRadius: 12,
    color: '#e6edf3',
    fontSize: 15,
    fontFamily: 'inherit',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 20,
  },
  criticalBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 16px',
    background: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: 12,
    color: '#fca5a5',
    fontSize: 13,
  },
  actions: {
    display: 'flex',
    gap: 12,
    paddingTop: 8,
    borderTop: '1px solid #21262d',
    marginTop: 4,
  },
  cancelBtn: {
    padding: '12px 24px',
    background: 'transparent',
    border: '1px solid #30363d',
    borderRadius: 12,
    color: '#8b949e',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
  },
  submitBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    border: 'none',
    borderRadius: 12,
    color: '#fff',
    fontSize: 14,
    fontWeight: 700,
    fontFamily: 'inherit',
    transition: 'all 0.2s',
    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
  },
  successWrap: {
    minHeight: '70vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successCard: {
    textAlign: 'center',
    maxWidth: 400,
  },
  successIconRing: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: 'rgba(34, 197, 94, 0.1)',
    border: '2px solid rgba(34, 197, 94, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
  },
  successTitle: {
    fontSize: 26,
    fontWeight: 700,
    color: '#e6edf3',
    marginBottom: 12,
  },
  successText: {
    color: '#8b949e',
    fontSize: 15,
    lineHeight: 1.6,
  },
};