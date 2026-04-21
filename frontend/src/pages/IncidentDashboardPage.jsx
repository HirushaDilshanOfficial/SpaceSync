import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Clock, Search, SlidersHorizontal, Plus, Wrench, Zap, XCircle, Download, Calendar, Filter } from 'lucide-react';
import { getCurrentUserId } from '../utils/currentUser';

const priorityConfig = {
  CRITICAL: { color: 'text-red-700 bg-red-50 border-red-200', dot: 'bg-red-400', icon: AlertTriangle },
  HIGH: { color: 'text-orange-700 bg-orange-50 border-orange-200', dot: 'bg-orange-400', icon: AlertTriangle },
  MEDIUM: { color: 'text-yellow-700 bg-yellow-50 border-yellow-200', dot: 'bg-yellow-400', icon: Clock },
  LOW: { color: 'text-green-700 bg-green-50 border-green-200', dot: 'bg-green-400', icon: CheckCircle },
};

const statusConfig = {
  OPEN: { color: 'text-blue-700 bg-blue-50 border-blue-200', dot: 'bg-blue-400', label: 'Open' },
  IN_PROGRESS: { color: 'text-purple-700 bg-purple-50 border-purple-200', dot: 'bg-purple-400', label: 'In Progress' },
  RESOLVED: { color: 'text-emerald-700 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-400', label: 'Resolved' },
  CLOSED: { color: 'text-gray-700 bg-gray-50 border-gray-200', dot: 'bg-gray-400', label: 'Closed' },
};

const typeConfig = {
  INCIDENT: { icon: Zap, color: 'text-red-500' },
  MAINTENANCE: { icon: Wrench, color: 'text-blue-500' },
  REPAIR: { icon: Wrench, color: 'text-orange-500' },
};

const inputClass = "h-10 px-3 text-sm text-gray-700 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all placeholder:text-gray-400 w-full";

const TAB_STYLES = {
  active: 'bg-white text-gray-900 font-semibold shadow-sm border border-gray-200',
  inactive: 'text-gray-500 hover:text-gray-700',
};

const API_BASE = 'http://localhost:8080/api';

export function IncidentDashboardPage() {
  const navigate = useNavigate();
  const currentUserId = getCurrentUserId();
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState({ open: 0, inProgress: 0, resolved: 0 });
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('OPEN');
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterResource, setFilterResource] = useState('');
  const [filterAssignedTo, setFilterAssignedTo] = useState('');
  const [filterReportedBy, setFilterReportedBy] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [resources, setResources] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const [incidentsRes, statsRes, analyticsRes, resourcesRes] = await Promise.all([
        fetch(`${API_BASE}/incidents`),
        fetch(`${API_BASE}/incidents/stats`),
        fetch(`${API_BASE}/incidents/analytics/dashboard`),
        fetch(`${API_BASE}/resources`)
      ]);

      if (incidentsRes.ok && statsRes.ok && analyticsRes.ok && resourcesRes.ok) {
        const incidentsData = await incidentsRes.json();
        const statsData = await statsRes.json();
        const analyticsData = await analyticsRes.json();
        const resourcesData = await resourcesRes.json();
        setIncidents(incidentsData);
        setStats(statsData);
        setAnalytics(analyticsData);
        setResources(resourcesData);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchFilteredIncidents = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (activeTab) params.append('status', activeTab);
      if (filterPriority) params.append('priority', filterPriority);
      if (filterType) params.append('ticketType', filterType);
      if (filterResource) params.append('resourceId', filterResource);
      if (filterAssignedTo) params.append('assignedTo', filterAssignedTo);
      if (filterReportedBy) params.append('reportedBy', filterReportedBy);
      if (filterStartDate) params.append('startDate', new Date(filterStartDate).toISOString());
      if (filterEndDate) params.append('endDate', new Date(filterEndDate).toISOString());
      if (search) params.append('searchText', search);

      const response = await fetch(`${API_BASE}/incidents/filter?${params}`);
      if (response.ok) {
        const filteredData = await response.json();
        setIncidents(filteredData);
      }
    } catch (error) {
      console.error("Failed to fetch filtered incidents:", error);
    }
  }, [activeTab, filterPriority, filterType, filterResource, filterAssignedTo, filterReportedBy, filterStartDate, filterEndDate, search]);

  const updateStatus = async (id, status) => {
    try {
      const url = new URL(`${API_BASE}/incidents/${id}/status`);
      url.searchParams.append('status', status);

      const res = await fetch(url, { method: 'PATCH' });
      if (res.ok) {
        fetchData(); // Refresh all data
      }
    } catch (error) {
      console.error(`Failed to update status to ${status}:`, error);
    }
  };

  const assignTicket = async (id, assignedTo) => {
    try {
      const url = new URL(`${API_BASE}/incidents/${id}/assign`);
      url.searchParams.append('assignedTo', assignedTo);

      const res = await fetch(url, { method: 'PATCH' });
      if (res.ok) {
        fetchData(); // Refresh all data
      }
    } catch (error) {
      console.error(`Failed to assign ticket:`, error);
    }
  };

  const filtered = incidents.filter(incident => {
    if (activeTab && incident.status !== activeTab) return false;
    return true;
  });

  const exportData = async (format) => {
    try {
      const params = new URLSearchParams();
      if (filterPriority) params.append('priority', filterPriority);
      if (filterType) params.append('ticketType', filterType);
      if (filterResource) params.append('resourceId', filterResource);
      if (filterAssignedTo) params.append('assignedTo', filterAssignedTo);
      if (filterReportedBy) params.append('reportedBy', filterReportedBy);
      if (filterStartDate) params.append('startDate', new Date(filterStartDate).toISOString());
      if (filterEndDate) params.append('endDate', new Date(filterEndDate).toISOString());
      if (search) params.append('searchText', search);

      const response = await fetch(`${API_BASE}/incidents/export/${format}?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `incident_tickets.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error(`Failed to export ${format}:`, error);
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
        <div className="text-gray-500">Loading incidents...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Incident Management</h1>
          <p className="text-gray-500 mt-1 text-sm">Track and manage maintenance requests and incidents</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="flex gap-2">
            <button
              onClick={() => exportData('csv')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 active:bg-green-800 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={() => exportData('pdf')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 active:bg-red-800 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              PDF
            </button>
            <button
              onClick={() => navigate('/maintenance-calendar')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm"
            >
              <Calendar className="w-4 h-4" />
              Calendar
            </button>
          </div>
          <button
            onClick={() => navigate('/report-incident')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            Report Incident
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { key: 'open', label: 'Open', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
          { key: 'inProgress', label: 'In Progress', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
          { key: 'resolved', label: 'Resolved', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
          { key: 'total', label: 'Total', bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-100', value: stats.total || 0 },
          { key: 'resolvedThisMonth', label: 'Resolved This Month', bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100', value: analytics.resolvedThisMonth || 0 },
          { key: 'avgResolutionTime', label: 'Avg Resolution Time', bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100', value: `${analytics.avgResolutionTimeHours || 0}h` }
        ].map(({ key, label, bg, text, border, value }) => (
          <div key={key} className={`${bg} ${border} border rounded-2xl p-4`}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">{label}</p>
            <p className={`text-2xl font-bold ${text}`}>{value || stats[key] || 0}</p>
          </div>
        ))}
      </div>

      {/* Analytics Summary */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Performance Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">{analytics.resolutionRate || 0}%</p>
            <p className="text-sm text-gray-600">Resolution Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.open || 0}</p>
            <p className="text-sm text-gray-600">Active Tickets</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{analytics.resolvedThisMonth || 0}</p>
            <p className="text-sm text-gray-600">Resolved This Month</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <h3 className="font-semibold text-gray-900">Advanced Filters</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search incidents..."
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className={inputClass}
            >
              <option value="">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={inputClass}
            >
              <option value="">All Types</option>
              <option value="INCIDENT">Incident</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="REPAIR">Repair</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Resource</label>
            <select
              value={filterResource}
              onChange={(e) => setFilterResource(e.target.value)}
              className={inputClass}
            >
              <option value="">All Resources</option>
              {resources.map(resource => (
                <option key={resource.id} value={resource.id}>{resource.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Assigned To</label>
            <input
              type="text"
              value={filterAssignedTo}
              onChange={(e) => setFilterAssignedTo(e.target.value)}
              placeholder="Assigned user..."
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Reported By</label>
            <input
              type="text"
              value={filterReportedBy}
              onChange={(e) => setFilterReportedBy(e.target.value)}
              placeholder="Reporter..."
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchFilteredIncidents}
              className="w-full px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearch('');
                setFilterPriority('');
                setFilterType('');
                setFilterResource('');
                setFilterAssignedTo('');
                setFilterReportedBy('');
                setFilterStartDate('');
                setFilterEndDate('');
                fetchData();
              }}
              className="w-full px-4 py-2.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
        {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(status => (
          <button
            key={status}
            onClick={() => setActiveTab(status)}
            className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === status ? TAB_STYLES.active : TAB_STYLES.inactive
            }`}
          >
            {statusConfig[status].label} ({incidents.filter(i => i.status === status).length})
          </button>
        ))}
      </div>

      {/* Incidents List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No incidents found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((incident) => {
            const priorityStyle = priorityConfig[incident.priority];
            const statusStyle = statusConfig[incident.status];
            const typeStyle = typeConfig[incident.ticketType];
            const TypeIcon = typeStyle.icon;

            return (
              <div
                key={incident.id}
                className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/incidents/${incident.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${priorityStyle.color}`}>
                      <priorityStyle.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{incident.title}</h3>
                      <p className="text-xs text-gray-500">{incident.resourceName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TypeIcon className={`w-4 h-4 ${typeStyle.color}`} />
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyle.color}`}>
                      {statusStyle.label}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{incident.description}</p>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>Reported: {formatDate(incident.createdAt)}</span>
                  {incident.resolvedAt && (
                    <span>Resolved: {formatDate(incident.resolvedAt)}</span>
                  )}
                </div>

                {incident.assignedTo && (
                  <div className="text-xs text-gray-600 mb-4">
                    Assigned to: {incident.assignedTo}
                  </div>
                )}

                <div className="flex gap-2">
                  {incident.status === 'OPEN' && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          assignTicket(incident.id, currentUserId);
                        }}
                        className="flex-1 px-3 py-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Assign to Me
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateStatus(incident.id, 'IN_PROGRESS');
                        }}
                        className="flex-1 px-3 py-2 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Start Work
                      </button>
                    </>
                  )}

                  {incident.status === 'IN_PROGRESS' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateStatus(incident.id, 'RESOLVED');
                      }}
                      className="flex-1 px-3 py-2 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Mark Resolved
                    </button>
                  )}

                  {incident.status === 'RESOLVED' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateStatus(incident.id, 'CLOSED');
                      }}
                      className="flex-1 px-3 py-2 text-xs bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Close Ticket
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}