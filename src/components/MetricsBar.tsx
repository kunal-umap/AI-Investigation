import React from 'react';
import { Play, Activity, ShieldCheck, Database, Flame, Clock } from 'lucide-react';

interface MetricsBarProps {
  totalIncidents: number;
  activeCount: number;
  criticalCount: number;
  mttiMinutes: number;
  poolSaturationPercent: number;
  onSimulateScenario: () => void;
  isSimulating: boolean;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({
  totalIncidents,
  activeCount,
  criticalCount,
  mttiMinutes,
  poolSaturationPercent,
  onSimulateScenario,
  isSimulating,
}) => {
  return (
    <div className="border border-slate-800 bg-slate-900/40 rounded-lg px-4 py-3 text-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Metric indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 items-center">
          <div>
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              <span>Active P1 Inquiries</span>
            </div>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className="font-mono text-xl font-bold text-slate-100 tabular-nums">
                {activeCount}
              </span>
              <span className="text-[11px] text-slate-400">
                ({criticalCount} critical)
              </span>
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-slate-400" />
              <span>Mean Time to Investigate</span>
            </div>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className="font-mono text-xl font-bold text-slate-100 tabular-nums">
                {mttiMinutes.toFixed(1)}m
              </span>
              <span className="text-[11px] text-emerald-400 font-medium">-42% vs SLA</span>
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
              <Database className="h-3 w-3 text-slate-400" />
              <span>DB Pool Saturation</span>
            </div>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className={`font-mono text-xl font-bold tabular-nums ${poolSaturationPercent >= 80 ? 'text-amber-400' : 'text-slate-100'}`}>
                {poolSaturationPercent}%
              </span>
              <span className="text-[11px] text-slate-400">HikariCP 50/50</span>
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              <span>Production Safety</span>
            </div>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className="font-medium text-emerald-400 text-sm">Read-Only</span>
              <span className="text-[11px] text-slate-400 font-mono">0 mutations</span>
            </div>
          </div>
        </div>

        {/* Live Replay Trigger */}
        <div className="shrink-0 flex items-center gap-2 border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-800">
          <button
            onClick={onSimulateScenario}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-850 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
            title="Replay canonical OPS-1044 HikariCP saturation incident scenario"
          >
            <Play className={`h-3 w-3 text-emerald-400 ${isSimulating ? 'animate-pulse' : ''}`} />
            <span>{isSimulating ? 'Simulating Anomaly...' : 'Replay Scenario (OPS-1044)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
