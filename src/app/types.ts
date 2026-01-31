// ── Facility ──
export interface Facility {
  id: string;
  name: string;
  region: string;
  timezone: string;
}

// ── User ──
export type UserRole = 'Supervisor' | 'Process Engineer' | 'Regional Expert';
export interface User {
  id: string;
  name: string;
  role: UserRole;
}

// ── Metric ──
export interface TimeseriesPoint {
  ts: number;
  value: number;
}
export interface Metric {
  id: string;
  facilityId: string;
  name: string;
  unit: string;
  area: string;
  asset: string;
  normalRange: { min: number; max: number };
  standard?: number;
  goal?: number;
  tags: string[];
  description: string;
  timeseries: TimeseriesPoint[];
}

// ── Anomaly ──
export type Severity = 'Info' | 'Low' | 'Medium' | 'High' | 'Critical';
export type AnomalyStatus =
  | 'New'
  | 'Triage'
  | 'Under Review'
  | 'Confirmed'
  | 'Action Assigned'
  | 'Mitigation In Progress'
  | 'Monitoring'
  | 'Resolved'
  | 'Closed'
  | 'Archived'
  | 'False Positive';

export interface AnomalyDriver {
  metricId: string;
  direction: 'up' | 'down' | 'oscillating';
  note: string;
}
export interface Confirmation {
  byUserId: string;
  role: UserRole;
  ts: number;
  rationale: string;
}
export interface Comment {
  id: string;
  userId: string;
  ts: number;
  text: string;
}
export interface AuditEvent {
  id: string;
  ts: number;
  actor: 'system' | 'user' | 'ai';
  eventType: string;
  detail: string;
}
export type RootCauseCategory =
  | 'Equipment'
  | 'Instrumentation'
  | 'Process Condition'
  | 'Raw Material'
  | 'Operator Procedure'
  | 'Unknown';
export type VerificationMethod =
  | 'Metric stable'
  | 'Inspection'
  | 'Lab result'
  | 'Other';
export interface ResolutionLog {
  rootCauseCategory: RootCauseCategory;
  rootCauseDescription: string;
  correctiveActionsSummary: string;
  preventiveActions: string;
  verificationMethod: VerificationMethod;
  verificationWindowHours: number;
  evidenceLinks: string[];
  approverUserId: string;
  resolvedAt: number;
}
export interface Anomaly {
  id: string;
  facilityId: string;
  title: string;
  description: string;
  severity: Severity;
  confidence: number;
  status: AnomalyStatus;
  startTime: number;
  endTime?: number;
  area: string;
  asset: string;
  relatedMetricIds: string[];
  drivers: AnomalyDriver[];
  confirmations: Confirmation[];
  ownerUserId?: string;
  comments: Comment[];
  actionIds: string[];
  healthScore: number;
  resolutionLog: ResolutionLog | null;
  audit: AuditEvent[];
}

// ── Action ──
export type ActionType = 'Inspect' | 'Repair' | 'Calibrate' | 'Adjust' | 'Replace' | 'Clean';
export type AssigneeGroup = 'Maintenance' | 'Electrician' | 'Instrumentation' | 'Operations';
export type ActionStatus = 'New' | 'Accepted' | 'In Progress' | 'Blocked' | 'Done' | 'Verified';
export interface ActionNote {
  ts: number;
  userId: string;
  text: string;
}
export interface Action {
  id: string;
  anomalyId: string;
  title: string;
  type: ActionType;
  assigneeGroup: AssigneeGroup;
  assigneeName?: string;
  priority: 'Low' | 'Medium' | 'High';
  dueAt: number;
  status: ActionStatus;
  notes: ActionNote[];
  cmmsWorkOrderId?: string;
  assigneeUserId?: string;
  completedAt?: number;
}

// ── Time Range ──
export type TimeRangePreset = '1h' | '8h' | '24h' | '7d' | 'custom';

// ── Notification ──
export interface AppNotification {
  id: string;
  ts: number;
  title: string;
  read: boolean;
}
