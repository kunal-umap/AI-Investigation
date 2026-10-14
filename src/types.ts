export type IncidentSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type IncidentStatus = 'DETECTED' | 'INVESTIGATING' | 'MITIGATED' | 'RESOLVED' | 'CLOSED';

export interface Incident {
  id: string;
  incidentKey: string;
  title: string;
  description: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  environment: string;
  serviceName: string;
  detectedAt: string;
  startedAt: string;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface IncidentTimelineEntry {
  id: string;
  incidentId: string;
  timestamp: string;
  entryType: string;
  summary: string;
  description: string;
  sourceRef: string;
  createdAt: string;
}

export interface IncidentEvidenceItem {
  id: string;
  incidentId: string;
  evidenceType: string;
  title: string;
  sourceUri: string;
  summary: string;
  confidenceScore: number;
  recordedAt: string;
}

export interface PaginatedIncidents {
  content: Incident[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
}

export interface CreateIncidentPayload {
  title: string;
  description: string;
  severity: IncidentSeverity;
  environment: string;
  serviceName: string;
  startedAt?: string;
}

export interface UpdateStatusPayload {
  status: IncidentStatus;
  reason: string;
  updatedBy: string;
  expectedVersion: number;
}

export interface InvestigationFinding {
  id: string;
  investigationId: string;
  title: string;
  category: string;
  description: string;
  confidenceScore: number;
  timestamp: string;
}

export interface InvestigationHypothesis {
  id: string;
  investigationId: string;
  hypothesisText: string;
  status: 'PENDING' | 'CONFIRMED' | 'REFUTED';
  evidenceReferences?: string;
  verifiedAt?: string | null;
}

export interface InvestigationRecommendation {
  id: string;
  investigationId: string;
  actionCategory: string;
  recommendationText: string;
  rationale: string;
  isActionableByHumanOnly: boolean;
}

export interface Investigation {
  id: string;
  incidentId: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  startedAt: string;
  completedAt?: string | null;
  rootCauseSummary?: string | null;
  confidenceScore?: number | null;
  findings?: InvestigationFinding[];
  hypotheses?: InvestigationHypothesis[];
  recommendations?: InvestigationRecommendation[];
}

export interface AuditRecord {
  id: string;
  action: string;
  actor: string;
  role: string;
  targetType: string;
  targetId: string;
  details: string;
  createdAt: string;
}

// Stage 3: Evidence-Based AI Investigation Types
export type AiHypothesisStatus = 'UNCONFIRMED' | 'LIKELY' | 'REJECTED' | 'CONFIRMED_BY_HUMAN';

export interface AiHypothesis {
  id: string;
  statement: string;
  confidence: number;
  supportingEvidenceIds: string[];
  contradictingEvidenceIds: string[];
  status: AiHypothesisStatus;
}

export interface AiObservation {
  id: string;
  category: string;
  statement: string;
  severityScore: number;
  evidenceReferences: string[];
}

export interface AiSimilarIncident {
  incidentId: string;
  incidentKey: string;
  title: string;
  similarityScore: number;
  matchingSignals: string[];
  historicalRootCause: string;
  historicalResolution: string;
  originalIncidentReference: string;
  isSameIncident: boolean; // AI explicitly distinguishes 'similar historical incident' from 'same incident'
}

export interface AiRecentChange {
  changeId: string;
  type: 'DEPLOYMENT' | 'GIT_COMMIT' | 'CONFIG_CHANGE' | 'DB_MIGRATION';
  description: string;
  timestamp: string;
  service: string;
  component: string;
  temporalProximityMinutes: number;
  potentialRelationship: string;
  evidenceReferences: string[];
}

export interface AiRecommendedCheck {
  id: string;
  title: string;
  description: string;
  rationale: string;
  isHumanOnlyGuardrailEnforced: boolean;
  suggestedDiagnostics: string[];
}

export interface QualityMetrics {
  model: string;
  modelVersion: string;
  promptVersion: string;
  createdAt: string;
  inputEvidenceCount: number;
  knowledgeSourcesUsed: number;
  recentChangesEvaluated: number;
  outputConfidence: number;
  executionDurationMs: number;
  circuitBreakerTripped: boolean;
  schemaFallbackUsed: boolean;
}

export interface InvestigationReport {
  id: string;
  incidentId: string;
  summary: string;
  impact: string;
  timeline: string;
  observations: AiObservation[];
  hypotheses: AiHypothesis[];
  similarIncidents: AiSimilarIncident[];
  recentChanges: AiRecentChange[];
  recommendedChecks: AiRecommendedCheck[];
  unknowns: string[];
  confidence: number;
  validatedEvidenceReferences: string[];
  rejectedInvalidEvidenceIds: string[];
  metrics: QualityMetrics;
  generatedAt: string;
}

export interface IncidentResolutionPayload {
  confirmedRootCause: string;
  actualResolution: string;
  affectedComponent: string;
  lessonsLearned: string;
  preventiveAction: string;
  relatedRunbook: string;
}

export interface ChangeGraphNode {
  id: string;
  label: string;
  type: 'SERVICE' | 'COMPONENT' | 'DATABASE' | 'API' | 'DEPLOYMENT' | 'CONFIGURATION' | 'INCIDENT';
  attributes?: Record<string, string>;
}

export interface ChangeGraphEdge {
  sourceId: string;
  targetId: string;
  relationship: 'DEPENDS_ON' | 'CALLS' | 'READS_FROM' | 'WRITES_TO' | 'DEPLOYED_WITH' | 'AFFECTED_BY' | 'CORRELATED_WITH';
}

export interface ChangeGraph {
  nodes: ChangeGraphNode[];
  edges: ChangeGraphEdge[];
}

export interface IncidentEvaluationScenario {
  scenarioId: string;
  title: string;
  service: string;
  telemetrySummary: string;
  knownRootCause: string;
  relevantEvidenceIds: string[];
  irrelevantEvidenceIds: string[];
  expectedSimilarIncidentId: string;
  recentChangeSummary: string;
}

export interface EvaluationResult {
  totalScenariosEvaluated: number;
  evidenceRetrievalPrecision: number;
  historicalIncidentRetrievalQuality: number;
  hypothesisCorrectness: number;
  unsupportedClaimRate: number;
  evidenceCitationAccuracy: number;
  averageLatencyMs: number;
}


