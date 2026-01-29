import { ResponsiveContainer, LineChart, Line } from 'recharts';

interface Props {
  data: { ts: number; value: number }[];
  color?: string;
  height?: number;
}

export default function SparklineChart({ data, color = '#42a5f5', height = 40 }: Props) {
  const last = data.slice(-20);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={last}>
        <Line dataKey="value" stroke={color} dot={false} strokeWidth={1.5} />
      </LineChart>
    </ResponsiveContainer>
  );
}
