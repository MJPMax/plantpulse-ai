import { Box } from '@mui/material';
import type { Severity } from '../../app/types';
import { severityColor } from '../../app/utils';

export default function SeverityDot({ severity, size = 10 }: { severity: Severity; size?: number }) {
  return (
    <Box
      component="span"
      sx={{
        width: size, height: size, borderRadius: '50%', display: 'inline-block',
        bgcolor: severityColor[severity], flexShrink: 0,
      }}
    />
  );
}
