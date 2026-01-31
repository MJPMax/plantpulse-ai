import { useState } from 'react';
import {
  Drawer, Typography, TextField, Select, MenuItem, Button, Stack, FormControl, InputLabel,
  Avatar, Box,
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import { useStore } from '../../app/store';
import type { ActionType, AssigneeGroup } from '../../app/types';

interface Props { open: boolean; onClose: () => void; anomalyId: string }

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
    <Drawer anchor="right" open={open} onClose={onClose} sx={{ '& .MuiDrawer-paper': { width: 380, p: 3 } }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Assign Action</Typography>
      <Stack spacing={2}>
        <TextField label="Action Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
        <FormControl fullWidth>
          <InputLabel>Type</InputLabel>
          <Select value={type} label="Type" onChange={(e) => setType(e.target.value as ActionType)}>
            {['Inspect', 'Repair', 'Calibrate', 'Adjust', 'Replace', 'Clean'].map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Assignee Group</InputLabel>
          <Select value={group} label="Assignee Group" onChange={(e) => setGroup(e.target.value as AssigneeGroup)}>
            {['Maintenance', 'Electrician', 'Instrumentation', 'Operations'].map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Assign To</InputLabel>
          <Select value={assigneeUserId} label="Assign To" displayEmpty
            onChange={(e) => setAssigneeUserId(e.target.value as string)}
            renderValue={(val) => {
              if (!val) return <em style={{ color: '#999' }}>Unassigned</em>;
              const u = users.find((u) => u.id === val);
              return u ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 22, height: 22, fontSize: '0.55rem', fontWeight: 700, bgcolor: assigneeColor(u.name), color: '#fff' }}>
                    {userInitials(u.name)}
                  </Avatar>
                  {u.name}
                </Box>
              ) : '';
            }}>
            <MenuItem value=""><em>Unassigned</em></MenuItem>
            {users.map((u) => (
              <MenuItem key={u.id} value={u.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 24, height: 24, fontSize: '0.6rem', fontWeight: 700, bgcolor: assigneeColor(u.name), color: '#fff' }}>
                    {userInitials(u.name)}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{u.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{u.role}</Typography>
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Priority</InputLabel>
          <Select value={priority} label="Priority" onChange={(e) => setPriority(e.target.value as any)}>
            {['Low', 'Medium', 'High'].map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={handleSubmit} disabled={!title.trim()}>Create Action</Button>
        <Button onClick={onClose}>Cancel</Button>
      </Stack>
    </Drawer>
  );
}
