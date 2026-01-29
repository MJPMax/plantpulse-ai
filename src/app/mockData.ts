import type {
  Facility, User, Metric, Anomaly, Action, AppNotification,
} from './types';
import { genTimeseries, uid } from './utils';

const now = Date.now();
const h = (n: number) => n * 3600_000;
const m = (n: number) => n * 60_000;

// ── Facilities ──
export const facilities: Facility[] = [
  { id: 'fac-1', name: 'Crushton Oilseed Plant', region: 'Midwest', timezone: 'America/Chicago' },
  { id: 'fac-2', name: 'Bayport Processing', region: 'Gulf Coast', timezone: 'America/Houston' },
];

// ── Users ──
export const users: User[] = [
  { id: 'u-1', name: 'Sarah Chen', role: 'Supervisor' },
  { id: 'u-2', name: 'Marco Rodriguez', role: 'Process Engineer' },
  { id: 'u-3', name: 'Dr. Ayesha Patel', role: 'Regional Expert' },
];

// ── Metrics ──
export const metrics: Metric[] = [
  // Fac-1: Crushton Oilseed Plant — productivity KPIs
  { id: 'met-1', facilityId: 'fac-1', name: 'Daily Throughput', unit: 'Bu/day', area: 'Extraction', asset: 'Main Press', normalRange: { min: 170, max: 210 }, standard: 200, goal: 195, tags: ['throughput', 'press'], description: 'Plant rate / daily throughput', timeseries: genTimeseries(24, 195, 15) },
  { id: 'met-2', facilityId: 'fac-1', name: 'White Flake Fat', unit: '%', area: 'Extraction', asset: 'Solvent System', normalRange: { min: 0.55, max: 0.85 }, standard: 0.76, goal: 0.67, tags: ['fat', 'flake', 'extraction'], description: 'White flake fat content', timeseries: genTimeseries(24, 0.71, 0.08) },
  { id: 'met-3', facilityId: 'fac-1', name: 'Loadout Meal Moisture', unit: '%', area: 'Quality', asset: 'Loadout', normalRange: { min: 11.5, max: 13.0 }, standard: 12.65, goal: 12.50, tags: ['moisture', 'meal', 'quality'], description: 'Loadout meal moisture content', timeseries: genTimeseries(24, 12.62, 0.3) },
  { id: 'met-4', facilityId: 'fac-1', name: 'Loadout Meal Fiber', unit: '%', area: 'Quality', asset: 'Loadout', normalRange: { min: 3.2, max: 4.2 }, standard: 3.95, goal: 3.70, tags: ['fiber', 'meal', 'quality'], description: 'Loadout meal fiber content', timeseries: genTimeseries(24, 3.73, 0.2) },
  { id: 'met-5', facilityId: 'fac-1', name: 'Hulls Fat', unit: '%', area: 'Extraction', asset: 'Hull System', normalRange: { min: 0.8, max: 1.6 }, standard: 1.44, goal: 1.30, tags: ['fat', 'hulls'], description: 'Hulls fat content', timeseries: genTimeseries(24, 1.63, 0.2) },
  { id: 'met-6', facilityId: 'fac-1', name: 'Secondary Heat', unit: 'MJ/MT', area: 'Utilities', asset: 'Boiler', normalRange: { min: 600, max: 900 }, standard: 850, goal: 800, tags: ['heat', 'energy', 'steam'], description: 'Secondary specific heat consumption', timeseries: genTimeseries(24, 820, 60) },
  { id: 'met-7', facilityId: 'fac-1', name: 'Solvent Loss', unit: '%mass', area: 'Extraction', asset: 'Solvent Recovery', normalRange: { min: -0.05, max: 0.08 }, standard: 0.05, goal: 0.03, tags: ['hexane', 'solvent'], description: 'Solvent loss percentage', timeseries: genTimeseries(24, 0.04, 0.03) },
  { id: 'met-8', facilityId: 'fac-1', name: 'Seed Moisture', unit: '%', area: 'Prep', asset: 'Conditioner', normalRange: { min: 9.0, max: 10.5 }, standard: 10.0, goal: 9.8, tags: ['moisture', 'seed', 'prep'], description: 'Incoming seed moisture content', timeseries: genTimeseries(24, 9.7, 0.4) },
  { id: 'met-9', facilityId: 'fac-1', name: 'Boilerhouse Eff. HHV', unit: '%', area: 'Utilities', asset: 'Boiler', normalRange: { min: 78, max: 88 }, standard: 85, goal: 83, tags: ['boiler', 'efficiency'], description: 'Boilerhouse efficiency (HHV)', timeseries: genTimeseries(24, 83.5, 3) },
  { id: 'met-10', facilityId: 'fac-1', name: 'Water Consumption', unit: 'GAL/Bu', area: 'Utilities', asset: 'Water System', normalRange: { min: 6, max: 10 }, standard: 9.0, goal: 8.0, tags: ['water', 'consumption'], description: 'Water consumption per bushel', timeseries: genTimeseries(24, 8.3, 1.0) },
  { id: 'met-11', facilityId: 'fac-1', name: 'Degumming TUC', unit: '%', area: 'Refining', asset: 'Degumming', normalRange: { min: 0.01, max: 0.06 }, standard: 0.04, goal: 0.03, tags: ['degumming', 'refining'], description: 'Degumming TUC percentage', timeseries: genTimeseries(24, 0.035, 0.01) },

  // Fac-2: Bayport
  { id: 'met-12', facilityId: 'fac-2', name: 'Daily Throughput', unit: 'Bu/day', area: 'Extraction', asset: 'Main Press', normalRange: { min: 150, max: 190 }, standard: 180, goal: 175, tags: ['throughput'], description: 'Bayport daily throughput', timeseries: genTimeseries(24, 172, 12) },
  { id: 'met-13', facilityId: 'fac-2', name: 'White Flake Fat', unit: '%', area: 'Extraction', asset: 'Solvent System', normalRange: { min: 0.55, max: 0.85 }, standard: 0.76, goal: 0.67, tags: ['fat', 'flake'], description: 'Bayport white flake fat', timeseries: genTimeseries(24, 0.73, 0.07) },
];

// ── Anomalies ──
export const anomalies: Anomaly[] = [
  {
    id: 'ano-1', facilityId: 'fac-1', title: 'Throughput Drop – Main Press', description: 'Sudden 12% throughput decrease detected on Main Press extraction line.',
    severity: 'Critical', confidence: 0.92, status: 'Under Review',
    startTime: now - h(3), area: 'Extraction', asset: 'Main Press',
    relatedMetricIds: ['met-1', 'met-2', 'met-7'], drivers: [
      { metricId: 'met-1', direction: 'down', note: 'Dropped from 52 to 44 T/h' },
      { metricId: 'met-7', direction: 'up', note: 'Hexane loss increasing' },
    ],
    confirmations: [{ byUserId: 'u-2', role: 'Process Engineer', ts: now - h(2), rationale: 'Verified on DCS trend, confirmed drop is real.' }],
    ownerUserId: 'u-1', comments: [
      { id: uid(), userId: 'u-2', ts: now - h(2), text: 'Checked DCS — throughput dropped sharply at 06:15. Press vibration also elevated.' },
    ],
    actionIds: ['act-1', 'act-2'], resolutionLog: null,
    audit: [
      { id: uid(), ts: now - h(3), actor: 'system', eventType: 'created', detail: 'Anomaly detected by AI model.' },
      { id: uid(), ts: now - h(2.5), actor: 'user', eventType: 'status_change', detail: 'Status changed to Under Review by Sarah Chen.' },
      { id: uid(), ts: now - h(2), actor: 'user', eventType: 'confirmation', detail: 'Confirmed by Marco Rodriguez (Process Engineer).' },
    ],
  },
  {
    id: 'ano-2', facilityId: 'fac-1', title: 'Steam Consumption Spike', description: 'Steam usage exceeded 340 kg/T threshold for 45 min.',
    severity: 'High', confidence: 0.87, status: 'New',
    startTime: now - h(1.5), area: 'Utilities', asset: 'Boiler A',
    relatedMetricIds: ['met-3', 'met-8'], drivers: [
      { metricId: 'met-3', direction: 'up', note: 'Peaked at 348 kg/T' },
      { metricId: 'met-8', direction: 'up', note: 'Moisture slightly elevated' },
    ],
    confirmations: [], ownerUserId: undefined, comments: [], actionIds: [],
    resolutionLog: null,
    audit: [{ id: uid(), ts: now - h(1.5), actor: 'system', eventType: 'created', detail: 'Anomaly detected by AI model.' }],
  },
  {
    id: 'ano-3', facilityId: 'fac-1', title: 'Extraction Efficiency Below Target', description: 'Efficiency dropped to 89%, below 92% threshold.',
    severity: 'Medium', confidence: 0.78, status: 'Confirmed',
    startTime: now - h(6), area: 'Extraction', asset: 'Solvent System',
    relatedMetricIds: ['met-2', 'met-7'], drivers: [
      { metricId: 'met-2', direction: 'down', note: 'Dropped to 89%' },
    ],
    confirmations: [{ byUserId: 'u-1', role: 'Supervisor', ts: now - h(5), rationale: 'Lab sample confirmed low efficiency.' }],
    ownerUserId: 'u-2', comments: [
      { id: uid(), userId: 'u-1', ts: now - h(5), text: 'Lab confirmed — efficiency is indeed low. Possibly solvent ratio issue.' },
    ],
    actionIds: ['act-3'], resolutionLog: null,
    audit: [
      { id: uid(), ts: now - h(6), actor: 'system', eventType: 'created', detail: 'Anomaly detected.' },
      { id: uid(), ts: now - h(5), actor: 'user', eventType: 'confirmation', detail: 'Confirmed by Sarah Chen.' },
      { id: uid(), ts: now - h(5), actor: 'user', eventType: 'status_change', detail: 'Status → Confirmed.' },
    ],
  },
  {
    id: 'ano-4', facilityId: 'fac-1', title: 'Power Consumption Oscillation', description: 'kWh/T showing unusual oscillating pattern over 4h window.',
    severity: 'Low', confidence: 0.65, status: 'Action Assigned',
    startTime: now - h(10), area: 'Utilities', asset: 'Main Grid',
    relatedMetricIds: ['met-4'], drivers: [
      { metricId: 'met-4', direction: 'oscillating', note: 'Cycling between 36–50 kWh/T' },
    ],
    confirmations: [{ byUserId: 'u-3', role: 'Regional Expert', ts: now - h(8), rationale: 'Pattern consistent with VFD hunting.' }],
    ownerUserId: 'u-2', comments: [], actionIds: ['act-4', 'act-5'],
    resolutionLog: null,
    audit: [
      { id: uid(), ts: now - h(10), actor: 'system', eventType: 'created', detail: 'Anomaly detected.' },
      { id: uid(), ts: now - h(8), actor: 'user', eventType: 'status_change', detail: 'Status → Action Assigned.' },
    ],
  },
  {
    id: 'ano-5', facilityId: 'fac-1', title: 'Meal Residual Oil Elevated', description: 'Residual oil in meal at 1.4%, above 1.2% limit.',
    severity: 'High', confidence: 0.91, status: 'Mitigation In Progress',
    startTime: now - h(14), area: 'Quality', asset: 'Desolventizer',
    relatedMetricIds: ['met-6', 'met-2'], drivers: [
      { metricId: 'met-6', direction: 'up', note: 'Reached 1.4%' },
    ],
    confirmations: [{ byUserId: 'u-1', role: 'Supervisor', ts: now - h(12), rationale: 'Lab test confirmed.' }],
    ownerUserId: 'u-1', comments: [
      { id: uid(), userId: 'u-1', ts: now - h(12), text: 'Quality alert — meal oil too high. Adjusting DT temperature.' },
    ],
    actionIds: ['act-6', 'act-7'], resolutionLog: null,
    audit: [
      { id: uid(), ts: now - h(14), actor: 'system', eventType: 'created', detail: 'Anomaly detected.' },
      { id: uid(), ts: now - h(12), actor: 'user', eventType: 'status_change', detail: 'Status → Mitigation In Progress.' },
    ],
  },
  {
    id: 'ano-6', facilityId: 'fac-1', title: 'Conditioner Moisture Sensor Drift', description: 'Sensor reading diverged from lab values.',
    severity: 'Info', confidence: 0.55, status: 'False Positive',
    startTime: now - h(48), endTime: now - h(44), area: 'Prep', asset: 'Conditioner',
    relatedMetricIds: ['met-8'], drivers: [
      { metricId: 'met-8', direction: 'oscillating', note: 'Sensor noise' },
    ],
    confirmations: [], ownerUserId: undefined,
    comments: [{ id: uid(), userId: 'u-2', ts: now - h(44), text: 'Compared with lab — sensor was reading correctly. False alarm.' }],
    actionIds: [], resolutionLog: null,
    audit: [
      { id: uid(), ts: now - h(48), actor: 'system', eventType: 'created', detail: 'Anomaly detected.' },
      { id: uid(), ts: now - h(44), actor: 'user', eventType: 'status_change', detail: 'Marked as False Positive.' },
    ],
  },
  {
    id: 'ano-7', facilityId: 'fac-1', title: 'Hexane Recovery Efficiency Loss', description: 'Hexane loss rate exceeded threshold, resolved after valve repair.',
    severity: 'Medium', confidence: 0.83, status: 'Resolved',
    startTime: now - h(72), endTime: now - h(60), area: 'Extraction', asset: 'Solvent Recovery',
    relatedMetricIds: ['met-7'], drivers: [
      { metricId: 'met-7', direction: 'up', note: 'Loss at 1.1 L/T' },
    ],
    confirmations: [{ byUserId: 'u-2', role: 'Process Engineer', ts: now - h(70), rationale: 'Confirmed via mass balance.' }],
    ownerUserId: 'u-2',
    comments: [{ id: uid(), userId: 'u-2', ts: now - h(62), text: 'Valve replaced, hexane loss back to normal.' }],
    actionIds: ['act-8'],
    resolutionLog: {
      rootCauseCategory: 'Equipment', rootCauseDescription: 'Check valve on condenser return line was stuck open.',
      correctiveActionsSummary: 'Replaced check valve CV-301.', preventiveActions: 'Added CV-301 to quarterly inspection list.',
      verificationMethod: 'Metric stable', verificationWindowHours: 8, evidenceLinks: [],
      approverUserId: 'u-1', resolvedAt: now - h(60),
    },
    audit: [
      { id: uid(), ts: now - h(72), actor: 'system', eventType: 'created', detail: 'Anomaly detected.' },
      { id: uid(), ts: now - h(60), actor: 'user', eventType: 'resolved', detail: 'Resolved by Marco Rodriguez.' },
    ],
  },
  {
    id: 'ano-8', facilityId: 'fac-2', title: 'Bayport Throughput Variance', description: 'Throughput fluctuating outside normal band at Bayport.',
    severity: 'Medium', confidence: 0.72, status: 'New',
    startTime: now - h(2), area: 'Extraction', asset: 'Main Press',
    relatedMetricIds: ['met-12', 'met-13'], drivers: [
      { metricId: 'met-12', direction: 'oscillating', note: 'Unstable throughput' },
    ],
    confirmations: [], ownerUserId: undefined, comments: [], actionIds: [],
    resolutionLog: null,
    audit: [{ id: uid(), ts: now - h(2), actor: 'system', eventType: 'created', detail: 'Anomaly detected.' }],
  },
];

// ── Actions ──
export const actions: Action[] = [
  { id: 'act-1', anomalyId: 'ano-1', title: 'Inspect Main Press bearings', type: 'Inspect', assigneeGroup: 'Maintenance', assigneeName: 'John K.', priority: 'High', dueAt: now + h(4), status: 'In Progress', notes: [{ ts: now - h(1), userId: 'u-1', text: 'Vibration analysis scheduled.' }] },
  { id: 'act-2', anomalyId: 'ano-1', title: 'Check press feed rate controls', type: 'Calibrate', assigneeGroup: 'Instrumentation', priority: 'High', dueAt: now + h(6), status: 'New', notes: [] },
  { id: 'act-3', anomalyId: 'ano-3', title: 'Adjust solvent-to-seed ratio', type: 'Adjust', assigneeGroup: 'Operations', priority: 'Medium', dueAt: now + h(8), status: 'Accepted', notes: [] },
  { id: 'act-4', anomalyId: 'ano-4', title: 'Inspect VFD parameters', type: 'Inspect', assigneeGroup: 'Electrician', priority: 'Low', dueAt: now + h(12), status: 'New', notes: [] },
  { id: 'act-5', anomalyId: 'ano-4', title: 'Calibrate power meter', type: 'Calibrate', assigneeGroup: 'Instrumentation', priority: 'Low', dueAt: now + h(24), status: 'New', notes: [] },
  { id: 'act-6', anomalyId: 'ano-5', title: 'Increase DT temperature by 5°C', type: 'Adjust', assigneeGroup: 'Operations', assigneeName: 'Lisa M.', priority: 'High', dueAt: now + h(2), status: 'In Progress', notes: [{ ts: now - h(10), userId: 'u-1', text: 'Adjusted from 105°C to 110°C.' }] },
  { id: 'act-7', anomalyId: 'ano-5', title: 'Clean DT trays', type: 'Clean', assigneeGroup: 'Maintenance', priority: 'Medium', dueAt: now + h(48), status: 'New', notes: [] },
  { id: 'act-8', anomalyId: 'ano-7', title: 'Replace check valve CV-301', type: 'Replace', assigneeGroup: 'Maintenance', assigneeName: 'Tom R.', priority: 'High', dueAt: now - h(62), status: 'Verified', notes: [{ ts: now - h(62), userId: 'u-2', text: 'Valve replaced and tested.' }] },
  { id: 'act-9', anomalyId: 'ano-2', title: 'Inspect boiler feed water quality', type: 'Inspect', assigneeGroup: 'Operations', priority: 'Medium', dueAt: now + h(6), status: 'New', notes: [] },
  { id: 'act-10', anomalyId: 'ano-8', title: 'Check press hydraulic pressure', type: 'Inspect', assigneeGroup: 'Maintenance', priority: 'Medium', dueAt: now + h(10), status: 'New', notes: [] },
];

// ── Notifications ──
export const notifications: AppNotification[] = [
  { id: 'n-1', ts: now - m(10), title: 'Critical: Throughput Drop on Main Press', read: false },
  { id: 'n-2', ts: now - m(30), title: 'Steam Consumption Spike detected', read: false },
  { id: 'n-3', ts: now - h(1), title: 'Action act-1 started by John K.', read: true },
  { id: 'n-4', ts: now - h(2), title: 'Anomaly ano-3 confirmed by Sarah Chen', read: true },
  { id: 'n-5', ts: now - h(5), title: 'Meal Residual Oil mitigation in progress', read: true },
];
