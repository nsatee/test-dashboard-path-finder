import React from 'react';
import { Target, TrendingUp, AlertTriangle, Activity } from 'lucide-react';
import { SummaryStats } from '../../types';

type Props = {
  stats: SummaryStats;
};

export function KeyInsightsPanel({ stats }: Props) {
  // Helper to determine status color
  const getHealthColor = (rate: number, target: number) => {
    if (rate >= target) return 'text-[var(--color-success-foreground)]';
    if (rate >= target * 0.8) return 'text-[var(--color-warning-foreground)]';
    return 'text-[var(--color-destructive-foreground)]';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Best Path */}
      <div className="bg-card border border-border rounded-lg p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2 text-[var(--color-success-foreground)]">
            <Target size={18} />
            <h3 className="font-semibold text-sm uppercase tracking-wide">Best Path</h3>
          </div>
          <p className="text-2xl font-bold text-card-foreground">{stats.mostSuccessfulPath.name}</p>
          <p className="text-sm text-muted-foreground mt-1">
            <span className="font-medium text-[var(--color-success-foreground)]">{stats.mostSuccessfulPath.rate}%</span> success rate
          </p>
        </div>
        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            This category yields your best outcomes. Consider applying this mindset to other areas.
          </p>
        </div>
      </div>

      {/* Most Frequent */}
      <div className="bg-card border border-border rounded-lg p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2 text-[var(--color-primary)]">
            <TrendingUp size={18} />
            <h3 className="font-semibold text-sm uppercase tracking-wide">Most Frequent</h3>
          </div>
          <p className="text-2xl font-bold text-card-foreground">{stats.pathWithMostDecisions.name}</p>
          <p className="text-sm text-muted-foreground mt-1">
            <span className="font-medium">{stats.pathWithMostDecisions.count}</span> decisions made
          </p>
        </div>
        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            This is your dominant decision type. Ensure you are not over-indexing on this category.
          </p>
        </div>
      </div>

      {/* Workflow Health */}
      <div className="bg-card border border-border rounded-lg p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2 text-[var(--color-warning-foreground)]">
            <Activity size={18} />
            <h3 className="font-semibold text-sm uppercase tracking-wide">Workflow Health</h3>
          </div>
          <div className="flex justify-between items-baseline">
            <p className="text-2xl font-bold text-card-foreground">{stats.sealRate}%</p>
            <span className="text-xs text-muted-foreground">Target: 80%</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
             Decisions Sealed
          </p>
        </div>
        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Sealing decisions prevents hindsight bias. <span className={getHealthColor(stats.sealRate, 80)}>
              {stats.sealRate < 80 ? 'Try to seal more decisions.' : 'Great job sealing decisions!'}
            </span>
          </p>
        </div>
      </div>

      {/* Improvement Area (Mocked for now as we don't have 'worst' in stats yet, using logic) */}
      <div className="bg-card border border-border rounded-lg p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2 text-[var(--color-destructive)]">
            <AlertTriangle size={18} />
            <h3 className="font-semibold text-sm uppercase tracking-wide">Focus Area</h3>
          </div>
          <p className="text-2xl font-bold text-card-foreground">{stats.completionRate}%</p>
          <p className="text-sm text-muted-foreground mt-1">
            Retrospective Rate
          </p>
        </div>
        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
             {stats.completionRate < 50 
              ? "You're missing learning opportunities. Schedule time for retrospectives." 
              : "Good habit of reviewing past decisions."}
          </p>
        </div>
      </div>
    </div>
  );
}
