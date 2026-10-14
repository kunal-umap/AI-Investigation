import React, { useState } from 'react';
import { Incident, IncidentResolutionPayload } from '../types';
import { resolveIncidentWithKnowledge } from '../api';
import { CheckCircle2, X, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';

interface IncidentResolutionModalProps {
  incident: Incident;
  isOpen: boolean;
  onClose: () => void;
  onResolved: (updatedIncident: Incident) => void;
}

export const IncidentResolutionModal: React.FC<IncidentResolutionModalProps> = ({
  incident,
  isOpen,
  onClose,
  onResolved,
}) => {
  const [confirmedRootCause, setConfirmedRootCause] = useState('');
  const [actualResolution, setActualResolution] = useState('');
  const [affectedComponent, setAffectedComponent] = useState(incident.serviceName);
  const [lessonsLearned, setLessonsLearned] = useState('');
  const [preventiveAction, setPreventiveAction] = useState('');
  const [relatedRunbook, setRelatedRunbook] = useState(`KB-RUNBOOK-${incident.serviceName.toUpperCase()}`);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmedRootCause.trim() || !actualResolution.trim()) {
      setError('Confirmed Root Cause and Actual Resolution are required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload: IncidentResolutionPayload = {
        confirmedRootCause: confirmedRootCause.trim(),
        actualResolution: actualResolution.trim(),
        affectedComponent: affectedComponent.trim() || incident.serviceName,
        lessonsLearned: lessonsLearned.trim() || 'Knowledge codified from resolution.',
        preventiveAction: preventiveAction.trim() || 'Add alert rule and regression tests.',
        relatedRunbook: relatedRunbook.trim() || 'N/A',
      };

      const result = await resolveIncidentWithKnowledge(incident.id, payload);
      onResolved(result.incident);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to resolve incident';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100">
                Confirm Resolution & Ingest Verified Knowledge
              </h3>
              <p className="text-xs text-zinc-400">
                Human confirmation marks the root cause as verified and trains the AI knowledge base.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Safety Principle Banner */}
        <div className="px-6 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2 text-xs text-amber-300">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>
            <strong>Safety Constraint:</strong> AI hypotheses are NEVER treated as ground truth automatically. Only your human confirmation creates verified historical knowledge.
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Confirmed Root Cause <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={confirmedRootCause}
              onChange={(e) => setConfirmedRootCause(e.target.value)}
              placeholder="e.g. Missing composite index on orders table caused full table scans under load"
              rows={2}
              required
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Actual Resolution Executed <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={actualResolution}
              onChange={(e) => setActualResolution(e.target.value)}
              placeholder="e.g. Added composite index on orders(tenant_id, created_at) and tuned max-pool-size to 60"
              rows={2}
              required
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Affected Component
              </label>
              <input
                type="text"
                value={affectedComponent}
                onChange={(e) => setAffectedComponent(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Related Runbook Reference
              </label>
              <input
                type="text"
                value={relatedRunbook}
                onChange={(e) => setRelatedRunbook(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Lessons Learned
            </label>
            <input
              type="text"
              value={lessonsLearned}
              onChange={(e) => setLessonsLearned(e.target.value)}
              placeholder="e.g. Migration reviewer must check EXPLAIN output for high-volume query endpoints"
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Preventive Action
            </label>
            <input
              type="text"
              value={preventiveAction}
              onChange={(e) => setPreventiveAction(e.target.value)}
              placeholder="e.g. Add automated query plan linter step to deployment pipeline"
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-2">
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400 space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-zinc-300">
                <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
                <span>Knowledge Ingestion Preview</span>
              </div>
              <p className="text-[11px]">
                Upon resolution, document <span className="font-mono text-emerald-400">KB-HIST-{incident.incidentKey}</span> will be ingested into the semantic knowledge store with human verified status.
              </p>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {submitting ? 'Ingesting Knowledge...' : 'Confirm Resolution & Ingest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
