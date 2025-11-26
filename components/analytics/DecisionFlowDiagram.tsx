import React from 'react';
import { FlowData, SummaryStats } from '../../types';

type Props = {
  data: FlowData;
  stats: SummaryStats;
};

// Helper for Bézier curves
const getPath = (startX: number, startY: number, endX: number, endY: number) => {
  const controlPoint1X = startX + (endX - startX) / 2;
  const controlPoint1Y = startY;
  const controlPoint2X = startX + (endX - startX) / 2;
  const controlPoint2Y = endY;
  
  return `M ${startX} ${startY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${endX} ${endY}`;
};

export function DecisionFlowDiagram({ stats }: Props) {
  const framed = stats.totalDecisions;
  const sealed = stats.sealedCount;
  const retrospected = stats.retrospectCount;

  // Calculate widths relative to Frame (max width)
  // We use a fixed canvas size
  const width = 400;
  const height = 180;
  const nodeHeight = 40;
  
  // Normalize widths (min 10px visibility)
  const maxVal = framed || 1;
  const wFrame = 40; // Fixed thickness of the bar
  const wSeal = 40;
  const wRetro = 40;

  // Vertical scale based on count
  const hFrame = 140; // Max height
  const hSeal = (sealed / maxVal) * hFrame;
  const hRetro = (retrospected / maxVal) * hFrame;

  // Y Positions (Centered vertically)
  const yFrame = (height - hFrame) / 2;
  const ySeal = (height - hSeal) / 2;
  const yRetro = (height - hRetro) / 2;

  // X Positions (Distributed)
  const xFrame = 40;
  const xSeal = 180;
  const xRetro = 320;

  return (
    <div className="h-full flex flex-col items-center justify-center py-4">
       <div className="relative w-full h-[220px] select-none">
          <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
             <defs>
                <linearGradient id="gradFlow1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-warning)" stopOpacity={0.4} />
                </linearGradient>
                <linearGradient id="gradFlow2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--color-warning)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-success)" stopOpacity={0.4} />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
             </defs>

             {/* Connector: Frame -> Seal */}
             <path 
                d={`
                    M ${xFrame + wFrame} ${yFrame} 
                    L ${xFrame + wFrame} ${yFrame + hFrame} 
                    L ${xSeal} ${ySeal + hSeal} 
                    L ${xSeal} ${ySeal} 
                    Z
                `}
                fill="url(#gradFlow1)"
             />

             {/* Connector: Seal -> Retro */}
             <path 
                d={`
                    M ${xSeal + wSeal} ${ySeal} 
                    L ${xSeal + wSeal} ${ySeal + hSeal} 
                    L ${xRetro} ${yRetro + hRetro} 
                    L ${xRetro} ${yRetro} 
                    Z
                `}
                fill="url(#gradFlow2)"
             />

             {/* Nodes */}
             {/* Frame */}
             <rect x={xFrame} y={yFrame} width={wFrame} height={hFrame} rx={4} fill="var(--color-primary)" filter="url(#glow)" />
             <text x={xFrame + 20} y={yFrame - 15} textAnchor="middle" fontSize="12" fontWeight="bold" fill="var(--color-foreground)">Frame</text>
             <text x={xFrame + 20} y={yFrame + hFrame + 20} textAnchor="middle" fontSize="14" fontWeight="bold" fill="var(--color-primary)">{framed}</text>

             {/* Seal */}
             <rect x={xSeal} y={ySeal} width={wSeal} height={Math.max(4, hSeal)} rx={4} fill="var(--color-warning)" filter="url(#glow)" />
             <text x={xSeal + 20} y={yFrame - 15} textAnchor="middle" fontSize="12" fontWeight="bold" fill="var(--color-foreground)">Seal</text>
             <text x={xSeal + 20} y={ySeal + hSeal + 20} textAnchor="middle" fontSize="14" fontWeight="bold" fill="var(--color-warning-foreground)">{sealed}</text>

             {/* Retro */}
             <rect x={xRetro} y={yRetro} width={wRetro} height={Math.max(4, hRetro)} rx={4} fill="var(--color-success)" filter="url(#glow)" />
             <text x={xRetro + 20} y={yFrame - 15} textAnchor="middle" fontSize="12" fontWeight="bold" fill="var(--color-foreground)">Retro</text>
             <text x={xRetro + 20} y={yRetro + hRetro + 20} textAnchor="middle" fontSize="14" fontWeight="bold" fill="var(--color-success-foreground)">{retrospected}</text>

             {/* Metrics Labels overlaying the connectors */}
             <g transform={`translate(${(xFrame + xSeal)/2 + 20}, ${yFrame + hFrame + 50})`}>
                 <text textAnchor="middle" fontSize="10" fill="var(--color-muted-foreground)">Avg {stats.avgDaysToSeal}d</text>
                 <text y="14" textAnchor="middle" fontSize="12" fontWeight="bold" fill="var(--color-foreground)">{stats.sealRate}%</text>
             </g>
             
             <g transform={`translate(${(xSeal + xRetro)/2 + 20}, ${yFrame + hFrame + 50})`}>
                 <text textAnchor="middle" fontSize="10" fill="var(--color-muted-foreground)">Avg {stats.avgDaysToRetrospect}d</text>
                 {/* Logic for retro rate relative to sealed */}
                 <text y="14" textAnchor="middle" fontSize="12" fontWeight="bold" fill="var(--color-foreground)">
                    {sealed > 0 ? Math.round((retrospected/sealed)*100) : 0}%
                 </text>
             </g>

          </svg>
       </div>
       
       <div className="text-center text-xs text-muted-foreground mt-4 bg-card/50 px-4 py-2 rounded-full border border-border/50">
          The funnel visualizes decision drop-off from inception to review.
       </div>
    </div>
  );
}