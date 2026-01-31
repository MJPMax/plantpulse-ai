import { useState } from 'react';
import {
  Dialog, Typography, TextField, Select, MenuItem, Button, Stack,
  Avatar, Box, IconButton, Slide,
} from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';
import { Close as CloseIcon, Person as PersonIcon } from '@mui/icons-material';
import { forwardRef } from 'react';
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

const SlideLeft = forwardRef(function SlideLeft(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="left" ref={ref} {...props} />;
});

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
    <Dialog open={open} onClose={onClose} TransitionComponent={SlideLeft}
      maxWidth={false}
      sx={{
        '& .MuiDialog-container': { justifyContent: 'flex-end' },
        '& .MuiDialog-paper': {
          m: 0, width: 400, maxHeight: 'calc(100vh - 48px)', height: 'calc(100vh - 48px)',
          borderRadius: 0, p: 3, overflowY: 'auto', position: 'fixed', top: 48, right: 0,
        },
      }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6">Create Action</Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </Stack>

      <TextField size="small" fullWidth value={title} onChange={(e) => setTitle(e.target.value)}
        placeholder="Action title…" label="Title"
        sx={{ mb: 2, '& input': { fontWeight: 600, fontSize: '0.95rem' } }} />

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
    </Dialog>
  );
}
