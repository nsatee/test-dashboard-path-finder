import React, { useMemo } from 'react';
import { Decision } from '../../types';
import { ChartErrorBoundary } from './ChartWrapper';
import { BrainCircuit, Lightbulb, Zap, HelpCircle } from 'lucide-react';

type Props = {
  data: Decision[];
};

type QuadrantStats = {
  id: string;
  label: string;
  subLabel: string;
  icon: React.ElementType;
  total: number;
  wins: number;
  winRate: number;
  color: string;
  bg: string;
};

export function DecisionTrajectoryScatter({ data }: Props) {
  const quadrants = useMemo(() => {
    // Buckets
    const q: Record<string, QuadrantStats> = {
      full: { id: 'full', label: 'Full Conviction', subLabel: 'Head & Heart Agree', icon: Zap, total: 0, wins: 0, winRate: 0, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
      data: { id: 'data', label: 'Data Driven', subLabel: 'High Logic, Low Gut', icon: BrainCircuit, total: 0, wins: 0, winRate: 0, color: 'text-blue-500', bg: 'bg-blue-500/10' },
      intuition: { id: 'intuition', label: 'Pure Intuition', subLabel: 'High Gut, Low Logic', icon: Lightbulb, total: 0, wins: 0, winRate: 0, color: 'text-purple-500', bg: 'bg-purple-500/10' },
      gamble: { id: 'gamble', label: 'Wild Guess', subLabel: 'Low Logic, Low Gut', icon: HelpCircle, total: 0, wins: 0, winRate: 0, color: 'text-slate-500', bg: 'bg-slate-500/10' },
    };

    data.forEach(d => {
      const highLogic = d.initialConfidence >= 65; // Threshold for logic
      const highGut = d.gutFeeling >= 6; // Threshold for gut (0-10)

      let key = '';
      if (highLogic && highGut) key = 'full';
      else if (highLogic && !highGut) key = 'data';
      else if (!highLogic && highGut) key = 'intuition';
      else key = 'gamble';

      q[key].total++;
      if (d.outcome === 'right_call') q[key].wins++;
    });

    // Calculate rates
    Object.values(q).forEach(bucket => {
      bucket.winRate = bucket.total > 0 ? Math.round((bucket.wins / bucket.total) * 100) : 0;
    });

    return q;
  }, [data]);

  const QuadrantCard = ({ stats }: { stats: QuadrantStats }) => (
    <div className={`relative flex flex-col justify-between p-4 rounded-xl border ${stats.total === 0 ? 'opacity-50 border-dashed border-border' : 'border-border/60'} ${stats.bg} transition-all hover:scale-[1.02] hover:shadow-md h-full`}>
       
       {/* Header */}
       <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
             <div className={`p-1.5 rounded-md bg-card/60 backdrop-blur-sm ${stats.color}`}>
                <stats.icon size={14} />
             </div>
             <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-card-foreground">{stats.label}</h4>
                <p className="text-[10px] text-muted-foreground">{stats.subLabel}</p>
             </div>
          </div>
       </div>

       {/* Stats */}
       <div className="flex items-end justify-between mt-2">
          <div>
              <div className="flex items-baseline gap-1">
                 <span className={`text-2xl font-black ${stats.winRate >= 60 ? 'text-[var(--color-success-foreground)]' : stats.winRate <= 40 && stats.total > 0 ? 'text-[var(--color-destructive)]' : 'text-card-foreground'}`}>
                    {stats.total > 0 ? `${stats.winRate}%` : '-'}
                 </span>
                 <span className="text-[10px] font-bold text-muted-foreground uppercase">Win Rate</span>
              </div>
          </div>
          <div className="text-right">
             <span className="text-xs font-mono font-medium text-muted-foreground bg-card/50 px-1.5 py-0.5 rounded border border-black/5">
                {stats.total} Decisions
             </span>
          </div>
       </div>

       {/* Insight Badge (Conditional) */}
       {stats.total > 3 && (
           <div className="mt-3 pt-2 border-t border-black/5 text-[10px] font-medium opacity-80">
               {stats.winRate >= 75 ? (
                   <span className="text-[var(--color-success-foreground)] flex items-center gap-1">✨ Your superpower</span>
               ) : stats.winRate <= 40 ? (
                   <span className="text-[var(--color-destructive)] flex items-center gap-1">⚠️ Avoid this zone</span>
               ) : (
                   <span className="text-muted-foreground">Neutral zone</span>
               )}
           </div>
       )}
    </div>
  );

  return (
    <ChartErrorBoundary>
      <div className="h-full flex flex-col">
        {/* The Matrix Layout */}
        <div className="flex-grow grid grid-cols-2 grid-rows-2 gap-3 p-1">
            {/* Top Left: Data Driven (High Logic, Low Gut) */}
            <QuadrantCard stats={quadrants.data} />
            
            {/* Top Right: Full Conviction (High Logic, High Gut) */}
            <QuadrantCard stats={quadrants.full} />
            
            {/* Bottom Left: Gamble (Low Logic, Low Gut) */}
            <QuadrantCard stats={quadrants.gamble} />

            {/* Bottom Right: Intuition (Low Logic, High Gut) */}
            <QuadrantCard stats={quadrants.intuition} />
        </div>

        {/* Axis Labels (Subtle) */}
        <div className="flex justify-between px-2 mt-1 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
            <span>← Low Intuition</span>
            <span>High Intuition →</span>
        </div>
      </div>
    </ChartErrorBoundary>
  );
}