import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import cloud from 'd3-cloud';
import { LiveWordCloudData } from './types';

interface LiveWordCloudProps {
  data: LiveWordCloudData[];
  width?: number;
  height?: number;
}

export function LiveWordCloud({ 
  data,
  width = 600,
  height = 400 
}: LiveWordCloudProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width, height });

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const fontSize = d3.scaleLinear()
      .domain([
        d3.min(data, d => d.value) || 0,
        d3.max(data, d => d.value) || 0
      ])
      .range([14, 50]);

    const layout = cloud()
      .size([dimensions.width, dimensions.height])
      .words(data.map(d => ({
        text: d.text,
        size: fontSize(d.value)
      })))
      .padding(5)
      .rotate(0)
      .font("Inter")
      .fontSize(d => d.size!)
      .on("end", draw);

    layout.start();

    function draw(words: cloud.Word[]) {
      svg
        .append("g")
        .attr("transform", `translate(${dimensions.width / 2},${dimensions.height / 2})`)
        .selectAll("text")
        .data(words)
        .enter()
        .append("text")
        .style("font-size", d => `${d.size}px`)
        .style("font-family", "Inter")
        .style("fill", (_, i) => d3.schemeCategory10[i % 10])
        .attr("text-anchor", "middle")
        .attr("transform", d => `translate(${d.x},${d.y})`)
        .text(d => d.text)
        .style("opacity", 0)
        .transition()
        .duration(300)
        .style("opacity", 1);
    }
  }, [data, dimensions]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="overflow-visible"
      />
    </div>
  );
}
