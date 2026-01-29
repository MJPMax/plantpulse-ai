import { useState } from 'react';
import {
  Drawer, Typography, TextField, Select, MenuItem, Button, Stack, FormControl, InputLabel,
} from '@mui/material';
import { useStore } from '../../app/store';
import type { ActionType, AssigneeGroup } from '../../app/types';

interface Props { open: boolean; onClose: () => void; anomalyId: string }

export default function AssignActionDrawer({ open, onClose, anomalyId }: Props) {
  const { createAction } = useStore();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ActionType>('Inspect');
  const [group, setGroup] = useState<AssigneeGroup>('Maintenance');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [assigneeName, setAssigneeName] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) return;
    createAction(anomalyId, {
      title: title.trim(), type, assigneeGroup: group, assigneeName: assigneeName || undefined,
      priority, dueAt: Date.now() + 8 * 3600_000, status: 'New',
    });
    setTitle(''); setAssigneeName('');
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
        <TextField label="Assignee Name (optional)" value={assigneeName} onChange={(e) => setAssigneeName(e.target.value)} fullWidth />
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
