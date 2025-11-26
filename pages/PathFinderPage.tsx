import React, { useEffect, useState } from 'react';
import { getPathFinderData } from '../services/mockData';
import { PathFinderData } from '../types';
import { ChartWrapper } from '../components/analytics/ChartWrapper';
import { DecisionPathTimeline } from '../components/analytics/DecisionPathTimeline';
import { DecisionTrajectoryScatter } from '../components/analytics/DecisionTrajectoryScatter';
import { DecisionPathNetwork } from '../components/analytics/DecisionPathNetwork';
import { PathSuccessRateChart } from '../components/analytics/PathSuccessRateChart';
import { DecisionFlowDiagram } from '../components/analytics/DecisionFlowDiagram';
import { Skeleton } from '../components/ui/Skeleton';
import { Download, RefreshCw, Calendar, Share2 } from 'lucide-react';

export function PathFinderPage() {
  const [data, setData] = useState<PathFinderData | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading || !data) {
    return (
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
        <Skeleton className="h-[400px] w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <Skeleton className="h-[350px] w-full" />
           <Skeleton className="h-[350px] w-full" />
        </div>
      </div>
    );
  }

  const totalDecisions = data.decisions.length;
  const successRate = Math.round((data.decisions.filter(d => d.outcome === 'right_call').length / totalDecisions) * 100);
  const avgStress = (data.decisions.reduce((acc, curr) => acc + curr.stressLevel, 0) / totalDecisions).toFixed(1);

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-card-foreground">Path Finder</h1>
            <p className="text-muted-foreground mt-1">Visualize your decision-making journeys and discover patterns.</p>
        </div>
        <div className="flex gap-3">
             <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-[var(--color-muted)] transition-colors text-card-foreground">
                <Calendar className="w-4 h-4" />
                Last 90 Days
            </button>
            <button 
                onClick={loadData}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-lg hover:opacity-90 transition-opacity shadow-sm"
            >
                <RefreshCw className="w-4 h-4" />
                Refresh Data
            </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Decisions" value={totalDecisions} subtext="+12% from last period" />
        <StatCard label="Success Rate" value={`${successRate}%`} subtext="Top 10% of users" indicator="success" />
        <StatCard label="Avg. Stress Level" value={`${avgStress}/10`} subtext="Decreasing trend" indicator="warning" />
        <StatCard label="Active Patterns" value="5" subtext="3 new detected" />
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Main Timeline */}
        <section>
             <ChartWrapper 
                title="Decision Path Timeline" 
                description="Chronological view of decision confidence marked by final outcomes."
                action={<button className="text-muted-foreground hover:text-card-foreground"><Download className="w-4 h-4" /></button>}
            >
                <div className="h-[400px]">
                    <DecisionPathTimeline data={data.decisions} />
                </div>
            </ChartWrapper>
        </section>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ChartWrapper 
                title="Confidence Trajectory" 
                description="Analysis of initial vs. post-mortem confidence (Calibration)."
            >
                <div className="h-[350px]">
                    <DecisionTrajectoryScatter data={data.decisions} />
                </div>
            </ChartWrapper>

            <ChartWrapper 
                title="Pattern Success Rates" 
                description="Success rates categorized by decision tags."
            >
                <div className="h-[350px]">
                    <PathSuccessRateChart data={data.decisions} />
                </div>
            </ChartWrapper>
        </div>

        {/* Network & Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                 <ChartWrapper 
                    title="Decision Network" 
                    description="Clustering decisions by shared context and tags to find hidden connections."
                >
                    <div className="h-[450px]">
                        <DecisionPathNetwork data={data.networkData} />
                    </div>
                </ChartWrapper>
            </div>
            <div className="lg:col-span-1">
                 <ChartWrapper 
                    title="Process Flow" 
                    description="Attrition and outcome flow."
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

function StatCard({ label, value, subtext, indicator }: { label: string, value: string | number, subtext: string, indicator?: 'success' | 'warning' }) {
    const borderColor = indicator === 'success' ? 'border-[var(--color-success)]' : indicator === 'warning' ? 'border-[var(--color-warning)]' : 'border-border';
    
    return (
        <div className={`bg-card p-6 rounded-lg border ${borderColor} shadow-sm`}>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-card-foreground">{value}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>
        </div>
    )
}