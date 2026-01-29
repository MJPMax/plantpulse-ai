import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Stack, Chip, Card, Button, Tabs, Tab,
  ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import { OpenInNew as SeeqIcon } from '@mui/icons-material';
import { useStore } from '../app/store';
import TrendChart from '../components/charts/TrendChart';
import SeeqDialog from '../components/dialogs/SeeqDialog';

export default function MetricDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { metrics, anomalies } = useStore();
  const metric = metrics.find((m) => m.id === id);

  const [tab, setTab] = useState(0);
  const [showBaseline, setShowBaseline] = useState(false);
  const [showThreshold, setShowThreshold] = useState(true);
  const [seeqOpen, setSeeqOpen] = useState(false);

  if (!metric) return <Typography>Metric not found.</Typography>;

  const current = metric.timeseries[metric.timeseries.length - 1]?.value ?? 0;
  const inRange = current >= metric.normalRange.min && current <= metric.normalRange.max;

  // Generate a fake baseline
  const baselineSeries = metric.timeseries.map((p) => ({
    ts: p.ts,
    value: (metric.normalRange.min + metric.normalRange.max) / 2 + (Math.random() - 0.5) * 2,
  }));

  const relatedMetrics = metrics.filter((m) => m.id !== metric.id && m.area === metric.area && m.facilityId === metric.facilityId);
  const relatedAnomalies = anomalies.filter((a) => a.relatedMetricIds.includes(metric.id));

  const series = [{ name: metric.name, data: metric.timeseries, color: '#42a5f5' }];
  if (showBaseline) series.push({ name: 'Expected Baseline', data: baselineSeries, color: '#66bb6a' });

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
        <ToggleButtonGroup size="small" value={[showBaseline ? 'baseline' : '', showThreshold ? 'threshold' : ''].filter(Boolean)}
          onChange={(_, vals: string[]) => { setShowBaseline(vals.includes('baseline')); setShowThreshold(vals.includes('threshold')); }}>
          <ToggleButton value="baseline">Expected Baseline</ToggleButton>
          <ToggleButton value="threshold">Threshold Band</ToggleButton>
        </ToggleButtonGroup>
        <Button variant="outlined" size="small" startIcon={<SeeqIcon />} onClick={() => setSeeqOpen(true)}>Open in SEEQ</Button>
      </Stack>

      <Card sx={{ mb: 2, p: 2 }}>
        <TrendChart
          series={series}
          height={280}
          normalRange={showThreshold ? metric.normalRange : undefined}
          anomalyBands={relatedAnomalies.map((a) => ({ start: a.startTime, end: a.endTime ?? Date.now() }))}
        />
      </Card>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Related Metrics" />
        <Tab label="Distribution" />
        <Tab label="Operating Modes" />
      </Tabs>

      {tab === 0 && (
        <Stack spacing={0.5}>
          {relatedMetrics.map((m) => (
            <Chip key={m.id} label={`${m.name} (${m.unit}) — ${m.asset}`} sx={{ cursor: 'pointer' }}
              onClick={() => navigate(`/metrics/${m.id}`)} />
          ))}
          {relatedMetrics.length === 0 && <Typography variant="body2" color="text.secondary">No related metrics in this area.</Typography>}
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
