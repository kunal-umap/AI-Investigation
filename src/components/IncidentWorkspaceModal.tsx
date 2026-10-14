import React, { useState, useEffect } from 'react';
import {
  Incident,
  IncidentTimelineEntry,
  IncidentEvidenceItem,
  IncidentStatus,
  InvestigationReport,
  AiHypothesis,
} from '../types';
import {
  fetchIncidentTimeline,
  fetchIncidentEvidence,
  updateIncidentStatus,
  runAiInvestigation,
  getInvestigationReport,
  confirmHypothesisByHuman,
  resolveIncidentWithKnowledge,
  fetchChangeGraph,
} from '../api';
import {
  X,
  Clock,
  ShieldCheck,
  Server,
  Activity,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Database,
  FileText,
  AlertTriangle,
  Lightbulb,
  Search,
  BookOpen,
  ArrowRight,
  GitCommit,
} from 'lucide-react';
import { EvidenceInspectorModal } from './EvidenceInspectorModal';

interface IncidentWorkspaceModalProps {
  incident: Incident;
  userRole: 'ADMIN' | 'ENGINEER' | 'VIEWER';
  onClose: () => void;
  onIncidentUpdated: (updated: Incident) => void;
}

export const IncidentWorkspaceModal: React.FC<IncidentWorkspaceModalProps> = ({
  incident,
  userRole,
  onClose,
  onIncidentUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'investigation' | 'evidence' | 'timeline' | 'topology' | 'resolve'>('investigation');
  const [report, setReport] = useState<InvestigationReport | null>(null);
  const [timeline, setTimeline] = useState<IncidentTimelineEntry[]>([]);
  const [evidenceList, setEvidenceList] = useState<IncidentEvidenceItem[]>([]);
  const [loadingReport, setLoadingReport] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [copiedQueryId, setCopiedQueryId] = useState<string | null>(null);

  // Status transition state
  const [targetStatus, setTargetStatus] = useState<IncidentStatus>(incident.status);
  const [statusReason, setStatusReason] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Postmortem / resolution form state
  const [rootCauseInput, setRootCauseInput] = useState('Missing composite index on orders (tenant_id, created_at)');
  const [resolutionInput, setResolutionInput] = useState('Applied composite index CREATE INDEX CONCURRENTLY idx_orders_tenant_created and increased HikariCP pool from 20 to 50.');
  const [lessonsInput, setLessonsInput] = useState('Enforce index coverage reviews for all multi-tenant queries prior to production rollout.');
  const [preventiveInput, setPreventiveInput] = useState('Add CI lint rule alerting on unindexed WHERE clauses with high concurrency.');
  const [isResolving, setIsResolving] = useState(false);

  // Evidence inspector drawer state
  const [inspectedEvidence, setInspectedEvidence] = useState<IncidentEvidenceItem | null>(null);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);

  useEffect(() => {
    setLoadingData(true);
    Promise.all([
      fetchIncidentTimeline(incident.id).catch(() => []),
      fetchIncidentEvidence(incident.id).catch(() => []),
      getInvestigationReport(incident.id).catch(() => null),
    ]).then(([timelineData, evidenceData, existingReport]) => {
      setTimeline(timelineData);
      setEvidenceList(evidenceData);
      if (existingReport) {
        setReport(existingReport);
      }
      setLoadingData(false);
    });
  }, [incident.id]);

  const handleRunInvestigation = async () => {
    setLoadingReport(true);
    try {
      const res = await runAiInvestigation(incident.id, userRole);
      setReport(res);
    } catch (err) {
      console.error('Failed to run AI investigation:', err);
    } finally {
      setLoadingReport(false);
    }
  };

  const handleConfirmHypothesis = async (hypId: string) => {
    if (!report) return;
    try {
      const updated = await confirmHypothesisByHuman(report.id, hypId, userRole);
      setReport({
        ...report,
        hypotheses: report.hypotheses.map((h) => (h.id === updated.id ? updated : h)),
      });
      // Also prefill root cause in resolve tab
      const confirmedHyp = report.hypotheses.find((h) => h.id === hypId);
      if (confirmedHyp) {
        setRootCauseInput(confirmedHyp.statement);
      }
    } catch (err) {
      console.error('Failed to confirm hypothesis:', err);
    }
  };

  const handleCopyQuery = (queryText: string, checkId: string) => {
    navigator.clipboard.writeText(queryText);
    setCopiedQueryId(checkId);
    setTimeout(() => setCopiedQueryId(null), 2000);
  };

  const handleStatusTransition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusReason.trim()) {
      setStatusMessage('Please enter an operational rationale.');
      return;
    }
    setUpdatingStatus(true);
    setStatusMessage(null);
    try {
      const updated = await updateIncidentStatus(incident.id, {
        status: targetStatus,
        reason: statusReason.trim(),
        updatedBy: `sre-${userRole.toLowerCase()}`,
        expectedVersion: incident.version,
      });
      onIncidentUpdated(updated);
      const updatedTimeline = await fetchIncidentTimeline(incident.id);
      setTimeline(updatedTimeline);
      setStatusReason('');
      setStatusMessage(`Incident transitioned to ${targetStatus}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update status';
      setStatusMessage(`Error: ${msg}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleResolveAndPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResolving(true);
    try {
      const res = await resolveIncidentWithKnowledge(
        incident.id,
        {
          confirmedRootCause: rootCauseInput,
          actualResolution: resolutionInput,
          lessonsLearned: lessonsInput,
          preventiveAction: preventiveInput,
          relatedRunbook: 'KB-RUNBOOK-ORDER-DB',
          affectedComponent: `${incident.serviceName}-pool`,
        },
        userRole
      );
      if (res.incident) {
        onIncidentUpdated(res.incident);
      }
      setActiveTab('investigation');
      // Refresh timeline
      const updatedTimeline = await fetchIncidentTimeline(incident.id);
      setTimeline(updatedTimeline);
    } catch (err) {
      console.error('Failed to resolve incident:', err);
    } finally {
      setIsResolving(false);
    }
  };

  const handleOpenEvidence = (evId: string) => {
    const found = evidenceList.find((e) => e.id === evId) || {
      id: evId,
      incidentId: incident.id,
      evidenceType: 'CORRELATED_TELEMETRY',
      title: `Evidence ${evId}`,
      sourceUri: `context://${incident.serviceName}/${evId}`,
      summary: 'Correlated telemetry recorded during incident triage.',
      confidenceScore: 0.95,
      recordedAt: incident.detectedAt,
    };
    setInspectedEvidence(found);
    setShowEvidenceModal(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xs">
      <div className="relative w-full max-w-6xl max-h-[94vh] bg-slate-950 border border-slate-800 rounded-xl flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-emerald-400">
              {incident.incidentKey}
            </span>
            <span className="text-slate-600">/</span>
            <span className="font-mono text-xs text-slate-300">
              {incident.serviceName}
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-xs text-slate-400">
              {incident.environment}
            </span>
            <span className="font-mono text-[10px] text-slate-500">v{incident.version}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Status indicator */}
            <span className="font-mono text-xs uppercase px-2 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-200">
              {incident.status}
            </span>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Incident Summary strip */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-900/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">{incident.title}</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">{incident.description}</p>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px] shrink-0">
            <div>
              <span className="text-slate-500">Detected: </span>
              <span>{new Date(incident.detectedAt).toLocaleTimeString('en-US', { hour12: false })} UTC</span>
            </div>
            <div>
              <span className="text-slate-500">Assignee: </span>
              <span className="text-slate-300">sre-oncall-1</span>
            </div>
          </div>
        </div>

        {/* Workspace Tab Bar */}
        <div className="px-6 border-b border-slate-800 bg-slate-950 flex items-center gap-1 text-xs font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('investigation')}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'investigation'
                ? 'border-emerald-500 text-slate-100 font-semibold'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>Root Cause Analysis</span>
          </button>

          <button
            onClick={() => setActiveTab('evidence')}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'evidence'
                ? 'border-emerald-500 text-slate-100 font-semibold'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            <Database className="h-3.5 w-3.5 opacity-70" />
            <span>Evidence & Telemetry ({evidenceList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'border-emerald-500 text-slate-100 font-semibold'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            <Clock className="h-3.5 w-3.5 opacity-70" />
            <span>Timeline ({timeline.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('resolve')}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'resolve'
                ? 'border-emerald-500 text-slate-100 font-semibold'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-teal-400" />
            <span>Resolve & Post-Mortem</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'investigation' && (
            <div className="space-y-6">
              {/* Action and Safety Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-slate-800 bg-slate-900/40">
                <div className="flex items-center gap-2 text-xs">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-200">Read-Only Investigation Engine</span>
                    <span className="text-slate-400 text-[11px] block">
                      Evidence-grounded telemetry correlation · Model: Gemini 2.5 on Google Cloud · Zero mutations allowed
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleRunInvestigation}
                  disabled={loadingReport}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer self-start sm:self-auto whitespace-nowrap"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{loadingReport ? 'Analyzing Evidence...' : report ? 'Re-run Analysis' : 'Run Root Cause Analysis'}</span>
                </button>
              </div>

              {/* Investigation Report Display */}
              {report ? (
                <div className="space-y-6">
                  {/* Executive Brief & Grounding Metrics */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Executive Narrative */}
                    <div className="lg:col-span-8 p-4 rounded-lg border border-slate-800 bg-slate-900/30 space-y-3">
                      <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
                        <span className="font-semibold text-emerald-400">EXECUTIVE SITUATION BRIEF</span>
                        <span>Confidence: {(report.confidence * 100).toFixed(0)}%</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-normal">
                        {report.summary}
                      </p>
                      <div className="pt-2 border-t border-slate-800/80 text-xs">
                        <span className="text-slate-400 font-medium">Customer Impact: </span>
                        <span className="text-slate-300">{report.impact}</span>
                      </div>
                    </div>

                    {/* Quality & Safety Grounding Metrics */}
                    <div className="lg:col-span-4 p-4 rounded-lg border border-slate-800 bg-slate-900/30 space-y-2.5 text-xs font-mono">
                      <div className="text-slate-400 font-semibold mb-2">GROUNDING ASSURANCE</div>
                      <div className="flex items-center justify-between py-1 border-b border-slate-850">
                        <span className="text-slate-400">Validated Citations:</span>
                        <span className="text-emerald-400 font-bold">{report.validatedEvidenceReferences.length} verified</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-slate-850">
                        <span className="text-slate-400">Purged Claims:</span>
                        <span className="text-slate-400">{report.rejectedInvalidEvidenceIds.length}</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-slate-850">
                        <span className="text-slate-400">Model Engine:</span>
                        <span className="text-slate-300">{report.metrics.model}</span>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span className="text-slate-400">Analysis Latency:</span>
                        <span className="text-slate-300">{report.metrics.executionDurationMs} ms</span>
                      </div>
                    </div>
                  </div>

                  {/* Candidate Hypotheses */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-mono font-semibold text-slate-300">
                        INVESTIGATIVE HYPOTHESES ({report.hypotheses.length})
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        * Only authorized human SRE can confirm root cause
                      </span>
                    </div>

                    <div className="space-y-3">
                      {report.hypotheses.map((hyp) => {
                        const isConfirmed = hyp.status === 'CONFIRMED_BY_HUMAN';
                        return (
                          <div
                            key={hyp.id}
                            className={`p-4 rounded-lg border transition-all ${
                              isConfirmed
                                ? 'bg-emerald-950/20 border-emerald-500/50'
                                : 'bg-slate-900/40 border-slate-800'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="space-y-1.5 flex-1">
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="font-mono font-bold text-slate-400">{hyp.id}</span>
                                  <span
                                    className={`font-mono text-[10px] px-2 py-0.5 rounded border uppercase font-medium ${
                                      isConfirmed
                                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                        : 'bg-slate-800 text-slate-400 border-slate-700'
                                    }`}
                                  >
                                    {isConfirmed ? 'CONFIRMED BY HUMAN' : hyp.status}
                                  </span>
                                  <span className="text-[11px] font-mono text-slate-400">
                                    Confidence: {(hyp.confidence * 100).toFixed(0)}%
                                  </span>
                                </div>
                                <p className="text-xs text-slate-200 font-medium leading-relaxed">
                                  {hyp.statement}
                                </p>
                              </div>

                              {/* Human SRE confirmation button */}
                              <div className="shrink-0">
                                {!isConfirmed ? (
                                  <button
                                    onClick={() => handleConfirmHypothesis(hyp.id)}
                                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                    <span>Confirm as Root Cause (Human)</span>
                                  </button>
                                ) : (
                                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    <span>Human Confirmed</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Evidence Citations */}
                            <div className="mt-3 pt-2.5 border-t border-slate-800 flex flex-wrap items-center gap-3 text-xs">
                              {hyp.supportingEvidenceIds.length > 0 && (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[11px] text-slate-400">Supporting Evidence:</span>
                                  <div className="flex flex-wrap gap-1">
                                    {hyp.supportingEvidenceIds.map((evId) => (
                                      <button
                                        key={evId}
                                        onClick={() => handleOpenEvidence(evId)}
                                        className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700 hover:border-emerald-500/50 transition-colors cursor-pointer flex items-center gap-1"
                                      >
                                        <span>{evId}</span>
                                        <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recommended Read-Only Diagnostic Checks */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono font-semibold text-slate-300">
                      RECOMMENDED READ-ONLY DIAGNOSTIC PROCEDURES
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {report.recommendedChecks.map((chk) => (
                        <div
                          key={chk.id}
                          className="p-3.5 rounded-lg border border-slate-800 bg-slate-900/30 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-200">{chk.title}</span>
                            <span className="font-mono text-[10px] text-slate-400">READ-ONLY</span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-normal">{chk.description}</p>

                          {/* Query snippet with copy button */}
                          <div className="relative mt-2">
                            <pre className="font-mono text-[11px] text-emerald-300 bg-slate-950 p-2.5 rounded border border-slate-800 overflow-x-auto pr-16">
                              {chk.suggestedDiagnostics[0]}
                            </pre>
                            <button
                              onClick={() => handleCopyQuery(chk.suggestedDiagnostics[0], chk.id)}
                              className="absolute top-2 right-2 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              {copiedQueryId === chk.id ? (
                                <>
                                  <Check className="h-2.5 w-2.5 text-emerald-400" />
                                  <span>Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-2.5 w-2.5" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Historical Similar Incidents */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono font-semibold text-slate-300">
                      HISTORICAL PRECEDENTS & RESOLUTIONS ({report.similarIncidents.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {report.similarIncidents.map((sim, i) => (
                        <div
                          key={i}
                          className="p-3.5 rounded-lg border border-slate-800 bg-slate-900/30 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-semibold text-purple-400">{sim.incidentKey}: {sim.title}</span>
                            <span className="font-mono text-emerald-400 font-semibold">
                              {(sim.similarityScore * 100).toFixed(0)}% match
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-300">
                            <span className="text-slate-400 font-medium">Root Cause: </span>
                            {sim.historicalRootCause}
                          </div>
                          <div className="text-[11px] text-emerald-400 bg-slate-950 p-2 rounded border border-slate-850 font-mono">
                            <span className="text-slate-500 font-sans block text-[10px]">Verified Resolution:</span>
                            {sim.historicalResolution}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center rounded-lg border border-dashed border-slate-800 bg-slate-900/20 space-y-3">
                  <Sparkles className="h-6 w-6 text-emerald-400 mx-auto" />
                  <div className="text-xs font-semibold text-slate-200">
                    No Investigation Report Generated Yet
                  </div>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Click &quot;Run Root Cause Analysis&quot; to ingest telemetry, correlate recent deployments, cross-reference historical post-mortems, and produce evidence-grounded hypotheses.
                  </p>
                  <button
                    onClick={handleRunInvestigation}
                    disabled={loadingReport}
                    className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors cursor-pointer"
                  >
                    Run Root Cause Analysis
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Evidence Tab */}
          {activeTab === 'evidence' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 mb-2">
                All telemetry records gathered for this incident envelope. Click an item to inspect raw payload and source URI.
              </div>
              <div className="border border-slate-800 bg-slate-900/30 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                    <tr>
                      <th className="px-4 py-2.5">Evidence ID</th>
                      <th className="px-4 py-2.5">Type</th>
                      <th className="px-4 py-2.5">Title</th>
                      <th className="px-4 py-2.5">Source URI</th>
                      <th className="px-4 py-2.5 text-right">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-[11px]">
                    {evidenceList.map((ev) => (
                      <tr
                        key={ev.id}
                        onClick={() => handleOpenEvidence(ev.id)}
                        className="hover:bg-slate-850/50 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-2.5 font-bold text-emerald-400">{ev.id}</td>
                        <td className="px-4 py-2.5 text-slate-400">{ev.evidenceType}</td>
                        <td className="px-4 py-2.5 text-slate-200 font-sans">{ev.title}</td>
                        <td className="px-4 py-2.5 text-slate-400 truncate max-w-xs">{ev.sourceUri}</td>
                        <td className="px-4 py-2.5 text-right text-emerald-400">
                          {(ev.confidenceScore * 100).toFixed(0)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400 mb-2">
                Sequential operational timeline tracking alerts, engineer notes, and state transitions.
              </div>
              <div className="relative pl-6 space-y-4 border-l-2 border-slate-800 ml-3">
                {timeline.map((entry) => (
                  <div key={entry.id} className="relative">
                    <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-slate-800 border-2 border-emerald-500"></div>
                    <div className="text-xs text-slate-400 font-mono">
                      {new Date(entry.timestamp).toLocaleTimeString('en-US', { hour12: false })} UTC · {entry.entryType}
                    </div>
                    <p className="text-xs text-slate-200 mt-0.5">{entry.content}</p>
                    {entry.actor && (
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">By: {entry.actor}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resolve & Post-Mortem Tab */}
          {activeTab === 'resolve' && (
            <div className="max-w-2xl mx-auto space-y-5">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-semibold text-slate-100">Verify Resolution & Ingest to Knowledge Base</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Confirming the resolution formally marks the incident as RESOLVED and permanently publishes the verified post-mortem to the Knowledge Base for future similar incidents.
                </p>
              </div>

              <form onSubmit={handleResolveAndPublish} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Confirmed Root Cause (Verified by Human SRE)</label>
                  <textarea
                    rows={2}
                    value={rootCauseInput}
                    onChange={(e) => setRootCauseInput(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2.5 text-slate-200 focus:outline-hidden focus:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Actual Remediation & Resolution Executed</label>
                  <textarea
                    rows={2}
                    value={resolutionInput}
                    onChange={(e) => setResolutionInput(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2.5 text-slate-200 focus:outline-hidden focus:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Lessons Learned</label>
                  <input
                    type="text"
                    value={lessonsInput}
                    onChange={(e) => setLessonsInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 focus:outline-hidden focus:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Preventive Action Plan</label>
                  <input
                    type="text"
                    value={preventiveInput}
                    onChange={(e) => setPreventiveInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 focus:outline-hidden focus:border-slate-700"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isResolving}
                    className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{isResolving ? 'Publishing Post-Mortem...' : 'Confirm Resolution & Ingest to KB'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Evidence Inspector Drawer */}
        <EvidenceInspectorModal
          evidence={inspectedEvidence}
          isValidated={true}
          isOpen={showEvidenceModal}
          onClose={() => setShowEvidenceModal(false)}
        />
      </div>
    </div>
  );
};
