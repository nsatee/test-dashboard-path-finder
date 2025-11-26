
import React, { useEffect, useState, useMemo } from 'react';
import { getPathFinderData } from '../services/mockData';
import { PathFinderData, Decision } from '../types';
import { ChartWrapper } from '../components/analytics/ChartWrapper';
import { DecisionPathTimeline } from '../components/analytics/DecisionPathTimeline';
import { DecisionTrajectoryScatter } from '../components/analytics/DecisionTrajectoryScatter';
import { DecisionPathNetwork } from '../components/analytics/DecisionPathNetwork';
import { PathSuccessRateChart } from '../components/analytics/PathSuccessRateChart';
import { DecisionFlowDiagram } from '../components/analytics/DecisionFlowDiagram';
import { Skeleton } from '../components/ui/Skeleton';
import { Download, RefreshCw } from 'lucide-react';
import { PathFinderStatsCards } from '../components/analytics/PathFinderStatsCards';
import { PathFinderFilters, FilterState } from '../components/analytics/PathFinderFilters';

export function PathFinderPage() {
  const [data, setData] = useState<PathFinderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    timeRange: 'all',
    outcome: 'all',
    tags: []
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await getPathFinderData();
      setData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const availableTags = useMemo(() => {
    if (!data) return [];
    const tags = new Set<string>();
    data.decisions.forEach(d => d.tags.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [data]);

  const filteredDecisions = useMemo(() => {
    if (!data) return [];
    
    return data.decisions.filter(d => {
      // Time Filter
      if (filters.timeRange !== 'all') {
        const days = parseInt(filters.timeRange.replace('d', ''));
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        if (new Date(d.date) < cutoff) return false;
      }

      // Outcome Filter
      if (filters.outcome !== 'all' && d.outcome !== filters.outcome) return false;

      // Tag Filter
      if (filters.tags.length > 0) {
        if (!d.tags.some(t => filters.tags.includes(t))) return false;
      }

      return true;
    });
  }, [data, filters]);

  if (loading || !data) {
    return (
      <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-4 md:p-8 space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-card-foreground">Path Finder</h1>
            <p className="text-muted-foreground mt-1">Visualize your decision-making journeys and discover patterns.</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={loadData}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-lg hover:opacity-90 transition-opacity shadow-sm"
            >
                <RefreshCw className="w-4 h-4" />
                Refresh
            </button>
        </div>
      </div>

      {/* Stats Cards - Always Global */}
      <div className="max-w-7xl mx-auto">
         <PathFinderStatsCards stats={data.stats} />
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto sticky top-2 z-40 shadow-sm">
         <PathFinderFilters 
            activeFilters={filters} 
            onFilterChange={setFilters} 
            availableTags={availableTags} 
         />
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Main Timeline */}
        <section>
             <ChartWrapper 
                title="Decision Path Timeline" 
                description={`Visualizing ${filteredDecisions.length} decisions over time. Markers show Frame (Circle), Seal (Square), and Retrospect (Diamond).`}
                action={<button className="text-muted-foreground hover:text-card-foreground"><Download className="w-4 h-4" /></button>}
            >
                <div className="h-[400px]">
                    <DecisionPathTimeline data={filteredDecisions} />
                </div>
            </ChartWrapper>
        </section>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ChartWrapper 
                title="Decision Trajectory" 
                description="Analyze how confidence, stress, and gut feelings correlate with outcomes."
            >
                <div className="h-[400px]">
                    <DecisionTrajectoryScatter data={filteredDecisions} />
                </div>
            </ChartWrapper>

            <ChartWrapper 
                title="Path Success Rates" 
                description="Compare success rates across different dimensions."
            >
                <div className="h-[400px]">
                    <PathSuccessRateChart data={filteredDecisions} />
                </div>
            </ChartWrapper>
        </div>

        {/* Network & Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                 <ChartWrapper 
                    title="Path Network" 
                    description="Clustering decisions by shared context and tags to find hidden connections."
                >
                    <div className="h-[450px]">
                        <DecisionPathNetwork data={data.networkData} />
                    </div>
                </ChartWrapper>
            </div>
            <div className="lg:col-span-1">
                 <ChartWrapper 
                    title="Decision Flow" 
                    description="Tracking the flow from Frame to Seal to Retrospect."
                >
                    <div className="h-[450px]">
                        <DecisionFlowDiagram data={data.flowData} />
                    </div>
                </ChartWrapper>
            </div>
        </div>

      </div>
    </div>
  );
}
