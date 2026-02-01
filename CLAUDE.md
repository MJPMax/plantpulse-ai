# PlantPulse AI — Project Handoff & Architecture Guide

## Overview

PlantPulse AI is a facility process monitoring & anomaly detection dashboard. It's a React TypeScript SPA with in-memory data persisted to localStorage (no backend).

**Stack**: React 19 + TypeScript 5.9 + Vite 7 + MUI 7 + Zustand 5 + Recharts 3

## Project Structure

```
src/
  app/
    types.ts            # All type definitions
    store.ts            # Zustand state management (persist to localStorage)
    mockData.ts         # Seed data (2 facilities, 3 users, 24 metrics, 8 anomalies)
    scoreboardData.ts   # Scoreboard ranking computations
    theme.ts            # MUI theme (IBM Plex Mono, brown palette, industrial feel)
    utils.ts            # Formatting, color maps, timeseries generators
  components/
    AIPanel/AIPanel.tsx           # AI copilot chat (canned responses, voice sim)
    charts/TrendChart.tsx         # Recharts composed chart with bands & reference lines
    charts/SparklineChart.tsx     # Minimal inline sparkline
    common/SeverityDot.tsx        # Colored severity indicator
    common/StatusChip.tsx         # Anomaly & action status badges
    common/AuditTimeline.tsx      # Event history display
    dialogs/ConfirmAnomalyDialog.tsx  # Multi-role confirmation form
    dialogs/AssignActionDrawer.tsx    # Inline Collapse card for action creation
    dialogs/ResolutionLogForm.tsx     # Root cause & corrective actions form
    dialogs/SeeqDialog.tsx           # Mock SEEQ integration dialog
  pages/
    Overview.tsx        # KPI sparklines + active anomalies list
    Anomalies.tsx       # Filterable anomaly workbench table
    AnomalyDetail.tsx   # Full anomaly view (5 tabs: Evidence, Actions, Comments, Resolution Log, Audit)
    MetricDetail.tsx    # Metric trend chart with standard/goal lines, related anomalies
    Actions.tsx         # Task list (left) + detail panel (right) with inline editing
    Scoreboard.tsx      # User & facility rankings with medals
    Specs.tsx           # Placeholder
    Settings.tsx        # Placeholder
  App.tsx               # Shell: fixed AppBar (48px dense), left nav (200px), right AI panel
  router.tsx            # Route definitions
  main.tsx              # Entry point
```

## Routes

| Route | Page | Key Features |
|---|---|---|
| `/` | Overview | 8 KPI sparkline cards, top 5 active anomalies, confirm/assign/SEEQ buttons |
| `/anomalies` | Anomalies | Table with severity/status filters, "needs confirmation" toggle, health sort |
| `/anomalies/:id` | AnomalyDetail | Confirmation module, narrative (editable), trend chart, 5 tabs, action buttons |
| `/metrics/:id` | MetricDetail | Trend chart with normal range band, standard/goal lines, rate overlay toggle |
| `/actions` | Actions | Left: filterable card list with avatars. Right: detail with inline edit, notes, status buttons |
| `/scoreboard` | Scoreboard | Top Contributor, Action Champion, Fastest Responder, Bot Whisperer rankings |
| `/specs` | Specs | Coming soon placeholder |
| `/settings` | Settings | Coming soon placeholder |

## Key Types

All defined in `src/app/types.ts`:

- **Facility**: id, name, region, timezone
- **User**: id, name, role (Supervisor | Process Engineer | Regional Expert)
- **Metric**: id, facilityId, name, unit, area, asset, normalRange, standard?, goal?, timeseries[]
- **Anomaly**: id, title, severity, confidence, status (11 states), drivers[], confirmations[], actionIds[], healthScore, resolutionLog?, audit[]
- **Action**: id, anomalyId, title, type (6 types), assigneeGroup (4 groups), status (6 states), priority, assigneeUserId?, notes[]

### Status Flows

- **Anomaly**: New → Triage → Under Review → Confirmed → Action Assigned → Mitigation In Progress → Monitoring → Resolved → Closed → Archived (+ False Positive)
- **Action**: New → Accepted → In Progress → Blocked → Done → Verified

## Store (Zustand)

State in `src/app/store.ts` with localStorage persistence (`plant-monitor-store` key).

### Key Methods
- `confirmAnomaly(id, rationale)` — adds confirmation, auto-transitions to Confirmed when threshold met
- `createAction(anomalyId, fields)` — creates action, links to anomaly, auto-transitions to Action Assigned
- `updateAction(id, fields)` — partial update for inline editing
- `markResolved(id)` — validates resolution log, sets status to Resolved
- `resetDemoData()` — clears localStorage, reloads seed data

### Governance Rules
- Critical anomalies require 2 confirmations from distinct users
- All others require 1
- Resolution requires rootCauseCategory + rootCauseDescription

## Theme & Styling

- **Primary**: `#6B4F3A` (brown) — industrial feel
- **Font**: IBM Plex Mono (monospace)
- **Background**: `#E8E6E3` (warm gray)
- **Paper**: `#F5F3F0`
- Color maps in `utils.ts`: `severityColor`, `statusColor`, `actionStatusColor`, `healthColor`

## Layout

- **AppBar**: Fixed, 48px dense, z-index = drawer + 1. Contains: logo, facility selector, time range, search, user selector, notifications
- **Left Nav**: 200px permanent on desktop, drawer on mobile
- **Content**: Flex with `height: calc(100vh - 48px)`, scrollable
- **AI Panel**: Right 33% on desktop, bottom drawer on mobile

## Mock Data

2 facilities, 3 users, 24 metrics (11 KPIs + 13 leading indicators), 8 anomalies, 8+ actions. Timeseries generated with random walk + optional drift toward anomaly values.

## Build & Deploy

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # tsc -b && vite build → /dist
npm run preview      # Preview production build
```

**Vercel**: Auto-deploys on push to `main`. Build command: `npm run build`.

**Important**: `tsc -b` is strict — unused imports/variables will fail the build. Always run `npx tsc -b` locally before pushing.

## External Integrations (Mocked)

- **SEEQ**: Placeholder dialog passing facility/time/tags context. No actual API.
- **CMMS**: `cmmsWorkOrderId` field on Actions. Stub only.

## Common Development Tasks

- **Add metric**: `mockData.ts` → metrics array
- **Add anomaly**: `mockData.ts` → anomalies array, link metric IDs
- **Add page**: Create `pages/NewPage.tsx`, add route in `router.tsx`, add nav item in `App.tsx`
- **Add dialog**: Create in `components/dialogs/`, wire open/close state in parent page
- **Modify theme**: `src/app/theme.ts`

## Recent Changes

- **Actions page revamp**: Inline editing, assignee filter, color-coded avatars, grid detail panel
- **AssignActionDrawer**: Changed from Drawer/Dialog overlay to inline Collapse card (overlay had z-index issues with fixed AppBar)
- **Scoreboard**: Medal pixel art, user/facility rankings, renamed "Operators" to "Individual"
- **MetricDetail**: Standard/Goal reference lines, rate toggle, related open anomalies
- **Store**: Added `updateAction` for partial field updates

## Known Limitations

- No backend / real API — all data in-memory with localStorage
- AI responses are canned (keyword-matched)
- Voice input is simulated (dropdown of sample utterances)
- SEEQ/CMMS integrations are placeholders
- No authentication or RBAC
- No real-time data streaming
- Specs & Settings pages are placeholders
