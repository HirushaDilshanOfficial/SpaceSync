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
      <div className="success-wrap">
        <div className="success-card">
          <div className="success-icon-ring">
            <CheckCircle size={40} color="#059669" strokeWidth={2.5} />
          </div>
          <h2 className="success-title">Report Submitted!</h2>
          <p className="success-text">
            Your incident has been logged. Our facilities team will review and address the issue shortly.
          </p>
          <div className="success-loader">
            <div className="success-progress"></div>
          </div>
          <p style={{ color: 'var(--clr-text-faint)', fontSize: 13, fontWeight: 600 }}>Redirecting to dashboard…</p>
        </div>
        <style>{`
          .success-wrap { min-height: 80vh; display: flex; align-items: center; justify-content: center; padding: 24px; font-family: 'Inter', sans-serif; }
          .success-card { text-align: center; max-width: 440px; padding: 48px; background: #ffffff; border-radius: 32px; border: 1px solid var(--clr-border); box-shadow: var(--shadow-lg); animation: slideUp 0.6s cubic-bezier(.4,0,.2,1); }
          @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
          .success-icon-ring { width: 88px; height: 88px; border-radius: 50%; background: #ecfdf5; border: 4px solid #a7f3d0; display: flex; align-items: center; justify-content: center; margin: 0 auto 32px; }
          .success-title { font-size: 32px; font-weight: 900; color: var(--clr-text); margin-bottom: 16px; letter-spacing: -1.5px; }
          .success-text { color: var(--clr-text-muted); font-size: 16px; line-height: 1.7; margin-bottom: 32px; font-weight: 500; }
          .success-loader { width: 100%; height: 6px; background: #f1f5f9; border-radius: 100px; margin-bottom: 16px; overflow: hidden; }
          .success-progress { height: 100%; background: var(--clr-success); width: 0%; animation: progress 2.5s linear forwards; }
          @keyframes progress { from { width: 0%; } to { width: 100%; } }
        `}</style>
      </div>
    );
  }

  const isValid = formData.title && formData.description && formData.ticketType && formData.priority;

  return (
    <div className="report-incident-root">
      <div className="container">

        {/* Header */}
        <header className="page-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <h1 className="page-title">Report an Issue</h1>
          <p className="page-subtitle">Tell us about a problem — we'll get it sorted.</p>
        </header>

        <div className="form-card">
          <form onSubmit={handleSubmit} className="report-form">
            <Field label="What's the issue?" required>
              <input
                id="title"
                type="text"
                className="form-control"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Projector not working in Lab 2"
                required
              />
            </Field>

            <Field label="Describe the problem" required>
              <textarea
                id="description"
                className="form-control textarea"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="What happened? When did it start? Any other details…"
                required
              />
            </Field>

            <div className="form-row">
              <Field label="Ticket Type" required>
                <select id="ticketType" className="form-control" value={formData.ticketType} onChange={handleChange} required>
                  <option value="">Select type…</option>
                  <option value="INCIDENT">⚡ Incident</option>
                  <option value="MAINTENANCE">🔧 Maintenance</option>
                  <option value="REPAIR">🔨 Repair</option>
                </select>
              </Field>

              <Field label="Priority" required>
                <select id="priority" className="form-control" value={formData.priority} onChange={handleChange} required>
                  <option value="">Select priority…</option>
                  <option value="CRITICAL">🔴 Critical</option>
                  <option value="HIGH">🟠 High</option>
                  <option value="MEDIUM">🟡 Medium</option>
                  <option value="LOW">🟢 Low</option>
                </select>
              </Field>
            </div>

            <Field label="Affected Space / Resource" required>
              <select id="resourceId" className="form-control" value={formData.resourceId} onChange={handleChange} required>
                <option value="">Select a resource…</option>
                {resources.map(r => (
                  <option key={r.id} value={r.id}>{r.name} ({r.type})</option>
                ))}
              </select>
            </Field>

            {formData.priority === 'CRITICAL' && (
              <div className="critical-banner">
                <AlertTriangle size={18} />
                <span>Critical issues are escalated immediately to the facilities team.</span>
              </div>
            )}

            <div className="form-actions">
              <button type="button" onClick={() => navigate(-1)} className="btn btn-ghost">
                Cancel
              </button>
              <button type="submit" disabled={loading || !isValid} className="btn btn-primary">
                {loading ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : <><Send size={18} /> Submit Report</>}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .report-incident-root {
          min-height: 100vh;
          padding: 60px 24px 100px;
          background: var(--clr-bg);
          background-image: var(--grad-mesh);
          color: var(--clr-text);
          font-family: 'Inter', sans-serif;
        }
        .container { max-width: 760px; margin: 0 auto; }
        .page-header { margin-bottom: 48px; }
        .back-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: none; border: none; color: var(--clr-text-muted);
          font-size: 14px; font-weight: 700; cursor: pointer;
          margin-bottom: 16px; transition: all 0.2s;
        }
        .back-btn:hover { color: var(--clr-primary); transform: translateX(-4px); }
        .page-title { font-size: 40px; font-weight: 900; color: var(--clr-text); letter-spacing: -2px; margin-bottom: 12px; }
        .page-subtitle { color: var(--clr-text-muted); font-size: 17px; font-weight: 500; }

        .form-card {
          background: #ffffff;
          border: 1px solid var(--clr-border);
          border-radius: 32px;
          padding: 56px;
          box-shadow: var(--shadow-lg);
          animation: slideUp 0.6s ease both;
        }
        .report-form { display: flex; flex-direction: column; gap: 36px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
        @media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } }

        .form-control {
          background: #f8fafc !important;
          border: 1px solid var(--clr-border) !important;
          color: var(--clr-text) !important;
          border-radius: 12px !important;
          padding: 14px 20px !important;
          width: 100%;
          outline: none !important;
          transition: all 0.25s cubic-bezier(.4,0,.2,1);
          font-family: inherit;
          font-size: 15px !important;
        }
        .form-control:focus {
          border-color: var(--clr-primary) !important;
          background: #ffffff !important;
          box-shadow: 0 0 0 4px rgba(0,48,135,0.08) !important;
        }
        .form-control option { background: #ffffff; color: var(--clr-text); }
        .textarea { min-height: 140px; resize: vertical; line-height: 1.6; }

        .critical-banner {
          display: flex; align-items: center; gap: 14px;
          padding: 20px 24px; background: #fff1f2;
          border: 1px solid #fecdd3; border-radius: 16px;
          color: #dc2626; font-size: 14px; font-weight: 700;
        }

        .form-actions {
          display: flex; justify-content: flex-end; gap: 20px;
          padding-top: 40px; border-top: 1px solid #f1f5f9;
        }

        .btn { padding: 14px 40px; border-radius: 12px; font-weight: 800; transition: all 0.3s cubic-bezier(.4,0,.2,1); border: none; cursor: pointer; font-family: inherit; font-size: 15px; display: inline-flex; align-items: center; justify-content: center; gap: 12px; }
        .btn-primary { background: var(--grad-primary); color: #ffffff; box-shadow: 0 4px 14px rgba(0,48,135,0.25); }
        .btn-primary:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,48,135,0.35); }
        .btn-ghost { background: #ffffff; color: var(--clr-text-muted); border: 1px solid var(--clr-border); }
        .btn-ghost:hover { background: #f8fafc; color: var(--clr-primary); border-color: var(--clr-primary); }
        
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div className="field-group" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <label style={{ fontSize: 14, fontWeight: 800, color: 'var(--clr-text)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      {children}
    </div>
  );
}