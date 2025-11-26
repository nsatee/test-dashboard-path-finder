
import React, { useState } from 'react';
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

type Grouping = 'tag' | 'confidence' | 'stress';

export function PathSuccessRateChart({ data }: Props) {
  const [grouping, setGrouping] = useState<Grouping>('tag');

  const processedData = React.useMemo(() => {
    const stats: Record<string, { total: number; right: number }> = {};
    
    if (grouping === 'tag') {
        data.forEach(d => {
            d.tags.forEach(tag => {
                if (!stats[tag]) stats[tag] = { total: 0, right: 0 };
                stats[tag].total += 1;
                if (d.outcome === 'right_call') stats[tag].right += 1;
            });
        });
    } else if (grouping === 'confidence') {
        data.forEach(d => {
            let key = 'Medium (40-70%)';
            if (d.initialConfidence > 70) key = 'High (>70%)';
            if (d.initialConfidence < 40) key = 'Low (<40%)';
            
            if (!stats[key]) stats[key] = { total: 0, right: 0 };
            stats[key].total += 1;
            if (d.outcome === 'right_call') stats[key].right += 1;
        });
    } else if (grouping === 'stress') {
        data.forEach(d => {
            let key = 'Medium (4-7)';
            if (d.stressLevel > 7) key = 'High (8-10)';
            if (d.stressLevel < 4) key = 'Low (0-3)';

            if (!stats[key]) stats[key] = { total: 0, right: 0 };
            stats[key].total += 1;
            if (d.outcome === 'right_call') stats[key].right += 1;
        });
    }

    return Object.entries(stats)
      .map(([name, val]) => ({
        name,
        rate: Math.round((val.right / val.total) * 100),
        count: val.total
      }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 7);
  }, [data, grouping]);

  return (
    <ChartErrorBoundary>
      <div className="h-full flex flex-col">
        <div className="flex gap-2 mb-4 justify-end">
            {(['tag', 'confidence', 'stress'] as const).map(g => (
                <button
                    key={g}
                    onClick={() => setGrouping(g)}
                    className={`px-2 py-1 text-[10px] uppercase font-semibold tracking-wider rounded border transition-colors ${
                        grouping === g 
                        ? 'bg-[var(--color-card-foreground)] text-[var(--color-card)] border-transparent' 
                        : 'text-muted-foreground border-border hover:bg-[var(--color-muted)]'
                    }`}
                >
                    {g}
                </button>
            ))}
        </div>
        <div className="flex-grow min-h-0">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                data={processedData}
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
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                />
                <Tooltip 
                    cursor={{ fill: 'var(--color-muted)', opacity: 0.2 }}
                    contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', color: 'var(--color-card-foreground)' }}
                    formatter={(value: any, name: any, props: any) => [`${value}% Success`, `(${props.payload.count} decisions)`]}
                />
                <Bar dataKey="rate" radius={[0, 4, 4, 0]} barSize={20}>
                    {processedData.map((entry, index) => (
                    <Cell 
                        key={`cell-${index}`} 
                        fill={`hsl(${100 * (entry.rate / 100)}, 70%, 50%)`} 
                    />
                    ))}
                </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>
    </ChartErrorBoundary>
  );
}
