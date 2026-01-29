import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Card, CardContent, Stack, Chip, Button, Select, MenuItem,
  FormControl, InputLabel, TextField, Divider,
} from '@mui/material';
import { useStore } from '../app/store';
import { ActionStatusChip } from '../components/common/StatusChip';
import { fmtTs } from '../app/utils';
import type { ActionStatus, AssigneeGroup } from '../app/types';

export default function Actions() {
  const navigate = useNavigate();
  const { actions, anomalies, users, updateActionStatus, addActionNote } = useStore();

  const [groupFilter, setGroupFilter] = useState<AssigneeGroup | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<ActionStatus | 'All'>('All');
  const [selectedId, setSelectedId] = useState<string | null>(actions[0]?.id ?? null);
  const [noteText, setNoteText] = useState('');

  const filtered = useMemo(() => {
    let list = [...actions];
    if (groupFilter !== 'All') list = list.filter((a) => a.assigneeGroup === groupFilter);
    if (statusFilter !== 'All') list = list.filter((a) => a.status === statusFilter);
    return list.sort((a, b) => b.dueAt - a.dueAt);
  }, [actions, groupFilter, statusFilter]);

  const selected = actions.find((a) => a.id === selectedId);
  const linkedAnomaly = selected ? anomalies.find((a) => a.id === selected.anomalyId) : null;

  const handleAddNote = () => {
    if (!noteText.trim() || !selectedId) return;
    addActionNote(selectedId, noteText.trim());
    setNoteText('');
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Actions</Typography>
      <Grid container spacing={2}>
        {/* List */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Group</InputLabel>
              <Select value={groupFilter} label="Group" onChange={(e) => setGroupFilter(e.target.value as any)}>
                <MenuItem value="All">All</MenuItem>
                {(['Maintenance', 'Electrician', 'Instrumentation', 'Operations'] as AssigneeGroup[]).map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value as any)}>
                <MenuItem value="All">All</MenuItem>
                {(['New', 'Accepted', 'In Progress', 'Blocked', 'Done', 'Verified'] as ActionStatus[]).map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>

          <Stack spacing={1}>
            {filtered.map((a) => (
              <Card key={a.id} variant="outlined"
                sx={{ cursor: 'pointer', borderColor: a.id === selectedId ? 'primary.main' : 'divider' }}
                onClick={() => setSelectedId(a.id)}>
                <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="body2" sx={{ flex: 1, fontWeight: 500, fontSize: '0.85rem' }}>{a.title}</Typography>
                    <ActionStatusChip status={a.status} />
                  </Stack>
                  <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                    <Chip label={a.assigneeGroup} size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} />
                    <Chip label={a.priority} size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} />
                    <Typography variant="caption" color="text.secondary">Due: {fmtTs(a.dueAt)}</Typography>
                  </Stack>
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && <Typography variant="body2" color="text.secondary">No actions match filters.</Typography>}
          </Stack>
        </Grid>

        {/* Detail */}
        <Grid size={{ xs: 12, md: 6 }}>
          {selected ? (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>{selected.title}</Typography>
                <Stack spacing={0.5} sx={{ mb: 1.5 }}>
                  <Typography variant="body2">Type: {selected.type}</Typography>
                  <Typography variant="body2">Group: {selected.assigneeGroup}</Typography>
                  {selected.assigneeName && <Typography variant="body2">Assignee: {selected.assigneeName}</Typography>}
                  <Typography variant="body2">Priority: {selected.priority}</Typography>
                  <Typography variant="body2">Due: {fmtTs(selected.dueAt)}</Typography>
                  {selected.cmmsWorkOrderId && <Typography variant="body2">CMMS WO: {selected.cmmsWorkOrderId}</Typography>}
                </Stack>

                <Stack direction="row" spacing={0.5} sx={{ mb: 1.5 }}>
                  <ActionStatusChip status={selected.status} />
                  {(['New', 'Accepted', 'In Progress', 'Blocked', 'Done', 'Verified'] as ActionStatus[]).map((s) => (
                    <Button key={s} size="small" variant={selected.status === s ? 'contained' : 'text'}
                      onClick={() => updateActionStatus(selected.id, s)} sx={{ fontSize: '0.65rem', minWidth: 0, px: 1 }}>
                      {s}
                    </Button>
                  ))}
                </Stack>

                {linkedAnomaly && (
                  <Button size="small" variant="outlined" sx={{ mb: 1.5 }}
                    onClick={() => navigate(`/anomalies/${linkedAnomaly.id}`)}>
                    View Anomaly: {linkedAnomaly.title}
                  </Button>
                )}

                <Divider sx={{ mb: 1 }} />
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Notes</Typography>
                <Stack spacing={0.5} sx={{ mb: 1 }}>
                  {selected.notes.map((n, i) => (
                    <Box key={i} sx={{ p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="caption" color="primary">{users.find((u) => u.id === n.userId)?.name} · {fmtTs(n.ts)}</Typography>
                      <Typography variant="body2">{n.text}</Typography>
                    </Box>
                  ))}
                  {selected.notes.length === 0 && <Typography variant="body2" color="text.secondary">No notes.</Typography>}
                </Stack>
                <Stack direction="row" spacing={1}>
                  <TextField size="small" fullWidth placeholder="Add note…" value={noteText}
                    onChange={(e) => setNoteText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddNote()} />
                  <Button variant="contained" size="small" onClick={handleAddNote}>Add</Button>
                </Stack>
              </CardContent>
            </Card>
          ) : (
            <Typography variant="body2" color="text.secondary">Select an action to view details.</Typography>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
