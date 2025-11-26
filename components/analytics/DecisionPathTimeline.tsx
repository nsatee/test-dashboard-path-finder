import React, { useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Decision } from '../../types';
import { ChartErrorBoundary } from './ChartWrapper';

type Props = {
  data: Decision[];
};

export function DecisionPathTimeline({ data }: Props) {
  const chartData = useMemo(() => {
    // Group by month
    const monthlyStats: Record<string, { monthDate: number, total: number, right: number, wrong: number, unclear: number }> = {};

    data.forEach(d => {
      const date = new Date(d.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyStats[key]) {
        monthlyStats[key] = { monthDate: date.getTime(), total: 0, right: 0, wrong: 0, unclear: 0 };
      }

      monthlyStats[key].total++;
      if (d.outcome === 'right_call') monthlyStats[key].right++;
      else if (d.outcome === 'wrong_call') monthlyStats[key].wrong++;
      else monthlyStats[key].unclear++;
    });

    return Object.entries(monthlyStats)
      .map(([key, stats]) => ({
        name: new Date(stats.monthDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        date: stats.monthDate,
        ...stats,
        successRate: stats.total > 0 ? Math.round((stats.right / stats.total) * 100) : 0
      }))
      .sort((a, b) => a.date - b.date);
  }, [data]);

  if (data.length === 0) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">No data available</div>;
  }

  return (
    <ChartErrorBoundary>
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-4 px-2">
            <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-card-foreground">Monthly Trend:</span> Volume vs. Quality
            </div>
        </div>
        <div className="flex-grow min-h-0">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                data={chartData}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                <defs>
                    <linearGradient id="colorRight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-success)" stopOpacity={1}/>
                        <stop offset="100%" stopColor="var(--color-success)" stopOpacity={0.6}/>
                    </linearGradient>
                    <linearGradient id="colorWrong" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-destructive)" stopOpacity={1}/>
                        <stop offset="100%" stopColor="var(--color-destructive)" stopOpacity={0.6}/>
                    </linearGradient>
                     <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                    </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.4} />
                <XAxis 
                    dataKey="name" 
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                />
                <YAxis 
                    yAxisId="left"
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    label={{ value: 'Volume', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'var(--color-muted-foreground)', fontSize: 10 } }}
                />
                <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    unit="%"
                    label={{ value: 'Success Rate', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: 'var(--color-muted-foreground)', fontSize: 10 } }}
                />
                <Tooltip 
                    cursor={{fill: 'var(--color-muted)', opacity: 0.2}}
                    contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    labelStyle={{ color: 'var(--color-card-foreground)', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" />
                
                <Bar yAxisId="left" dataKey="right" name="Right Call" stackId="a" fill="url(#colorRight)" radius={[0, 0, 4, 4]} barSize={24} />
                <Bar yAxisId="left" dataKey="wrong" name="Wrong Call" stackId="a" fill="url(#colorWrong)" barSize={24} />
                <Bar yAxisId="left" dataKey="unclear" name="Unclear" stackId="a" fill="var(--color-muted-foreground)" radius={[4, 4, 0, 0]} opacity={0.3} barSize={24} />
                
                {/* Use Area instead of Line for visual weight */}
                <Area 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="successRate" 
                    name="Success Rate" 
                    stroke="var(--color-primary)" 
                    strokeWidth={3}
                    fill="url(#colorRate)"
                    dot={{ fill: 'var(--color-card)', stroke: 'var(--color-primary)', strokeWidth: 2, r: 4 }}
                />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
      </div>
    </ChartErrorBoundary>
  );
}