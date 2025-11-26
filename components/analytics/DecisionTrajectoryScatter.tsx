import React, { useMemo } from 'react';
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
  ReferenceArea,
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
      <div className="bg-card/95 backdrop-blur border border-border p-3 rounded-lg shadow-xl text-xs z-50">
        <p className="font-bold text-card-foreground mb-1 text-sm">{data.title}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
            <p className="text-muted-foreground">Confidence:</p> 
            <p className="text-right font-mono font-medium">{data.originalConf}%</p>
            
            <p className="text-muted-foreground">Gut Feeling:</p> 
            <p className="text-right font-mono font-medium">{data.originalGut}/10</p>
            
            <p className="text-muted-foreground">Outcome:</p> 
            <p className="text-right capitalize font-bold" style={{
                color: data.outcome === 'right_call' ? 'var(--color-success-foreground)' : 
                       data.outcome === 'wrong_call' ? 'var(--color-destructive)' : 'var(--color-muted-foreground)'
            }}>{data.outcome.replace('_', ' ')}</p>
        </div>
      </div>
    );
  }
  return null;
};

const QuadrantLabel = ({ x, y, text, align }: { x: string, y: string, text: string, align: 'start' | 'end' }) => (
    <div 
        className="absolute text-[10px] font-bold text-foreground/30 uppercase tracking-widest pointer-events-none select-none z-10"
        style={{ 
            left: x, 
            top: y, 
            transform: align === 'end' ? 'translateX(-100%)' : 'none',
        }}
    >
        {text}
    </div>
);

export function DecisionTrajectoryScatter({ data }: Props) {
  const getColor = (outcome: string) => {
    switch (outcome) {
      case 'right_call': return 'var(--color-success)';
      case 'wrong_call': return 'var(--color-destructive)';
      default: return 'var(--color-muted-foreground)';
    }
  };

  // Add jitter to prevent stacking
  const jitteredData = useMemo(() => {
      return data.map(d => ({
          ...d,
          // Store original for tooltip
          originalGut: d.gutFeeling,
          originalConf: d.initialConfidence,
          // Add small random noise: +/- 0.3 for Gut (0-10 scale), +/- 2 for Conf (0-100 scale)
          gutFeeling: Math.max(0, Math.min(10, d.gutFeeling + (Math.random() - 0.5) * 0.6)),
          initialConfidence: Math.max(0, Math.min(100, d.initialConfidence + (Math.random() - 0.5) * 4))
      }));
  }, [data]);

  return (
    <ChartErrorBoundary>
      <div className="h-full flex flex-col relative">
        <div className="mb-2 px-2 text-sm text-muted-foreground flex justify-between">
            <span>Correlation Analysis: <strong>Intuition vs. Analysis</strong></span>
        </div>

        {/* Quadrant Labels Overlay */}
        <QuadrantLabel x="94%" y="6%" text="High Conviction" align="end" />
        <QuadrantLabel x="6%" y="6%" text="Data Driven" align="start" />
        <QuadrantLabel x="94%" y="88%" text="Pure Intuition" align="end" />
        <QuadrantLabel x="6%" y="88%" text="Uncertain" align="start" />

        <div className="flex-grow min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
                
                {/* Background Zones - Very faint */}
                <ReferenceArea x1={5} x2={10} y1={50} y2={100} fill="var(--color-success)" fillOpacity={0.03} />
                <ReferenceArea x1={0} x2={5} y1={0} y2={50} fill="var(--color-destructive)" fillOpacity={0.02} />

                <XAxis 
                    type="number" 
                    dataKey="gutFeeling" 
                    name="Gut Feeling" 
                    domain={[0, 10]} 
                    stroke="var(--color-muted-foreground)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: 'var(--color-border)' }}
                    ticks={[0, 2.5, 5, 7.5, 10]}
                >
                     <Label value="Gut Feeling (Intuition)" offset={-10} position="insideBottom" style={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }} />
                </XAxis>
                <YAxis 
                    type="number" 
                    dataKey="initialConfidence" 
                    name="Confidence" 
                    domain={[0, 100]} 
                    stroke="var(--color-muted-foreground)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: 'var(--color-border)' }}
                    ticks={[0, 25, 50, 75, 100]}
                >
                    <Label value="Rational Confidence (%)" angle={-90} position="insideLeft" style={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }} />
                </YAxis>

                {/* Center Axes */}
                <ReferenceLine x={5} stroke="var(--color-foreground)" strokeOpacity={0.2} strokeWidth={1} strokeDasharray="4 4" />
                <ReferenceLine y={50} stroke="var(--color-foreground)" strokeOpacity={0.2} strokeWidth={1} strokeDasharray="4 4" />

                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />

                <Scatter name="Decisions" data={jitteredData}>
                    {jitteredData.map((entry, index) => (
                    <Cell 
                        key={`cell-${index}`} 
                        fill={getColor(entry.outcome)} 
                        stroke="rgba(255,255,255,0.5)" // Crisp white border for separation
                        strokeWidth={1} 
                        r={4} // Smaller, clearer dots
                    />
                    ))}
                </Scatter>
                </ScatterChart>
            </ResponsiveContainer>
        </div>
      </div>
    </ChartErrorBoundary>
  );
}