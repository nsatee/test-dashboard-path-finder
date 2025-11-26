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
  Label,
  Text
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
      <div className="bg-card border border-border p-3 rounded shadow-lg text-xs z-50">
        <p className="font-bold text-card-foreground mb-1">{data.title}</p>
        <p className="text-muted-foreground">Confidence: <span className="text-card-foreground">{data.initialConfidence}%</span></p>
        <p className="text-muted-foreground">Gut Feeling: <span className="text-card-foreground">{data.gutFeeling}/10</span></p>
        <p className="text-muted-foreground">Outcome: <span className="capitalize text-card-foreground">{data.outcome.replace('_', ' ')}</span></p>
      </div>
    );
  }
  return null;
};

const QuadrantLabel = ({ x, y, text, align }: { x: string, y: string, text: string, align: 'start' | 'end' }) => (
    <div 
        className="absolute text-xs font-bold text-muted-foreground/50 uppercase pointer-events-none select-none"
        style={{ 
            left: x, 
            top: y, 
            transform: align === 'end' ? 'translateX(-100%)' : 'none'
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

  return (
    <ChartErrorBoundary>
      <div className="h-full flex flex-col relative">
        <div className="mb-2 px-2 text-sm text-muted-foreground flex justify-between">
            <span>Correlation Analysis: <strong>Intuition (Gut) vs. Analysis (Confidence)</strong></span>
        </div>

        {/* Quadrant Labels Overlay - approximated positions */}
        <QuadrantLabel x="95%" y="5%" text="High Conviction" align="end" />
        <QuadrantLabel x="5%" y="5%" text="Data Driven?" align="start" />
        <QuadrantLabel x="95%" y="90%" text="Pure Intuition" align="end" />
        <QuadrantLabel x="5%" y="90%" text="Low Conviction" align="start" />

        <div className="flex-grow min-h-0">
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
                
                <XAxis 
                    type="number" 
                    dataKey="gutFeeling" 
                    name="Gut Feeling" 
                    domain={[0, 10]} 
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    ticks={[0, 2.5, 5, 7.5, 10]}
                >
                     <Label value="Gut Feeling (Intuition)" offset={-10} position="insideBottom" style={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }} />
                </XAxis>
                <YAxis 
                    type="number" 
                    dataKey="initialConfidence" 
                    name="Confidence" 
                    domain={[0, 100]} 
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    ticks={[0, 25, 50, 75, 100]}
                >
                    <Label value="Rational Confidence (%)" angle={-90} position="insideLeft" style={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }} />
                </YAxis>

                {/* Center Lines */}
                <ReferenceLine x={5} stroke="var(--color-border)" strokeWidth={2} />
                <ReferenceLine y={50} stroke="var(--color-border)" strokeWidth={2} />

                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />

                <Scatter name="Decisions" data={data}>
                    {data.map((entry, index) => (
                    <Cell 
                        key={`cell-${index}`} 
                        fill={getColor(entry.outcome)} 
                        stroke="white" 
                        strokeWidth={1} 
                        r={6}
                    />
                    ))}
                </Scatter>
                </ScatterChart>
            </ResponsiveContainer>
        </div>
        <div className="flex gap-4 justify-center mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--color-success)]"></span> Right Call</div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--color-destructive)]"></span> Wrong Call</div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--color-muted-foreground)]"></span> Unclear</div>
        </div>
      </div>
    </ChartErrorBoundary>
  );
}
