import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const D3MonthlyTrendChart = ({ data, darkMode }) => {
  const chartRef = useRef(null);
  
  useEffect(() => {
    if (!data || data.length === 0 || !chartRef.current) return;
    
    d3.select(chartRef.current).selectAll('*').remove();
    
    const margin = { top: 40, right: 30, bottom: 70, left: 100 };
    const width = chartRef.current.clientWidth - margin.left - margin.right;
    const height = chartRef.current.clientHeight - margin.top - margin.bottom;
    
    // Create SVG with a background rect that has shadow
    const mainSvg = d3.select(chartRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);
      
    // Add definitions for gradients and filters
    const defs = mainSvg.append("defs");
    
    // Add shadow filter for entire chart
    const chartFilter = defs.append("filter")
      .attr("id", "chart-shadow")
      .attr("width", "130%")
      .attr("height", "130%");
    
    chartFilter.append("feDropShadow")
      .attr("dx", 0)
      .attr("dy", 0)
      .attr("stdDeviation", 4)
      .attr("flood-opacity", 0.2);
    
    // Add gradient for income bars
    const incomeGradient = defs.append("linearGradient")
      .attr("id", "incomeGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
      
    incomeGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", darkMode ? "#34d399" : "#10b981")
      .attr("stop-opacity", 1);
      
    incomeGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", darkMode ? "#34d399" : "#10b981")
      .attr("stop-opacity", 0.8);
    
    // Add gradient for expense bars
    const expenseGradient = defs.append("linearGradient")
      .attr("id", "expenseGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
      
    expenseGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", darkMode ? "#f87171" : "#ef4444")
      .attr("stop-opacity", 1);
      
    expenseGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", darkMode ? "#f87171" : "#ef4444")
      .attr("stop-opacity", 0.8);
    
    // Add a background rectangle with shadow
    mainSvg.append("rect")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("fill", darkMode ? "rgba(30, 30, 36, 0.4)" : "rgba(255, 255, 255, 0.6)")
      .attr("rx", 8) // Rounded corners
      .style("filter", "url(#chart-shadow)");
    
    // Main chart group
    const svg = mainSvg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
      
    const x = d3.scaleBand()
      .domain(data.map(d => d.month))
      .range([0, width])
      .padding(0.3);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => Math.max(d.income, d.expenses)) * 1.1])
      .range([height, 0]);
      
    // Add grid lines
    svg.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat("")
      )
      .style("stroke", darkMode ? "rgba(113, 113, 122, 0.2)" : "rgba(226, 232, 240, 0.7)")
      .style("stroke-dasharray", "3,3")
      .select("path")
      .style("stroke-width", 0);
      
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('text-anchor', 'middle')
      .style('fill', darkMode ? '#a1a1aa' : '#475569')
      .style('font-size', '12px')
      .style('font-weight', 'bold');
      
    svg.select('.domain').style('stroke', darkMode ? '#71717a' : '#cbd5e1');
    
    // Add y-axis with larger font
    svg.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `$${d}`))
      .selectAll('text')
      .style('fill', darkMode ? '#a1a1aa' : '#475569')
      .style('font-size', '14px') // Larger font for y-axis
      .style('font-weight', 'bold');
    
    // Add y-axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 20)
      .attr("x", -height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("fill", darkMode ? "#a1a1aa" : "#475569")
      .style("font-size", "14px")
      .style("font-weight", 'bold')
      .text("Amount ($)");
      
    const incomeColor = darkMode ? "url(#incomeGradient)" : "url(#incomeGradient)";
    const expenseColor = darkMode ? "url(#expenseGradient)" : "url(#expenseGradient)";
    
    // Calculate width for each bar with gap between bars
    const barWidth = x.bandwidth() * 0.4; // 40% of bandwidth for each bar
    
    // Create group bars for income
    svg.selectAll('.income-bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'income-bar')
      .attr('x', d => x(d.month) + x.bandwidth() * 0.1) // 10% margin from left
      .attr('width', barWidth)
      .attr('y', d => y(d.income))
      .attr('height', d => height - y(d.income))
      .attr('fill', incomeColor)
      .attr('rx', 4)
      .attr('ry', 4)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('y', d => y(d.income) - 5) // Move up slightly
          .attr('height', d => height - y(d.income) + 5); // Make taller
          
        addDataLabel(this, d.income, 'income');
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('y', d => y(d.income))
          .attr('height', d => height - y(d.income));
          
        svg.selectAll('.temp-label').remove();
      });
      
    // Create group bars for expenses with CLEAR gap between
    svg.selectAll('.expense-bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'expense-bar')
      .attr('x', d => x(d.month) + x.bandwidth() * 0.5) // 50% position from left
      .attr('width', barWidth)
      .attr('y', d => y(d.expenses))
      .attr('height', d => height - y(d.expenses))
      .attr('fill', expenseColor)
      .attr('rx', 4)
      .attr('ry', 4)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('y', d => y(d.expenses) - 5) // Move up slightly
          .attr('height', d => height - y(d.expenses) + 5); // Make taller
          
        addDataLabel(this, d.expenses, 'expense');
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('y', d => y(d.expenses))
          .attr('height', d => height - y(d.expenses));
          
        svg.selectAll('.temp-label').remove();
      });
    
    // Function to add temporary data labels on hover
    function addDataLabel(element, value, type) {
      const rect = element.getBoundingClientRect();
      const svgRect = chartRef.current.getBoundingClientRect();
      
      const xPos = rect.left - svgRect.left + rect.width / 2;
      const yPos = rect.top - svgRect.top - 10;
      
      svg.append('text')
        .attr('class', 'temp-label')
        .attr('x', xPos - margin.left)
        .attr('y', yPos - margin.top)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('fill', type === 'income' ? '#10b981' : '#ef4444')
        .text(`$${value.toFixed(2)}`);
    }
    
    // Add month annotations at the bottom
    const annotations = svg.append('g')
      .attr('class', 'annotations')
      .attr('transform', `translate(0,${height + 35})`);
    
    // Add a subtle highlight for the latest month
    if (data.length > 0) {
      const latestMonth = data[data.length - 1].month;
      svg.append('rect')
        .attr('x', x(latestMonth))
        .attr('y', 0)
        .attr('width', x.bandwidth())
        .attr('height', height)
        .attr('fill', darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)')
        .attr('rx', 4);
        
      annotations.append('text')
        .attr('x', x(latestMonth) + x.bandwidth() / 2)
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('fill', darkMode ? '#a1a1aa' : '#475569')
        .text('Latest');
    }
    
    // Create colored squares with text properly aligned (color box BEFORE text)
    // Income legend
    svg.append('rect')
      .attr('x', width - 95) // Position further left
      .attr('y', 0)
      .attr('width', 15)
      .attr('height', 15)
      .attr('rx', 3)
      .attr('fill', incomeColor);
      
    svg.append('text')
      .attr('x', width - 75) // Position after the square
      .attr('y', 12)
      .attr('text-anchor', 'start') // Left align
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', darkMode ? '#a1a1aa' : '#475569')
      .text('Income');
      
    // Expense legend
    svg.append('rect')
      .attr('x', width - 95) // Position further left
      .attr('y', 25)
      .attr('width', 15)
      .attr('height', 15)
      .attr('rx', 3)
      .attr('fill', expenseColor);
      
    svg.append('text')
      .attr('x', width - 75) // Position after the square
      .attr('y', 37)
      .attr('text-anchor', 'start') // Left align
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', darkMode ? '#a1a1aa' : '#475569')
      .text('Expenses');
    
    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .style('fill', darkMode ? '#ecedee' : '#0f172a')
      .text('Monthly Income vs Expenses');
    
    return () => {};
  }, [data, darkMode]);
  
  return (
    <div 
      ref={chartRef} 
      className="w-full h-full"
    ></div>
  );
};

export default D3MonthlyTrendChart;