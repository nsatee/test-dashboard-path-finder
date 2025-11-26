
import React, { useState } from 'react';
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
  Legend
} from 'recharts';
import { Decision } from '../../types';
import { ChartErrorBoundary } from './ChartWrapper';

type Props = {
  data: Decision[];
};

type ViewMode = 'confidence' | 'stress' | 'gut';

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border p-3 rounded shadow-lg text-sm max-w-xs z-50">
        <p className="font-semibold text-card-foreground mb-1">{data.title}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <span className="text-muted-foreground">Outcome:</span>
          <span className="capitalize">{data.outcome.replace('_', ' ')}</span>
          <span className="text-muted-foreground">Initial Conf:</span>
          <span>{data.initialConfidence}%</span>
          <span className="text-muted-foreground">Final Conf:</span>
          <span>{data.finalConfidence}%</span>
          <span className="text-muted-foreground">Stress:</span>
          <span>{data.stressLevel}/10</span>
           <span className="text-muted-foreground">Gut:</span>
          <span>{data.gutFeeling}/10</span>
        </div>
      </div>
    );
  }
  return null;
};

export function DecisionTrajectoryScatter({ data }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('confidence');

  const getColor = (outcome: string) => {
    switch (outcome) {
      case 'right_call': return 'var(--color-success)';
      case 'wrong_call': return 'var(--color-destructive)';
      default: return 'var(--color-muted-foreground)';
    }
  };

  const renderViewControls = () => (
    <div className="flex justify-center gap-2 mb-4">
        <button 
            onClick={() => setViewMode('confidence')}
            className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${viewMode === 'confidence' ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] border-transparent' : 'bg-transparent text-muted-foreground border-border'}`}
        >
            Confidence
        </button>
        <button 
            onClick={() => setViewMode('stress')}
            className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${viewMode === 'stress' ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] border-transparent' : 'bg-transparent text-muted-foreground border-border'}`}
        >
            Stress Impact
        </button>
        <button 
            onClick={() => setViewMode('gut')}
            className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${viewMode === 'gut' ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] border-transparent' : 'bg-transparent text-muted-foreground border-border'}`}
        >
            Gut vs Conf
        </button>
    </div>
  );

  return (
    <ChartErrorBoundary>
      <div className="h-full flex flex-col">
        {renderViewControls()}
        <div className="flex-grow min-h-0">
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
                
                {viewMode === 'confidence' && (
                    <>
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
                             <Label value="Initial Confidence (%)" offset={-10} position="insideBottom" style={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }} />
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
                            <Label value="Post-Mortem Confidence (%)" angle={-90} position="insideLeft" style={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }} />
                        </YAxis>
                        <ReferenceLine 
                            segment={[{ x: 0, y: 0 }, { x: 100, y: 100 }]} 
                            stroke="var(--color-muted-foreground)" 
                            strokeDasharray="3 3" 
                            opacity={0.5}
                        />
                    </>
                )}

                {viewMode === 'stress' && (
                     <>
                        <XAxis 
                            type="number" 
                            dataKey="stressLevel" 
                            name="Stress Level" 
                            domain={[0, 10]} 
                            stroke="var(--color-muted-foreground)"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        >
                             <Label value="Stress Level (0-10)" offset={-10} position="insideBottom" style={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }} />
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
                        >
                             <Label value="Confidence (%)" angle={-90} position="insideLeft" style={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }} />
                        </YAxis>
                    </>
                )}

                 {viewMode === 'gut' && (
                     <>
                        <XAxis 
                            type="number" 
                            dataKey="gutFeeling" 
                            name="Gut Feeling" 
                            domain={[0, 10]} 
                            stroke="var(--color-muted-foreground)"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        >
                             <Label value="Gut Feeling (0-10)" offset={-10} position="insideBottom" style={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }} />
                        </XAxis>
                        <YAxis 
                            type="number" 
                            dataKey="initialConfidence" 
                            name="Confidence" 
                            domain={[0, 100]} // Mapping 0-100 to 0-10 roughly or just keep raw
                            stroke="var(--color-muted-foreground)"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(v) => (v/10).toString()} // Show 0-10 scale
                        >
                             <Label value="Rational Confidence (0-10)" angle={-90} position="insideLeft" style={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }} />
                        </YAxis>
                         <ReferenceLine 
                            segment={[{ x: 0, y: 0 }, { x: 10, y: 100 }]} 
                            stroke="var(--color-muted-foreground)" 
                            strokeDasharray="3 3" 
                            opacity={0.5}
                        />
                    </>
                )}

                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />

                <Scatter name="Decisions" data={data} fill="#8884d8">
                    {data.map((entry, index) => (
                    <Cell 
                        key={`cell-${index}`} 
                        fill={getColor(entry.outcome)} 
                        stroke="white" 
                        strokeWidth={1}
                        // Render size based on stress if in confidence view, else standard
                        r={viewMode === 'confidence' ? 4 + (entry.stressLevel / 2) : 6}
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
