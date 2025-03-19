import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const D3PieChart = ({ data, colorScale, darkMode }) => {
  const chartRef = useRef(null);
  
  useEffect(() => {
    if (!data || data.length === 0 || !chartRef.current) return;
    
    d3.select(chartRef.current).selectAll('*').remove();
    
    const width = chartRef.current.clientWidth;
    const height = chartRef.current.clientHeight;
    
    // Calculate available height after accounting for title
    const titleHeight = 40; // Approximate height of the header
    const availableHeight = height - titleHeight;
    
    // Increase radius size and position chart lower in the available space
    const radius = Math.min(width, availableHeight) / 2 * 1;
    
    const svg = d3.select(chartRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${titleHeight + (availableHeight / 2) - 30})`); // Center in available space below title

    // Add subtle gradient definitions for a more polished look
    const defs = svg.append("defs");
    
    data.forEach((d, i) => {
      const gradientId = `pieGradient-${i}`;
      const gradient = defs.append("linearGradient")
        .attr("id", gradientId)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%");
      
      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", d3.rgb(colorScale[i % colorScale.length]).brighter(0.2));
      
      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", d3.rgb(colorScale[i % colorScale.length]).darker(0.2));
    });
    
    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.name))
      .range(colorScale);
    
    const pie = d3.pie()
      .value(d => d.value)
      .sort(null)
      .padAngle(0.03); // Add padding between pie slices
    
    const arc = d3.arc()
      .innerRadius(radius * 0.4) // Larger inner radius for better donut appearance
      .outerRadius(radius);
    
    // Shorter label arc to keep labels within bounds
    const labelArc = d3.arc()
      .innerRadius(radius * 0.7)
      .outerRadius(radius * 0.7);
    
    // Add a subtle shadow filter
    const filter = defs.append("filter")
      .attr("id", "shadow")
      .attr("width", "200%")
      .attr("height", "200%");
    
    filter.append("feDropShadow")
      .attr("dx", 0)
      .attr("dy", 0)
      .attr("stdDeviation", 3)
      .attr("flood-opacity", 0.3);
    
    const tooltip = d3.select('body').append('div')
      .attr('class', 'chart-tooltip')
      .style('position', 'absolute')
      .style('padding', '10px')
      .style('background', darkMode ? '#1e1e24' : '#fff')
      .style('border', `1px solid ${darkMode ? '#27272a' : '#e2e8f0'}`)
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', 1000);
    
    const slices = svg.selectAll('.slice')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'slice');
    
    slices.append('path')
      .attr('d', arc)
      .attr('fill', (d, i) => `url(#pieGradient-${i})`) // Use gradients
      .attr('stroke', darkMode ? '#27272a' : '#fff')
      .style('stroke-width', '2px')
      .style('filter', 'url(#shadow)') // Apply shadow
      .style('opacity', 0.9)
      .on('mouseover', function(event, d) {
        // Explode the slice on hover
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', d3.arc()
            .innerRadius(radius * 0.4)
            .outerRadius(radius * 1.05)); // Expand the radius
        
        const percent = ((d.data.value / d3.sum(data, d => d.value)) * 100).toFixed(1);
        
        tooltip.transition().duration(200).style('opacity', 0.95);
        tooltip.html(`
          <div style="font-weight: bold; margin-bottom: 4px;">${d.data.name}</div>
          <div>Amount: $${d.data.value.toFixed(2)}</div>
          <div>Percentage: ${percent}%</div>
        `)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 28}px`);
      })
      .on('mouseout', function() {
        // Return to normal size
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arc);
          
        tooltip.transition().duration(500).style('opacity', 0);
      });
    
    // Add percentage labels - only for segments large enough
    slices.append('text')
      .attr('transform', d => {
        // Only show labels for segments that are big enough
        const percent = ((d.data.value / d3.sum(data, d => d.value)) * 100);
        if (percent < 8) return 'translate(-1000,-1000)'; // Hide small segments
        return `translate(${labelArc.centroid(d)})`;
      })
      .attr('dy', '.35em')
      .attr('text-anchor', 'middle')
      .style('pointer-events', 'none')
      .text(d => {
        const percent = ((d.data.value / d3.sum(data, d => d.value)) * 100).toFixed(0);
        return `${percent}%`;
      })
      .style('fill', darkMode ? '#ecedee' : '#0f172a')
      .style('font-weight', 'bold')
      .style('font-size', '14px') // Larger text
      .style('text-shadow', darkMode ? '1px 1px 2px rgba(0,0,0,0.3)' : '1px 1px 2px rgba(255,255,255,0.5)');
    
    // Create legend at the bottom with improved styling
    const legendRectSize = 12;
    const legendSpacing = 5;
    const legendHeight = legendRectSize + legendSpacing;
    
    // Calculate number of columns needed
    const itemsPerColumn = 5;
    const numColumns = Math.ceil(data.length / itemsPerColumn);
    
    const legend = svg.selectAll('.legend')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', function(d, i) {
        const column = Math.floor(i / itemsPerColumn);
        const row = i % itemsPerColumn;
        const x = (column * 130) - ((numColumns - 1) * 60);
        const y = (row * legendHeight * 1.8) + radius + 40; // Position below pie chart
        return `translate(${x}, ${y})`;
      });
    
    legend.append('rect')
      .attr('width', legendRectSize)
      .attr('height', legendRectSize)
      .style('fill', (d, i) => color(d.name))
      .style('stroke', darkMode ? '#27272a' : '#fff')
      .style('stroke-width', '1px')
      .style('rx', '2px'); // Rounded corners
    
    legend.append('text')
      .attr('x', legendRectSize + 8)
      .attr('y', legendRectSize - 2)
      .text(d => {
        const name = d.name.length > 15 ? d.name.substring(0, 12) + '...' : d.name;
        return `${name} ($${d.value.toFixed(0)})`;
      })
      .style('fill', darkMode ? '#a1a1aa' : '#475569')
      .style('font-size', '12px');
    
    // Add central donut hole with better visibility
    // Add a background circle first
    svg.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', radius * 0.4)
      .attr('fill', darkMode ? '#1e1e24' : '#f8fafc')
      .attr('stroke', darkMode ? '#71717a' : '#cbd5e1')
      .attr('stroke-width', '2px');
    
    // Add total in center as a single text group
    const total = d3.sum(data, d => d.value);
    
    // Create a group for the center text to keep them together
    const centerText = svg.append('g')
      .attr('text-anchor', 'middle');
    
    // Add "Total" label
    centerText.append('text')
      .attr('dy', '-0.5em') // Position above
      .style('font-size', '14px')
      .style('fill', darkMode ? '#a1a1aa' : '#475569')
      .text('Total');
    
    // Add amount directly below
    centerText.append('text')
      .attr('dy', '0.9em') // Position below
      .style('font-size', '18px')
      .style('font-weight', 'bold')
      .style('fill', darkMode ? '#ecedee' : '#0f172a')
      .text(`$${total.toFixed(0)}`);
    
    return () => {
      d3.selectAll('.chart-tooltip').remove();
    };
  }, [data, colorScale, darkMode]);
  
  return (
    <div 
      ref={chartRef} 
      className="w-full h-full"
    ></div>
  );
};

export default D3PieChart;