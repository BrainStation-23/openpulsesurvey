import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { LiveBarChartData } from './types';

interface LiveBarChartProps {
  data: LiveBarChartData[];
  width?: number;
  height?: number;
}

export function LiveBarChart({ 
  data,
  width = 600,
  height = 400
}: LiveBarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const x = d3.scaleBand()
      .domain(data.map(d => d.rating.toString()))
      .range([0, innerWidth])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count) || 0])
      .nice()
      .range([innerHeight, 0]);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x));

    g.append("g")
      .call(d3.axisLeft(y).ticks(null, "s"))
      .append("text")
      .attr("x", 4)
      .attr("y", margin.top)
      .attr("dy", "0.71em")
      .attr("text-anchor", "start")
      .text("Count");

    g.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.rating.toString())!)
      .attr("y", d => y(d.count))
      .attr("width", x.bandwidth())
      .attr("height", d => innerHeight - y(d.count))
      .attr("fill", "steelblue")
      .style("opacity", 0)
      .transition()
      .duration(300)
      .style("opacity", 1);

  }, [data, width, height]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="overflow-visible"
      />
    </div>
  );
}
