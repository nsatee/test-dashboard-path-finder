
import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';

export type FilterState = {
  timeRange: 'all' | '7d' | '30d' | '90d';
  outcome: 'all' | 'right_call' | 'wrong_call' | 'unclear';
  tags: string[];
};

type Props = {
  activeFilters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  availableTags: string[];
};

export function PathFinderFilters({ activeFilters, onFilterChange, availableTags }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFilterChange({
      ...activeFilters,
      [key]: value
    });
  };

  const toggleTag = (tag: string) => {
    const currentTags = activeFilters.tags;
    if (currentTags.includes(tag)) {
      updateFilter('tags', currentTags.filter(t => t !== tag));
    } else {
      updateFilter('tags', [...currentTags, tag]);
    }
  };

  const clearFilters = () => {
    onFilterChange({
      timeRange: 'all',
      outcome: 'all',
      tags: []
    });
  };

  const activeCount = 
    (activeFilters.timeRange !== 'all' ? 1 : 0) + 
    (activeFilters.outcome !== 'all' ? 1 : 0) + 
    activeFilters.tags.length;

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-[var(--color-muted)] text-[var(--color-foreground)] rounded-md hover:bg-opacity-80 transition-colors"
            >
                <Filter size={16} />
                Filters
                {activeCount > 0 && (
                    <span className="bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {activeCount}
                    </span>
                )}
            </button>
            
            {/* Quick Filters - Visible on Desktop */}
            <div className="hidden md:flex gap-2 ml-2">
                {(['all', '30d', '90d'] as const).map(range => (
                    <button
                        key={range}
                        onClick={() => updateFilter('timeRange', range)}
                        className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                            activeFilters.timeRange === range 
                            ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] border-transparent' 
                            : 'bg-transparent text-muted-foreground border-border hover:border-[var(--color-primary)]'
                        }`}
                    >
                        {range === 'all' ? 'All Time' : `Last ${range.replace('d', ' Days')}`}
                    </button>
                ))}
            </div>
        </div>

        {activeCount > 0 && (
             <button 
                onClick={clearFilters}
                className="text-xs text-muted-foreground hover:text-[var(--color-destructive)] flex items-center gap-1"
            >
                <X size={12} /> Clear all
            </button>
        )}
      </div>

      {/* Expanded Filters Panel */}
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2">
            
            {/* Time Range Mobile */}
            <div className="md:hidden space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Time Range</p>
                <div className="flex flex-wrap gap-2">
                    {(['all', '7d', '30d', '90d'] as const).map(range => (
                         <button
                            key={range}
                            onClick={() => updateFilter('timeRange', range)}
                            className={`px-3 py-1 text-xs rounded-md border ${
                                activeFilters.timeRange === range 
                                ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]' 
                                : 'text-muted-foreground'
                            }`}
                        >
                            {range === 'all' ? 'All Time' : range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Outcome */}
            <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Outcome</p>
                <div className="flex flex-wrap gap-2">
                    {[
                        { val: 'all', label: 'All Outcomes' },
                        { val: 'right_call', label: 'Right Calls' },
                        { val: 'wrong_call', label: 'Wrong Calls' },
                        { val: 'unclear', label: 'Unclear' }
                    ].map(opt => (
                         <button
                            key={opt.val}
                            onClick={() => updateFilter('outcome', opt.val)}
                            className={`px-3 py-1 text-xs rounded-md border ${
                                activeFilters.outcome === opt.val 
                                ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]' 
                                : 'text-muted-foreground hover:bg-[var(--color-muted)]'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tags */}
            <div className="space-y-2 md:col-span-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Tags</p>
                <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`px-2 py-1 text-xs rounded border transition-colors ${
                                activeFilters.tags.includes(tag)
                                ? 'bg-[var(--color-foreground)] text-[var(--color-background)] border-transparent'
                                : 'bg-transparent text-muted-foreground border-border hover:border-[var(--color-foreground)]'
                            }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
