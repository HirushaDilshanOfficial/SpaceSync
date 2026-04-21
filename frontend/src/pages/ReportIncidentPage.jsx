import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Loader2, XCircle, AlertTriangle, Wrench, Zap } from 'lucide-react';
import { getCurrentUserId } from '../utils/currentUser';

const FieldLabel = ({ children, required }) => (
  <label className="block text-sm font-medium text-gray-700 mb-1.5">
    {children} {required && <span className="text-red-400">*</span>}
  </label>
);

const inputClass = "w-full px-3.5 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all placeholder:text-gray-400";

const selectClass = "w-full px-3.5 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all";

export function ReportIncidentPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resources, setResources] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    resourceId: '',
    priority: '',
    ticketType: '',
    scheduledStart: '',
    scheduledEnd: '',
    notes: ''
  });

  React.useEffect(() => {
    fetch('http://localhost:8080/api/resources')
      .then(res => res.json())
      .then(data => setResources(data))
      .catch(err => console.error("Failed to fetch resources:", err));
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        resourceId: formData.resourceId,
        priority: formData.priority,
        ticketType: formData.ticketType,
        reportedBy: getCurrentUserId(),
        scheduledStart: formData.scheduledStart ? new Date(formData.scheduledStart).toISOString() : null,
        scheduledEnd: formData.scheduledEnd ? new Date(formData.scheduledEnd).toISOString() : null,
        notes: formData.notes
      };

      const response = await fetch('http://localhost:8080/api/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to submit incident report');
      }

      setSubmitted(true);
      setTimeout(() => navigate('/incidents'), 2000);
    } catch (err) {
      console.error('Error submitting incident:', err);
      alert('Failed to submit incident report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Incident Reported Successfully!</h2>
          <p className="text-gray-600 mb-6">Your incident report has been submitted and will be reviewed by our maintenance team.</p>
          <button
            onClick={() => navigate('/incidents')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            View All Incidents
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Report an Incident</h1>
          <p className="text-gray-600 mt-1">Let us know about any issues with campus resources</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <FieldLabel required>Title</FieldLabel>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            className={inputClass}
            placeholder="Brief description of the issue"
            required
          />
        </div>

        {/* Description */}
        <div>
          <FieldLabel required>Description</FieldLabel>
          <textarea
            id="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className={`${inputClass} resize-none`}
            placeholder="Please provide detailed information about the incident..."
            required
          />
        </div>

        {/* Resource */}
        <div>
          <FieldLabel required>Affected Resource</FieldLabel>
          <select
            id="resourceId"
            value={formData.resourceId}
            onChange={handleChange}
            className={selectClass}
            required
          >
            <option value="">Select a resource</option>
            {resources.map(resource => (
              <option key={resource.id} value={resource.id}>
                {resource.name} ({resource.type})
              </option>
            ))}
          </select>
        </div>

        {/* Priority & Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel required>Priority</FieldLabel>
            <select
              id="priority"
              value={formData.priority}
              onChange={handleChange}
              className={selectClass}
              required
            >
              <option value="">Select priority</option>
              <option value="CRITICAL">🔴 Critical</option>
              <option value="HIGH">🟠 High</option>
              <option value="MEDIUM">🟡 Medium</option>
              <option value="LOW">🟢 Low</option>
            </select>
          </div>

          <div>
            <FieldLabel required>Incident Type</FieldLabel>
            <select
              id="ticketType"
              value={formData.ticketType}
              onChange={handleChange}
              className={selectClass}
              required
            >
              <option value="">Select type</option>
              <option value="INCIDENT">⚡ Incident</option>
              <option value="MAINTENANCE">🔧 Maintenance</option>
              <option value="REPAIR">🔨 Repair</option>
            </select>
          </div>
        </div>

        {/* Scheduled Dates for Maintenance */}
        {formData.ticketType === 'MAINTENANCE' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Scheduled Start</FieldLabel>
              <input
                id="scheduledStart"
                type="datetime-local"
                value={formData.scheduledStart}
                onChange={handleChange}
                className={inputClass}
                required={formData.ticketType === 'MAINTENANCE'}
              />
            </div>

            <div>
              <FieldLabel required>Scheduled End</FieldLabel>
              <input
                id="scheduledEnd"
                type="datetime-local"
                value={formData.scheduledEnd}
                onChange={handleChange}
                className={inputClass}
                required={formData.ticketType === 'MAINTENANCE'}
              />
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <FieldLabel>Additional Notes</FieldLabel>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className={`${inputClass} resize-none`}
            placeholder="Any additional information or context..."
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                Submit Incident Report
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}