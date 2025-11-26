
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
  ReferenceLine
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
      <div className="bg-card border border-border p-3 rounded shadow-lg text-sm z-50">
        <p className="font-semibold text-card-foreground mb-1">{data.title}</p>
        <div className="space-y-1 text-xs">
             <p className="text-muted-foreground">Created: <span className="text-card-foreground">{data.date}</span></p>
             {data.sealedDate && <p className="text-muted-foreground">Sealed: <span className="text-card-foreground">{data.sealedDate}</span></p>}
             {data.retrospectiveDate && <p className="text-muted-foreground">Retro: <span className="text-card-foreground">{data.retrospectiveDate}</span></p>}
             <p className="text-muted-foreground mt-2">Outcome: <span className="capitalize text-card-foreground font-medium">{data.outcome.replace('_', ' ')}</span></p>
             <p className="text-muted-foreground">Confidence: {data.initialConfidence}%</p>
        </div>
      </div>
    );
  }
  return null;
};

export function DecisionPathTimeline({ data }: Props) {
  // Transform data to flatten events for the timeline
  // Y-axis will be the decision index to stack them
  const chartData = data.map((d, i) => ({
      ...d,
      index: i + 1,
      frameTime: new Date(d.date).getTime(),
      sealTime: d.sealedDate ? new Date(d.sealedDate).getTime() : null,
      retroTime: d.retrospectiveDate ? new Date(d.retrospectiveDate).getTime() : null,
  }));

  const getColor = (outcome: string) => {
    switch (outcome) {
      case 'right_call': return 'var(--color-success)';
      case 'wrong_call': return 'var(--color-destructive)';
      default: return 'var(--color-muted-foreground)';
    }
  };

  const minTime = Math.min(...chartData.map(d => d.frameTime));
  const maxTime = Math.max(...chartData.map(d => d.retroTime || d.frameTime)) + 86400000 * 2; // buffer

  return (
    <ChartErrorBoundary>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          layout="vertical"
          width={500}
          height={400}
          data={chartData}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} horizontal={true} vertical={true} />
          
          <XAxis 
            type="number" 
            dataKey="frameTime" 
            domain={[minTime, maxTime]}
            scale="time"
            tickFormatter={(tick) => new Date(tick).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            stroke="var(--color-muted-foreground)"
            fontSize={10}
            tickLine={false}
            axisLine={false}
          />
          
          <YAxis 
            type="number" 
            dataKey="index" 
            stroke="var(--color-muted-foreground)" 
            fontSize={10}
            tickLine={false}
            axisLine={false}
            width={30}
            reversed={true} // Newest top if sorted desc, but here we usually sort asc by date. Let's keep normal.
          />
          
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--color-border)', strokeWidth: 1 }} />
          
          {/* Connector: Frame -> Seal */}
          <Line
            dataKey="sealTime"
            data={chartData.filter(d => d.sealTime)}
            stroke="var(--color-border)"
            strokeDasharray="3 3"
            strokeWidth={1}
            dot={false}
            activeDot={false}
            legendType="none"
          />

          {/* Points for Frame */}
          <Scatter name="Frame" dataKey="frameTime" shape="circle" fill="var(--color-primary)" />
          
          {/* Points for Seal */}
          <Scatter name="Seal" dataKey="sealTime" shape="square" fill="var(--color-warning)" />

          {/* Points for Retro */}
          <Scatter 
            name="Retro" 
            dataKey="retroTime" 
            shape="diamond" 
            fill="var(--color-foreground)"
          />

          {/* Connection lines between Seal and Retro for each decision */}
          {chartData.map((entry, index) => {
            if (entry.retroTime && entry.sealTime) {
               return (
               <ReferenceLine 
                 key={index} 
                 segment={[
                   { x: entry.sealTime, y: entry.index },
                   { x: entry.retroTime, y: entry.index }
                 ]} 
                 stroke={getColor(entry.outcome)}
                 strokeWidth={2}
               />
               );
            }
            return null;
          })}

        </ComposedChart>
      </ResponsiveContainer>
    </ChartErrorBoundary>
  );
}
