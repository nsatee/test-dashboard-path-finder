import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';
import { Decision } from '../../types';
import { ChartErrorBoundary } from './ChartWrapper';

type Props = {
  data: Decision[];
};

export function PathSuccessRateChart({ data }: Props) {
  const { chartData, averageSuccessRate } = useMemo(() => {
    const stats: Record<string, { total: number; right: number }> = {};
    
    // Group by tags
    data.forEach(d => {
        d.tags.forEach(tag => {
            if (!stats[tag]) stats[tag] = { total: 0, right: 0 };
            stats[tag].total += 1;
            if (d.outcome === 'right_call') stats[tag].right += 1;
        });
    });

    const totalRight = Object.values(stats).reduce((sum, s) => sum + s.right, 0);
    const totalCount = Object.values(stats).reduce((sum, s) => sum + s.total, 0);
    const avgRate = totalCount > 0 ? Math.round((totalRight / totalCount) * 100) : 0;

    const items = Object.entries(stats)
      .map(([name, val]) => ({
        name,
        rate: Math.round((val.right / val.total) * 100),
        count: val.total
      }))
      .filter(i => i.count >= 1) // Only show paths with data
      .sort((a, b) => b.rate - a.rate) // Sort by success rate
      .slice(0, 7); // Top 7

    return { chartData: items, averageSuccessRate: avgRate };
  }, [data]);

  const CustomYAxisTick = ({ x, y, payload }: any) => {
     // Find the item to get the count
     const item = chartData.find(d => d.name === payload.value);
     return (
        <g transform={`translate(${x},${y})`}>
           <text x={0} y={0} dy={-5} textAnchor="start" fill="var(--color-card-foreground)" fontSize={12} fontWeight={500}>
              {payload.value}
           </text>
           <text x={0} y={0} dy={10} textAnchor="start" fill="var(--color-muted-foreground)" fontSize={10}>
              {item ? `${item.count} decisions` : ''}
           </text>
        </g>
     );
  };

  return (
    <ChartErrorBoundary>
      <div className="h-full flex flex-col">
        <div className="flex-grow min-h-0">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="var(--color-border)" opacity={0.5} />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={100}
                    tick={<CustomYAxisTick />}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                />
                <Tooltip 
                    cursor={{ fill: 'var(--color-muted)', opacity: 0.1 }}
                    contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
                    formatter={(value: any, name: any, props: any) => [`${value}% Success Rate`, `(${props.payload.count} decisions)`]}
                />
                <ReferenceLine x={averageSuccessRate} stroke="var(--color-muted-foreground)" strokeDasharray="3 3">
                   {/* Label is tricky in SVG, tooltip is better */}
                </ReferenceLine>
                
                <Bar dataKey="rate" radius={[0, 4, 4, 0]} barSize={24}>
                    {chartData.map((entry, index) => (
                    <Cell 
                        key={`cell-${index}`} 
                        fill={entry.rate >= averageSuccessRate ? 'var(--color-success)' : 'var(--color-primary)'} 
                        opacity={entry.rate >= averageSuccessRate ? 0.9 : 0.6}
                    />
                    ))}
                </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
        <div className="mt-2 text-center text-xs text-muted-foreground">
           Dashed line represents your average success rate ({averageSuccessRate}%)
        </div>
      </div>
    </ChartErrorBoundary>
  );
}
