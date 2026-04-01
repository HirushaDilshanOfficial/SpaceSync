import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';

const RESOURCES = ['Conference Room A', 'Conference Room B', 'Training Lab', 'Projector XYZ', 'Board Room'];

const FieldLabel = ({ children, required }) => (
  <label className="block text-sm font-medium text-gray-700 mb-1.5">
    {children} {required && <span className="text-red-400">*</span>}
  </label>
);

const inputClass = "w-full px-3.5 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all placeholder:text-gray-400";

export function NewBookingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); setTimeout(() => navigate('/dashboard'), 1800); }, 1200);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center px-4">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center border-4 border-emerald-100">
          <CheckCircle className="w-10 h-10 text-emerald-500" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Request Submitted!</h2>
          <p className="text-gray-400 text-sm mt-2 max-w-xs">Your booking is now pending admin approval. Redirecting to dashboard…</p>
        </div>
        <div className="flex gap-1 mt-2">
          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 bg-indigo-200 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Book a Workspace</h1>
        <p className="text-gray-500 mt-1 text-sm">Fill in the details. Your request goes to an admin for approval.</p>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-card">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">

          {/* Resource */}
          <div>
            <FieldLabel required>Resource / Location</FieldLabel>
            <select className={inputClass} required defaultValue="">
              <option value="" disabled>Select a workspace to book</option>
              {RESOURCES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Date + Attendees */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Date</FieldLabel>
              <input type="date" className={inputClass} required />
            </div>
            <div>
              <FieldLabel required>Expected Attendees</FieldLabel>
              <input type="number" min="1" placeholder="e.g. 8" className={inputClass} required />
            </div>
          </div>

          {/* Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Start Time</FieldLabel>
              <input type="time" className={inputClass} required />
            </div>
            <div>
              <FieldLabel required>End Time</FieldLabel>
              <input type="time" className={inputClass} required />
            </div>
          </div>

          {/* Purpose */}
          <div>
            <FieldLabel required>Purpose of Booking</FieldLabel>
            <textarea
              className={`${inputClass} resize-none`}
              rows={4}
              placeholder="Briefly describe why you need this space — e.g. client presentation, team standup, training session…"
              required
            />
          </div>

          {/* Info note */}
          <div className="flex items-start gap-2.5 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 text-sm text-indigo-700">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 8v4m0 4h.01"/></svg>
            <span>Once submitted, an admin will review your request. You'll see the status under <strong>My Bookings</strong>.</span>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-3 border-t border-gray-100">
            <button type="button" onClick={() => navigate(-1)} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-xl transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 transition-colors shadow-sm"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : 'Submit Request'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
