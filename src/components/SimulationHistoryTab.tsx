import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface SimulationHistoryTabProps {
  // Add props if needed, e.g., operativeId
}

export const SimulationHistoryTab: React.FC<SimulationHistoryTabProps> = () => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Dummy data for now - will need Firebase integration later
    const data = [
      { turn: 1, success: 20 },
      { turn: 2, success: 40 },
      { turn: 3, success: 30 },
      { turn: 4, success: 60 },
      { turn: 5, success: 80 },
    ];

    const width = 600;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };

    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);

    const x = d3
      .scaleLinear()
      .domain(d3.extent(data, d => d.turn) as [number, number])
      .range([margin.left, width - margin.right]);

    const y = d3
      .scaleLinear()
      .domain([0, 100])
      .range([height - margin.bottom, margin.top]);

    const line = d3
      .line<{ turn: number; success: number }>()
      .x(d => x(d.turn))
      .y(d => y(d.success));

    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#d97706") // Amber color
      .attr("stroke-width", 2)
      .attr("d", line);

    return () => {
      d3.select(chartRef.current).select("svg").remove();
    };
  }, []);

  return (
    <div className="mi6-swap-panel rounded-[28px] p-5">
      <h3 className="text-stone-100 mb-4 uppercase tracking-widest font-mono text-sm">Simulation History</h3>
      <div ref={chartRef} className="w-full h-64" />
    </div>
  );
};
