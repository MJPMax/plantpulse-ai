import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Facility, User, Metric, Anomaly, Action, TimeRangePreset,
  AnomalyStatus, ActionStatus, ResolutionLog, AppNotification,
  KnowledgeFile, KnowledgeScenario,
} from './types';
import {
  facilities as defFacilities,
  users as defUsers,
  metrics as defMetrics,
  anomalies as defAnomalies,
  actions as defActions,
  notifications as defNotifications,
  knowledgeFiles as defKnowledgeFiles,
  knowledgeScenarios as defKnowledgeScenarios,
} from './mockData';
import { uid, confirmationsNeeded } from './utils';

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  ts: number;
}

interface StoreState {
  // Data
  facilities: Facility[];
  users: User[];
  metrics: Metric[];
  anomalies: Anomaly[];
  actions: Action[];
  notifications: AppNotification[];
  chatMessages: ChatMessage[];
  knowledgeFiles: KnowledgeFile[];
  knowledgeScenarios: KnowledgeScenario[];

  // UI state
  currentFacilityId: string;
  currentUserId: string;
  timeRange: TimeRangePreset;
  searchQuery: string;

  // Setters
  setFacility: (id: string) => void;
  setTimeRange: (r: TimeRangePreset) => void;
  setCurrentUser: (id: string) => void;
  setSearchQuery: (q: string) => void;

  // Anomaly actions
  addComment: (anomalyId: string, text: string) => void;
  editNarrative: (anomalyId: string, text: string) => void;
  confirmAnomaly: (anomalyId: string, rationale: string) => void;
  setAnomalyStatus: (anomalyId: string, status: AnomalyStatus) => void;
  setResolutionLog: (anomalyId: string, log: ResolutionLog) => void;
  markResolved: (anomalyId: string) => boolean;

  // Action actions
  createAction: (anomalyId: string, fields: Omit<Action, 'id' | 'anomalyId' | 'notes'>) => void;
  updateActionStatus: (actionId: string, status: ActionStatus) => void;
  updateAction: (actionId: string, fields: Partial<Omit<Action, 'id' | 'anomalyId' | 'notes'>>) => void;
  addActionNote: (actionId: string, text: string) => void;

  // Chat
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'ts'>) => void;
  clearChat: () => void;

  // Knowledge Library
  uploadKnowledgeFile: (fields: Omit<KnowledgeFile, 'id' | 'uploadedAt' | 'scenarioCount' | 'scenarioIds'>, scenarioCount: number) => string;
  archiveKnowledgeFile: (fileId: string) => void;
  deleteKnowledgeFile: (fileId: string) => void;
  searchScenarios: (query: string, filters?: { area?: string; causeType?: string; metricId?: string }) => KnowledgeScenario[];

  // Reset
  resetDemoData: () => void;
}

const addAuditEvent = (a: Anomaly, actor: 'system' | 'user' | 'ai', eventType: string, detail: string) => {
  a.audit.push({ id: uid(), ts: Date.now(), actor, eventType, detail });
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      facilities: defFacilities,
      users: defUsers,
      metrics: defMetrics,
      anomalies: defAnomalies,
      actions: defActions,
      notifications: defNotifications,
      chatMessages: [],
      knowledgeFiles: defKnowledgeFiles,
      knowledgeScenarios: defKnowledgeScenarios,

      currentFacilityId: 'fac-1',
      currentUserId: 'u-1',
      timeRange: '24h',
      searchQuery: '',

      setFacility: (id) => set({ currentFacilityId: id }),
      setTimeRange: (r) => set({ timeRange: r }),
      setCurrentUser: (id) => set({ currentUserId: id }),
      setSearchQuery: (q) => set({ searchQuery: q }),

      addComment: (anomalyId, text) => set((s) => ({
        anomalies: s.anomalies.map((a) => {
          if (a.id !== anomalyId) return a;
          const updated = { ...a, comments: [...a.comments, { id: uid(), userId: s.currentUserId, ts: Date.now(), text }] };
          addAuditEvent(updated, 'user', 'comment', `Comment added by ${s.users.find((u) => u.id === s.currentUserId)?.name}.`);
          return updated;
        }),
      })),

      editNarrative: (anomalyId, text) => set((s) => ({
        anomalies: s.anomalies.map((a) => {
          if (a.id !== anomalyId) return a;
          const updated = { ...a, description: text };
          addAuditEvent(updated, 'user', 'narrative_edit', 'Description updated.');
          return updated;
        }),
      })),

      confirmAnomaly: (anomalyId, rationale) => set((s) => {
        const user = s.users.find((u) => u.id === s.currentUserId);
        if (!user) return s;
        return {
          anomalies: s.anomalies.map((a) => {
            if (a.id !== anomalyId) return a;
            if (a.confirmations.some((c) => c.byUserId === user.id)) return a;
            const updated = { ...a, confirmations: [...a.confirmations, { byUserId: user.id, role: user.role, ts: Date.now(), rationale }] };
            addAuditEvent(updated, 'user', 'confirmation', `Confirmed by ${user.name} (${user.role}).`);
            if (updated.confirmations.length >= confirmationsNeeded(updated.severity)) {
              updated.status = 'Confirmed';
              addAuditEvent(updated, 'system', 'status_change', 'Status → Confirmed (governance met).');
            }
            return updated;
          }),
        };
      }),

      setAnomalyStatus: (anomalyId, status) => set((s) => ({
        anomalies: s.anomalies.map((a) => {
          if (a.id !== anomalyId) return a;
          const updated = { ...a, status };
          const userName = s.users.find((u) => u.id === s.currentUserId)?.name ?? 'Unknown';
          addAuditEvent(updated, 'user', 'status_change', `Status → ${status} by ${userName}.`);
          return updated;
        }),
      })),

      setResolutionLog: (anomalyId, log) => set((s) => ({
        anomalies: s.anomalies.map((a) => a.id === anomalyId ? { ...a, resolutionLog: log } : a),
      })),

      markResolved: (anomalyId) => {
        const a = get().anomalies.find((x) => x.id === anomalyId);
        if (!a || !a.resolutionLog || !a.resolutionLog.rootCauseCategory || !a.resolutionLog.rootCauseDescription) return false;
        get().setAnomalyStatus(anomalyId, 'Resolved');
        return true;
      },

      createAction: (anomalyId, fields) => set((s) => {
        const id = `act-${uid()}`;
        const newAction: Action = { ...fields, id, anomalyId, notes: [] };
        const anomalies = s.anomalies.map((a) => {
          if (a.id !== anomalyId) return a;
          const updated = { ...a, actionIds: [...a.actionIds, id] };
          addAuditEvent(updated, 'user', 'action_created', `Action "${fields.title}" created.`);
          if (updated.status === 'Confirmed') {
            updated.status = 'Action Assigned';
            addAuditEvent(updated, 'system', 'status_change', 'Status → Action Assigned.');
          }
          return updated;
        });
        return { actions: [...s.actions, newAction], anomalies };
      }),

      updateActionStatus: (actionId, status) => set((s) => ({
        actions: s.actions.map((a) => a.id === actionId ? { ...a, status } : a),
      })),

      updateAction: (actionId, fields) => set((s) => ({
        actions: s.actions.map((a) => a.id === actionId ? { ...a, ...fields } : a),
      })),

      addActionNote: (actionId, text) => set((s) => ({
        actions: s.actions.map((a) => a.id === actionId ? { ...a, notes: [...a.notes, { ts: Date.now(), userId: s.currentUserId, text }] } : a),
      })),

      addChatMessage: (msg) => set((s) => ({
        chatMessages: [...s.chatMessages, { ...msg, id: uid(), ts: Date.now() }],
      })),
      clearChat: () => set({ chatMessages: [] }),

      // Knowledge Library methods
      uploadKnowledgeFile: (fields, scenarioCount) => {
        const s = get();
        const id = `kf-${uid()}`;
        const scenarioIds: string[] = [];
        const scenarios: KnowledgeScenario[] = [];

        // Template pools for scenario generation
        const metrics = ['Daily Throughput', 'White Flake Fat', 'Hexane Loss', 'Steam Consumption', 'Extraction Efficiency', 'Meal Residual Oil'];
        const contributors = ['Temperature', 'Pressure', 'Flow Rate', 'Steam Supply', 'Control Loop', 'Equipment Condition'];
        const causes = ['Control valve malfunction', 'Sensor drift', 'Equipment wear', 'Steam supply issue', 'Process parameter deviation', 'Maintenance required'];
        const recommendations = ['Inspect equipment and verify operation', 'Check control loop performance', 'Calibrate sensors and instruments', 'Adjust process parameters', 'Monitor performance and trend data'];

        // Generate mock scenarios based on metadata
        for (let i = 0; i < scenarioCount; i++) {
          const scenarioId = `ks-${uid()}`;
          scenarioIds.push(scenarioId);

          scenarios.push({
            id: scenarioId,
            fileId: id,
            plant: fields.plant,
            area: fields.area,
            processType: fields.area === 'Extraction' ? 'Solvent Extraction' : fields.area === 'Preparation' ? 'Conditioning' : 'Steam Generation',
            productivityMetric: metrics[Math.floor(Math.random() * metrics.length)],
            contributorDeviation: contributors[Math.floor(Math.random() * contributors.length)],
            deviationDirection: Math.random() > 0.5 ? 'High' : 'Low',
            impactImportance: ['Critical - Major / Direct', 'High - Moderate / Direct', 'Medium - Minor / Indirect', 'Low - Negligible'][Math.floor(Math.random() * 4)] as any,
            potentialCause: causes[Math.floor(Math.random() * causes.length)],
            causeType: ['Process Control', 'Operations', 'Maintenance', 'Equipment'][Math.floor(Math.random() * 4)] as any,
            followUpRecommendation: recommendations[Math.floor(Math.random() * recommendations.length)],
            recommendationType: ['Inspect', 'Adjust', 'Monitor', 'Calibrate'][Math.floor(Math.random() * 4)] as any,
            logicPath: `${fields.area} > Simulated > Scenario ${i + 1}`,
            tags: [fields.area.toLowerCase(), 'simulated', 'auto-generated'],
          });
        }

        const newFile: KnowledgeFile = {
          ...fields,
          id,
          uploadedAt: Date.now(),
          scenarioCount,
          scenarioIds,
        };

        set({
          knowledgeFiles: [...s.knowledgeFiles, newFile],
          knowledgeScenarios: [...s.knowledgeScenarios, ...scenarios],
        });

        return id;
      },

      archiveKnowledgeFile: (fileId) => set((s) => ({
        knowledgeFiles: s.knowledgeFiles.map((f) => f.id === fileId ? { ...f, status: 'Archived' as const } : f),
      })),

      deleteKnowledgeFile: (fileId) => set((s) => ({
        knowledgeFiles: s.knowledgeFiles.filter((f) => f.id !== fileId),
        knowledgeScenarios: s.knowledgeScenarios.filter((sc) => sc.fileId !== fileId),
      })),

      searchScenarios: (query, filters) => {
        const s = get();
        let results = s.knowledgeScenarios.filter((sc) => {
          const file = s.knowledgeFiles.find((f) => f.id === sc.fileId);
          return file && file.status === 'Active';
        });

        if (filters?.area) results = results.filter((sc) => sc.area === filters.area);
        if (filters?.causeType) results = results.filter((sc) => sc.causeType === filters.causeType);
        if (filters?.metricId) results = results.filter((sc) => sc.metricId === filters.metricId);

        if (query.trim()) {
          const q = query.toLowerCase();
          results = results.filter((sc) =>
            sc.productivityMetric.toLowerCase().includes(q) ||
            sc.contributorDeviation.toLowerCase().includes(q) ||
            sc.potentialCause.toLowerCase().includes(q) ||
            sc.followUpRecommendation.toLowerCase().includes(q)
          );
        }

        return results;
      },

      resetDemoData: () => {
        localStorage.removeItem('plant-monitor-store');
        set({
          facilities: defFacilities,
          users: defUsers,
          metrics: defMetrics,
          anomalies: defAnomalies,
          actions: defActions,
          notifications: defNotifications,
          chatMessages: [],
          knowledgeFiles: defKnowledgeFiles,
          knowledgeScenarios: defKnowledgeScenarios,
          currentFacilityId: 'fac-1',
          currentUserId: 'u-1',
          timeRange: '24h',
          searchQuery: '',
        });
      },
    }),
    { name: 'plant-monitor-store' }
  )
);
