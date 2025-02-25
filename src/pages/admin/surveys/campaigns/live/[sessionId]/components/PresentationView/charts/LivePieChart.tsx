import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { LivePieChartData } from './types';

interface LivePieChartProps {
  data: LivePieChartData[];
  total: number;
  width?: number;
  height?: number;
}

export function LivePieChart({ 
  data, 
  total,
  width = 400, 
  height = 300 
}: LivePieChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const radius = Math.min(width, height) / 2;

    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.value.toString()))
      .range(d3.schemeCategory10);

    const pie = d3.pie<LivePieChartData>().value(d => d.count);

    const arc = d3.arc<d3.PieArcDatum<LivePieChartData>>()
      .outerRadius(radius * 0.8)
      .innerRadius(radius * 0.4);

    const outerArc = d3.arc<d3.PieArcDatum<LivePieChartData>>()
      .innerRadius(radius * 0.9)
      .outerRadius(radius * 0.9);

    svg.append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`)
      .selectAll("path")
      .data(pie(data))
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", d => color(d.data.value.toString()) as string)
      .attr("stroke", "white")
      .style("stroke-width", "2px")
      .style("opacity", 0.7);

    svg.append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`)
      .selectAll("polyline")
      .data(pie(data))
      .enter()
      .append("polyline")
      .attr("stroke", "black")
      .style("fill", "none")
      .attr("stroke-width", 1)
      .attr("points", d => {
        const posA = arc.centroid(d);
        const posB = outerArc.centroid(d);
        const posC = outerArc.centroid(d);
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1);
        return [posA, posB, posC].join(",");
      });

    svg.append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`)
      .selectAll("text")
      .data(pie(data))
      .enter()
      .append("text")
      .text(d => `${d.data.value} (${d.data.percentage.toFixed(1)}%)`)
      .attr("transform", d => {
        const pos = outerArc.centroid(d);
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        pos[0] = radius * (midangle < Math.PI ? 1 : -1);
        return `translate(${pos[0]},${pos[1]})`;
      })
      .style("text-anchor", d => {
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        return (midangle < Math.PI ? "start" : "end");
      });
  }, [data, total, width, height]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg ref={svgRef} width={width} height={height}></svg>
    </div>
  );
}
