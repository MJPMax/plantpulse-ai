import { useState } from 'react';
import {
  Box, Typography, TextField, Select, MenuItem, Button, Stack, FormControl, InputLabel, Alert,
} from '@mui/material';
import { useStore } from '../../app/store';
import type { Anomaly, RootCauseCategory, VerificationMethod } from '../../app/types';

interface Props { anomaly: Anomaly; onResolve?: () => void }

export default function ResolutionLogForm({ anomaly, onResolve }: Props) {
  const { setResolutionLog, markResolved, currentUserId } = useStore();
  const log = anomaly.resolutionLog;

  const [rootCauseCategory, setRootCauseCategory] = useState<RootCauseCategory>(log?.rootCauseCategory ?? 'Unknown');
  const [rootCauseDescription, setRootCauseDescription] = useState(log?.rootCauseDescription ?? '');
  const [correctiveActionsSummary, setCorrectiveActionsSummary] = useState(log?.correctiveActionsSummary ?? '');
  const [preventiveActions, setPreventiveActions] = useState(log?.preventiveActions ?? '');
  const [verificationMethod, setVerificationMethod] = useState<VerificationMethod>(log?.verificationMethod ?? 'Metric stable');
  const [verificationWindowHours, setVerificationWindowHours] = useState(log?.verificationWindowHours ?? 8);
  const [error, setError] = useState('');

  const save = () => {
    setResolutionLog(anomaly.id, {
      rootCauseCategory, rootCauseDescription, correctiveActionsSummary, preventiveActions,
      verificationMethod, verificationWindowHours, evidenceLinks: [],
      approverUserId: currentUserId, resolvedAt: Date.now(),
    });
  };

  const handleResolve = () => {
    save();
    if (!rootCauseCategory || !rootCauseDescription.trim()) {
      setError('Root cause category and description are required.');
      return;
    }
    // Need to call markResolved after state updates; use timeout
    setTimeout(() => {
      const ok = markResolved(anomaly.id);
      if (!ok) setError('Resolution log incomplete.');
      else { setError(''); onResolve?.(); }
    }, 100);
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Resolution Log</Typography>
      {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
      <Stack spacing={2}>
        <FormControl fullWidth>
          <InputLabel>Root Cause Category</InputLabel>
          <Select value={rootCauseCategory} label="Root Cause Category" onChange={(e) => setRootCauseCategory(e.target.value as RootCauseCategory)}>
            {['Equipment', 'Instrumentation', 'Process Condition', 'Raw Material', 'Operator Procedure', 'Unknown'].map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField label="Root Cause Description" multiline rows={2} value={rootCauseDescription}
          onChange={(e) => setRootCauseDescription(e.target.value)} fullWidth />
        <TextField label="Corrective Actions Summary" multiline rows={2} value={correctiveActionsSummary}
          onChange={(e) => setCorrectiveActionsSummary(e.target.value)} fullWidth />
        <TextField label="Preventive Actions" multiline rows={2} value={preventiveActions}
          onChange={(e) => setPreventiveActions(e.target.value)} fullWidth />
        <FormControl fullWidth>
          <InputLabel>Verification Method</InputLabel>
          <Select value={verificationMethod} label="Verification Method" onChange={(e) => setVerificationMethod(e.target.value as VerificationMethod)}>
            {['Metric stable', 'Inspection', 'Lab result', 'Other'].map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField label="Verification Window (hours)" type="number" value={verificationWindowHours}
          onChange={(e) => setVerificationWindowHours(Number(e.target.value))} fullWidth />
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={save}>Save Draft</Button>
          <Button variant="contained" color="success" onClick={handleResolve}>Mark Resolved</Button>
        </Stack>
      </Stack>
    </Box>
  );
}
