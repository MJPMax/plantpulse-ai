# PlantPulse AI — UI Prototype

Interactive mock-up of an oilseed crushing facility monitoring application by Cargill. No backend, no real AI — all data is in-memory with localStorage persistence.

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Routes

| Route | Description |
|-------|-------------|
| `/` | Overview Dashboard — KPIs, active anomalies, trend chart |
| `/anomalies` | Anomalies Workbench — filterable table |
| `/anomalies/:id` | Anomaly Detail — evidence, actions, comments, resolution log, audit |
| `/metrics/:id` | Metric Detail — trend chart with toggles, related data |
| `/actions` | Actions — task list with detail panel |

## Key Demo Flows

1. **Confirm an anomaly**: Open anomaly detail → click Confirm → enter rationale. Critical anomalies need 2 confirmations from distinct users (switch user in header).
2. **Assign an action**: From any anomaly → click Assign Action → fill drawer form.
3. **Resolve an anomaly**: Fill Resolution Log tab → click Mark Resolved.
4. **AI Copilot**: Use the right panel to chat, click suggested prompts, or try voice simulation with sample utterances.
5. **Open in SEEQ**: Available on anomaly detail and metric detail pages.

## Reset Demo Data

Click **Reset Demo Data** in the left navigation sidebar to restore all mock data and clear localStorage.

## Deploy to Vercel (share with others)

1. Push this project to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click **"Add New Project"** → import your repo
4. Vercel auto-detects Vite — just click **Deploy**
5. You'll get a public URL like `plantpulse-ai.vercel.app`

Every push to `main` will auto-redeploy.

## Limitations

- No real backend or API
- AI responses are canned/mocked
- Voice simulation uses a dropdown of sample utterances
- SEEQ integration is a placeholder dialog
- Timeseries data is randomly generated on first load
