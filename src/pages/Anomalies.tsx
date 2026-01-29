import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Select, MenuItem, FormControl, InputLabel, Stack, Button, Chip, Paper, ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import { useStore } from '../app/store';
import SeverityDot from '../components/common/SeverityDot';
import { AnomalyStatusChip } from '../components/common/StatusChip';
import { fmtTs, fmtDuration, confirmationsNeeded, pctOutOfRange } from '../app/utils';
import ConfirmAnomalyDialog from '../components/dialogs/ConfirmAnomalyDialog';
import AssignActionDrawer from '../components/dialogs/AssignActionDrawer';
import type { Anomaly, Severity, AnomalyStatus } from '../app/types';

export default function Anomalies() {
  const navigate = useNavigate();
  const { anomalies, actions, metrics, currentFacilityId, users, searchQuery } = useStore();

  const [sevFilter, setSevFilter] = useState<Severity | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<AnomalyStatus | 'All'>('All');
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<Anomaly | null>(null);
  const [assignTarget, setAssignTarget] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = anomalies.filter((a) => a.facilityId === currentFacilityId);
    if (sevFilter !== 'All') list = list.filter((a) => a.severity === sevFilter);
    if (statusFilter !== 'All') list = list.filter((a) => a.status === statusFilter);
    if (needsConfirm) list = list.filter((a) => a.confirmations.length < confirmationsNeeded(a.severity) && !['Resolved', 'Closed', 'Archived', 'False Positive'].includes(a.status));
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((a) => a.title.toLowerCase().includes(q) || a.id.toLowerCase().includes(q));
    }
    return list.sort((a, b) => b.startTime - a.startTime);
  }, [anomalies, currentFacilityId, sevFilter, statusFilter, needsConfirm, searchQuery]);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Anomalies Workbench</Typography>

      {/* Filters */}
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel>Severity</InputLabel>
          <Select value={sevFilter} label="Severity" onChange={(e) => setSevFilter(e.target.value as any)}>
            <MenuItem value="All">All</MenuItem>
            {(['Critical', 'High', 'Medium', 'Low', 'Info'] as Severity[]).map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value as any)}>
            <MenuItem value="All">All</MenuItem>
            {(['New', 'Triage', 'Under Review', 'Confirmed', 'Action Assigned', 'Mitigation In Progress', 'Monitoring', 'Resolved', 'Closed', 'Archived', 'False Positive'] as AnomalyStatus[]).map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <ToggleButtonGroup size="small" value={needsConfirm ? 'yes' : ''} exclusive
          onChange={(_, v) => setNeedsConfirm(v === 'yes')}>
          <ToggleButton value="yes" sx={{ fontSize: '0.75rem' }}>Needs Confirmation</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {/* Table */}
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width={36}></TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Start / Duration</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Out of Range</TableCell>
              <TableCell>Actions</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((a) => {
              const openActions = actions.filter((x) => a.actionIds.includes(x.id) && !['Done', 'Verified'].includes(x.status)).length;
              const totalActions = a.actionIds.length;
              const owner = users.find((u) => u.id === a.ownerUserId);
              return (
                <TableRow key={a.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/anomalies/${a.id}`)}>
                  <TableCell><SeverityDot severity={a.severity} /></TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>{a.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{a.id}</Typography>
                  </TableCell>
                  <TableCell><AnomalyStatusChip status={a.status} /></TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{fmtTs(a.startTime)}</Typography>
                    <Typography variant="caption" color="text.secondary">{fmtDuration(a.startTime)}</Typography>
                  </TableCell>
                  <TableCell><Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{owner?.name ?? '—'}</Typography></TableCell>
                  <TableCell>
                    {(() => {
                      const relMets = metrics.filter((m) => a.relatedMetricIds.includes(m.id));
                      const maxPct = Math.max(0, ...relMets.map((m) => pctOutOfRange(m.timeseries, m.normalRange)));
                      return maxPct > 0 ? <Chip label={`${maxPct}%`} size="small" color={maxPct > 50 ? 'error' : 'warning'} sx={{ fontSize: '0.7rem' }} /> : <Typography variant="body2" color="text.secondary">—</Typography>;
                    })()}
                  </TableCell>
                  <TableCell><Chip label={`${openActions}/${totalActions}`} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} /></TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} onClick={(e) => e.stopPropagation()}>
                      <Button size="small" onClick={() => navigate(`/anomalies/${a.id}`)}>Open</Button>
                      <Button size="small" onClick={() => setConfirmTarget(a)}>Confirm</Button>
                      <Button size="small" onClick={() => setAssignTarget(a.id)}>Assign</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {filtered.length === 0 && <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>No anomalies match filters.</Typography>}

      {confirmTarget && <ConfirmAnomalyDialog open={!!confirmTarget} onClose={() => setConfirmTarget(null)} anomaly={confirmTarget} />}
      {assignTarget && <AssignActionDrawer open={!!assignTarget} onClose={() => setAssignTarget(null)} anomalyId={assignTarget} />}
    </Box>
  );
}
