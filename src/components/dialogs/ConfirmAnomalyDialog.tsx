import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography } from '@mui/material';
import { useStore } from '../../app/store';
import type { Anomaly } from '../../app/types';
import { confirmationsNeeded } from '../../app/utils';

interface Props { open: boolean; onClose: () => void; anomaly: Anomaly }

export default function ConfirmAnomalyDialog({ open, onClose, anomaly }: Props) {
  const { confirmAnomaly, currentUserId } = useStore();
  const [rationale, setRationale] = useState('');
  const alreadyConfirmed = anomaly.confirmations.some((c) => c.byUserId === currentUserId);
  const needed = confirmationsNeeded(anomaly.severity);

  const handleConfirm = () => {
    if (!rationale.trim()) return;
    confirmAnomaly(anomaly.id, rationale.trim());
    setRationale('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Confirm Anomaly</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>{anomaly.title}</strong> — {anomaly.severity} severity
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Confirmations: {anomaly.confirmations.length} / {needed} required
        </Typography>
        {alreadyConfirmed ? (
          <Typography color="warning.main">You have already confirmed this anomaly.</Typography>
        ) : (
          <TextField label="Rationale" multiline rows={3} fullWidth value={rationale}
            onChange={(e) => setRationale(e.target.value)} sx={{ mt: 1 }} />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleConfirm} disabled={alreadyConfirmed || !rationale.trim()}>
          Confirm Anomaly
        </Button>
      </DialogActions>
    </Dialog>
  );
}
