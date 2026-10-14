import React, { useState } from 'react';
import { CreateIncidentPayload, IncidentSeverity } from '../types';
import { createIncident } from '../api';
import { X, AlertOctagon, AlertTriangle, Info } from 'lucide-react';

interface CreateIncidentModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export const CreateIncidentModal: React.FC<CreateIncidentModalProps> = ({ onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<IncidentSeverity>('HIGH');
  const [environment, setEnvironment] = useState('production');
  const [serviceName, setServiceName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !serviceName.trim()) {
      setError('Please provide title, description, and service name.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const payload: CreateIncidentPayload = {
        title: title.trim(),
        description: description.trim(),
        severity,
        environment: environment.trim(),
        serviceName: serviceName.trim(),
        startedAt: new Date().toISOString(),
      };
      await createIncident(payload);
      onCreated();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create incident';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl text-zinc-100">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <AlertOctagon className="h-5 w-5 text-rose-500" />
            <h2 className="text-base font-semibold text-zinc-100">Report & Ingest Production Incident</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-zinc-300 mb-1">Incident Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Order Processing Service P99 Latency Degradation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Severity *</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
                className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 focus:border-emerald-500 focus:outline-hidden"
              >
                <option value="CRITICAL">CRITICAL (P1)</option>
                <option value="HIGH">HIGH (P2)</option>
                <option value="MEDIUM">MEDIUM (P3)</option>
                <option value="LOW">LOW (P4)</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Target Service *</label>
              <input
                type="text"
                required
                placeholder="e.g. checkout-api"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Environment *</label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 focus:border-emerald-500 focus:outline-hidden"
              >
                <option value="production">production</option>
                <option value="staging">staging</option>
                <option value="canary">canary</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Investigation Scope</label>
              <div className="rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-zinc-400 font-mono text-[11px] flex items-center gap-1.5">
                <Info className="h-3 w-3 text-emerald-400" />
                Read-Only Telemetry
              </div>
            </div>
          </div>

          <div>
            <label className="block font-medium text-zinc-300 mb-1">Incident Symptom Description *</label>
            <textarea
              required
              rows={3}
              placeholder="Describe observed errors, telemetry anomalies, and scope of user impact..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-zinc-700 bg-zinc-850 px-4 py-2 text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Ingesting...' : 'Create Incident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
