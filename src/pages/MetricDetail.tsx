import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Stack, Chip, Card, CardContent, Button, Tabs, Tab,
  ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import { OpenInNew as SeeqIcon } from '@mui/icons-material';
import { useStore } from '../app/store';
import TrendChart from '../components/charts/TrendChart';
import SeeqDialog from '../components/dialogs/SeeqDialog';
import SeverityDot from '../components/common/SeverityDot';
import { AnomalyStatusChip } from '../components/common/StatusChip';
import { computeHealthScore } from '../app/utils';

const CLOSED_STATUSES = ['Resolved', 'Closed', 'Archived', 'False Positive'];

export default function MetricDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { metrics, anomalies } = useStore();
  const metric = metrics.find((m) => m.id === id);

  const [tab, setTab] = useState(0);
  const [showRate, setShowRate] = useState(false);
  const [showThreshold, setShowThreshold] = useState(true);
  const [seeqOpen, setSeeqOpen] = useState(false);

  if (!metric) return <Typography>Metric not found.</Typography>;

  const current = metric.timeseries[metric.timeseries.length - 1]?.value ?? 0;
  const inRange = current >= metric.normalRange.min && current <= metric.normalRange.max;

  const relatedAnomalies = anomalies.filter((a) => a.relatedMetricIds.includes(metric.id));
  const openAnomalies = relatedAnomalies.filter((a) => !CLOSED_STATUSES.includes(a.status));
  const plantRate = metrics.find((m) => m.id === 'met-1');

  // Reference lines: Standard + Goal (always visible)
  const refLines: { label: string; value: number; color: string; dashed?: boolean }[] = [];
  if (metric.standard != null) refLines.push({ label: `Standard ${metric.standard}`, value: metric.standard, color: '#E91E63', dashed: true });
  if (metric.goal != null) refLines.push({ label: `Goal ${metric.goal}`, value: metric.goal, color: '#4CAF50', dashed: true });

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Typography variant="h5">{metric.name}</Typography>
        <Chip label={metric.unit} size="small" variant="outlined" />
        <Chip label={inRange ? 'Normal' : 'Out of Range'} size="small" color={inRange ? 'success' : 'warning'} />
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {metric.area} · {metric.asset} · Range: {metric.normalRange.min}–{metric.normalRange.max} {metric.unit}
      </Typography>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Current: {current.toFixed(2)} {metric.unit}
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <ToggleButtonGroup size="small"
          value={[showRate ? 'rate' : '', showThreshold ? 'threshold' : ''].filter(Boolean)}
          onChange={(_, vals: string[]) => { setShowRate(vals.includes('rate')); setShowThreshold(vals.includes('threshold')); }}>
          {metric.id !== 'met-1' && <ToggleButton value="rate">Show Rate</ToggleButton>}
          <ToggleButton value="threshold">Threshold Band</ToggleButton>
        </ToggleButtonGroup>
        <Button variant="outlined" size="small" startIcon={<SeeqIcon />} onClick={() => setSeeqOpen(true)}>Open in SEEQ</Button>
      </Stack>

      <Card sx={{ mb: 2, p: 2 }}>
        <TrendChart
          series={[{ name: metric.name, data: metric.timeseries, color: '#42a5f5' }]}
          height={280}
          normalRange={showThreshold ? metric.normalRange : undefined}
          anomalyBands={relatedAnomalies.map((a) => ({ start: a.startTime, end: a.endTime ?? Date.now() }))}
          refLines={refLines}
          backgroundSeries={showRate && plantRate && metric.id !== 'met-1' ? { name: 'Plant Rate', data: plantRate.timeseries } : undefined}
        />
      </Card>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Related Open Anomalies" />
        <Tab label="Distribution" />
        <Tab label="Operating Modes" />
      </Tabs>

      {tab === 0 && (
        <Stack spacing={1}>
          {openAnomalies.map((a) => {
            const relMets = metrics.filter((m) => a.relatedMetricIds.includes(m.id));
            const scores = relMets.map((m) => computeHealthScore(m.timeseries, m.normalRange));
            const avg = scores.length ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0;
            return (
              <Card key={a.id} sx={{ cursor: 'pointer' }} onClick={() => navigate(`/anomalies/${a.id}`)}>
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <SeverityDot severity={a.severity} />
                    <Typography variant="subtitle2" sx={{ flex: 1 }}>{a.title}</Typography>
                    <AnomalyStatusChip status={a.status} />
                    <Chip label={`${avg}% Health`} size="small" variant="outlined"
                      sx={{ fontSize: '0.65rem', fontWeight: 500, color: '#6B6760', borderColor: '#C4C0BA' }} />
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
          {openAnomalies.length === 0 && <Typography variant="body2" color="text.secondary">No open anomalies related to this metric.</Typography>}
        </Stack>
      )}

      {tab === 1 && (
        <Card sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Distribution histogram placeholder — In production, this would show a histogram of metric values
            with normal distribution overlay.
          </Typography>
          <Box sx={{ mt: 2, height: 120, bgcolor: 'background.default', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="caption" color="text.secondary">📊 Histogram Placeholder</Typography>
          </Box>
        </Card>
      )}

      {tab === 2 && (
        <Card sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Operating modes placeholder — In production, this would show how the metric behaves
            across different operating modes (startup, steady-state, shutdown).
          </Typography>
          <Box sx={{ mt: 2, height: 120, bgcolor: 'background.default', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="caption" color="text.secondary">⚙️ Operating Modes Placeholder</Typography>
          </Box>
        </Card>
      )}

      <SeeqDialog open={seeqOpen} onClose={() => setSeeqOpen(false)} metric={metric} />
    </Box>
  );
}
