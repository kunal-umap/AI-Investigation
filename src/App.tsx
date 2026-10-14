import React, { useEffect, useState } from 'react';
import { Incident } from './types';
import { fetchIncidents, fetchDashboardMetrics, simulateDemoReplay } from './api';
import { NavigationHeader, WorkspaceTab } from './components/NavigationHeader';
import { MetricsBar } from './components/MetricsBar';
import { IncidentListView } from './components/IncidentListView';
import { IncidentWorkspaceModal } from './components/IncidentWorkspaceModal';
import { CreateIncidentModal } from './components/CreateIncidentModal';
import { CurlCommandHelper } from './components/CurlCommandHelper';
import { KnowledgeBaseView } from './components/KnowledgeBaseView';
import { TopologyView } from './components/TopologyView';
import { BenchmarkView } from './components/BenchmarkView';
import { AuditTrailView } from './components/AuditTrailView';

export default function App() {
  const [currentTab, setCurrentTab] = useState<WorkspaceTab>('incidents');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [userRole, setUserRole] = useState<'ADMIN' | 'ENGINEER' | 'VIEWER'>('ENGINEER');

  // Metrics
  const [mttiMinutes, setMttiMinutes] = useState(4.5);
  const [poolSaturation, setPoolSaturation] = useState(100);
  const [isSimulating, setIsSimulating] = useState(false);

  // Modals
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCliHelper, setShowCliHelper] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pageData, metricsData] = await Promise.all([
        fetchIncidents(0, 50, statusFilter || undefined, severityFilter || undefined),
        fetchDashboardMetrics().catch(() => null),
      ]);
      setIncidents(pageData.content || []);
      if (metricsData) {
        setMttiMinutes(metricsData.meanTimeToIdentifyMinutes || 4.5);
        if (metricsData.databaseHealth) {
          setPoolSaturation(metricsData.databaseHealth.poolSaturationPercent || 100);
        }
      }
    } catch (err) {
      console.error('Error loading operational data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, severityFilter]);

  const handleSimulateScenario = async () => {
    setIsSimulating(true);
    try {
      const res = await simulateDemoReplay();
      if (res.incident) {
        setIncidents((prev) => [res.incident, ...prev]);
        setSelectedIncident(res.incident);
        setCurrentTab('incidents');
      }
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleIncidentUpdated = (updated: Incident) => {
    setIncidents((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    setSelectedIncident(updated);
  };

  const activeIncidents = incidents.filter(
    (i) => i.status === 'DETECTED' || i.status === 'INVESTIGATING'
  );
  const criticalCount = activeIncidents.filter((i) => i.severity === 'CRITICAL').length;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Human Top Bar Navigation Contract */}
      <NavigationHeader
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        activeIncidentsCount={activeIncidents.length}
        userRole={userRole}
        onRoleChange={(role) => setUserRole(role)}
        onNewIncident={() => setShowCreateModal(true)}
        onRefresh={loadData}
        isRefreshing={loading}
        onToggleCliHelper={() => setShowCliHelper(!showCliHelper)}
      />

      {/* Main Workspace Canvas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 space-y-6">
        {/* Terminal and API snippet drawer */}
        {showCliHelper && (
          <div className="mb-2">
            <CurlCommandHelper />
          </div>
        )}

        {/* Workspace Tab Content */}
        {currentTab === 'incidents' && (
          <div className="space-y-5">
            {/* Telemetry KPIs and Demo Trigger Strip */}
            <MetricsBar
              totalIncidents={incidents.length}
              activeCount={activeIncidents.length}
              criticalCount={criticalCount}
              mttiMinutes={mttiMinutes}
              poolSaturationPercent={poolSaturation}
              onSimulateScenario={handleSimulateScenario}
              isSimulating={isSimulating}
            />

            {/* Incidents Table / Stream */}
            <IncidentListView
              incidents={incidents}
              loading={loading}
              onSelectIncident={(inc) => setSelectedIncident(inc)}
              statusFilter={statusFilter}
              onStatusFilterChange={(st) => setStatusFilter(st)}
              severityFilter={severityFilter}
              onSeverityFilterChange={(sev) => setSeverityFilter(sev)}
              searchQuery={searchQuery}
              onSearchQueryChange={(q) => setSearchQuery(q)}
              onRefresh={loadData}
            />
          </div>
        )}

        {currentTab === 'topology' && <TopologyView />}

        {currentTab === 'knowledge' && <KnowledgeBaseView />}

        {currentTab === 'benchmarks' && <BenchmarkView />}

        {currentTab === 'audit' && <AuditTrailView userRole={userRole} />}
      </main>

      {/* Modals */}
      {selectedIncident && (
        <IncidentWorkspaceModal
          incident={selectedIncident}
          userRole={userRole}
          onClose={() => setSelectedIncident(null)}
          onIncidentUpdated={handleIncidentUpdated}
        />
      )}

      {showCreateModal && (
        <CreateIncidentModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            loadData();
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}
