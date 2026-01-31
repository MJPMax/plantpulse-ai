import { useState } from 'react';
import {
  Drawer, Typography, TextField, Select, MenuItem, Button, Stack, FormControl, InputLabel,
  Avatar, Box, IconButton,
} from '@mui/material';
import { Check as CheckIcon, Close as CloseIcon, Person as PersonIcon } from '@mui/icons-material';
import { useStore } from '../../app/store';
import type { ActionType, AssigneeGroup } from '../../app/types';

interface Props { open: boolean; onClose: () => void; anomalyId: string }

const ACTION_TYPES: ActionType[] = ['Inspect', 'Repair', 'Calibrate', 'Adjust', 'Replace', 'Clean'];
const ASSIGNEE_GROUPS: AssigneeGroup[] = ['Maintenance', 'Electrician', 'Instrumentation', 'Operations'];
const PRIORITIES = ['Low', 'Medium', 'High'] as const;

function userInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function assigneeColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return `hsl(${h % 360}, 30%, 45%)`;
}

export default function AssignActionDrawer({ open, onClose, anomalyId }: Props) {
  const { createAction, users } = useStore();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ActionType>('Inspect');
  const [group, setGroup] = useState<AssigneeGroup>('Maintenance');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [assigneeUserId, setAssigneeUserId] = useState('');

  const selectedUser = users.find((u) => u.id === assigneeUserId);
  const assigneeName = selectedUser?.name ?? 'Unassigned';

  const handleSubmit = () => {
    if (!title.trim()) return;
    createAction(anomalyId, {
      title: title.trim(), type, assigneeGroup: group,
      assigneeUserId: assigneeUserId || undefined,
      assigneeName: selectedUser?.name ?? undefined,
      priority, dueAt: Date.now() + 8 * 3600_000, status: 'New',
    });
    setTitle(''); setAssigneeUserId('');
    onClose();
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={{ '& .MuiDrawer-paper': { width: 400, p: 3 } }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
        <TextField size="small" fullWidth value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="Action title…"
          sx={{ mr: 1, '& input': { fontWeight: 600, fontSize: '0.95rem' } }} />
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" color="primary" onClick={handleSubmit} disabled={!title.trim()}><CheckIcon fontSize="small" /></IconButton>
          <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
        </Stack>
      </Stack>

      {/* Assignee — prominent */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, p: 1.5, bgcolor: '#F5F3F0', borderRadius: 1, border: '1px solid #E8E6E3' }}>
        <Avatar sx={{
          width: 36, height: 36, fontSize: '0.8rem', fontWeight: 700,
          bgcolor: assigneeName === 'Unassigned' ? '#D4D1CC' : assigneeColor(assigneeName), color: '#fff',
        }}>
          {assigneeName === 'Unassigned' ? <PersonIcon /> : userInitials(assigneeName)}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1 }}>Assigned to</Typography>
          <Select size="small" value={assigneeUserId} displayEmpty
            onChange={(e) => setAssigneeUserId(e.target.value as string)}
            sx={{ mt: 0.5, minWidth: 180, fontSize: '0.82rem' }}>
            <MenuItem value=""><em>Unassigned</em></MenuItem>
            {users.map((u) => <MenuItem key={u.id} value={u.id}>{u.name} — {u.role}</MenuItem>)}
          </Select>
        </Box>
      </Box>

      {/* Properties grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">Type</Typography>
          <Select size="small" fullWidth value={type} onChange={(e) => setType(e.target.value as ActionType)}
            sx={{ mt: 0.25, fontSize: '0.82rem' }}>
            {ACTION_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </Select>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">Group</Typography>
          <Select size="small" fullWidth value={group} onChange={(e) => setGroup(e.target.value as AssigneeGroup)}
            sx={{ mt: 0.25, fontSize: '0.82rem' }}>
            {ASSIGNEE_GROUPS.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
          </Select>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">Priority</Typography>
          <Select size="small" fullWidth value={priority} onChange={(e) => setPriority(e.target.value as any)}
            sx={{ mt: 0.25, fontSize: '0.82rem' }}>
            {PRIORITIES.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
          </Select>
        </Box>
      </Box>

      <Button variant="contained" fullWidth onClick={handleSubmit} disabled={!title.trim()}>Create Action</Button>
    </Drawer>
  );
}
