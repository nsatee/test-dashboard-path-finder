import React from 'react';
import { Target, TrendingUp, AlertTriangle, Activity, LucideIcon } from 'lucide-react';
import { SummaryStats } from '../../types';

type Props = {
  stats: SummaryStats;
};

const InsightCard = ({ 
  icon: Icon, 
  title, 
  value, 
  subValue, 
  description, 
  colorVar,
  bgClass 
}: { 
  icon: LucideIcon, 
  title: string, 
  value: string | number, 
  subValue: React.ReactNode, 
  description: string,
  colorVar: string,
  bgClass: string
}) => (
  <div className={`relative overflow-hidden border border-border/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 ${bgClass} group`}>
    
    {/* Background Watermark Icon */}
    <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity transform rotate-12 group-hover:scale-110 duration-500">
      <Icon size={120} color={colorVar} />
    </div>

    <div className="relative z-10 flex flex-col h-full justify-between">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-md bg-white/50 backdrop-blur-md shadow-sm">
             <Icon size={16} color={colorVar} />
          </div>
          <h3 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">{title}</h3>
        </div>
        
        <div className="mb-1">
          <p className="text-3xl font-black text-card-foreground tracking-tight">{value}</p>
        </div>
        
        <div className="mb-4">
          <p className="text-sm font-medium">{subValue}</p>
        </div>
      </div>

      <div className="pt-3 border-t border-black/5">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  </div>
);

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
      <InsightCard 
        icon={Target}
        title="Top Performer"
        value={stats.mostSuccessfulPath.name}
        colorVar="var(--color-success-foreground)"
        bgClass="bg-gradient-to-br from-[var(--color-success)]/10 to-transparent"
        subValue={
          <span className="text-[var(--color-success-foreground)] bg-[var(--color-success)]/20 px-2 py-0.5 rounded text-xs font-bold">
            {stats.mostSuccessfulPath.rate}% Success Rate
          </span>
        }
        description="This category consistently yields your best outcomes. Leverage this strength."
      />

      {/* Most Frequent */}
      <InsightCard 
        icon={TrendingUp}
        title="Highest Volume"
        value={stats.pathWithMostDecisions.name}
        colorVar="var(--color-primary)"
        bgClass="bg-gradient-to-br from-[var(--color-primary)]/5 to-transparent"
        subValue={
          <span className="text-[var(--color-primary)] font-bold">
            {stats.pathWithMostDecisions.count} Decisions
          </span>
        }
        description="Your dominant decision type. Ensure you are not over-indexing here."
      />

      {/* Workflow Health */}
      <InsightCard 
        icon={Activity}
        title="Workflow Health"
        value={`${stats.sealRate}%`}
        colorVar="var(--color-warning-foreground)"
        bgClass="bg-gradient-to-br from-[var(--color-warning)]/10 to-transparent"
        subValue={
          <span className="text-muted-foreground text-xs">Target: 80% Sealed</span>
        }
        description={
            stats.sealRate < 80 
            ? "Try to seal more decisions to prevent hindsight bias." 
            : "Excellent work locking in your decisions before the outcome."
        }
      />

      {/* Focus Area */}
      <InsightCard 
        icon={AlertTriangle}
        title="Opportunity"
        value={`${stats.completionRate}%`}
        colorVar="var(--color-destructive)"
        bgClass="bg-gradient-to-br from-[var(--color-destructive)]/10 to-transparent"
        subValue={
           <span className="text-muted-foreground text-xs">Retrospective Rate</span>
        }
        description={
             stats.completionRate < 50 
              ? "You're missing learning loops. Schedule 15m/week for retrospectives." 
              : "Solid habit of reviewing past decisions."
        }
      />
    </div>
  );
}