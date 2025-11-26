import React, { useMemo } from 'react';
import { Decision } from '../../types';
import { Tag } from 'lucide-react';
import { ChartErrorBoundary } from './ChartWrapper';

type Props = {
  data: Decision[];
};

// Helper to determine the "Verdict" or "Archetype" of the cluster
const getVerdict = (count: number, rate: number, avgConf: number) => {
    if (count > 8 && rate > 75) return { label: 'Mastery', color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: '🏆' };
    if (count > 8 && rate < 40) return { label: 'Trouble Spot', color: 'text-red-500', bg: 'bg-red-500/10', icon: '⚠️' };
    if (rate > 80) return { label: 'Hidden Gem', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: '💎' };
    if (rate < 40) return { label: 'Risky', color: 'text-orange-500', bg: 'bg-orange-500/10', icon: '🔥' };
    if (count > 10) return { label: 'Routine', color: 'text-purple-500', bg: 'bg-purple-500/10', icon: '🔄' };
    return { label: 'Developing', color: 'text-slate-500', bg: 'bg-slate-500/10', icon: '🌱' };
};

// Simple SVG Donut Chart for Success Rate
const SuccessDonut = ({ rate }: { rate: number }) => {
    const size = 60;
    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (rate / 100) * circumference;
    
    // Color logic
    const color = rate >= 70 ? 'var(--color-success)' : rate >= 40 ? 'var(--color-primary)' : 'var(--color-destructive)';

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke="var(--color-muted)"
                    strokeWidth={strokeWidth}
                    opacity={0.3}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Win</span>
                <span className="text-sm font-black leading-none mt-0.5">{rate}%</span>
            </div>
        </div>
    );
};

// WiFi Signal Visual for Confidence
const ConfidenceSignal = ({ level }: { level: number }) => {
    // Level is 0-100. Map to 1-4 bars.
    const bars = 4;
    const activeBars = Math.ceil((level / 100) * bars);
    
    return (
        <div className="flex items-end gap-[2px] h-4">
            {[...Array(bars)].map((_, i) => (
                <div 
                    key={i}
                    className={`w-1.5 rounded-sm transition-all ${i < activeBars ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-muted)]'}`}
                    style={{ height: `${(i + 1) * 25}%` }}
                />
            ))}
        </div>
    );
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
        verdict: getVerdict(val.total, Math.round((val.right / val.total) * 100), Math.round(val.confSum / val.total))
      }))
      .sort((a, b) => b.count - a.count) // Sort by volume
      .slice(0, 6);
  }, [data]);

  if (clusters.length === 0) {
      return <div className="p-8 text-center text-muted-foreground">No data available. Start tagging your decisions!</div>;
  }

  return (
    <ChartErrorBoundary>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
        {clusters.map((cluster) => (
            <div 
                key={cluster.name} 
                className="bg-card border border-border/60 rounded-xl p-5 hover:shadow-lg hover:border-[var(--color-primary)]/30 transition-all duration-300 relative group overflow-hidden"
            >
                {/* Subtle Background Decoration */}
                <div className={`absolute top-0 right-0 p-16 opacity-5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 ${cluster.verdict.bg.replace('/10', '/50')}`} />

                {/* Header: Tag & Badge */}
                <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-[var(--color-muted)]/50 rounded-lg text-muted-foreground">
                            <Tag size={16} />
                        </div>
                        <div>
                            <h4 className="font-bold text-card-foreground leading-tight">{cluster.name}</h4>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Topic</span>
                        </div>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cluster.verdict.bg} ${cluster.verdict.color}`}>
                        <span>{cluster.verdict.icon}</span>
                        <span>{cluster.verdict.label}</span>
                    </div>
                </div>

                {/* Main Stats Row */}
                <div className="flex items-center gap-6 relative z-10">
                    {/* Visual 1: Success Score */}
                    <div className="flex flex-col items-center gap-1">
                        <SuccessDonut rate={cluster.successRate} />
                    </div>

                    {/* Divider */}
                    <div className="w-px h-12 bg-border"></div>

                    {/* Visual 2: Data List */}
                    <div className="flex-1 space-y-3">
                         {/* Confidence */}
                         <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground">Conviction</span>
                                <span className="text-xs font-medium">
                                    {cluster.avgConfidence > 80 ? 'High' : cluster.avgConfidence > 50 ? 'Medium' : 'Low'}
                                </span>
                            </div>
                            <ConfidenceSignal level={cluster.avgConfidence} />
                        </div>

                         {/* Volume */}
                         <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground">Experience</span>
                                <span className="text-xs font-medium">{cluster.count} Decisions</span>
                            </div>
                            <span className="text-xs font-mono text-muted-foreground bg-[var(--color-muted)] px-1.5 rounded">Lv.{cluster.count}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Insight */}
                <div className="mt-5 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                    {cluster.successRate >= 80 ? (
                        <span>You have strong intuition in this area.</span>
                    ) : cluster.successRate <= 40 ? (
                        <span>Review past failures here to improve.</span>
                    ) : (
                        <span>Keep tracking to find patterns.</span>
                    )}
                </div>
            </div>
        ))}
      </div>
    </ChartErrorBoundary>
  );
}