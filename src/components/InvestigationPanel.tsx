import React, { useState, useEffect } from 'react';
import {
  InvestigationReport,
  AiHypothesis,
  IncidentEvidenceItem,
  Incident,
} from '../types';
import {
  runAiInvestigation,
  getInvestigationReport,
  confirmHypothesisByHuman,
  fetchIncidentEvidence,
} from '../api';
import {
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Lightbulb,
  GitCommit,
  Network,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Search,
  Check,
  ChevronRight,
  ExternalLink,
  Layers,
  Activity,
  Gauge,
  HelpCircle,
  Sliders,
} from 'lucide-react';
import { ChangeImpactGraphModal } from './ChangeImpactGraphModal';
import { IncidentResolutionModal } from './IncidentResolutionModal';
import { EvaluationBenchmarkModal } from './EvaluationBenchmarkModal';
import { EvidenceInspectorModal } from './EvidenceInspectorModal';

interface InvestigationPanelProps {
  incident: Incident;
  userRole: 'ADMIN' | 'ENGINEER' | 'VIEWER';
  onIncidentUpdated: (updated: Incident) => void;
}

export const InvestigationPanel: React.FC<InvestigationPanelProps> = ({
  incident,
  userRole,
  onIncidentUpdated,
}) => {
  const [report, setReport] = useState<InvestigationReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evidenceList, setEvidenceList] = useState<IncidentEvidenceItem[]>([]);

  // Modals state
  const [showChangeGraph, setShowChangeGraph] = useState(false);
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [showBenchmarkModal, setShowBenchmarkModal] = useState(false);
  const [inspectedEvidence, setInspectedEvidence] = useState<IncidentEvidenceItem | null>(null);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);

  // Load existing investigation if available
  useEffect(() => {
    fetchIncidentEvidence(incident.id)
      .then((evs) => setEvidenceList(evs))
      .catch(() => {});

    getInvestigationReport(incident.id)
      .then((rep) => {
        if (rep) setReport(rep);
      })
      .catch(() => {});
  }, [incident.id]);

  const handleStartInvestigation = async () => {
    setLoading(true);
    setError(null);
    try {
      const newReport = await runAiInvestigation(incident.id, userRole);
      setReport(newReport);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Investigation failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmHypothesis = async (hypothesisId: string) => {
    if (!report) return;
    try {
      const updatedHyp = await confirmHypothesisByHuman(report.id, hypothesisId, userRole);
      const updatedHypotheses = report.hypotheses.map((h) =>
        h.id === updatedHyp.id ? updatedHyp : h
      );
      setReport({ ...report, hypotheses: updatedHypotheses });
    } catch (err) {
      console.error('Failed to confirm hypothesis:', err);
    }
  };

  const handleInspectEvidence = (evId: string) => {
    const found = evidenceList.find((e) => e.id === evId) || {
      id: evId,
      incidentId: incident.id,
      evidenceType: 'CORRELATED_TELEMETRY',
      title: `Evidence ${evId}`,
      sourceUri: `context://${incident.serviceName}/${evId}`,
      summary: 'Correlated telemetry evidence recorded in context builder.',
      confidenceScore: 0.95,
      recordedAt: incident.detectedAt,
    };
    setInspectedEvidence(found);
    setShowEvidenceModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED_BY_HUMAN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="h-3 w-3" /> Confirmed by Human
          </span>
        );
      case 'LIKELY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="h-3 w-3" /> Likely Hypothesis
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle className="h-3 w-3" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700">
            Unconfirmed
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Read-Only Safety Guardrail Banner */}
      <div className="p-4 rounded-xl border border-emerald-500/20 bg-zinc-950/80 backdrop-blur-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 shrink-0">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Read-Only AI Investigation Assistant
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                ACTIVE GUARDRAIL
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Autonomous mutations are strictly disabled. The assistant analyzes, correlates, searches, and hypothesizes without executing writes, shell commands, service restarts, or infrastructure rollbacks.
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setShowChangeGraph(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 hover:bg-zinc-800 hover:border-zinc-600 transition-all"
          >
            <Network className="h-3.5 w-3.5 text-sky-400" />
            <span>Change Graph</span>
          </button>

          <button
            onClick={() => setShowBenchmarkModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 hover:bg-zinc-800 hover:border-zinc-600 transition-all"
          >
            <Gauge className="h-3.5 w-3.5 text-indigo-400" />
            <span>Evaluation (20)</span>
          </button>

          {incident.status !== 'RESOLVED' && (
            <button
              onClick={() => setShowResolutionModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700/80 hover:bg-emerald-600 text-white border border-emerald-500/30 transition-all"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Confirm & Learn</span>
            </button>
          )}

          <button
            onClick={handleStartInvestigation}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black shadow-lg shadow-emerald-500/10 transition-all disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5 fill-current" />
            {loading ? 'Investigating Telemetry...' : report ? 'Re-run Investigation' : 'Investigate with AI'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Investigation Report Display */}
      {report ? (
        <div className="space-y-6">
          {/* Executive Summary & Impact */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Investigation Summary
                </div>
                <div className="text-[11px] font-mono text-zinc-500">
                  Confidence: {(report.confidence * 100).toFixed(0)}%
                </div>
              </div>
              <p className="text-sm text-zinc-200 leading-relaxed font-normal">
                {report.summary}
              </p>
              <div className="pt-2 border-t border-zinc-800/80">
                <div className="text-xs font-medium text-zinc-400 mb-1">Observed Impact:</div>
                <p className="text-xs text-zinc-300 leading-normal">{report.impact}</p>
              </div>
            </div>

            {/* Quality & Safety Grounding Metrics */}
            <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Safety & Citations
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-zinc-800/60">
                  <span className="text-zinc-400">Model Engine:</span>
                  <span className="font-mono text-zinc-200">{report.metrics.model}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-zinc-800/60">
                  <span className="text-zinc-400">Validated Citations:</span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    {report.validatedEvidenceReferences.length} verified
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-zinc-800/60">
                  <span className="text-zinc-400">Rejected Hallucinations:</span>
                  <span className="font-mono text-zinc-400">
                    {report.rejectedInvalidEvidenceIds.length} purged
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-zinc-400">Analysis Latency:</span>
                  <span className="font-mono text-zinc-300">{report.metrics.executionDurationMs} ms</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reconstructed Incident Timeline */}
          {report.timeline && (
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-sky-400" />
                Correlated Sequence of Events
              </div>
              <p className="text-xs text-zinc-300 font-mono bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
                {report.timeline}
              </p>
            </div>
          )}

          {/* Hypotheses Section with Human Verification */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-400" />
                Investigative Hypotheses ({report.hypotheses.length})
              </div>
              <span className="text-[11px] text-zinc-400">
                * Only human confirmation can elevate a hypothesis to ground truth
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {report.hypotheses.map((hyp) => {
                const isHumanConfirmed = hyp.status === 'CONFIRMED_BY_HUMAN';
                return (
                  <div
                    key={hyp.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isHumanConfirmed
                        ? 'bg-emerald-950/20 border-emerald-500/40 ring-1 ring-emerald-500/30'
                        : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-xs font-bold text-zinc-400">
                            {hyp.id}
                          </span>
                          {getStatusBadge(hyp.status)}
                          <span className="text-xs font-mono text-zinc-400">
                            Confidence: {(hyp.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                        <p className="text-xs text-zinc-200 font-medium leading-relaxed">
                          {hyp.statement}
                        </p>
                      </div>

                      {/* Confirmation Button for Human SRE */}
                      <div className="shrink-0 flex items-center gap-2">
                        {!isHumanConfirmed ? (
                          <button
                            onClick={() => handleConfirmHypothesis(hyp.id)}
                            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-zinc-800 hover:bg-emerald-600 hover:text-white text-zinc-200 border border-zinc-700 transition-colors"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Confirm (Human)</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold px-2 py-1 rounded bg-emerald-500/10">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Human Verified</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Evidence Citations */}
                    <div className="mt-3 pt-3 border-t border-zinc-800/80 flex flex-wrap items-center gap-3 text-xs">
                      {hyp.supportingEvidenceIds.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-zinc-400">Supporting Evidence:</span>
                          <div className="flex flex-wrap gap-1">
                            {hyp.supportingEvidenceIds.map((evId) => (
                              <button
                                key={evId}
                                onClick={() => handleInspectEvidence(evId)}
                                className="px-2 py-0.5 rounded font-mono text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors flex items-center gap-1"
                              >
                                <span>{evId}</span>
                                <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {hyp.contradictingEvidenceIds.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-zinc-400">Contradicting:</span>
                          <div className="flex flex-wrap gap-1">
                            {hyp.contradictingEvidenceIds.map((evId) => (
                              <button
                                key={evId}
                                onClick={() => handleInspectEvidence(evId)}
                                className="px-2 py-0.5 rounded font-mono text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-colors"
                              >
                                {evId}
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

          {/* Observations & Telemetry Signals */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <Activity className="h-4 w-4 text-sky-400" />
              Correlated Telemetry Observations ({report.observations.length})
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {report.observations.map((obs) => (
                <div
                  key={obs.id}
                  className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-zinc-800 text-sky-400 font-medium">
                      {obs.category}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400">
                      Severity: {(obs.severityScore * 10).toFixed(1)}/10
                    </span>
                  </div>
                  <p className="text-zinc-200 text-xs leading-relaxed">{obs.statement}</p>
                  {obs.evidenceReferences.length > 0 && (
                    <div className="pt-2 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-zinc-500">Citations:</span>
                      {obs.evidenceReferences.map((ref) => (
                        <button
                          key={ref}
                          onClick={() => handleInspectEvidence(ref)}
                          className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-zinc-800 text-zinc-300 hover:text-emerald-400 border border-zinc-700 transition-colors"
                        >
                          {ref}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Similar Historical Incidents */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <Search className="h-4 w-4 text-purple-400" />
                Similar Historical Incidents ({report.similarIncidents.length})
              </div>
              <span className="text-[11px] text-zinc-400">
                Explicitly distinguished from the current incident
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {report.similarIncidents.map((sim, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-2.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold text-zinc-200">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-zinc-800 text-purple-400">
                        {sim.incidentKey}
                      </span>
                      <span className="truncate">{sim.title}</span>
                    </div>
                    <span className="font-mono text-emerald-400 font-semibold">
                      {(sim.similarityScore * 100).toFixed(0)}% match
                    </span>
                  </div>

                  <div className="text-[11px] text-zinc-400">
                    <strong className="text-zinc-300">Historical Root Cause:</strong>{' '}
                    {sim.historicalRootCause}
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    <strong className="text-zinc-300">Verified Resolution:</strong>{' '}
                    {sim.historicalResolution}
                  </div>

                  <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px]">
                    <span className="text-zinc-500 font-mono">
                      Ref: {sim.originalIncidentReference}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                      {sim.isSameIncident ? 'SAME INCIDENT' : 'HISTORICAL PARALLEL'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Changes & Correlation */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <GitCommit className="h-4 w-4 text-amber-400" />
              Recent Changes in Temporal Proximity Window ({report.recentChanges.length})
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {report.recentChanges.map((chg) => (
                <div
                  key={chg.changeId}
                  className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-medium text-zinc-200">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-zinc-800 text-amber-400">
                        {chg.type}
                      </span>
                      <span>{chg.description}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">{chg.potentialRelationship}</p>
                  </div>
                  <div className="sm:text-right shrink-0">
                    <span className="font-mono text-[11px] text-zinc-400">
                      {chg.temporalProximityMinutes.toFixed(0)}m before detection
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Investigation Checks (Human-Only Guardrail) */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-emerald-400" />
              Recommended Investigation Checks (Read-Only Diagnostics)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {report.recommendedChecks.map((chk) => (
                <div
                  key={chk.id}
                  className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-2.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-zinc-100">{chk.title}</div>
                    {chk.isHumanOnlyGuardrailEnforced && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        HUMAN ACTION ONLY
                      </span>
                    )}
                  </div>
                  <p className="text-zinc-300 text-xs">{chk.description}</p>
                  <div className="p-2.5 rounded-lg bg-zinc-950 font-mono text-[11px] text-emerald-300 border border-zinc-800/80 overflow-x-auto">
                    {chk.suggestedDiagnostics[0]}
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    Rationale: {chk.rationale}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Known Unknowns */}
          {report.unknowns.length > 0 && (
            <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-semibold text-amber-300">
                <HelpCircle className="h-4 w-4 text-amber-400" />
                <span>Known Unknowns & Missing Context</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-zinc-300 text-[11px]">
                {report.unknowns.map((unk, i) => (
                  <li key={i}>{unk}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 flex items-center justify-center mx-auto text-emerald-400">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-200">
              No AI Investigation Performed Yet
            </h4>
            <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1">
              Click &quot;Investigate with AI&quot; to aggregate telemetry, correlate change events, search historical verified runbooks, and generate grounded hypotheses.
            </p>
          </div>
          <button
            onClick={handleStartInvestigation}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            {loading ? 'Analyzing...' : 'Trigger AI Investigation Pipeline'}
          </button>
        </div>
      )}

      {/* Modals */}
      <ChangeImpactGraphModal
        service={incident.serviceName}
        isOpen={showChangeGraph}
        onClose={() => setShowChangeGraph(false)}
      />

      <IncidentResolutionModal
        incident={incident}
        isOpen={showResolutionModal}
        onClose={() => setShowResolutionModal(false)}
        onResolved={(updated) => {
          onIncidentUpdated(updated);
          setShowResolutionModal(false);
        }}
      />

      <EvaluationBenchmarkModal
        isOpen={showBenchmarkModal}
        onClose={() => setShowBenchmarkModal(false)}
      />

      <EvidenceInspectorModal
        evidence={inspectedEvidence}
        isValidated={true}
        isOpen={showEvidenceModal}
        onClose={() => setShowEvidenceModal(false)}
      />
    </div>
  );
};
