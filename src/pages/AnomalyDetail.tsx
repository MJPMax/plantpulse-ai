import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Stack, Chip, Button, Tabs, Tab, Card, CardContent, TextField,
  Menu, MenuItem,
} from '@mui/material';
import {
  OpenInNew as SeeqIcon, CheckCircle as ConfirmIcon, Add as AddIcon,
} from '@mui/icons-material';
import { useStore } from '../app/store';
import SeverityDot from '../components/common/SeverityDot';
import { AnomalyStatusChip } from '../components/common/StatusChip';
import { ActionStatusChip } from '../components/common/StatusChip';
import { fmtTs, fmtDuration, confirmationsNeeded, pctOutOfRange, healthColor } from '../app/utils';
import TrendChart from '../components/charts/TrendChart';
import AuditTimeline from '../components/common/AuditTimeline';
import ConfirmAnomalyDialog from '../components/dialogs/ConfirmAnomalyDialog';
import AssignActionDrawer from '../components/dialogs/AssignActionDrawer';
import SeeqDialog from '../components/dialogs/SeeqDialog';
import ResolutionLogForm from '../components/dialogs/ResolutionLogForm';
import type { AnomalyStatus, ActionStatus } from '../app/types';

const STATUS_FLOW: AnomalyStatus[] = ['New', 'Triage', 'Under Review', 'Confirmed', 'Action Assigned', 'Mitigation In Progress', 'Monitoring', 'Resolved', 'Closed', 'Archived'];

export default function AnomalyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const store = useStore();
  const anomaly = store.anomalies.find((a) => a.id === id);

  const [tab, setTab] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [seeqOpen, setSeeqOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [narrativeEdit, setNarrativeEdit] = useState(false);
  const [narrativeText, setNarrativeText] = useState('');
  const [statusMenu, setStatusMenu] = useState<null | HTMLElement>(null);

  if (!anomaly) return <Typography>Anomaly not found.</Typography>;

  const needed = confirmationsNeeded(anomaly.severity);
  const relatedMetrics = store.metrics.filter((m) => anomaly.relatedMetricIds.includes(m.id));
  const linkedActions = store.actions.filter((a) => anomaly.actionIds.includes(a.id));

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    store.addComment(anomaly.id, commentText.trim());
    setCommentText('');
  };

  const handleNarrativeSave = () => {
    store.editNarrative(anomaly.id, narrativeText);
    setNarrativeEdit(false);
  };

  const handleStatusChange = (s: AnomalyStatus) => {
    store.setAnomalyStatus(anomaly.id, s);
    setStatusMenu(null);
  };

  const handleActionStatusChange = (actionId: string, status: ActionStatus) => {
    store.updateActionStatus(actionId, status);
  };

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <SeverityDot severity={anomaly.severity} size={14} />
        <Typography variant="h5" sx={{ flex: 1 }}>{anomaly.title}</Typography>
        <AnomalyStatusChip status={anomaly.status} />
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="body2" color="text.secondary">{anomaly.id} · {anomaly.area} · {anomaly.asset}</Typography>
        <Chip label={`Confidence: ${(anomaly.confidence * 100).toFixed(0)}%`} size="small" variant="outlined" />
        <Chip label={`Health: ${anomaly.healthScore}%`} size="small"
          sx={{ fontWeight: 700, bgcolor: healthColor(anomaly.healthScore), color: '#fff' }} />
        <Typography variant="body2" color="text.secondary">{fmtTs(anomaly.startTime)} · {fmtDuration(anomaly.startTime)}</Typography>
      </Stack>

      {/* Confirmation module */}
      <Card sx={{ mb: 2, borderColor: anomaly.confirmations.length < needed ? 'warning.main' : 'success.main', borderWidth: 1 }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Typography variant="subtitle2">
            Confirmations: {anomaly.confirmations.length} / {needed}
            {anomaly.severity === 'Critical' && <Chip label="Critical — 2 required" size="small" color="error" sx={{ ml: 1 }} />}
          </Typography>
          {anomaly.confirmations.map((c, i) => (
            <Typography key={i} variant="body2" sx={{ fontSize: '0.8rem' }}>
              ✓ {store.users.find((u) => u.id === c.byUserId)?.name} ({c.role}) — "{c.rationale}" · {fmtTs(c.ts)}
            </Typography>
          ))}
        </CardContent>
      </Card>

      {/* Action buttons */}
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}>
        <Button variant="contained" size="small" onClick={() => setConfirmOpen(true)} startIcon={<ConfirmIcon />}>Confirm</Button>
        <Button variant="outlined" size="small" onClick={() => setAssignOpen(true)} startIcon={<AddIcon />}>Assign Action</Button>
        <Button variant="outlined" size="small" onClick={() => setSeeqOpen(true)} startIcon={<SeeqIcon />}>Open in SEEQ</Button>
        <Button variant="outlined" size="small" onClick={(e) => setStatusMenu(e.currentTarget)}>Change Status</Button>
        {anomaly.status !== 'False Positive' && (
          <Button size="small" color="warning" onClick={() => handleStatusChange('False Positive')}>False Positive</Button>
        )}
        {anomaly.status === 'Resolved' && <Button size="small" onClick={() => handleStatusChange('Closed')}>Close</Button>}
        {anomaly.status === 'Closed' && <Button size="small" onClick={() => handleStatusChange('Archived')}>Archive</Button>}
      </Stack>
      <Menu anchorEl={statusMenu} open={!!statusMenu} onClose={() => setStatusMenu(null)}>
        {STATUS_FLOW.map((s) => <MenuItem key={s} onClick={() => handleStatusChange(s)}>{s}</MenuItem>)}
      </Menu>

      {/* Narrative */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>What happened</Typography>
          {narrativeEdit ? (
            <Stack spacing={1}>
              <TextField multiline rows={3} value={narrativeText} onChange={(e) => setNarrativeText(e.target.value)} fullWidth />
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="contained" onClick={handleNarrativeSave}>Save</Button>
                <Button size="small" onClick={() => setNarrativeEdit(false)}>Cancel</Button>
              </Stack>
            </Stack>
          ) : (
            <Typography variant="body2" sx={{ cursor: 'pointer' }}
              onClick={() => { setNarrativeText(anomaly.description); setNarrativeEdit(true); }}>
              {anomaly.description} <Typography component="span" variant="caption" color="primary">(click to edit)</Typography>
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Key drivers */}
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Key Drivers</Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}>
        {anomaly.drivers.map((d) => {
          const met = store.metrics.find((m) => m.id === d.metricId);
          return (
            <Chip key={d.metricId}
              label={`${met?.name ?? d.metricId} ${d.direction === 'up' ? '↑' : d.direction === 'down' ? '↓' : '~'} — ${d.note}`}
              size="small" variant="outlined" onClick={() => navigate(`/metrics/${d.metricId}`)}
              sx={{ cursor: 'pointer' }} />
          );
        })}
      </Stack>

      {/* Trend */}
      {relatedMetrics.length > 0 && (
        <Card sx={{ mb: 2, p: 2 }}>
          <TrendChart
            series={relatedMetrics.map((m, i) => ({
              name: m.name, data: m.timeseries, color: ['#42a5f5', '#66bb6a', '#ffa726', '#ef5350'][i % 4],
            }))}
            height={200}
            anomalyBands={[{ start: anomaly.startTime, end: anomaly.endTime ?? Date.now() }]}
            backgroundSeries={{ name: 'Plant Rate', data: store.metrics.find((m) => m.id === 'met-1')?.timeseries ?? [] }}
            refLines={relatedMetrics.flatMap((m) => {
              const lines: { label: string; value: number; color: string; dashed?: boolean }[] = [];
              lines.push({ label: `Min ${m.normalRange.min}`, value: m.normalRange.min, color: '#C1382E' });
              lines.push({ label: `Max ${m.normalRange.max}`, value: m.normalRange.max, color: '#C1382E' });
              if (m.standard != null) lines.push({ label: `Target ${m.standard}`, value: m.standard, color: '#3A7D44', dashed: true });
              return lines;
            })}
          />
          {/* Min / Max / Target / Out of Range summary */}
          <Stack direction="row" spacing={2} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
            {relatedMetrics.map((m) => {
              const oor = pctOutOfRange(m.timeseries, m.normalRange);
              return (
                <Typography key={m.id} variant="caption" sx={{ fontSize: '0.7rem' }}>
                  <strong>{m.name}:</strong> Min {m.normalRange.min} | Max {m.normalRange.max}
                  {m.standard != null && ` | Target ${m.standard}`}
                  {' | '}<span style={{ color: oor > 50 ? '#C1382E' : oor > 0 ? '#C47A20' : '#3A7D44' }}>{oor}% out of range</span>
                </Typography>
              );
            })}
          </Stack>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Evidence" />
        <Tab label="Actions" />
        <Tab label="Comments" />
        <Tab label="Resolution Log" />
        <Tab label="Audit" />
      </Tabs>

      {tab === 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Detection Details</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>AI model detected pattern deviation with {(anomaly.confidence * 100).toFixed(0)}% confidence. Severity: {anomaly.severity}.</Typography>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Related Metrics</Typography>
          <Stack spacing={0.5} sx={{ mb: 2 }}>
            {relatedMetrics.map((m) => (
              <Chip key={m.id} label={`${m.name} (${m.unit})`} size="small" onClick={() => navigate(`/metrics/${m.id}`)} sx={{ cursor: 'pointer' }} />
            ))}
          </Stack>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Similar Anomalies</Typography>
          {store.anomalies.filter((a) => a.id !== anomaly.id && a.area === anomaly.area).slice(0, 3).map((a) => (
            <Chip key={a.id} label={a.title} size="small" sx={{ mr: 0.5, cursor: 'pointer' }} onClick={() => navigate(`/anomalies/${a.id}`)} />
          ))}
        </Box>
      )}

      {tab === 1 && (
        <Box>
          <Button size="small" variant="outlined" startIcon={<AddIcon />} sx={{ mb: 1 }} onClick={() => setAssignOpen(true)}>
            Create Action
          </Button>
          <Stack spacing={1}>
            {linkedActions.map((a) => (
              <Card key={a.id} variant="outlined">
                <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }}>{a.title}</Typography>
                    <Chip label={a.assigneeGroup} size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} />
                    <ActionStatusChip status={a.status} />
                  </Stack>
                  <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                    {(['Accepted', 'In Progress', 'Done', 'Verified'] as ActionStatus[]).map((s) => (
                      <Button key={s} size="small" variant={a.status === s ? 'contained' : 'text'}
                        onClick={() => handleActionStatusChange(a.id, s)} sx={{ fontSize: '0.65rem', minWidth: 0, px: 1 }}>
                        {s}
                      </Button>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            ))}
            {linkedActions.length === 0 && <Typography variant="body2" color="text.secondary">No actions yet.</Typography>}
          </Stack>
        </Box>
      )}

      {tab === 2 && (
        <Box>
          <Stack spacing={1} sx={{ mb: 2 }}>
            {anomaly.comments.map((c) => {
              const user = store.users.find((u) => u.id === c.userId);
              return (
                <Box key={c.id} sx={{ p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="caption" color="primary">{user?.name ?? 'Unknown'} · {fmtTs(c.ts)}</Typography>
                  <Typography variant="body2">{c.text}</Typography>
                </Box>
              );
            })}
          </Stack>
          <Stack direction="row" spacing={1}>
            <TextField size="small" fullWidth placeholder="Add a comment…" value={commentText}
              onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddComment()} />
            <Button variant="contained" size="small" onClick={handleAddComment}>Post</Button>
          </Stack>
        </Box>
      )}

      {tab === 3 && <ResolutionLogForm anomaly={anomaly} />}

      {tab === 4 && <AuditTimeline events={anomaly.audit} />}

      {/* Dialogs */}
      <ConfirmAnomalyDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} anomaly={anomaly} />
      <AssignActionDrawer open={assignOpen} onClose={() => setAssignOpen(false)} anomalyId={anomaly.id} />
      <SeeqDialog open={seeqOpen} onClose={() => setSeeqOpen(false)} anomaly={anomaly} />
    </Box>
  );
}
