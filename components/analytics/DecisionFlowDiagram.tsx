import React from 'react';
import { FlowData, SummaryStats } from '../../types';
import { ArrowDown } from 'lucide-react';

type Props = {
  data: FlowData;
  stats: SummaryStats;
};

export function DecisionFlowDiagram({ data, stats }: Props) {
  // Extract counts from flow data logic used in mock
  // Frame = source 0 -> 2 (framed-sealed) + source 0->1 (sealed)
  // Actually simpler to use stats
  
  const framed = stats.totalDecisions;
  const sealed = stats.sealedCount;
  const retrospected = stats.retrospectCount;

  const sealRate = stats.sealRate;
  const retroRate = stats.completionRate; // This is retro / total. We might want retro / sealed.
  const retroOfSealedRate = sealed > 0 ? Math.round((retrospected / sealed) * 100) : 0;

  return (
    <div className="h-full flex flex-col justify-center py-4 space-y-2">
      
      {/* Stage 1: Frame */}
      <div className="relative group">
        <div className="bg-card border border-border p-4 rounded-lg shadow-sm hover:border-[var(--color-primary)] transition-colors">
            <div className="flex justify-between items-center">
                <span className="font-semibold text-card-foreground">Frame</span>
                <span className="text-2xl font-bold">{framed}</span>
            </div>
            <div className="w-full bg-[var(--color-muted)] h-2 rounded-full mt-2 overflow-hidden">
                <div className="bg-[var(--color-primary)] h-full w-full"></div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">100% of decisions started</p>
        </div>
      </div>

      {/* Arrow 1 */}
      <div className="flex justify-center items-center h-8 relative">
         <div className="absolute left-1/2 -translate-x-1/2 h-full w-px bg-border"></div>
         <div className="bg-[var(--color-background)] z-10 px-2 text-xs text-muted-foreground flex items-center gap-1">
            <ArrowDown size={12} />
            {100 - sealRate}% drop-off
         </div>
      </div>

      {/* Stage 2: Seal */}
      <div className="relative group">
        <div className="bg-card border border-border p-4 rounded-lg shadow-sm hover:border-[var(--color-warning)] transition-colors">
            <div className="flex justify-between items-center">
                <span className="font-semibold text-card-foreground">Seal</span>
                <span className="text-2xl font-bold">{sealed}</span>
            </div>
            <div className="w-full bg-[var(--color-muted)] h-2 rounded-full mt-2 overflow-hidden">
                <div 
                    className="bg-[var(--color-warning)] h-full transition-all duration-500" 
                    style={{ width: `${sealRate}%` }}
                ></div>
            </div>
            <div className="flex justify-between text-xs mt-1">
                 <p className="text-[var(--color-warning-foreground)] font-medium">{sealRate}% conversion</p>
                 <p className="text-muted-foreground">Avg: {stats.avgDaysToSeal} days</p>
            </div>
        </div>
      </div>

      {/* Arrow 2 */}
      <div className="flex justify-center items-center h-8 relative">
         <div className="absolute left-1/2 -translate-x-1/2 h-full w-px bg-border"></div>
         <div className="bg-[var(--color-background)] z-10 px-2 text-xs text-muted-foreground flex items-center gap-1">
            <ArrowDown size={12} />
            {100 - retroOfSealedRate}% drop-off
         </div>
      </div>

      {/* Stage 3: Retrospect */}
      <div className="relative group">
        <div className="bg-card border border-border p-4 rounded-lg shadow-sm hover:border-[var(--color-success)] transition-colors">
            <div className="flex justify-between items-center">
                <span className="font-semibold text-card-foreground">Retrospect</span>
                <span className="text-2xl font-bold">{retrospected}</span>
            </div>
             {/* Width relative to Sealed, not Total, to show funnel progression visually? 
                 Usually funnel shows relative to start. But visually, stepping down is good.
             */}
            <div className="w-full bg-[var(--color-muted)] h-2 rounded-full mt-2 overflow-hidden">
                <div 
                    className="bg-[var(--color-success)] h-full transition-all duration-500" 
                    style={{ width: `${stats.completionRate}%` }}
                ></div>
            </div>
            <div className="flex justify-between text-xs mt-1">
                 <p className="text-[var(--color-success-foreground)] font-medium">{retroOfSealedRate}% of sealed</p>
                 <p className="text-muted-foreground">Avg: {stats.avgDaysToRetrospect} days</p>
            </div>
        </div>
      </div>
      
      {/* Insights */}
      <div className="mt-4 p-3 bg-[var(--color-muted)]/30 rounded text-xs text-muted-foreground text-center">
        💡 <strong>Insight:</strong> Focus on sealing decisions faster (target &lt; 2 days) to improve retrospective rates.
      </div>
    </div>
  );
}
