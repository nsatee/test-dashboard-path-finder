import React, { useMemo } from 'react';
import { Decision } from '../../types';
import { Tag, Zap, Activity } from 'lucide-react';
import { ChartErrorBoundary } from './ChartWrapper';

type Props = {
  data: Decision[];
};

export function DecisionClusters({ data }: Props) {
  const clusters = useMemo(() => {
    const stats: Record<string, { total: number; right: number; confSum: number; decisions: Decision[] }> = {};
    
    data.forEach(d => {
        d.tags.forEach(tag => {
            if (!stats[tag]) stats[tag] = { total: 0, right: 0, confSum: 0, decisions: [] };
            stats[tag].total += 1;
            stats[tag].confSum += d.initialConfidence;
            if (d.outcome === 'right_call') stats[tag].right += 1;
            stats[tag].decisions.push(d);
        });
    });

    return Object.entries(stats)
      .map(([name, val]) => ({
        name,
        count: val.total,
        successRate: Math.round((val.right / val.total) * 100),
        avgConfidence: Math.round(val.confSum / val.total),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6); // Top 6 clusters
  }, [data]);

  return (
    <ChartErrorBoundary>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1">
        {clusters.map((cluster) => (
            <div 
                key={cluster.name} 
                className="bg-card border border-border rounded-lg overflow-hidden group hover:shadow-lg transition-all duration-300 hover:border-[var(--color-primary)]/50 cursor-default"
            >
                {/* Header Strip */}
                <div className="bg-[var(--color-muted)]/50 px-4 py-2 flex justify-between items-center border-b border-border/50 group-hover:bg-[var(--color-primary)]/10 transition-colors">
                    <div className="flex items-center gap-2">
                        <Tag size={14} className="text-muted-foreground group-hover:text-[var(--color-primary)] transition-colors" />
                        <span className="text-sm font-semibold text-card-foreground">{cluster.name}</span>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground bg-background/50 px-2 py-0.5 rounded">
                        {cluster.count}
                    </span>
                </div>
                
                {/* Body */}
                <div className="p-4 space-y-4">
                    {/* Metric 1 */}
                    <div>
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Zap size={10} /> Success
                            </span>
                            <span className={`text-sm font-bold ${cluster.successRate >= 60 ? 'text-[var(--color-success-foreground)]' : 'text-[var(--color-destructive)]'}`}>
                                {cluster.successRate}%
                            </span>
                        </div>
                        <div className="h-1.5 w-full bg-[var(--color-muted)] rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full ${cluster.successRate >= 60 ? 'bg-[var(--color-success)]' : 'bg-[var(--color-destructive)]'}`}
                                style={{ width: `${cluster.successRate}%` }}
                            />
                        </div>
                    </div>

                    {/* Metric 2 */}
                    <div>
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Activity size={10} /> Confidence
                            </span>
                            <span className="text-sm font-bold text-card-foreground">
                                {cluster.avgConfidence}%
                            </span>
                        </div>
                         <div className="h-1.5 w-full bg-[var(--color-muted)] rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-[var(--color-primary)] opacity-70 rounded-full"
                                style={{ width: `${cluster.avgConfidence}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        ))}
      </div>
    </ChartErrorBoundary>
  );
}