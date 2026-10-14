import React, { useEffect, useState } from 'react';
import {
  Incident,
  IncidentTimelineEntry,
  IncidentEvidenceItem,
  IncidentStatus,
  Investigation,
} from '../types';
import {
  fetchIncidentTimeline,
  fetchIncidentEvidence,
  updateIncidentStatus,
  fetchIncidentInvestigation,
} from '../api';
import { InvestigationPanel } from './InvestigationPanel';
import {
  X,
  Clock,
  ShieldCheck,
  Tag,
  Server,
  AlertTriangle,
  ArrowRight,
  History,
  Sparkles,
  FileSearch,
} from 'lucide-react';

interface IncidentDetailModalProps {
  incident: Incident | null;
  userRole: 'ADMIN' | 'ENGINEER' | 'VIEWER';
  onClose: () => void;
  onIncidentUpdated: (updated: Incident) => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  userRole,
  onClose,
  onIncidentUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'investigation' | 'timeline' | 'evidence'>('investigation');
  const [timeline, setTimeline] = useState<IncidentTimelineEntry[]>([]);
  const [evidence, setEvidence] = useState<IncidentEvidenceItem[]>([]);
  const [investigation, setInvestigation] = useState<Investigation | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [targetStatus, setTargetStatus] = useState<IncidentStatus>('INVESTIGATING');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const canMutate = userRole === 'ADMIN' || userRole === 'ENGINEER';

  useEffect(() => {
    if (!incident) return;
    setLoading(true);
    setError(null);
    Promise.all([
      fetchIncidentTimeline(incident.id).catch(() => []),
      fetchIncidentEvidence(incident.id).catch(() => []),
      fetchIncidentInvestigation(incident.id, userRole).catch(() => null),
    ]).then(([timelineData, evidenceData, investigationData]) => {
      setTimeline(timelineData);
      setEvidence(evidenceData);
      setInvestigation(investigationData);
      setLoading(false);
    });
  }, [incident, userRole]);

  if (!incident) return null;

  const handleStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide an operational rationale for this status transition.');
      return;
    }
    setUpdating(true);
    setError(null);
    try {
      const updated = await updateIncidentStatus(incident.id, {
        status: targetStatus,
        reason: reason.trim(),
        updatedBy: `sre-console-${userRole.toLowerCase()}`,
        expectedVersion: incident.version,
      });
      onIncidentUpdated(updated);
      const updatedTimeline = await fetchIncidentTimeline(incident.id);
      setTimeline(updatedTimeline);
      setReason('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update status';
      setError(msg);
    } finally {
      setUpdating(false);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-red-500/10 text-red-400 border border-red-500/30';
      case 'HIGH':
        return 'bg-orange-500/10 text-orange-400 border border-orange-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/30';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DETECTED':
        return 'bg-rose-500/20 text-rose-300 border border-rose-500/40';
      case 'INVESTIGATING':
        return 'bg-sky-500/20 text-sky-300 border border-sky-500/40';
      case 'MITIGATED':
        return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
      case 'RESOLVED':
        return 'bg-teal-500/20 text-teal-300 border border-teal-500/40';
      default:
        return 'bg-zinc-500/20 text-zinc-300 border border-zinc-500/40';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl text-zinc-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-semibold tracking-wider text-emerald-400">
              {incident.incidentKey}
            </span>
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${getSeverityBadge(incident.severity)}`}>
              {incident.severity}
            </span>
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${getStatusBadge(incident.status)}`}>
              {incident.status}
            </span>
            <span className="text-xs text-zinc-500 font-mono">v{incident.version}</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Title & Description */}
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-100">{incident.title}</h2>
            <p className="mt-1 text-sm text-zinc-400 leading-relaxed">{incident.description}</p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3.5 rounded-lg bg-zinc-900/40 border border-zinc-850 text-xs">
            <div>
              <div className="text-zinc-500 flex items-center gap-1.5 mb-1 font-medium">
                <Server className="h-3.5 w-3.5 text-zinc-400" /> Service
              </div>
              <div className="font-mono font-medium text-zinc-200">{incident.serviceName}</div>
            </div>
            <div>
              <div className="text-zinc-500 flex items-center gap-1.5 mb-1 font-medium">
                <Tag className="h-3.5 w-3.5 text-zinc-400" /> Environment
              </div>
              <div className="font-mono uppercase font-medium text-zinc-200">{incident.environment}</div>
            </div>
            <div>
              <div className="text-zinc-500 flex items-center gap-1.5 mb-1 font-medium">
                <Clock className="h-3.5 w-3.5 text-zinc-400" /> Detected At (UTC)
              </div>
              <div className="font-mono text-zinc-300">{new Date(incident.detectedAt).toUTCString()}</div>
            </div>
            <div>
              <div className="text-zinc-500 flex items-center gap-1.5 mb-1 font-medium">
                <ShieldCheck className="h-3.5 w-3.5 text-zinc-400" /> Guardrail Policy
              </div>
              <div className="text-emerald-400 font-medium">Read-Only Guardrail Enforced</div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('investigation')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'investigation'
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Automated Investigation & RCA</span>
              {investigation && (
                <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                  Ready
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'timeline'
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
              }`}
            >
              <History className="h-3.5 w-3.5" />
              <span>Audit Timeline ({timeline.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('evidence')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'evidence'
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
              }`}
            >
              <FileSearch className="h-3.5 w-3.5" />
              <span>Raw Evidence ({evidence.length})</span>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'investigation' && (
            <InvestigationPanel
              incident={incident}
              userRole={userRole}
              onIncidentUpdated={(updated) => {
                onIncidentUpdated(updated);
              }}
            />
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              {/* Human Progression Form */}
              {canMutate && (
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
                  <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2 mb-3">
                    <ArrowRight className="h-4 w-4 text-emerald-400" />
                    Human Engineer Status Transition
                  </h3>

                  {error && (
                    <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400 flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleStatusChange} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1">Target Status</label>
                        <select
                          value={targetStatus}
                          onChange={(e) => setTargetStatus(e.target.value as IncidentStatus)}
                          className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-hidden"
                        >
                          <option value="DETECTED">DETECTED</option>
                          <option value="INVESTIGATING">INVESTIGATING</option>
                          <option value="MITIGATED">MITIGATED</option>
                          <option value="RESOLVED">RESOLVED</option>
                          <option value="CLOSED">CLOSED</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-zinc-400 mb-1">Operational Reason / Findings</label>
                        <input
                          type="text"
                          placeholder="e.g., Confirmed connection pool exhaustion root cause via telemetry correlation"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        disabled={updating}
                        className="rounded-md bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors cursor-pointer"
                      >
                        {updating ? 'Transitioning...' : 'Submit Status Transition'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {loading ? (
                <div className="text-xs text-zinc-500">Loading audit timeline...</div>
              ) : timeline.length === 0 ? (
                <div className="rounded-lg border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-500">
                  No timeline records yet.
                </div>
              ) : (
                <div className="relative border-l-2 border-zinc-800 ml-3 space-y-4 py-1">
                  {timeline.map((entry) => (
                    <div key={entry.id} className="relative pl-6">
                      <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full bg-zinc-950 border-2 border-emerald-500/80 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      </div>
                      <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/50 p-3">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-mono text-xs font-semibold text-emerald-300">
                            {entry.entryType}
                          </span>
                          <span className="font-mono text-[11px] text-zinc-500">
                            {new Date(entry.timestamp).toISOString()}
                          </span>
                        </div>
                        <div className="text-xs font-medium text-zinc-200">{entry.summary}</div>
                        {entry.description && (
                          <div className="mt-1 text-xs text-zinc-400 leading-normal">{entry.description}</div>
                        )}
                        <div className="mt-2 text-[10px] font-mono text-zinc-500">
                          Source Ref: {entry.sourceRef}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'evidence' && (
            <div className="space-y-3">
              {evidence.length === 0 ? (
                <div className="rounded-lg border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-500">
                  No raw evidence items captured yet.
                </div>
              ) : (
                evidence.map((item) => (
                  <div key={item.id} className="rounded-lg border border-zinc-850 bg-zinc-900/40 p-3.5 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-sky-400 uppercase">{item.evidenceType}</span>
                      <span className="font-mono text-[11px] text-zinc-500">Confidence: {Math.round(item.confidenceScore * 100)}%</span>
                    </div>
                    <div className="font-medium text-zinc-200">{item.title}</div>
                    <div className="text-zinc-400 mt-1">{item.summary}</div>
                    <div className="text-[10px] font-mono text-zinc-500 mt-2">URI: {item.sourceUri}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-800 px-6 py-3 bg-zinc-900/40 flex justify-between items-center text-xs text-zinc-500 font-mono">
          <span>UUID: {incident.id}</span>
          <button
            onClick={onClose}
            className="rounded-md border border-zinc-700 bg-zinc-800 px-4 py-1.5 text-xs text-zinc-200 hover:bg-zinc-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
