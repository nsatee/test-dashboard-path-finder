import React, { useMemo } from 'react';
import { Decision } from '../../types';
import { Tag, TrendingUp, BarChart2 } from 'lucide-react';
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
            <div key={cluster.name} className="bg-card border border-border p-4 rounded-lg hover:border-[var(--color-primary)] transition-all cursor-default group">
                <div className="flex justify-between items-start mb-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--color-muted)] text-card-foreground">
                        <Tag size={12} />
                        {cluster.name}
                    </span>
                    <span className="text-xs text-muted-foreground">{cluster.count} decisions</span>
                </div>
                
                <div className="space-y-3 mt-3">
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground flex items-center gap-1"><TrendingUp size={12}/> Success Rate</span>
                            <span className={`font-semibold ${cluster.successRate >= 60 ? 'text-[var(--color-success-foreground)]' : 'text-[var(--color-destructive)]'}`}>{cluster.successRate}%</span>
                        </div>
                        <div className="w-full bg-[var(--color-muted)] h-1.5 rounded-full overflow-hidden">
                            <div 
                                className={`h-full ${cluster.successRate >= 60 ? 'bg-[var(--color-success)]' : 'bg-[var(--color-destructive)]'}`} 
                                style={{ width: `${cluster.successRate}%` }}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground flex items-center gap-1"><BarChart2 size={12}/> Avg Confidence</span>
                            <span className="font-semibold">{cluster.avgConfidence}%</span>
                        </div>
                         <div className="w-full bg-[var(--color-muted)] h-1.5 rounded-full overflow-hidden">
                            <div 
                                className="bg-[var(--color-primary)] h-full opacity-70"
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