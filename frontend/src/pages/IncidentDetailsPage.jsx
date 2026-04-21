import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, CheckCircle, Clock, Wrench, Zap, User, Calendar, MessageSquare } from 'lucide-react';
import { getCurrentUserId } from '../utils/currentUser';

const priorityConfig = {
  CRITICAL: { color: 'text-red-700 bg-red-50 border-red-200', dot: 'bg-red-400', icon: AlertTriangle, label: 'Critical' },
  HIGH: { color: 'text-orange-700 bg-orange-50 border-orange-200', dot: 'bg-orange-400', icon: AlertTriangle, label: 'High' },
  MEDIUM: { color: 'text-yellow-700 bg-yellow-50 border-yellow-200', dot: 'bg-yellow-400', icon: Clock, label: 'Medium' },
  LOW: { color: 'text-green-700 bg-green-50 border-green-200', dot: 'bg-green-400', icon: CheckCircle, label: 'Low' },
};

const statusConfig = {
  OPEN: { color: 'text-blue-700 bg-blue-50 border-blue-200', dot: 'bg-blue-400', label: 'Open' },
  IN_PROGRESS: { color: 'text-purple-700 bg-purple-50 border-purple-200', dot: 'bg-purple-400', label: 'In Progress' },
  RESOLVED: { color: 'text-emerald-700 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-400', label: 'Resolved' },
  CLOSED: { color: 'text-gray-700 bg-gray-50 border-gray-200', dot: 'bg-gray-400', label: 'Closed' },
};

const typeConfig = {
  INCIDENT: { icon: Zap, color: 'text-red-500', label: 'Incident' },
  MAINTENANCE: { icon: Wrench, color: 'text-blue-500', label: 'Maintenance' },
  REPAIR: { icon: Wrench, color: 'text-orange-500', label: 'Repair' },
};

const API_BASE = 'http://localhost:8080/api';

export function IncidentDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const currentUserId = getCurrentUserId();
  const [incident, setIncident] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [incidentRes, logsRes] = await Promise.all([
        fetch(`${API_BASE}/incidents/${id}`),
        fetch(`${API_BASE}/incidents/${id}/logs`)
      ]);

      if (incidentRes.ok && logsRes.ok) {
        const incidentData = await incidentRes.json();
        const logsData = await logsRes.json();
        setIncident(incidentData);
        setLogs(logsData);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status) => {
    try {
      const url = new URL(`${API_BASE}/incidents/${id}/status`);
      url.searchParams.append('status', status);

      const res = await fetch(url, { method: 'PATCH' });
      if (res.ok) {
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error(`Failed to update status:`, error);
    }
  };

  const assignTicket = async (assignedTo) => {
    try {
      const url = new URL(`${API_BASE}/incidents/${id}/assign`);
      url.searchParams.append('assignedTo', assignedTo);

      const res = await fetch(url, { method: 'PATCH' });
      if (res.ok) {
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error(`Failed to assign ticket:`, error);
    }
  };

  const reopenTicket = async () => {
    try {
      const url = new URL(`${API_BASE}/incidents/${id}/reopen`);
      url.searchParams.append('performedBy', currentUserId);

      const res = await fetch(url, { method: 'PATCH' });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to reopen ticket:', error);
    }
  };

  const submitComment = async () => {
    if (!commentText.trim()) {
      return;
    }

    setCommentSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/incidents/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          performedBy: currentUserId,
          details: commentText.trim()
        })
      });

      if (res.ok) {
        setCommentText('');
        fetchData();
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString();
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading incident details...</div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Incident not found</p>
        <button
          onClick={() => navigate('/incidents')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Back to Incidents
        </button>
      </div>
    );
  }

  const priorityStyle = priorityConfig[incident.priority];
  const statusStyle = statusConfig[incident.status];
  const typeStyle = typeConfig[incident.ticketType];
  const TypeIcon = typeStyle.icon;
  const PriorityIcon = priorityStyle.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/incidents')}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Incident #{incident.id}</h1>
          <p className="text-gray-600 mt-1">{incident.title}</p>
        </div>
      </div>

      {/* Incident Details */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Details</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <TypeIcon className={`w-4 h-4 ${typeStyle.color}`} />
                  <span className="text-sm text-gray-600">Type: {typeStyle.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${priorityStyle.dot}`}></div>
                  <span className="text-sm text-gray-600">Priority: {priorityStyle.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${statusStyle.dot}`}></div>
                  <span className="text-sm text-gray-600">Status: {statusStyle.label}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Description</h4>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{incident.description}</p>
            </div>

            {incident.notes && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{incident.notes}</p>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Assignment & Timeline</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Reported by: {incident.reportedByName}</p>
                    <p className="text-xs text-gray-500">{formatDate(incident.createdAt)}</p>
                  </div>
                </div>

                {incident.assignedTo && (
                  <div className="flex items-center gap-3">
                    <Wrench className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Assigned to: {incident.assignedTo}</p>
                    </div>
                  </div>
                )}

                {incident.resolvedAt && (
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Resolved</p>
                      <p className="text-xs text-gray-500">{formatDate(incident.resolvedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Resource</h4>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{incident.resourceName}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex flex-wrap gap-3">
            {incident.status === 'OPEN' && (
              <>
                <button
                  onClick={() => assignTicket(currentUserId)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Assign to Me
                </button>
                <button
                  onClick={() => updateStatus('IN_PROGRESS')}
                  className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Start Work
                </button>
              </>
            )}

            {incident.status === 'IN_PROGRESS' && (
              <button
                onClick={() => updateStatus('RESOLVED')}
                className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Mark Resolved
              </button>
            )}

            {(incident.status === 'RESOLVED' || incident.status === 'CLOSED') && (
              <>
                {incident.status === 'RESOLVED' && (
                  <button
                    onClick={() => updateStatus('CLOSED')}
                    className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Close Ticket
                  </button>
                )}
                <button
                  onClick={reopenTicket}
                  className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Reopen Ticket
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Add Work Note</h3>
        <div className="space-y-3">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={3}
            placeholder="Add an update for this ticket..."
            className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none"
          />
          <button
            onClick={submitComment}
            disabled={commentSubmitting || !commentText.trim()}
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {commentSubmitting ? 'Posting...' : 'Post Note'}
          </button>
        </div>
      </div>

      {/* Maintenance Logs */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-gray-400" />
          <h3 className="font-semibold text-gray-900">Activity Log</h3>
        </div>

        {logs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No activity logs yet</p>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-indigo-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{log.performedByName}</span>
                    <span className="text-sm text-gray-500">{log.action.toLowerCase().replace('_', ' ')}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{log.details}</p>
                  <p className="text-xs text-gray-400">{formatDate(log.timestamp)} at {formatTime(log.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}