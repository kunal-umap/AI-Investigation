import React from 'react';
import { IncidentEvidenceItem } from '../types';
import { X, ShieldCheck, ShieldAlert, FileText, Database, Server, Activity, ExternalLink } from 'lucide-react';

interface EvidenceInspectorModalProps {
  evidence: IncidentEvidenceItem | null;
  isValidated: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export const EvidenceInspectorModal: React.FC<EvidenceInspectorModalProps> = ({
  evidence,
  isValidated,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !evidence) return null;

  const getTypeIcon = (type: string) => {
    if (type.includes('DATABASE')) return <Database className="h-4 w-4 text-amber-400" />;
    if (type.includes('LOG')) return <FileText className="h-4 w-4 text-sky-400" />;
    if (type.includes('METRIC')) return <Activity className="h-4 w-4 text-emerald-400" />;
    return <Server className="h-4 w-4 text-purple-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-zinc-800 border border-zinc-700">
              {getTypeIcon(evidence.evidenceType)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-zinc-100">{evidence.title}</h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">ID: {evidence.id}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Grounding & Validation Badge */}
          <div
            className={`p-3 rounded-xl border flex items-center gap-2.5 ${
              isValidated
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            {isValidated ? (
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
            )}
            <div>
              <div className="font-semibold">
                {isValidated ? 'Validated Citation in Incident Context' : 'Ungrounded Reference Rejected'}
              </div>
              <p className="text-[11px] opacity-80 mt-0.5">
                {isValidated
                  ? 'Confirmed by EvidenceValidator. This evidence ID exists in the telemetry context window.'
                  : 'AI hallucination prevented. EvidenceValidator purged this reference before user display.'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-[11px] font-medium text-zinc-400 mb-1">Evidence Summary</div>
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800/80 text-zinc-200 leading-relaxed">
                {evidence.summary}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[11px] font-medium text-zinc-400 mb-1">Evidence Type</div>
                <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-300 font-mono text-[11px]">
                  {evidence.evidenceType}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-medium text-zinc-400 mb-1">Confidence Score</div>
                <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-emerald-400 font-mono text-[11px] font-semibold">
                  {(evidence.confidenceScore * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            <div>
              <div className="text-[11px] font-medium text-zinc-400 mb-1">Source Telemetry URI</div>
              <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-300 font-mono text-[11px] truncate flex items-center justify-between">
                <span className="truncate">{evidence.sourceUri}</span>
                <ExternalLink className="h-3 w-3 text-zinc-500 shrink-0 ml-2" />
              </div>
            </div>

            <div>
              <div className="text-[11px] font-medium text-zinc-400 mb-1">Recorded At</div>
              <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-400 font-mono text-[11px]">
                {new Date(evidence.recordedAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
