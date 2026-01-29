import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, Stack, Chip, Button,
} from '@mui/material';
import { OpenInNew as SeeqIcon } from '@mui/icons-material';
import { ResponsiveContainer, LineChart, Line, ReferenceLine, ReferenceArea } from 'recharts';
import { useStore } from '../app/store';
import { fmtTs, fmtDuration } from '../app/utils';
import SeverityDot from '../components/common/SeverityDot';
import { AnomalyStatusChip } from '../components/common/StatusChip';
import TrendChart from '../components/charts/TrendChart';
import { useState } from 'react';
import ConfirmAnomalyDialog from '../components/dialogs/ConfirmAnomalyDialog';
import AssignActionDrawer from '../components/dialogs/AssignActionDrawer';
import SeeqDialog from '../components/dialogs/SeeqDialog';
import type { Anomaly } from '../app/types';

/** KPI sparkline with Standard (pink dashed) and Goal (green dashed) reference lines + normal band */
function KpiSparkline({ data, standard, goal, normalRange }: {
  data: { ts: number; value: number }[];
  standard?: number;
  goal?: number;
  normalRange: { min: number; max: number };
}) {
  const last = data.slice(-20);
  return (
    <ResponsiveContainer width="100%" height={48}>
      <LineChart data={last} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
        {/* Normal range band (light green fill) */}
        <ReferenceArea y1={normalRange.min} y2={normalRange.max} fill="#4CAF50" fillOpacity={0.12} />
        {/* Standard line — pink/magenta dashed */}
        {standard != null && (
          <ReferenceLine y={standard} stroke="#E91E63" strokeDasharray="4 2" strokeWidth={1} />
        )}
        {/* Goal line — green dashed */}
        {goal != null && (
          <ReferenceLine y={goal} stroke="#4CAF50" strokeDasharray="4 2" strokeWidth={1} />
        )}
        <Line dataKey="value" stroke="#2D2D2D" dot={{ r: 2, fill: '#2D2D2D' }} strokeWidth={1.5} />
      </LineChart>
    </ResponsiveContainer>
  );
}

const KPI_MAP = [
  { label: 'Plant Rate', metricId: 'met-1' },
  { label: 'White Flake Fat', metricId: 'met-2' },
  { label: 'Meal Moisture', metricId: 'met-3' },
  { label: 'Meal Fiber', metricId: 'met-4' },
  { label: 'Hulls Fat', metricId: 'met-5' },
  { label: 'Secondary Heat', metricId: 'met-6' },
  { label: 'Solvent Loss', metricId: 'met-7' },
  { label: 'Seed Moisture', metricId: 'met-8' },
];

export default function Overview() {
  const navigate = useNavigate();
  const { anomalies, metrics, currentFacilityId } = useStore();
  const facAnomalies = anomalies
    .filter((a) => a.facilityId === currentFacilityId && !['Resolved', 'Closed', 'Archived', 'False Positive'].includes(a.status))
    .sort((a, b) => {
      const sev = ['Critical', 'High', 'Medium', 'Low', 'Info'];
      return sev.indexOf(a.severity) - sev.indexOf(b.severity) || b.startTime - a.startTime;
    })
    .slice(0, 5);

  const [confirmTarget, setConfirmTarget] = useState<Anomaly | null>(null);
  const [assignTarget, setAssignTarget] = useState<string | null>(null);
  const [seeqTarget, setSeeqTarget] = useState<Anomaly | null>(null);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Overview Dashboard</Typography>

      {/* KPI Strip */}
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {KPI_MAP.map((kpi) => {
          const m = metrics.find((x) => x.id === kpi.metricId);
          if (!m) return null;
          const current = m.timeseries[m.timeseries.length - 1]?.value ?? 0;
          const decimals = m.unit === '%' || m.unit === '%mass' ? 2 : m.unit === 'Bu/day' || m.unit === 'MJ/MT' ? 0 : 2;
          const inRange = current >= m.normalRange.min && current <= m.normalRange.max;
          return (
            <Grid size={{ xs: 6, sm: 4, md: 3 }} key={kpi.metricId}>
              <Card sx={{ cursor: 'pointer' }} onClick={() => navigate(`/metrics/${kpi.metricId}`)}>
                <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                  {/* Title row */}
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.75rem' }} noWrap>
                      {kpi.label}
                    </Typography>
                    {/* Standard & Goal labels */}
                    {(m.standard != null || m.goal != null) && (
                      <Stack direction="column" alignItems="flex-end" spacing={0}>
                        {m.standard != null && (
                          <Typography variant="caption" sx={{ fontSize: '0.6rem', color: '#E91E63', fontWeight: 600, lineHeight: 1.2 }}>
                            Standard&nbsp;{m.standard.toFixed(decimals)}
                          </Typography>
                        )}
                        {m.goal != null && (
                          <Typography variant="caption" sx={{ fontSize: '0.6rem', color: '#4CAF50', fontWeight: 600, lineHeight: 1.2 }}>
                            Goal&nbsp;{m.goal.toFixed(decimals)}
                          </Typography>
                        )}
                      </Stack>
                    )}
                  </Stack>
                  {/* Current value — large */}
                  <Typography sx={{ fontWeight: 700, fontSize: '1.35rem', lineHeight: 1.1, mb: 0.5, color: inRange ? 'text.primary' : '#C47A20' }}>
                    {current.toFixed(decimals)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>{m.unit}</Typography>
                  {/* Sparkline with standard/goal reference lines */}
                  <KpiSparkline data={m.timeseries} standard={m.standard} goal={m.goal} normalRange={m.normalRange} />
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Active Anomalies */}
      <Typography variant="h6" sx={{ mb: 1 }}>Active Anomalies</Typography>
      <Stack spacing={1} sx={{ mb: 3 }}>
        {facAnomalies.map((a) => (
          <Card key={a.id}>
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                <SeverityDot severity={a.severity} />
                <Typography variant="subtitle2" sx={{ flex: 1, cursor: 'pointer' }} onClick={() => navigate(`/anomalies/${a.id}`)}>
                  {a.title}
                </Typography>
                <AnomalyStatusChip status={a.status} />
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">{fmtTs(a.startTime)} · {fmtDuration(a.startTime)}</Typography>
                {a.drivers.slice(0, 3).map((d) => (
                  <Chip key={d.metricId} label={`${metrics.find((m) => m.id === d.metricId)?.name ?? d.metricId} ${d.direction === 'up' ? '↑' : d.direction === 'down' ? '↓' : '~'}`}
                    size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} />
                ))}
              </Stack>
              <Stack direction="row" spacing={0.5}>
                <Button size="small" onClick={() => navigate(`/anomalies/${a.id}`)}>Open</Button>
                <Button size="small" onClick={() => setConfirmTarget(a)}>Confirm</Button>
                <Button size="small" onClick={() => setAssignTarget(a.id)}>Assign</Button>
                <Button size="small" startIcon={<SeeqIcon sx={{ fontSize: 14 }} />} onClick={() => setSeeqTarget(a)}>SEEQ</Button>
              </Stack>
            </CardContent>
          </Card>
        ))}
        {facAnomalies.length === 0 && <Typography variant="body2" color="text.secondary">No active anomalies.</Typography>}
      </Stack>

      {/* Trend Panel */}
      <Typography variant="h6" sx={{ mb: 1 }}>Trends</Typography>
      <Card sx={{ p: 2 }}>
        <TrendChart
          series={[
            { name: 'Daily Throughput', data: metrics.find((m) => m.id === 'met-1')?.timeseries ?? [], color: '#42a5f5' },
            { name: 'White Flake Fat', data: metrics.find((m) => m.id === 'met-2')?.timeseries ?? [], color: '#66bb6a' },
            { name: 'Hulls Fat', data: metrics.find((m) => m.id === 'met-5')?.timeseries ?? [], color: '#ffa726' },
          ]}
          height={220}
          anomalyBands={facAnomalies.slice(0, 2).map((a) => ({ start: a.startTime, end: a.endTime ?? Date.now() }))}
        />
      </Card>

      {/* Dialogs */}
      {confirmTarget && <ConfirmAnomalyDialog open={!!confirmTarget} onClose={() => setConfirmTarget(null)} anomaly={confirmTarget} />}
      {assignTarget && <AssignActionDrawer open={!!assignTarget} onClose={() => setAssignTarget(null)} anomalyId={assignTarget} />}
      {seeqTarget && <SeeqDialog open={!!seeqTarget} onClose={() => setSeeqTarget(null)} anomaly={seeqTarget} />}
    </Box>
  );
}
