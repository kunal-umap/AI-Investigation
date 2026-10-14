import React, { useState } from 'react';
import { Incident } from '../types';
import { Search, Server, Clock, ChevronRight, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface IncidentListViewProps {
  incidents: Incident[];
  loading: boolean;
  onSelectIncident: (incident: Incident) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  severityFilter: string;
  onSeverityFilterChange: (sev: string) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onRefresh: () => void;
}

export const IncidentListView: React.FC<IncidentListViewProps> = ({
  incidents,
  loading,
  onSelectIncident,
  statusFilter,
  onStatusFilterChange,
  severityFilter,
  onSeverityFilterChange,
  searchQuery,
  onSearchQueryChange,
  onRefresh,
}) => {
  const getSeverityIndicator = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return (
          <div className="flex items-center gap-1.5 text-rose-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            <span>P1 Critical</span>
          </div>
        );
      case 'HIGH':
        return (
          <div className="flex items-center gap-1.5 text-orange-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
            <span>P2 High</span>
          </div>
        );
      case 'MEDIUM':
        return (
          <div className="flex items-center gap-1.5 text-amber-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>P3 Medium</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            <span>P4 Low</span>
          </div>
        );
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'DETECTED':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'INVESTIGATING':
        return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
      case 'MITIGATED':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'RESOLVED':
        return 'text-teal-400 bg-teal-500/10 border-teal-500/20';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  const filtered = incidents.filter((inc) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      inc.incidentKey.toLowerCase().includes(q) ||
      inc.title.toLowerCase().includes(q) ||
      inc.serviceName.toLowerCase().includes(q) ||
      inc.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-3">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by incident key, service, or title..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-slate-700 font-mono"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          {/* Quick status tabs */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-md p-0.5 text-xs">
            <button
              onClick={() => onStatusFilterChange('')}
              className={`px-2.5 py-1 rounded transition-colors ${
                statusFilter === '' ? 'bg-slate-800 text-slate-100 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => onStatusFilterChange('DETECTED')}
              className={`px-2.5 py-1 rounded transition-colors ${
                statusFilter === 'DETECTED' ? 'bg-slate-800 text-slate-100 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Detected
            </button>
            <button
              onClick={() => onStatusFilterChange('INVESTIGATING')}
              className={`px-2.5 py-1 rounded transition-colors ${
                statusFilter === 'INVESTIGATING' ? 'bg-slate-800 text-slate-100 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Investigating
            </button>
            <button
              onClick={() => onStatusFilterChange('RESOLVED')}
              className={`px-2.5 py-1 rounded transition-colors ${
                statusFilter === 'RESOLVED' ? 'bg-slate-800 text-slate-100 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Resolved
            </button>
          </div>

          {/* Severity selector */}
          <select
            value={severityFilter}
            onChange={(e) => onSeverityFilterChange(e.target.value)}
            className="bg-slate-900 text-slate-300 border border-slate-800 rounded-md px-2.5 py-1.5 text-xs focus:outline-hidden cursor-pointer"
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">P1 Critical</option>
            <option value="HIGH">P2 High</option>
            <option value="MEDIUM">P3 Medium</option>
            <option value="LOW">P4 Low</option>
          </select>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="border border-slate-800 bg-slate-900/30 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-mono">
              <tr>
                <th className="px-4 py-2.5 font-medium">Incident</th>
                <th className="px-4 py-2.5 font-medium">Service</th>
                <th className="px-4 py-2.5 font-medium">Title & Context</th>
                <th className="px-4 py-2.5 font-medium">Severity</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Detected</th>
                <th className="px-4 py-2.5 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading && filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-slate-600" />
                    <span>Loading incidents from telemetry store...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    No incidents match your current filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((incident) => {
                  const detectedDate = new Date(incident.detectedAt);
                  const isRecent = Date.now() - detectedDate.getTime() < 60 * 60 * 1000;

                  return (
                    <tr
                      key={incident.id}
                      onClick={() => onSelectIncident(incident)}
                      className="hover:bg-slate-850/50 transition-colors cursor-pointer group"
                    >
                      {/* Key */}
                      <td className="px-4 py-3 font-mono font-semibold text-emerald-400 whitespace-nowrap">
                        {incident.incidentKey}
                      </td>

                      {/* Service */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono text-slate-300">
                          <Server className="h-3 w-3 text-slate-500 shrink-0" />
                          <span>{incident.serviceName}</span>
                        </div>
                      </td>

                      {/* Title & Description with zero-pill inline metadata */}
                      <td className="px-4 py-3 max-w-md">
                        <div className="font-medium text-slate-200 group-hover:text-emerald-300 transition-colors truncate">
                          {incident.title}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
                          <span>{incident.environment}</span>
                          <span aria-hidden="true">·</span>
                          <span className="truncate">{incident.description}</span>
                        </div>
                      </td>

                      {/* Severity */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {getSeverityIndicator(incident.severity)}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`font-mono text-[10px] uppercase font-semibold px-2 py-0.5 rounded border ${getStatusStyle(
                            incident.status
                          )}`}
                        >
                          {incident.status}
                        </span>
                      </td>

                      {/* Detected Timestamp */}
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-500" />
                          <span>
                            {detectedDate.toLocaleTimeString('en-US', {
                              hour12: false,
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectIncident(incident);
                          }}
                          className="px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded transition-colors group-hover:border-emerald-500/50 group-hover:text-emerald-300"
                        >
                          Investigate
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
