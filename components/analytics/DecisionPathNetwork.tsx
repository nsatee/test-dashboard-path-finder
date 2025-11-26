
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { NetworkData, OutcomeType } from '../../types';
import { ChartErrorBoundary } from './ChartWrapper';

type Props = {
  data: NetworkData;
};

export function DecisionPathNetwork({ data }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Clear previous
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height]);

    // Clone data to avoid mutation issues in React strict mode
    const nodes = data.nodes.map(d => ({ ...d }));
    const links = data.links.map(d => ({ ...d }));

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(80))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(20));

    // Links
    const link = svg.append("g")
      .attr("stroke", "var(--color-border)")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", (d: any) => Math.sqrt(d.value) * 1.5);

    const getColor = (outcome: OutcomeType) => {
      switch (outcome) {
        case 'right_call': return 'var(--color-success)';
        case 'wrong_call': return 'var(--color-destructive)';
        default: return 'var(--color-muted-foreground)';
      }
    };

    // Node Group
    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(drag(simulation) as any);

    // Node Circle
    node.append("circle")
      .attr("r", (d: any) => 6 + (d.val || 5))
      .attr("fill", (d: any) => getColor(d.outcome))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("cursor", "grab");

    // Node Label
    node.append("text")
      .text((d: any) => d.label.length > 15 ? d.label.substring(0, 15) + '...' : d.label)
      .attr("x", 12)
      .attr("y", 4)
      .attr("font-size", "10px")
      .attr("fill", "var(--color-foreground)")
      .attr("opacity", 0.8)
      .style("pointer-events", "none");

    node.append("title")
      .text((d: any) => d.label);

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    function drag(simulation: any) {
      function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }

      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }

    return () => {
      simulation.stop();
    };
  }, [data]);

  return (
    <ChartErrorBoundary>
      <div className="w-full h-full min-h-[400px] overflow-hidden bg-[var(--color-muted)]/10 rounded-lg border border-[var(--color-border)] relative">
        <svg ref={svgRef} className="w-full h-full block" />
        <div className="absolute bottom-2 right-2 text-[10px] text-muted-foreground bg-card/80 p-1 rounded">
           Drag nodes to explore
        </div>
      </div>
    </ChartErrorBoundary>
  );
}
