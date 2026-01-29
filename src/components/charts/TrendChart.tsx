import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceArea } from 'recharts';
import { format } from 'date-fns';
import { Box, Typography } from '@mui/material';

interface Series { data: { ts: number; value: number }[]; name: string; color: string }
interface Props {
  series: Series[];
  height?: number;
  normalRange?: { min: number; max: number };
  anomalyBands?: { start: number; end: number }[];
  title?: string;
}

export default function TrendChart({ series, height = 260, normalRange, anomalyBands, title }: Props) {
  if (!series.length || !series[0].data.length) return null;
  // Merge into unified data
  const merged = series[0].data.map((p, i) => {
    const row: Record<string, number> = { ts: p.ts };
    series.forEach((s) => { row[s.name] = s.data[i]?.value ?? 0; });
    return row;
  });

  return (
    <Box>
      {title && <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{title}</Typography>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={merged} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E2DC" />
          <XAxis dataKey="ts" tickFormatter={(v) => format(new Date(v), 'HH:mm')} tick={{ fontSize: 10, fill: '#8A8A8A' }} />
          <YAxis tick={{ fontSize: 10, fill: '#8A8A8A' }} />
          <Tooltip labelFormatter={(v) => format(new Date(v as number), 'MMM d, HH:mm')} contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E2DC', fontSize: 12, borderRadius: 6 }} />
          {normalRange && (
            <ReferenceArea y1={normalRange.min} y2={normalRange.max} fill="#4caf50" fillOpacity={0.08} />
          )}
          {anomalyBands?.map((b, i) => (
            <ReferenceArea key={i} x1={b.start} x2={b.end} fill="#d32f2f" fillOpacity={0.1} />
          ))}
          {series.map((s) => (
            <Line key={s.name} dataKey={s.name} stroke={s.color} dot={false} strokeWidth={1.5} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}
