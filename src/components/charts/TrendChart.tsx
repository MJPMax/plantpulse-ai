import { ResponsiveContainer, LineChart, Line, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceArea, ReferenceLine } from 'recharts';
import { format } from 'date-fns';
import { Box, Typography } from '@mui/material';

interface Series { data: { ts: number; value: number }[]; name: string; color: string }
interface RefLine { label: string; value: number; color: string; dashed?: boolean }
interface BackgroundSeries { data: { ts: number; value: number }[]; name: string }
interface Props {
  series: Series[];
  height?: number;
  normalRange?: { min: number; max: number };
  anomalyBands?: { start: number; end: number }[];
  refLines?: RefLine[];
  backgroundSeries?: BackgroundSeries;
  title?: string;
}

export default function TrendChart({ series, height = 260, normalRange, anomalyBands, refLines, backgroundSeries, title }: Props) {
  if (!series.length || !series[0].data.length) return null;
  // Merge into unified data
  const merged = series[0].data.map((p, i) => {
    const row: Record<string, number> = { ts: p.ts };
    series.forEach((s) => { row[s.name] = s.data[i]?.value ?? 0; });
    if (backgroundSeries) { row[backgroundSeries.name] = backgroundSeries.data[i]?.value ?? 0; }
    return row;
  });

  return (
    <Box>
      {title && <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{title}</Typography>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={merged} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#D4D1CC" />
          <XAxis dataKey="ts" tickFormatter={(v) => format(new Date(v), 'HH:mm')} tick={{ fontSize: 10, fill: '#8A8A8A' }} />
          <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#8A8A8A' }} />
          {backgroundSeries && (
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9, fill: '#B0ADA8' }} />
          )}
          <Tooltip labelFormatter={(v) => format(new Date(v as number), 'MMM d, HH:mm')} contentStyle={{ background: '#F5F3F0', border: '1px solid #D4D1CC', fontSize: 12, borderRadius: 6 }} />
          {normalRange && (
            <ReferenceArea yAxisId="left" y1={normalRange.min} y2={normalRange.max} fill="#4caf50" fillOpacity={0.08} />
          )}
          {anomalyBands?.map((b, i) => (
            <ReferenceArea key={i} x1={b.start} x2={b.end} fill="#d32f2f" fillOpacity={0.1} />
          ))}
          {refLines?.map((rl, i) => (
            <ReferenceLine key={`ref-${i}`} yAxisId="left" y={rl.value} stroke={rl.color} strokeDasharray={rl.dashed ? '6 3' : undefined} strokeWidth={1.2}
              label={{ value: rl.label, position: 'right', fill: rl.color, fontSize: 10 }} />
          ))}
          {/* Background plant rate — filled area */}
          {backgroundSeries && (
            <Area yAxisId="right" dataKey={backgroundSeries.name} stroke="#B0ADA8" strokeWidth={0.8} strokeOpacity={0.5}
              fill="#C4C0BA" fillOpacity={0.15} dot={false} />
          )}
          {series.map((s) => (
            <Line key={s.name} yAxisId="left" dataKey={s.name} stroke={s.color} dot={false} strokeWidth={1.5} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}
