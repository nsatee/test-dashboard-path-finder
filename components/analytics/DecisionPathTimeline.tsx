import React from 'react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Scatter,
  Cell
} from 'recharts';
import { Decision } from '../../types';
import { ChartErrorBoundary } from './ChartWrapper';

type Props = {
  data: Decision[];
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border p-3 rounded shadow-lg text-sm">
        <p className="font-semibold text-card-foreground mb-1">{data.title}</p>
        <p className="text-muted-foreground">Date: {data.date}</p>
        <p className="text-muted-foreground">Outcome: <span className="capitalize text-card-foreground">{data.outcome.replace('_', ' ')}</span></p>
        <p className="text-muted-foreground">Confidence: {data.initialConfidence}%</p>
      </div>
    );
  }
  return null;
};

export function DecisionPathTimeline({ data }: Props) {
  // Color mapping matches CSS vars
  const getColor = (outcome: string) => {
    switch (outcome) {
      case 'right_call': return 'var(--color-success)';
      case 'wrong_call': return 'var(--color-destructive)';
      default: return 'var(--color-muted-foreground)';
    }
  };

  return (
    <ChartErrorBoundary>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="var(--color-muted-foreground)" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            minTickGap={30}
          />
          <YAxis 
            dataKey="initialConfidence" 
            stroke="var(--color-muted-foreground)" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
            label={{ value: 'Confidence %', angle: -90, position: 'insideLeft', style: { fill: 'var(--color-muted-foreground)' } }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--color-border)', strokeWidth: 1 }} />
          
          {/* Subtle line connecting chronologically */}
          <Line
            type="monotone"
            dataKey="initialConfidence"
            stroke="var(--color-primary)"
            strokeWidth={2}
            dot={false}
            opacity={0.3}
            activeDot={false}
          />
          
          {/* Points represent specific decisions */}
          <Scatter dataKey="initialConfidence" fill="var(--color-primary)">
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={getColor(entry.outcome)} 
                strokeWidth={2}
                stroke={entry.outcome === 'unclear' ? 'transparent' : 'white'}
              />
            ))}
          </Scatter>
        </ComposedChart>
      </ResponsiveContainer>
    </ChartErrorBoundary>
  );
}