
import React from 'react';
import { 
  BarChart2, 
  Lock, 
  CheckCircle2, 
  Clock, 
  CalendarDays, 
  Tag, 
  Target, 
  TrendingUp 
} from 'lucide-react';
import { SummaryStats } from '../../types';

type Props = {
  stats: SummaryStats;
};

export function PathFinderStatsCards({ stats }: Props) {
  const cards = [
    {
      label: 'Total Decisions',
      value: stats.totalDecisions,
      subtext: 'All decisions tracked',
      icon: BarChart2,
      color: 'var(--color-primary)',
      bg: 'rgba(96, 115, 245, 0.1)',
    },
    {
      label: 'Sealed Decisions',
      value: stats.sealedCount,
      subtext: `${stats.sealRate}% seal rate`,
      icon: Lock,
      color: 'var(--color-warning-foreground)',
      bg: 'var(--color-warning)',
    },
    {
      label: 'Retrospectives',
      value: stats.retrospectCount,
      subtext: `${stats.completionRate}% completion rate`,
      icon: CheckCircle2,
      color: 'var(--color-success-foreground)',
      bg: 'var(--color-success)',
    },
    {
      label: 'Avg Time to Seal',
      value: `${stats.avgDaysToSeal}d`,
      subtext: 'Days average',
      icon: Clock,
      color: 'var(--color-foreground)',
      bg: 'var(--color-muted)',
    },
    {
      label: 'Avg Time to Retro',
      value: `${stats.avgDaysToRetrospect}d`,
      subtext: 'Days average',
      icon: CalendarDays,
      color: 'var(--color-foreground)',
      bg: 'var(--color-muted)',
    },
    {
      label: 'Most Common Path',
      value: stats.mostCommonPath,
      subtext: 'Most frequent tag',
      icon: Tag,
      color: 'var(--color-primary)',
      bg: 'rgba(96, 115, 245, 0.1)',
    },
    {
      label: 'Most Successful',
      value: `${stats.mostSuccessfulPath.name}`,
      subtext: `${stats.mostSuccessfulPath.rate}% success rate`,
      icon: Target,
      color: 'var(--color-success-foreground)',
      bg: 'var(--color-success)',
    },
    {
      label: 'Highest Volume',
      value: `${stats.pathWithMostDecisions.name}`,
      subtext: `${stats.pathWithMostDecisions.count} decisions`,
      icon: TrendingUp,
      color: 'var(--color-primary)',
      bg: 'rgba(96, 115, 245, 0.1)',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {cards.map((card, index) => (
        <div 
          key={index} 
          className="bg-card border border-border rounded-lg p-4 md:p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-4">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: card.bg, color: card.color === 'var(--color-success-foreground)' || card.color === 'var(--color-warning-foreground)' ? card.color : 'inherit' }}
            >
              <card.icon 
                size={20} 
                color={card.color.startsWith('var') ? undefined : card.color} 
                style={card.color.startsWith('var') ? { color: card.color } : {}}
              />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-card-foreground tracking-tight">
              {card.value}
            </div>
            <p className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-wider">
              {card.label}
            </p>
            <p className="text-xs text-muted-foreground mt-1 opacity-80">
              {card.subtext}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
