import React, { useEffect, useState, useMemo } from "react";
import { getPathFinderData } from "../services/mockData";
import { PathFinderData } from "../types";
import { ChartWrapper } from "../components/analytics/ChartWrapper";
import { DecisionPathTimeline } from "../components/analytics/DecisionPathTimeline";
import { DecisionTrajectoryScatter } from "../components/analytics/DecisionTrajectoryScatter";
import { DecisionClusters } from "../components/analytics/DecisionClusters"; // New component
import { PathSuccessRateChart } from "../components/analytics/PathSuccessRateChart";
import { DecisionFlowDiagram } from "../components/analytics/DecisionFlowDiagram";
import { KeyInsightsPanel } from "../components/analytics/KeyInsightsPanel"; // New component
import { Skeleton } from "../components/ui/Skeleton";
import { RefreshCw } from "lucide-react";
import {
  PathFinderFilters,
  FilterState,
} from "../components/analytics/PathFinderFilters";

export function PathFinderPage() {
  const [data, setData] = useState<PathFinderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    timeRange: "all",
    outcome: "all",
    tags: [],
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
    data.decisions.forEach((d) => d.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [data]);

  const filteredDecisions = useMemo(() => {
    if (!data) return [];

    return data.decisions.filter((d) => {
      // Time Filter
      if (filters.timeRange !== "all") {
        const days = parseInt(filters.timeRange.replace("d", ""));
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        if (new Date(d.date) < cutoff) return false;
      }

      // Outcome Filter
      if (filters.outcome !== "all" && d.outcome !== filters.outcome)
        return false;

      // Tag Filter
      if (filters.tags.length > 0) {
        if (!d.tags.some((t) => filters.tags.includes(t))) return false;
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
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-4 md:p-8 space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-card-foreground">
            Path Finder Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Discover patterns and improve your decision quality.
          </p>
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

      {/* Actionable Insights Panel */}
      <div className="max-w-7xl mx-auto">
        <KeyInsightsPanel stats={data.stats} />
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
        {/* Row 1: Timeline & Success Rates */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ChartWrapper
              title="Decision Volume & Quality"
              description="Are you making more decisions? Are they getting better over time?"
            >
              <div className="h-[350px]">
                <DecisionPathTimeline data={filteredDecisions} />
              </div>
            </ChartWrapper>
          </div>
          <div className="lg:col-span-1">
            <ChartWrapper
              title="Success by Category"
              description="Which decision types yield the best results?"
            >
              <div className="h-[350px]">
                <PathSuccessRateChart data={filteredDecisions} />
              </div>
            </ChartWrapper>
          </div>
        </div>

        {/* Row 2: Quadrant & Funnel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartWrapper
            title="Conviction Analysis"
            description="Do you follow your gut or the data? Where do you succeed?"
          >
            <div className="h-[350px]">
              <DecisionTrajectoryScatter data={filteredDecisions} />
            </div>
          </ChartWrapper>

          <ChartWrapper
            title="Process Health"
            description="Where are you dropping the ball in the decision lifecycle?"
          >
            <div className="h-[350px]">
              <DecisionFlowDiagram data={data.flowData} stats={data.stats} />
            </div>
          </ChartWrapper>
        </div>

        {/* Row 3: Clusters (Replacing Network Graph) */}
        <ChartWrapper
          title="Decision Clusters"
          description="Grouped analysis of your most frequent decision topics."
        >
          <div className="min-h-[200px]">
            <DecisionClusters data={filteredDecisions} />
          </div>
        </ChartWrapper>
      </div>
    </div>
  );
}
