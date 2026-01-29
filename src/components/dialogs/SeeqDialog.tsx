import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Chip, Stack } from '@mui/material';
import type { Anomaly, Metric } from '../../app/types';
import { useStore } from '../../app/store';

interface Props { open: boolean; onClose: () => void; anomaly?: Anomaly; metric?: Metric }

export default function SeeqDialog({ open, onClose, anomaly, metric }: Props) {
  const { facilities, metrics } = useStore();
  const facilityId = anomaly?.facilityId ?? metric?.facilityId;
  const facility = facilities.find((f) => f.id === facilityId);
  const tags = metric
    ? metric.tags
    : anomaly?.relatedMetricIds.flatMap((id) => metrics.find((m) => m.id === id)?.tags ?? []) ?? [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Open in SEEQ</DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, border: '1px dashed', borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            This would open the SEEQ analytics workbench with the following context:
          </Typography>
          <Typography variant="body2"><strong>Facility:</strong> {facility?.name}</Typography>
          <Typography variant="body2"><strong>Time Window:</strong> Last 24h (configurable)</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}><strong>Subject:</strong> {anomaly?.title ?? metric?.name}</Typography>
          <Typography variant="body2" sx={{ mb: 0.5 }}><strong>Tags:</strong></Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
            {tags.map((t) => <Chip key={t} label={t} size="small" variant="outlined" />)}
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" onClick={onClose}>Open SEEQ (mock)</Button>
      </DialogActions>
    </Dialog>
  );
}
