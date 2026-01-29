import { Box, Typography, Stack, Chip } from '@mui/material';
import type { AuditEvent } from '../../app/types';
import { fmtTs } from '../../app/utils';

export default function AuditTimeline({ events }: { events: AuditEvent[] }) {
  const sorted = [...events].sort((a, b) => b.ts - a.ts);
  return (
    <Stack spacing={1}>
      {sorted.map((e) => (
        <Box key={e.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, py: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Chip label={e.actor} size="small" variant="outlined"
            color={e.actor === 'ai' ? 'secondary' : e.actor === 'system' ? 'default' : 'primary'}
            sx={{ fontSize: '0.65rem', minWidth: 50 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{e.detail}</Typography>
            <Typography variant="caption" color="text.secondary">{fmtTs(e.ts)} — {e.eventType}</Typography>
          </Box>
        </Box>
      ))}
      {sorted.length === 0 && <Typography variant="body2" color="text.secondary">No audit events.</Typography>}
    </Stack>
  );
}
