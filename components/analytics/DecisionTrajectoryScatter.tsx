import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  Label
} from 'recharts';
import { Decision } from '../../types';
import { ChartErrorBoundary } from './ChartWrapper';

type Props = {
  data: Decision[];
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border p-3 rounded shadow-lg text-sm max-w-xs">
        <p className="font-semibold text-card-foreground mb-1">{data.title}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <span className="text-muted-foreground">Initial:</span>
          <span>{data.initialConfidence}%</span>
          <span className="text-muted-foreground">Final:</span>
          <span>{data.finalConfidence}%</span>
          <span className="text-muted-foreground">Change:</span>
          <span className={data.finalConfidence >= data.initialConfidence ? 'text-[var(--color-success-foreground)]' : 'text-[var(--color-destructive-foreground)]'}>
            {data.finalConfidence - data.initialConfidence}%
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export function DecisionTrajectoryScatter({ data }: Props) {
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
        <ScatterChart
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
          <XAxis 
            type="number" 
            dataKey="initialConfidence" 
            name="Initial Confidence" 
            domain={[0, 100]}
            stroke="var(--color-muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          >
            <Label value="Initial Confidence (%)" offset={0} position="insideBottom" style={{ fill: 'var(--color-muted-foreground)' }} />
          </XAxis>
          <YAxis 
            type="number" 
            dataKey="finalConfidence" 
            name="Final Confidence" 
            domain={[0, 100]}
            stroke="var(--color-muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          >
             <Label value="Post-Mortem Confidence (%)" angle={-90} position="insideLeft" style={{ fill: 'var(--color-muted-foreground)' }} />
          </YAxis>
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          
          {/* Diagonal Line: Calibration Line */}
          <ReferenceLine 
            segment={[{ x: 0, y: 0 }, { x: 100, y: 100 }]} 
            stroke="var(--color-muted-foreground)" 
            strokeDasharray="3 3" 
            opacity={0.5}
            label={{ value: 'Perfect Calibration', position: 'insideTopRight', fill: 'var(--color-muted-foreground)', fontSize: 10 }}
          />

          <Scatter name="Decisions" data={data} fill="#8884d8">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.outcome)} stroke="white" strokeWidth={1} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </ChartErrorBoundary>
  );
}