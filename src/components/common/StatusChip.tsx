import { Chip } from '@mui/material';
import type { AnomalyStatus, ActionStatus } from '../../app/types';
import { statusColor, actionStatusColor } from '../../app/utils';

export function AnomalyStatusChip({ status }: { status: AnomalyStatus }) {
  return <Chip label={status} size="small" sx={{ bgcolor: statusColor[status] + '22', color: statusColor[status], fontWeight: 600, fontSize: '0.7rem' }} />;
}

export function ActionStatusChip({ status }: { status: ActionStatus }) {
  return <Chip label={status} size="small" sx={{ bgcolor: actionStatusColor[status] + '22', color: actionStatusColor[status], fontWeight: 600, fontSize: '0.7rem' }} />;
}
