import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Decision } from '../../types';
import { ChartErrorBoundary } from './ChartWrapper';

type Props = {
  data: Decision[];
};

export function PathSuccessRateChart({ data }: Props) {
  // Aggregate tags and calculate success rate
  const tagStats = React.useMemo(() => {
    const stats: Record<string, { total: number; right: number }> = {};
    
    data.forEach(d => {
      d.tags.forEach(tag => {
        if (!stats[tag]) stats[tag] = { total: 0, right: 0 };
        stats[tag].total += 1;
        if (d.outcome === 'right_call') stats[tag].right += 1;
      });
    });

    return Object.entries(stats)
      .map(([name, val]) => ({
        name,
        rate: Math.round((val.right / val.total) * 100),
        count: val.total
      }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 7); // Top 7 tags
  }, [data]);

  return (
    <ChartErrorBoundary>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={tagStats}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--color-border)" opacity={0.5} />
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={100} 
            stroke="var(--color-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            cursor={{ fill: 'var(--color-muted)', opacity: 0.2 }}
            contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', color: 'var(--color-card-foreground)' }}
          />
          <Bar dataKey="rate" radius={[0, 4, 4, 0]} barSize={20}>
            {tagStats.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={`hsl(${100 * (entry.rate / 100)}, 70%, 50%)`} // Gradient based on success
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartErrorBoundary>
  );
}