import { format, formatDistanceToNow } from 'date-fns';
import type { Severity, AnomalyStatus, ActionStatus } from './types';

export const severityColor: Record<Severity, string> = {
  Info: '#2196f3',
  Low: '#4caf50',
  Medium: '#ff9800',
  High: '#f57c00',
  Critical: '#d32f2f',
};

export const statusColor: Record<AnomalyStatus, string> = {
  New: '#2196f3',
  Triage: '#9c27b0',
  'Under Review': '#ff9800',
  Confirmed: '#e91e63',
  'Action Assigned': '#673ab7',
  'Mitigation In Progress': '#00bcd4',
  Monitoring: '#009688',
  Resolved: '#4caf50',
  Closed: '#607d8b',
  Archived: '#9e9e9e',
  'False Positive': '#795548',
};

export const actionStatusColor: Record<ActionStatus, string> = {
  New: '#2196f3',
  Accepted: '#9c27b0',
  'In Progress': '#ff9800',
  Blocked: '#d32f2f',
  Done: '#4caf50',
  Verified: '#388e3c',
};

export function fmtTs(ts: number): string {
  return format(new Date(ts), 'MMM d, HH:mm');
}

export function fmtDuration(startTs: number, _endTs?: number): string {
  return formatDistanceToNow(new Date(startTs), { addSuffix: false });
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function genTimeseries(hours: number, base: number, noise: number, interval = 15): { ts: number; value: number }[] {
  const now = Date.now();
  const pts: { ts: number; value: number }[] = [];
  const count = (hours * 60) / interval;
  for (let i = 0; i < count; i++) {
    const ts = now - (count - i) * interval * 60 * 1000;
    const value = base + (Math.random() - 0.5) * noise * 2;
    pts.push({ ts, value: Math.round(value * 100) / 100 });
  }
  return pts;
}

export function confirmationsNeeded(severity: Severity): number {
  return severity === 'Critical' ? 2 : 1;
}
