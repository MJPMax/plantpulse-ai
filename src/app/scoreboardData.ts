import type { Anomaly, Action, User } from './types';

export interface ScoreboardEntry {
  userId: string;
  userName: string;
  score: number;
  scoreLabel: string;
}

export interface ScoreboardCategory {
  id: string;
  title: string;
  description: string;
  entries: ScoreboardEntry[];
}

function userNameMap(users: User[]): Map<string, string> {
  return new Map(users.map((u) => [u.id, u.name]));
}

function median(arr: number[]): number {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function computeScoreboard(
  anomalies: Anomaly[],
  actions: Action[],
  users: User[],
): ScoreboardCategory[] {
  const names = userNameMap(users);
  const userIds = users.map((u) => u.id);

  // ── Top Contributor ──
  // Count: ownerUserId assignments + confirmations + comments
  const contribCounts = new Map<string, number>();
  userIds.forEach((id) => contribCounts.set(id, 0));
  for (const a of anomalies) {
    if (a.ownerUserId && contribCounts.has(a.ownerUserId)) {
      contribCounts.set(a.ownerUserId, (contribCounts.get(a.ownerUserId) ?? 0) + 1);
    }
    for (const c of a.confirmations) {
      if (contribCounts.has(c.byUserId)) {
        contribCounts.set(c.byUserId, (contribCounts.get(c.byUserId) ?? 0) + 1);
      }
    }
    for (const c of a.comments) {
      if (contribCounts.has(c.userId)) {
        contribCounts.set(c.userId, (contribCounts.get(c.userId) ?? 0) + 1);
      }
    }
  }
  // Also count action notes as contributions
  for (const act of actions) {
    for (const n of act.notes) {
      if (contribCounts.has(n.userId)) {
        contribCounts.set(n.userId, (contribCounts.get(n.userId) ?? 0) + 1);
      }
    }
  }
  const topContributor: ScoreboardEntry[] = [...contribCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([uid, count]) => ({
      userId: uid,
      userName: names.get(uid) ?? uid,
      score: count,
      scoreLabel: `${count} inputs`,
    }));

  // ── Action Champion ──
  // Count completed actions (Done or Verified) per assigneeUserId
  const DONE = new Set(['Done', 'Verified']);
  const actionCounts = new Map<string, number>();
  userIds.forEach((id) => actionCounts.set(id, 0));
  for (const act of actions) {
    if (act.assigneeUserId && DONE.has(act.status) && actionCounts.has(act.assigneeUserId)) {
      let pts = 1;
      // Bonus if completed before due date
      if (act.completedAt && act.completedAt < act.dueAt) pts += 0.5;
      actionCounts.set(act.assigneeUserId, (actionCounts.get(act.assigneeUserId) ?? 0) + pts);
    }
  }
  const actionChampion: ScoreboardEntry[] = [...actionCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([uid, count]) => ({
      userId: uid,
      userName: names.get(uid) ?? uid,
      score: count,
      scoreLabel: `${count % 1 ? count.toFixed(1) : count} closed`,
    }));

  // ── Fastest Responder ──
  // Median time from anomaly startTime to action completedAt, grouped by assigneeUserId
  const responseTimes = new Map<string, number[]>();
  userIds.forEach((id) => responseTimes.set(id, []));
  const anomalyMap = new Map(anomalies.map((a) => [a.id, a]));
  for (const act of actions) {
    if (act.assigneeUserId && act.completedAt) {
      const anomaly = anomalyMap.get(act.anomalyId);
      if (anomaly) {
        const dt = act.completedAt - anomaly.startTime;
        if (dt > 0) {
          responseTimes.get(act.assigneeUserId)?.push(dt);
        }
      }
    }
  }
  const fastestResponder: ScoreboardEntry[] = [...responseTimes.entries()]
    .filter(([, times]) => times.length > 0)
    .map(([uid, times]) => {
      const med = median(times);
      const hours = med / 3600_000;
      return {
        userId: uid,
        userName: names.get(uid) ?? uid,
        score: med,
        scoreLabel: hours < 1 ? `${Math.round(hours * 60)} min` : `${hours.toFixed(1)} hr`,
      };
    })
    .sort((a, b) => a.score - b.score); // lower is better

  // ── Bot Whisperer ──
  // Since ChatMessage lacks userId, use mock scores based on comment + confirmation activity as proxy
  // In production this would count AI chat prompts per user
  const aiCounts = new Map<string, number>();
  userIds.forEach((id) => aiCounts.set(id, 0));
  // Proxy: count audit events where actor='user' as "interactions with the system"
  for (const a of anomalies) {
    for (const ev of a.audit) {
      if (ev.actor === 'user') {
        // Attribute to ownerUserId or first confirmer
        const uid = a.ownerUserId ?? a.confirmations[0]?.byUserId;
        if (uid && aiCounts.has(uid)) {
          aiCounts.set(uid, (aiCounts.get(uid) ?? 0) + 1);
        }
      }
    }
  }
  // Add baseline mock values so all users show
  aiCounts.set('u-1', (aiCounts.get('u-1') ?? 0) + 8);
  aiCounts.set('u-2', (aiCounts.get('u-2') ?? 0) + 5);
  aiCounts.set('u-3', (aiCounts.get('u-3') ?? 0) + 3);

  const botWhisperer: ScoreboardEntry[] = [...aiCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([uid, count]) => ({
      userId: uid,
      userName: names.get(uid) ?? uid,
      score: count,
      scoreLabel: `${count} prompts`,
    }));

  return [
    {
      id: 'top-contributor',
      title: 'Top Contributor',
      description: 'Users who actively contribute operational input to PlantPulse AI.',
      entries: topContributor,
    },
    {
      id: 'action-champion',
      title: 'Action Champion',
      description: 'Users who close the loop by executing and completing actions.',
      entries: actionChampion,
    },
    {
      id: 'fastest-responder',
      title: 'Fastest Responder',
      description: 'Users who respond the quickest from signal to action.',
      entries: fastestResponder,
    },
    {
      id: 'bot-whisperer',
      title: 'Bot Whisperer',
      description: 'Users who most actively interact with the AI agent.',
      entries: botWhisperer,
    },
  ];
}
