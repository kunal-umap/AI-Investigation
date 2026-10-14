import React, { useEffect, useState } from 'react';
import { AuditRecord } from '../types';
import { fetchAuditRecords } from '../api';
import { ShieldAlert, RefreshCw, Filter, UserCheck, Shield } from 'lucide-react';

interface AuditLogModalProps {
  userRole: 'ADMIN' | 'ENGINEER' | 'VIEWER';
  onClose: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ userRole, onClose }) => {
  const [records, setRecords] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchAuditRecords(50, userRole);
      setRecords(data);
    } catch (err) {
      console.error('Failed to load audit records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [userRole]);

  const filtered = records.filter((r) => {
    if (!actionFilter) return true;
    return r.action.toLowerCase().includes(actionFilter.toLowerCase());
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl text-zinc-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4 bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-400" />
            <h3 className="text-base font-bold text-zinc-100">Enterprise SRE Audit Trail</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-4 px-6 py-3 border-b border-zinc-850 bg-zinc-900/30 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Filter by action (e.g., START_INVESTIGATION)..."
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="rounded border border-zinc-700 bg-zinc-800/80 px-2.5 py-1 text-xs text-zinc-200 placeholder-zinc-500 focus:border-emerald-500 focus:outline-hidden"
            />
          </div>
          <button
            type="button"
            onClick={loadAuditLogs}
            className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="p-8 text-center text-xs text-zinc-500">Loading audit records...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">No audit records found.</div>
          ) : (
            <div className="space-y-3">
              {filtered.map((record) => (
                <div
                  key={record.id}
                  className="rounded-lg border border-zinc-850 bg-zinc-900/40 p-3.5 text-xs flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-400">
                        {record.action}
                      </span>
                      <span className="text-zinc-500 font-mono text-[11px]">
                        Target: {record.targetType}/{record.targetId}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-500">
                      {new Date(record.createdAt).toUTCString()}
                    </span>
                  </div>
                  <div className="text-zinc-300">{record.details}</div>
                  <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400 mt-1">
                    <span className="flex items-center gap-1">
                      <UserCheck className="h-3 w-3 text-zinc-400" /> Actor: {record.actor}
                    </span>
                    <span>Role: <span className="text-zinc-300 font-semibold">{record.role}</span></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-800 px-6 py-3 bg-zinc-900/40 flex justify-end">
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
