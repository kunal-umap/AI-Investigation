import React from 'react';
import { ShieldCheck, Plus, Terminal, RefreshCw, Activity, Layers, BookOpen, Gauge, Shield, ChevronDown } from 'lucide-react';

export type WorkspaceTab = 'incidents' | 'topology' | 'knowledge' | 'benchmarks' | 'audit';

interface NavigationHeaderProps {
  currentTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  activeIncidentsCount: number;
  userRole: 'ADMIN' | 'ENGINEER' | 'VIEWER';
  onRoleChange: (role: 'ADMIN' | 'ENGINEER' | 'VIEWER') => void;
  onNewIncident: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onToggleCliHelper: () => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  currentTab,
  onTabChange,
  activeIncidentsCount,
  userRole,
  onRoleChange,
  onNewIncident,
  onRefresh,
  isRefreshing,
  onToggleCliHelper,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/90 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-6">
        {/* Zone 1: Clean, human wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-8 w-8 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Activity className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight text-slate-100 whitespace-nowrap">
              OpsInvestigator
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/60 hidden sm:inline-block">
              SRE Console
            </span>
          </div>
        </div>

        {/* Zone 2: Clean single-line workspace navigation tabs */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-slate-400">
          <button
            onClick={() => onTabChange('incidents')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'incidents'
                ? 'bg-slate-900 text-slate-100 font-semibold border border-slate-800'
                : 'hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <span>Incidents</span>
            {activeIncidentsCount > 0 && (
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                {activeIncidentsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('topology')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'topology'
                ? 'bg-slate-900 text-slate-100 font-semibold border border-slate-800'
                : 'hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Layers className="h-3.5 w-3.5 opacity-70" />
            <span>System Topology</span>
          </button>

          <button
            onClick={() => onTabChange('knowledge')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'knowledge'
                ? 'bg-slate-900 text-slate-100 font-semibold border border-slate-800'
                : 'hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5 opacity-70" />
            <span>Knowledge Base</span>
          </button>

          <button
            onClick={() => onTabChange('benchmarks')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'benchmarks'
                ? 'bg-slate-900 text-slate-100 font-semibold border border-slate-800'
                : 'hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Gauge className="h-3.5 w-3.5 opacity-70" />
            <span>Grounding Benchmarks</span>
          </button>

          <button
            onClick={() => onTabChange('audit')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'audit'
                ? 'bg-slate-900 text-slate-100 font-semibold border border-slate-800'
                : 'hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Shield className="h-3.5 w-3.5 opacity-70" />
            <span>Audit Ledger</span>
          </button>
        </nav>

        {/* Zone 3: Actions & Status */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Subtle Read-Only Guard indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900/80 border border-slate-800 text-[11px] text-emerald-400 font-mono">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Read-Only Guard Active</span>
          </div>

          {/* Quick CLI helper toggle */}
          <button
            onClick={onToggleCliHelper}
            title="cURL & API Terminal"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-md border border-slate-800/80 transition-colors cursor-pointer"
          >
            <Terminal className="h-3.5 w-3.5" />
          </button>

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh Telemetry"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-md border border-slate-800/80 transition-colors disabled:opacity-40 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          {/* Role selector */}
          <div className="relative inline-flex items-center">
            <select
              value={userRole}
              onChange={(e) => onRoleChange(e.target.value as 'ADMIN' | 'ENGINEER' | 'VIEWER')}
              className="appearance-none bg-slate-900 hover:bg-slate-850 text-slate-200 text-xs font-mono font-medium pl-2.5 pr-6 py-1.5 rounded-md border border-slate-800 focus:outline-hidden focus:border-slate-700 cursor-pointer"
            >
              <option value="ENGINEER">Engineer</option>
              <option value="ADMIN">Admin</option>
              <option value="VIEWER">Viewer</option>
            </select>
            <ChevronDown className="h-3 w-3 text-slate-400 absolute right-2 pointer-events-none" />
          </div>

          {/* Primary Action Button */}
          <button
            onClick={onNewIncident}
            disabled={userRole === 'VIEWER'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-xs font-medium text-white shadow-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Report Incident</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 px-2 py-1 text-xs text-slate-400 overflow-x-auto">
        <button
          onClick={() => onTabChange('incidents')}
          className={`px-2.5 py-1 rounded whitespace-nowrap cursor-pointer ${currentTab === 'incidents' ? 'text-emerald-400 font-semibold' : ''}`}
        >
          Incidents ({activeIncidentsCount})
        </button>
        <button
          onClick={() => onTabChange('topology')}
          className={`px-2.5 py-1 rounded whitespace-nowrap cursor-pointer ${currentTab === 'topology' ? 'text-emerald-400 font-semibold' : ''}`}
        >
          Topology
        </button>
        <button
          onClick={() => onTabChange('knowledge')}
          className={`px-2.5 py-1 rounded whitespace-nowrap cursor-pointer ${currentTab === 'knowledge' ? 'text-emerald-400 font-semibold' : ''}`}
        >
          Knowledge
        </button>
        <button
          onClick={() => onTabChange('benchmarks')}
          className={`px-2.5 py-1 rounded whitespace-nowrap cursor-pointer ${currentTab === 'benchmarks' ? 'text-emerald-400 font-semibold' : ''}`}
        >
          Benchmarks
        </button>
        <button
          onClick={() => onTabChange('audit')}
          className={`px-2.5 py-1 rounded whitespace-nowrap cursor-pointer ${currentTab === 'audit' ? 'text-emerald-400 font-semibold' : ''}`}
        >
          Audit
        </button>
      </div>
    </header>
  );
};
