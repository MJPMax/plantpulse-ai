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

  // ── Leading Indicator Metrics (Standard Metrics for Anomalies) ──
  // Extraction
  { id: 'li-1', facilityId: 'fac-1', name: 'Distillation Vacuum', unit: 'mmHg', area: 'Extraction', asset: 'Distillation', normalRange: { min: 680, max: 720 }, tags: ['distillation', 'vacuum'], description: 'Distillation column vacuum pressure', timeseries: genTimeseries(24, 700, 15) },
  { id: 'li-2', facilityId: 'fac-1', name: 'DT Dome Temperature', unit: '°C', area: 'Extraction', asset: 'Desolventizer-Toaster', normalRange: { min: 60, max: 75 }, tags: ['dt', 'temperature'], description: 'Desolventizer-Toaster dome temperature', timeseries: genTimeseries(24, 68, 5) },
  { id: 'li-3', facilityId: 'fac-1', name: 'DT Deck Steam Flow', unit: 'kg/h', area: 'Extraction', asset: 'Desolventizer-Toaster', normalRange: { min: 800, max: 1200 }, tags: ['dt', 'steam'], description: 'DT deck steam flow rate', timeseries: genTimeseries(24, 1000, 100) },
  { id: 'li-4', facilityId: 'fac-1', name: 'DT Sparge Steam Flow', unit: 'kg/h', area: 'Extraction', asset: 'Desolventizer-Toaster', normalRange: { min: 200, max: 400 }, tags: ['dt', 'sparge', 'steam'], description: 'DT sparge steam flow rate', timeseries: genTimeseries(24, 300, 50) },
  { id: 'li-5', facilityId: 'fac-1', name: 'DT %FLA', unit: '%', area: 'Extraction', asset: 'Desolventizer-Toaster', normalRange: { min: 50, max: 80 }, tags: ['dt', 'fla'], description: 'DT full load amperage percentage', timeseries: genTimeseries(24, 65, 10) },
  { id: 'li-6', facilityId: 'fac-1', name: 'Extraction Final Vent LEL', unit: '%LEL', area: 'Extraction', asset: 'Final Vent', normalRange: { min: 0, max: 20 }, tags: ['extraction', 'lel', 'safety'], description: 'Extraction final vent lower explosive limit', timeseries: genTimeseries(24, 8, 5) },
  { id: 'li-7', facilityId: 'fac-1', name: 'Extractor Pressure', unit: 'mbar', area: 'Extraction', asset: 'Extractor', normalRange: { min: -5, max: 5 }, tags: ['extractor', 'pressure'], description: 'Extractor operating pressure', timeseries: genTimeseries(24, 0.5, 3) },
  { id: 'li-8', facilityId: 'fac-1', name: 'Solvent Ratio', unit: 'ratio', area: 'Extraction', asset: 'Solvent System', normalRange: { min: 0.8, max: 1.2 }, tags: ['solvent', 'ratio'], description: 'Solvent-to-feed ratio', timeseries: genTimeseries(24, 1.0, 0.12) },
  { id: 'li-9', facilityId: 'fac-1', name: 'Solvent Temperature to Extractor', unit: '°C', area: 'Extraction', asset: 'Solvent System', normalRange: { min: 50, max: 60 }, tags: ['solvent', 'temperature'], description: 'Solvent feed temperature', timeseries: genTimeseries(24, 55, 3) },
  { id: 'li-10', facilityId: 'fac-1', name: 'Hexane Heater Steam Flow', unit: 'kg/h', area: 'Extraction', asset: 'Hexane Heater', normalRange: { min: 400, max: 600 }, tags: ['hexane', 'steam'], description: 'Hexane heater steam flow', timeseries: genTimeseries(24, 500, 50) },
  { id: 'li-11', facilityId: 'fac-1', name: 'Reboiler Temperature', unit: '°C', area: 'Extraction', asset: 'Reboiler', normalRange: { min: 105, max: 115 }, tags: ['reboiler', 'temperature'], description: 'Reboiler operating temperature', timeseries: genTimeseries(24, 110, 3) },
  { id: 'li-12', facilityId: 'fac-1', name: 'Reboiler Steam Flow', unit: 'kg/h', area: 'Extraction', asset: 'Reboiler', normalRange: { min: 600, max: 900 }, tags: ['reboiler', 'steam'], description: 'Reboiler steam flow rate', timeseries: genTimeseries(24, 750, 75) },
  { id: 'li-13', facilityId: 'fac-1', name: 'Oil Stripper Delta Pressure', unit: 'mbar', area: 'Extraction', asset: 'Oil Stripper', normalRange: { min: 10, max: 30 }, tags: ['oil-stripper', 'pressure'], description: 'Oil stripper differential pressure', timeseries: genTimeseries(24, 20, 5) },
  // Preparation
  { id: 'li-14', facilityId: 'fac-1', name: 'Flake Thickness', unit: 'mm', area: 'Preparation', asset: 'Flaker', normalRange: { min: 0.25, max: 0.35 }, tags: ['flake', 'thickness'], description: 'Flake thickness measurement', timeseries: genTimeseries(24, 0.30, 0.03) },
  { id: 'li-15', facilityId: 'fac-1', name: 'Flaker Full Load Amperage', unit: '%FLA', area: 'Preparation', asset: 'Flaker', normalRange: { min: 60, max: 85 }, tags: ['flaker', 'amps'], description: 'Flaker motor load', timeseries: genTimeseries(24, 72, 8) },
  { id: 'li-16', facilityId: 'fac-1', name: 'Expeller Torque', unit: 'Nm', area: 'Preparation', asset: 'Expeller', normalRange: { min: 800, max: 1200 }, tags: ['expeller', 'torque'], description: 'Expeller screw torque', timeseries: genTimeseries(24, 1000, 100) },
  { id: 'li-17', facilityId: 'fac-1', name: 'Cooking Discharge Temperature', unit: '°C', area: 'Preparation', asset: 'Cooker', normalRange: { min: 85, max: 95 }, tags: ['cooking', 'temperature'], description: 'Cooking discharge temperature', timeseries: genTimeseries(24, 90, 3) },
  { id: 'li-18', facilityId: 'fac-1', name: 'Conditioning Discharge Temperature', unit: '°C', area: 'Preparation', asset: 'Conditioner', normalRange: { min: 55, max: 65 }, tags: ['conditioning', 'temperature'], description: 'Conditioning discharge temperature', timeseries: genTimeseries(24, 60, 3) },
  // Boiler / Utilities
  { id: 'li-19', facilityId: 'fac-1', name: 'Boiler Steam Pressure', unit: 'bar', area: 'Utilities', asset: 'Boiler', normalRange: { min: 8, max: 12 }, tags: ['boiler', 'pressure'], description: 'Main boiler steam pressure', timeseries: genTimeseries(24, 10, 1) },
  { id: 'li-20', facilityId: 'fac-1', name: 'Boiler Feedwater Temperature', unit: '°C', area: 'Utilities', asset: 'Boiler', normalRange: { min: 85, max: 105 }, tags: ['boiler', 'feedwater', 'temperature'], description: 'Boiler feedwater temperature', timeseries: genTimeseries(24, 95, 5) },
  { id: 'li-21', facilityId: 'fac-1', name: 'Flue Gas Oxygen Concentration', unit: '%', area: 'Utilities', asset: 'Boiler', normalRange: { min: 3, max: 6 }, tags: ['flue-gas', 'oxygen'], description: 'Flue gas O2 concentration', timeseries: genTimeseries(24, 4.5, 1) },
  { id: 'li-22', facilityId: 'fac-1', name: 'Boiler Water Conductivity', unit: 'µS/cm', area: 'Utilities', asset: 'Boiler', normalRange: { min: 1000, max: 3000 }, tags: ['boiler', 'conductivity'], description: 'Boiler water conductivity inline', timeseries: genTimeseries(24, 2000, 400) },
  // Dehulling
  { id: 'li-23', facilityId: 'fac-1', name: 'Cracker Top Roll FLA', unit: '%FLA', area: 'Dehulling', asset: 'First Stage Cracker', normalRange: { min: 50, max: 75 }, tags: ['cracker', 'amps'], description: 'Hot dehulling 1st stage cracker top roll load', timeseries: genTimeseries(24, 62, 7) },
  { id: 'li-24', facilityId: 'fac-1', name: 'Primary Aspiration Delta P', unit: 'Pa', area: 'Dehulling', asset: 'Aspiration', normalRange: { min: 200, max: 400 }, tags: ['aspiration', 'pressure'], description: 'Primary aspiration differential pressure', timeseries: genTimeseries(24, 300, 50) },
];

// ── Anomalies (all based on Leading Indicator / Standard Metrics) ──
export const anomalies: Anomaly[] = [
  {
    id: 'ano-1', facilityId: 'fac-1', title: 'DT Dome Temperature Drop', description: 'Desolventizer-Toaster dome temperature dropped below 60°C, indicating poor solvent stripping. Risk of elevated solvent in meal.',
    severity: 'Critical', confidence: 0.94, status: 'Under Review',
    startTime: now - h(24), area: 'Extraction', asset: 'Desolventizer-Toaster', healthScore: 38,
    relatedMetricIds: ['li-2', 'li-3', 'li-4', 'li-5'], drivers: [
      { metricId: 'li-2', direction: 'down', note: 'Dome temp dropped from 68°C to 56°C' },
      { metricId: 'li-3', direction: 'down', note: 'DT deck steam flow reduced 15%' },
      { metricId: 'li-5', direction: 'up', note: 'DT %FLA climbing — bed compaction' },
    ],
    confirmations: [{ byUserId: 'u-2', role: 'Process Engineer', ts: now - h(2), rationale: 'Verified on DCS — dome temp below spec. Steam supply issue suspected.' }],
    ownerUserId: 'u-1', comments: [
      { id: uid(), userId: 'u-2', ts: now - h(2), text: 'DCS confirms dome temp at 56°C. Deck steam flow also low. Checking steam header pressure.' },
    ],
    actionIds: ['act-1', 'act-2'], resolutionLog: null,
    audit: [
      { id: uid(), ts: now - h(3), actor: 'system', eventType: 'created', detail: 'Anomaly detected by AI model — DT Dome Temperature below threshold.' },
      { id: uid(), ts: now - h(2.5), actor: 'user', eventType: 'status_change', detail: 'Status → Under Review by Sarah Chen.' },
      { id: uid(), ts: now - h(2), actor: 'user', eventType: 'confirmation', detail: 'Confirmed by Marco Rodriguez (Process Engineer).' },
    ],
  },
  {
    id: 'ano-2', facilityId: 'fac-1', title: 'Extraction Final Vent LEL Spike', description: 'Final vent LEL reading spiked to 18% LEL, approaching safety threshold of 20%.',
    severity: 'High', confidence: 0.91, status: 'New',
    startTime: now - h(24), area: 'Extraction', asset: 'Final Vent', healthScore: 52,
    relatedMetricIds: ['li-6', 'li-7', 'li-1'], drivers: [
      { metricId: 'li-6', direction: 'up', note: 'LEL spiked to 18% (limit 20%)' },
      { metricId: 'li-7', direction: 'up', note: 'Extractor pressure slightly positive' },
    ],
    confirmations: [], ownerUserId: undefined, comments: [], actionIds: [],
    resolutionLog: null,
    audit: [{ id: uid(), ts: now - h(1.5), actor: 'system', eventType: 'created', detail: 'Anomaly detected — Final Vent LEL approaching safety limit.' }],
  },
  {
    id: 'ano-3', facilityId: 'fac-1', title: 'Solvent Ratio Out of Spec', description: 'Solvent-to-feed ratio dropped to 0.75, below minimum 0.80. Extraction efficiency at risk.',
    severity: 'Medium', confidence: 0.82, status: 'Confirmed',
    startTime: now - h(24), area: 'Extraction', asset: 'Solvent System', healthScore: 61,
    relatedMetricIds: ['li-8', 'li-9', 'li-10'], drivers: [
      { metricId: 'li-8', direction: 'down', note: 'Ratio dropped to 0.75 (min 0.80)' },
      { metricId: 'li-9', direction: 'down', note: 'Solvent temp low — 48°C vs 50°C target' },
    ],
    confirmations: [{ byUserId: 'u-1', role: 'Supervisor', ts: now - h(5), rationale: 'Lab results show reduced oil yield. Solvent ratio confirmed low.' }],
    ownerUserId: 'u-2', comments: [
      { id: uid(), userId: 'u-1', ts: now - h(5), text: 'Lab confirmed — oil yield down. Solvent flow valve may be partially closed.' },
    ],
    actionIds: ['act-3'], resolutionLog: null,
    audit: [
      { id: uid(), ts: now - h(6), actor: 'system', eventType: 'created', detail: 'Anomaly detected — Solvent Ratio below spec.' },
      { id: uid(), ts: now - h(5), actor: 'user', eventType: 'confirmation', detail: 'Confirmed by Sarah Chen.' },
    ],
  },
  {
    id: 'ano-4', facilityId: 'fac-1', title: 'Flaker Roll Pressure Imbalance', description: 'Left and right flaker roll pressures diverging. Flake thickness uniformity at risk.',
    severity: 'Low', confidence: 0.68, status: 'Action Assigned',
    startTime: now - h(24), area: 'Preparation', asset: 'Flaker', healthScore: 67,
    relatedMetricIds: ['li-14', 'li-15'], drivers: [
      { metricId: 'li-14', direction: 'oscillating', note: 'Flake thickness varying 0.22–0.38mm' },
      { metricId: 'li-15', direction: 'up', note: 'Flaker FLA climbing — 82% vs 72% normal' },
    ],
    confirmations: [{ byUserId: 'u-3', role: 'Regional Expert', ts: now - h(8), rationale: 'Pattern indicates roll pressure imbalance. Common wear issue.' }],
    ownerUserId: 'u-2', comments: [], actionIds: ['act-4', 'act-5'],
    resolutionLog: null,
    audit: [
      { id: uid(), ts: now - h(10), actor: 'system', eventType: 'created', detail: 'Anomaly detected — Flaker pressure imbalance.' },
      { id: uid(), ts: now - h(8), actor: 'user', eventType: 'status_change', detail: 'Status → Action Assigned.' },
    ],
  },
  {
    id: 'ano-5', facilityId: 'fac-1', title: 'Reboiler Temperature Drift High', description: 'Reboiler temperature trending above 115°C, risking oil degradation and increased hexane loss.',
    severity: 'High', confidence: 0.89, status: 'Mitigation In Progress',
    startTime: now - h(24), area: 'Extraction', asset: 'Reboiler', healthScore: 45,
    relatedMetricIds: ['li-11', 'li-12', 'li-13'], drivers: [
      { metricId: 'li-11', direction: 'up', note: 'Reboiler temp at 118°C (max 115°C)' },
      { metricId: 'li-12', direction: 'up', note: 'Steam flow elevated — 920 kg/h' },
    ],
    confirmations: [{ byUserId: 'u-1', role: 'Supervisor', ts: now - h(12), rationale: 'Confirmed high temp on field reading.' }],
    ownerUserId: 'u-1', comments: [
      { id: uid(), userId: 'u-1', ts: now - h(12), text: 'Throttling reboiler steam valve. Monitoring temperature response.' },
    ],
    actionIds: ['act-6', 'act-7'], resolutionLog: null,
    audit: [
      { id: uid(), ts: now - h(14), actor: 'system', eventType: 'created', detail: 'Anomaly detected — Reboiler temperature above limit.' },
      { id: uid(), ts: now - h(12), actor: 'user', eventType: 'status_change', detail: 'Status → Mitigation In Progress.' },
    ],
  },
  {
    id: 'ano-6', facilityId: 'fac-1', title: 'Conditioning Discharge Temp Sensor Drift', description: 'Conditioning discharge temperature sensor showing erratic readings inconsistent with process state.',
    severity: 'Info', confidence: 0.52, status: 'False Positive',
    startTime: now - h(48), endTime: now - h(24), area: 'Preparation', asset: 'Conditioner', healthScore: 58,
    relatedMetricIds: ['li-18'], drivers: [
      { metricId: 'li-18', direction: 'oscillating', note: 'Readings fluctuating ±8°C in 10 minutes' },
    ],
    confirmations: [], ownerUserId: undefined,
    comments: [{ id: uid(), userId: 'u-2', ts: now - h(44), text: 'Compared with redundant sensor — primary reading correct. Noise from electrical interference, now resolved.' }],
    actionIds: [], resolutionLog: null,
    audit: [
      { id: uid(), ts: now - h(48), actor: 'system', eventType: 'created', detail: 'Anomaly detected — Conditioning temperature erratic.' },
      { id: uid(), ts: now - h(44), actor: 'user', eventType: 'status_change', detail: 'Marked as False Positive.' },
    ],
  },
  {
    id: 'ano-7', facilityId: 'fac-1', title: 'Distillation Vacuum Loss', description: 'Distillation vacuum degraded to 660 mmHg, resolved after condenser cleaning.',
    severity: 'Medium', confidence: 0.85, status: 'Resolved',
    startTime: now - h(72), endTime: now - h(48), area: 'Extraction', asset: 'Distillation', healthScore: 55,
    relatedMetricIds: ['li-1', 'li-11'], drivers: [
      { metricId: 'li-1', direction: 'down', note: 'Vacuum dropped to 660 mmHg' },
    ],
    confirmations: [{ byUserId: 'u-2', role: 'Process Engineer', ts: now - h(70), rationale: 'Confirmed via vacuum gauge comparison. Condenser fouled.' }],
    ownerUserId: 'u-2',
    comments: [{ id: uid(), userId: 'u-2', ts: now - h(62), text: 'Condenser cleaned, vacuum restored to 705 mmHg.' }],
    actionIds: ['act-8'],
    resolutionLog: {
      rootCauseCategory: 'Equipment', rootCauseDescription: 'Distillation condenser fouled with scale buildup, reducing heat transfer and vacuum.',
      correctiveActionsSummary: 'Condenser cleaned with chemical descaling procedure.', preventiveActions: 'Added condenser to monthly inspection schedule.',
      verificationMethod: 'Metric stable', verificationWindowHours: 8, evidenceLinks: [],
      approverUserId: 'u-1', resolvedAt: now - h(60),
    },
    audit: [
      { id: uid(), ts: now - h(72), actor: 'system', eventType: 'created', detail: 'Anomaly detected — Distillation vacuum loss.' },
      { id: uid(), ts: now - h(60), actor: 'user', eventType: 'resolved', detail: 'Resolved by Marco Rodriguez.' },
    ],
  },
  {
    id: 'ano-8', facilityId: 'fac-1', title: 'Boiler Feedwater Temperature Low', description: 'Boiler feedwater temperature dropped to 82°C, affecting steam generation efficiency.',
    severity: 'Medium', confidence: 0.76, status: 'New',
    startTime: now - h(24), area: 'Utilities', asset: 'Boiler', healthScore: 63,
    relatedMetricIds: ['li-20', 'li-19', 'li-22'], drivers: [
      { metricId: 'li-20', direction: 'down', note: 'Feedwater temp at 82°C (min 85°C)' },
      { metricId: 'li-19', direction: 'down', note: 'Steam pressure slightly low — 7.8 bar' },
    ],
    confirmations: [], ownerUserId: undefined, comments: [], actionIds: ['act-10'],
    resolutionLog: null,
    audit: [{ id: uid(), ts: now - h(2), actor: 'system', eventType: 'created', detail: 'Anomaly detected — Boiler feedwater temperature low.' }],
  },
];

// ── Actions ──
export const actions: Action[] = [
  { id: 'act-1', anomalyId: 'ano-1', title: 'Check steam header pressure and supply to DT', type: 'Inspect', assigneeGroup: 'Operations', assigneeName: 'John K.', priority: 'High', dueAt: now + h(4), status: 'In Progress', notes: [{ ts: now - h(1), userId: 'u-1', text: 'Steam header at 8.2 bar — slightly low. Investigating trap on line 3.' }] },
  { id: 'act-2', anomalyId: 'ano-1', title: 'Calibrate DT dome temperature sensor', type: 'Calibrate', assigneeGroup: 'Instrumentation', priority: 'High', dueAt: now + h(6), status: 'New', notes: [] },
  { id: 'act-3', anomalyId: 'ano-3', title: 'Adjust solvent flow valve and verify ratio', type: 'Adjust', assigneeGroup: 'Operations', priority: 'Medium', dueAt: now + h(8), status: 'Accepted', notes: [] },
  { id: 'act-4', anomalyId: 'ano-4', title: 'Inspect flaker roll bearings and alignment', type: 'Inspect', assigneeGroup: 'Maintenance', priority: 'Low', dueAt: now + h(12), status: 'New', notes: [] },
  { id: 'act-5', anomalyId: 'ano-4', title: 'Calibrate flaker roll pressure sensors L/R', type: 'Calibrate', assigneeGroup: 'Instrumentation', priority: 'Low', dueAt: now + h(24), status: 'New', notes: [] },
  { id: 'act-6', anomalyId: 'ano-5', title: 'Throttle reboiler steam valve to reduce temp', type: 'Adjust', assigneeGroup: 'Operations', assigneeName: 'Lisa M.', priority: 'High', dueAt: now + h(2), status: 'In Progress', notes: [{ ts: now - h(10), userId: 'u-1', text: 'Valve throttled from 75% to 60%. Monitoring temp response.' }] },
  { id: 'act-7', anomalyId: 'ano-5', title: 'Inspect reboiler steam control valve positioner', type: 'Inspect', assigneeGroup: 'Instrumentation', priority: 'Medium', dueAt: now + h(48), status: 'New', notes: [] },
  { id: 'act-8', anomalyId: 'ano-7', title: 'Clean distillation condenser', type: 'Clean', assigneeGroup: 'Maintenance', assigneeName: 'Tom R.', priority: 'High', dueAt: now - h(62), status: 'Verified', notes: [{ ts: now - h(62), userId: 'u-2', text: 'Condenser descaled and tested. Vacuum restored to 705 mmHg.' }] },
  { id: 'act-9', anomalyId: 'ano-2', title: 'Inspect extraction vent system and seals', type: 'Inspect', assigneeGroup: 'Maintenance', priority: 'High', dueAt: now + h(4), status: 'New', notes: [] },
  { id: 'act-10', anomalyId: 'ano-8', title: 'Inspect deaerator steam supply and traps', type: 'Inspect', assigneeGroup: 'Maintenance', priority: 'Medium', dueAt: now + h(10), status: 'New', notes: [] },
];

// ── Notifications ──
export const notifications: AppNotification[] = [
  { id: 'n-1', ts: now - m(10), title: 'Critical: DT Dome Temperature below threshold', read: false },
  { id: 'n-2', ts: now - m(30), title: 'High: Extraction Final Vent LEL spike to 18%', read: false },
  { id: 'n-3', ts: now - h(1), title: 'Action: Steam header inspection started by John K.', read: true },
  { id: 'n-4', ts: now - h(2), title: 'Anomaly: Solvent Ratio confirmed by Sarah Chen', read: true },
  { id: 'n-5', ts: now - h(5), title: 'Reboiler temperature mitigation in progress', read: true },
];
