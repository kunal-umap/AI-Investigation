import React, { useState, useEffect } from 'react';
import { AuditRecord } from '../types';
import { fetchAuditRecords } from '../api';
import { Shield, Clock, User, CheckCircle2, FileText } from 'lucide-react';

interface AuditTrailViewProps {
  userRole: 'ADMIN' | 'ENGINEER' | 'VIEWER';
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ userRole }) => {
  const [logs, setLogs] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchAuditRecords(50, userRole)
      .then((data) => setLogs(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [userRole]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Immutable Audit Ledger</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographically timestamped compliance ledger tracking all automated AI investigations, evidence retrievals, and human confirmation events.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
          <Shield className="h-3.5 w-3.5" />
          <span>Tamper-Resistant</span>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 border border-slate-800 rounded-lg">
          Loading audit records...
        </div>
      ) : logs.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-500 border border-slate-800 rounded-lg">
          No audit records logged yet.
        </div>
      ) : (
        <div className="border border-slate-800 bg-slate-900/30 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-mono">
              <tr>
                <th className="px-4 py-2.5">Audit ID</th>
                <th className="px-4 py-2.5">Action</th>
                <th className="px-4 py-2.5">Actor</th>
                <th className="px-4 py-2.5">Role</th>
                <th className="px-4 py-2.5">Target</th>
                <th className="px-4 py-2.5">Details</th>
                <th className="px-4 py-2.5">Timestamp (UTC)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-850/40">
                  <td className="px-4 py-3 text-slate-400">{log.id}</td>
                  <td className="px-4 py-3">
                    <span className="text-emerald-400 font-semibold px-1.5 py-0.5 bg-emerald-500/10 rounded">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{log.actor}</td>
                  <td className="px-4 py-3 text-slate-400">{log.role}</td>
                  <td className="px-4 py-3 text-slate-300">{log.targetType}: {log.targetId}</td>
                  <td className="px-4 py-3 text-slate-400 max-w-xs font-sans text-xs">{log.details}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString('en-US', { timeZone: 'UTC' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
