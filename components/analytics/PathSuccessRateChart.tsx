import React, { useMemo } from 'react';
import { Decision } from '../../types';
import { ChartErrorBoundary } from './ChartWrapper';

type Props = {
  data: Decision[];
};

export function PathSuccessRateChart({ data }: Props) {
  const { items, maxRate, overallRate } = useMemo(() => {
    const stats: Record<string, { total: number; right: number }> = {};
    let globalTotal = 0;
    let globalRight = 0;

    // Group by tags
    data.forEach(d => {
        if (d.outcome === 'right_call') globalRight++;
        globalTotal++;

        d.tags.forEach(tag => {
            if (!stats[tag]) stats[tag] = { total: 0, right: 0 };
            stats[tag].total += 1;
            if (d.outcome === 'right_call') stats[tag].right += 1;
        });
    });

    const calculatedItems = Object.entries(stats)
      .map(([name, val]) => ({
        name,
        rate: Math.round((val.right / val.total) * 100),
        count: val.total
      }))
      .filter(i => i.count >= 1) // Only show paths with data
      .sort((a, b) => b.rate - a.rate) // Sort by success rate
      .slice(0, 8); // Top 8

    const max = Math.max(...calculatedItems.map(i => i.rate), 1);
    const avg = globalTotal > 0 ? Math.round((globalRight / globalTotal) * 100) : 0;

    return { items: calculatedItems, maxRate: max, overallRate: avg };
  }, [data]);

  return (
    <ChartErrorBoundary>
      <div className="h-full flex flex-col pt-2 overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-4">
            {items.map((item) => (
                <div key={item.name} className="group">
                    {/* Header: Label + Stats */}
                    <div className="flex justify-between items-end mb-1.5">
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-card-foreground leading-none">{item.name}</span>
                            <span className="text-[10px] text-muted-foreground mt-1">{item.count} decisions</span>
                        </div>
                        <div className="text-right">
                             <span className={`text-sm font-bold ${item.rate >= 60 ? 'text-[var(--color-success-foreground)]' : item.rate >= 40 ? 'text-[var(--color-warning-foreground)]' : 'text-[var(--color-destructive)]'}`}>
                                {item.rate}%
                            </span>
                        </div>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="relative w-full h-2.5 bg-[var(--color-muted)] rounded-full overflow-hidden">
                         {/* Average Marker */}
                        <div 
                            className="absolute top-0 bottom-0 w-0.5 bg-[var(--color-foreground)]/20 z-10" 
                            style={{ left: `${(overallRate / maxRate) * 100}%` }}
                            title={`Overall Average: ${overallRate}%`}
                        />
                        
                        {/* The Bar (Scaled relative to maxRate) */}
                        <div 
                            className={`h-full rounded-full transition-all duration-500 ease-out ${
                                item.rate >= 60 ? 'bg-[var(--color-success)]' : 
                                item.rate >= 40 ? 'bg-[var(--color-primary)]' : 
                                'bg-[var(--color-destructive)]'
                            }`}
                            style={{ width: `${(item.rate / maxRate) * 100}%` }}
                        />
                    </div>
                </div>
            ))}

            {items.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-10">
                    No data available for current filters.
                </div>
            )}
        </div>
        
        <div className="mt-auto pt-4 flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
             <span className="w-0.5 h-3 bg-[var(--color-foreground)]/30 inline-block"></span>
             <span>Marker indicates overall average ({overallRate}%)</span>
        </div>
      </div>
    </ChartErrorBoundary>
  );
}