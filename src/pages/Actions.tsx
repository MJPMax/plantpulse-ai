import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Card, CardContent, Stack, Chip, Button, Select, MenuItem,
  FormControl, InputLabel, TextField, Divider, Avatar, IconButton,
} from '@mui/material';
import { Edit as EditIcon, Check as CheckIcon, Close as CloseIcon, Person as PersonIcon } from '@mui/icons-material';
import { useStore } from '../app/store';
import { ActionStatusChip } from '../components/common/StatusChip';
import { fmtTs } from '../app/utils';
import type { ActionStatus, ActionType, AssigneeGroup } from '../app/types';

const ACTION_TYPES: ActionType[] = ['Inspect', 'Repair', 'Calibrate', 'Adjust', 'Replace', 'Clean'];
const ASSIGNEE_GROUPS: AssigneeGroup[] = ['Maintenance', 'Electrician', 'Instrumentation', 'Operations'];
const STATUSES: ActionStatus[] = ['New', 'Accepted', 'In Progress', 'Blocked', 'Done', 'Verified'];
const PRIORITIES = ['Low', 'Medium', 'High'] as const;

function userInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function assigneeColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return `hsl(${h % 360}, 30%, 45%)`;
}

export default function Actions() {
  const navigate = useNavigate();
  const { actions, anomalies, users, updateActionStatus, updateAction, addActionNote } = useStore();

  const [groupFilter, setGroupFilter] = useState<AssigneeGroup | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<ActionStatus | 'All'>('All');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('All');
  const [selectedId, setSelectedId] = useState<string | null>(actions[0]?.id ?? null);
  const [noteText, setNoteText] = useState('');
  const [editing, setEditing] = useState(false);

  // Collect unique assignees for filter
  const assigneeOptions = useMemo(() => {
    const set = new Map<string, string>();
    actions.forEach((a) => {
      if (a.assigneeUserId) {
        const u = users.find((u) => u.id === a.assigneeUserId);
        if (u) set.set(u.id, u.name);
      } else if (a.assigneeName) {
        set.set(`name:${a.assigneeName}`, a.assigneeName);
      }
    });
    return [...set.entries()].map(([key, label]) => ({ key, label }));
  }, [actions, users]);

  const filtered = useMemo(() => {
    let list = [...actions];
    if (groupFilter !== 'All') list = list.filter((a) => a.assigneeGroup === groupFilter);
    if (statusFilter !== 'All') list = list.filter((a) => a.status === statusFilter);
    if (assigneeFilter !== 'All') {
      list = list.filter((a) => {
        if (assigneeFilter.startsWith('name:')) return a.assigneeName === assigneeFilter.slice(5);
        return a.assigneeUserId === assigneeFilter;
      });
    }
    return list.sort((a, b) => b.dueAt - a.dueAt);
  }, [actions, groupFilter, statusFilter, assigneeFilter]);

  const selected = actions.find((a) => a.id === selectedId);
  const linkedAnomaly = selected ? anomalies.find((a) => a.id === selected.anomalyId) : null;

  // Editable fields state
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState<ActionType>('Inspect');
  const [editGroup, setEditGroup] = useState<AssigneeGroup>('Operations');
  const [editAssignee, setEditAssignee] = useState('');
  const [editPriority, setEditPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');

  const startEditing = () => {
    if (!selected) return;
    setEditTitle(selected.title);
    setEditType(selected.type);
    setEditGroup(selected.assigneeGroup);
    setEditAssignee(selected.assigneeUserId ?? '');
    setEditPriority(selected.priority);
    setEditing(true);
  };

  const saveEdit = () => {
    if (!selected) return;
    const assignedUser = users.find((u) => u.id === editAssignee);
    updateAction(selected.id, {
      title: editTitle,
      type: editType,
      assigneeGroup: editGroup,
      assigneeUserId: editAssignee || undefined,
      assigneeName: assignedUser?.name ?? selected.assigneeName,
      priority: editPriority,
    });
    setEditing(false);
  };

  const cancelEdit = () => setEditing(false);

  const getAssigneeName = (a: typeof actions[0]) => {
    if (a.assigneeUserId) {
      const u = users.find((u) => u.id === a.assigneeUserId);
      if (u) return u.name;
    }
    return a.assigneeName ?? 'Unassigned';
  };

  const handleAddNote = () => {
    if (!noteText.trim() || !selectedId) return;
    addActionNote(selectedId, noteText.trim());
    setNoteText('');
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Actions</Typography>
      <Grid container spacing={2}>
        {/* ── List ── */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
            <FormControl size="small" sx={{ minWidth: 110 }}>
              <InputLabel>Group</InputLabel>
              <Select value={groupFilter} label="Group" onChange={(e) => setGroupFilter(e.target.value as any)}>
                <MenuItem value="All">All</MenuItem>
                {ASSIGNEE_GROUPS.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 110 }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value as any)}>
                <MenuItem value="All">All</MenuItem>
                {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Assignee</InputLabel>
              <Select value={assigneeFilter} label="Assignee" onChange={(e) => setAssigneeFilter(e.target.value as string)}>
                <MenuItem value="All">All</MenuItem>
                {assigneeOptions.map((o) => <MenuItem key={o.key} value={o.key}>{o.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>

          <Stack spacing={1} sx={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto', pr: 0.5 }}>
            {filtered.map((a) => {
              const name = getAssigneeName(a);
              const isSelected = a.id === selectedId;
              return (
                <Card key={a.id} variant="outlined"
                  sx={{
                    cursor: 'pointer',
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    borderWidth: isSelected ? 2 : 1,
                    transition: 'border-color 0.15s',
                    '&:hover': { borderColor: 'primary.light' },
                  }}
                  onClick={() => { setSelectedId(a.id); setEditing(false); }}>
                  <CardContent sx={{ py: 1.25, '&:last-child': { pb: 1.25 } }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="body2" sx={{ flex: 1, fontWeight: 600, fontSize: '0.82rem' }}>{a.title}</Typography>
                      <ActionStatusChip status={a.status} />
                    </Stack>

                    {/* Assignee row — prominent */}
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.75 }}>
                      <Avatar
                        sx={{
                          width: 24, height: 24, fontSize: '0.6rem', fontWeight: 700,
                          bgcolor: name === 'Unassigned' ? '#D4D1CC' : assigneeColor(name),
                          color: '#fff',
                        }}
                      >
                        {name === 'Unassigned' ? <PersonIcon sx={{ fontSize: 14 }} /> : userInitials(name)}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.78rem', color: name === 'Unassigned' ? '#8B8B8B' : '#2D2D2D' }}>
                        {name}
                      </Typography>
                      <Box sx={{ flex: 1 }} />
                      <Chip label={a.priority} size="small" variant="outlined"
                        sx={{
                          fontSize: '0.6rem', height: 20,
                          borderColor: a.priority === 'High' ? '#C1382E' : a.priority === 'Medium' ? '#C47A20' : '#8B8B8B',
                          color: a.priority === 'High' ? '#C1382E' : a.priority === 'Medium' ? '#C47A20' : '#8B8B8B',
                        }} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                        {fmtTs(a.dueAt)}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
            {filtered.length === 0 && <Typography variant="body2" color="text.secondary">No actions match filters.</Typography>}
          </Stack>
        </Grid>

        {/* ── Detail ── */}
        <Grid size={{ xs: 12, md: 7 }}>
          {selected ? (
            <Card sx={{ position: 'sticky', top: 16 }}>
              <CardContent>
                {/* Header with edit toggle */}
                <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
                  {editing ? (
                    <TextField size="small" fullWidth value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                      sx={{ mr: 1, '& input': { fontWeight: 600, fontSize: '0.95rem' } }} />
                  ) : (
                    <Typography variant="h6" sx={{ flex: 1 }}>{selected.title}</Typography>
                  )}
                  {editing ? (
                    <Stack direction="row" spacing={0.5}>
                      <IconButton size="small" color="primary" onClick={saveEdit}><CheckIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={cancelEdit}><CloseIcon fontSize="small" /></IconButton>
                    </Stack>
                  ) : (
                    <IconButton size="small" onClick={startEditing}><EditIcon fontSize="small" /></IconButton>
                  )}
                </Stack>

                {/* Assignee — large and prominent */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, p: 1.5, bgcolor: '#F5F3F0', borderRadius: 1, border: '1px solid #E8E6E3' }}>
                  {(() => {
                    const name = getAssigneeName(selected);
                    return (
                      <>
                        <Avatar sx={{
                          width: 36, height: 36, fontSize: '0.8rem', fontWeight: 700,
                          bgcolor: name === 'Unassigned' ? '#D4D1CC' : assigneeColor(name), color: '#fff',
                        }}>
                          {name === 'Unassigned' ? <PersonIcon /> : userInitials(name)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1 }}>Assigned to</Typography>
                          {editing ? (
                            <Select size="small" value={editAssignee} displayEmpty
                              onChange={(e) => setEditAssignee(e.target.value as string)}
                              sx={{ mt: 0.5, minWidth: 180, fontSize: '0.82rem' }}>
                              <MenuItem value=""><em>Unassigned</em></MenuItem>
                              {users.map((u) => <MenuItem key={u.id} value={u.id}>{u.name} — {u.role}</MenuItem>)}
                            </Select>
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{name}</Typography>
                          )}
                        </Box>
                      </>
                    );
                  })()}
                </Box>

                {/* Properties */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Type</Typography>
                    {editing ? (
                      <Select size="small" fullWidth value={editType} onChange={(e) => setEditType(e.target.value as ActionType)}
                        sx={{ mt: 0.25, fontSize: '0.82rem' }}>
                        {ACTION_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                      </Select>
                    ) : (
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{selected.type}</Typography>
                    )}
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Group</Typography>
                    {editing ? (
                      <Select size="small" fullWidth value={editGroup} onChange={(e) => setEditGroup(e.target.value as AssigneeGroup)}
                        sx={{ mt: 0.25, fontSize: '0.82rem' }}>
                        {ASSIGNEE_GROUPS.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                      </Select>
                    ) : (
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{selected.assigneeGroup}</Typography>
                    )}
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Priority</Typography>
                    {editing ? (
                      <Select size="small" fullWidth value={editPriority} onChange={(e) => setEditPriority(e.target.value as 'Low' | 'Medium' | 'High')}
                        sx={{ mt: 0.25, fontSize: '0.82rem' }}>
                        {PRIORITIES.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                      </Select>
                    ) : (
                      <Chip label={selected.priority} size="small" variant="outlined"
                        sx={{
                          mt: 0.25,
                          borderColor: selected.priority === 'High' ? '#C1382E' : selected.priority === 'Medium' ? '#C47A20' : '#8B8B8B',
                          color: selected.priority === 'High' ? '#C1382E' : selected.priority === 'Medium' ? '#C47A20' : '#8B8B8B',
                        }} />
                    )}
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Due</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{fmtTs(selected.dueAt)}</Typography>
                  </Box>
                  {selected.cmmsWorkOrderId && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">CMMS WO</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{selected.cmmsWorkOrderId}</Typography>
                    </Box>
                  )}
                </Box>

                {/* Status bar */}
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Status</Typography>
                <Stack direction="row" spacing={0.5} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}>
                  {STATUSES.map((s) => (
                    <Button key={s} size="small"
                      variant={selected.status === s ? 'contained' : 'outlined'}
                      color={selected.status === s ? 'primary' : 'inherit'}
                      onClick={() => updateActionStatus(selected.id, s)}
                      sx={{ fontSize: '0.68rem', minWidth: 0, px: 1.2, py: 0.5, textTransform: 'none' }}>
                      {s}
                    </Button>
                  ))}
                </Stack>

                {linkedAnomaly && (
                  <Button size="small" variant="outlined" sx={{ mb: 2 }}
                    onClick={() => navigate(`/anomalies/${linkedAnomaly.id}`)}>
                    View Anomaly: {linkedAnomaly.title}
                  </Button>
                )}

                <Divider sx={{ mb: 1.5 }} />

                {/* Notes */}
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Notes</Typography>
                <Stack spacing={0.5} sx={{ mb: 1 }}>
                  {selected.notes.map((n, i) => (
                    <Box key={i} sx={{ p: 1, bgcolor: '#F5F3F0', borderRadius: 1 }}>
                      <Typography variant="caption" color="primary" sx={{ fontWeight: 500 }}>
                        {users.find((u) => u.id === n.userId)?.name ?? 'Unknown'} · {fmtTs(n.ts)}
                      </Typography>
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
