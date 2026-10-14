import {
  Incident,
  IncidentTimelineEntry,
  IncidentEvidenceItem,
  PaginatedIncidents,
  CreateIncidentPayload,
  UpdateStatusPayload,
  Investigation,
  InvestigationHypothesis,
  AuditRecord,
  InvestigationReport,
  IncidentResolutionPayload,
  ChangeGraph,
  IncidentEvaluationScenario,
  EvaluationResult,
  AiHypothesis,
} from './types';

const BASE_URL = '/api/v1';

export async function checkBackendHealth(): Promise<{ status: string; components?: Record<string, unknown> }> {
  const res = await fetch('/actuator/health');
  if (!res.ok) {
    throw new Error(`Health check failed with HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchIncidents(page = 0, size = 20, status?: string, severity?: string): Promise<PaginatedIncidents> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });
  if (status) params.append('status', status);
  if (severity) params.append('severity', severity);

  const res = await fetch(`${BASE_URL}/incidents?${params.toString()}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.detail || `Failed to fetch incidents (${res.status})`);
  }
  return res.json();
}

export async function getIncident(id: string): Promise<Incident> {
  const res = await fetch(`${BASE_URL}/incidents/${id}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.detail || `Failed to get incident ${id} (${res.status})`);
  }
  return res.json();
}

export async function createIncident(payload: CreateIncidentPayload): Promise<Incident> {
  const res = await fetch(`${BASE_URL}/incidents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...payload,
      startedAt: payload.startedAt || new Date().toISOString(),
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    if (errorData?.invalidParams) {
      const issues = Object.entries(errorData.invalidParams)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
      throw new Error(`Validation error: ${issues}`);
    }
    throw new Error(errorData?.detail || `Failed to create incident (${res.status})`);
  }
  return res.json();
}

export async function updateIncidentStatus(id: string, payload: UpdateStatusPayload): Promise<Incident> {
  const res = await fetch(`${BASE_URL}/incidents/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.detail || `Failed to update status (${res.status})`);
  }
  return res.json();
}

export async function fetchIncidentTimeline(id: string): Promise<IncidentTimelineEntry[]> {
  const res = await fetch(`${BASE_URL}/incidents/${id}/timeline`);
  if (!res.ok) {
    throw new Error(`Failed to fetch timeline for incident ${id}`);
  }
  return res.json();
}

export async function fetchIncidentEvidence(id: string): Promise<IncidentEvidenceItem[]> {
  const res = await fetch(`${BASE_URL}/incidents/${id}/evidence`);
  if (!res.ok) {
    throw new Error(`Failed to fetch evidence for incident ${id}`);
  }
  return res.json();
}

export async function fetchIncidentInvestigation(incidentId: string, role = 'ENGINEER'): Promise<Investigation | null> {
  const res = await fetch(`${BASE_URL}/incidents/${incidentId}/investigations`, {
    headers: { 'X-User-Role': role, 'X-User-Id': 'console-user' }
  });
  if (!res.ok) {
    if (res.status === 404) return null;
    return null;
  }
  return res.json();
}

export async function startIncidentInvestigation(incidentId: string, role = 'ENGINEER'): Promise<Investigation> {
  const res = await fetch(`${BASE_URL}/incidents/${incidentId}/investigations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Role': role,
      'X-User-Id': 'console-user'
    }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || `Failed to trigger investigation (${res.status})`);
  }
  return res.json();
}

export async function verifyHypothesis(
  incidentId: string,
  investigationId: string,
  hypothesisId: string,
  status: 'CONFIRMED' | 'REFUTED',
  role = 'ENGINEER'
): Promise<InvestigationHypothesis> {
  const res = await fetch(`${BASE_URL}/investigations/${investigationId}/hypotheses/${hypothesisId}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Role': role,
      'X-User-Id': 'console-user'
    },
    body: JSON.stringify({ status })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || `Failed to verify hypothesis (${res.status})`);
  }
  return res.json();
}

export async function fetchAuditRecords(limit = 20, role = 'ENGINEER'): Promise<AuditRecord[]> {
  const res = await fetch(`${BASE_URL}/audit-records?limit=${limit}`, {
    headers: { 'X-User-Role': role, 'X-User-Id': 'console-user' }
  });
  if (!res.ok) {
    return [];
  }
  return res.json();
}

// ==================== STAGE 3 API CALLS ====================

export async function runAiInvestigation(
  incidentId: string,
  role = 'ENGINEER',
  userId = 'lead-sre-1'
): Promise<InvestigationReport> {
  const res = await fetch(`${BASE_URL}/incidents/${incidentId}/investigate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Role': role,
      'X-User-Id': userId,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || err?.error || `AI Investigation failed (${res.status})`);
  }
  return res.json();
}

export async function getInvestigationReport(id: string): Promise<InvestigationReport | null> {
  const res = await fetch(`${BASE_URL}/investigations/${id}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Failed to fetch report ${id}`);
  }
  return res.json();
}

export async function confirmHypothesisByHuman(
  investigationId: string,
  hypothesisId: string,
  role = 'ENGINEER',
  userId = 'lead-sre-1'
): Promise<AiHypothesis> {
  const res = await fetch(`${BASE_URL}/investigations/${investigationId}/hypotheses/${hypothesisId}/confirm-human`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Role': role,
      'X-User-Id': userId,
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to confirm hypothesis (${res.status})`);
  }
  return res.json();
}

export async function resolveIncidentWithKnowledge(
  incidentId: string,
  payload: IncidentResolutionPayload,
  role = 'ENGINEER',
  userId = 'lead-sre-1'
): Promise<any> {
  const res = await fetch(`${BASE_URL}/incidents/${incidentId}/resolution`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Role': role,
      'X-User-Id': userId,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || err?.error || `Failed to resolve incident (${res.status})`);
  }
  return res.json();
}

export async function fetchChangeGraph(service: string): Promise<ChangeGraph> {
  const res = await fetch(`${BASE_URL}/change-graph/${encodeURIComponent(service)}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch change graph for ${service}`);
  }
  return res.json();
}

export async function fetchEvaluationScenarios(): Promise<IncidentEvaluationScenario[]> {
  const res = await fetch(`${BASE_URL}/evaluation/scenarios`);
  if (!res.ok) {
    throw new Error(`Failed to fetch evaluation scenarios`);
  }
  return res.json();
}

export async function runEvaluationBenchmark(): Promise<EvaluationResult> {
  const res = await fetch(`${BASE_URL}/evaluation/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Role': 'ENGINEER',
      'X-User-Id': 'lead-sre-1',
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to run evaluation benchmark`);
  }
  return res.json();
}

export async function fetchDashboardMetrics(): Promise<any> {
  const res = await fetch(`${BASE_URL}/dashboard/metrics`);
  if (!res.ok) {
    throw new Error(`Failed to fetch dashboard metrics`);
  }
  return res.json();
}

export async function searchKnowledge(q = '', service?: string, type?: string): Promise<any[]> {
  const params = new URLSearchParams();
  if (q) params.append('q', q);
  if (service) params.append('service', service);
  if (type) params.append('type', type);

  const res = await fetch(`${BASE_URL}/knowledge/search?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to search knowledge base`);
  }
  return res.json();
}

export async function fetchIncidentEvidenceGraph(incidentId: string): Promise<any> {
  const res = await fetch(`${BASE_URL}/incidents/${incidentId}/evidence-graph`);
  if (!res.ok) {
    throw new Error(`Failed to fetch evidence graph for ${incidentId}`);
  }
  return res.json();
}

export async function simulateDemoReplay(): Promise<any> {
  const res = await fetch(`${BASE_URL}/demo/simulate-replay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Failed to simulate demo replay`);
  }
  return res.json();
}



